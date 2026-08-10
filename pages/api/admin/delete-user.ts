import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();
const ADMIN_SECRET = 'wOUR/4426/11';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).end();
  const { name, phone, secret } = req.query;

  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!name && !phone) {
    return res.status(400).json({ error: 'Provide name or phone' });
  }

  try {
    const resultsHash = await redis.hgetall('results');
    let keyToDelete: string | null = null;
    let userEntry: any = null;

    for (const [key, value] of Object.entries(resultsHash || {})) {
      let parsed;
      if (typeof value === 'string') {
        parsed = JSON.parse(value);
      } else {
        parsed = value;
      }
      if (parsed.name === name || parsed.phone === phone) {
        keyToDelete = key;
        userEntry = parsed;
        break;
      }
    }

    // No saved result — most likely someone who started the quiz (claiming
    // their one-time attempt lock) but never finished it. There's no
    // deviceId on file to clear precisely, so best-effort: clear the phone
    // lock so they can retry from a fresh device/browser. If they're on the
    // SAME device/browser, they'll also need to clear site data, since the
    // device-level lock is keyed by a deviceId we don't have a record of.
    if (!keyToDelete) {
      if (!phone) {
        return res.status(404).json({ error: 'User not found (no saved result, and no phone provided to reset a device-only lock)' });
      }
      const pipeline = redis.pipeline();
      pipeline.del(`completed:phone:${phone}`);
      pipeline.del(`submitted:phone:${phone}`);
      await pipeline.exec();
      return res.status(200).json({
        success: true,
        message: `No finished result found for this user — cleared the phone-number lock only. If they're retrying on the same device, they must also clear site data / use a different device, since the device-level lock can't be identified without a saved result.`
      });
    }

    // Delete score and locks atomically using a pipeline
    const pipeline = redis.pipeline();
    pipeline.hdel('results', keyToDelete);
    pipeline.zrem('leaderboard', userEntry.name);

    if (userEntry.phone) {
      pipeline.del(`completed:phone:${userEntry.phone}`);
      pipeline.del(`submitted:phone:${userEntry.phone}`);
    }
    if (userEntry.userId) {
      pipeline.del(`completed:user:${userEntry.userId}`);
      pipeline.del(`submitted:user:${userEntry.userId}`);
    }
    await pipeline.exec();

    res.status(200).json({ success: true, message: `Deleted ${userEntry.name} and removed locks` });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}