import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();
const ADMIN_SECRET = 'wOUR/4426/11'; // your secret

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

    if (!keyToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete the score from hash and leaderboard
    await redis.hdel('results', keyToDelete);
    await redis.zrem('leaderboard', userEntry.name);

    // Delete phone lock (if exists)
    if (userEntry.phone) {
      await redis.del(`completed:phone:${userEntry.phone}`);
    }
    // Delete device‑ID lock (if exists)
    if (userEntry.userId) {
      await redis.del(`completed:user:${userEntry.userId}`);
    }

    res.status(200).json({ success: true, message: `Deleted ${userEntry.name}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}