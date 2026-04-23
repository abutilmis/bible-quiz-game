import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

// Use the same secret as in admin.tsx (change to your own)
const ADMIN_SECRET = 'wOUR/4426/11'; // ← change to a strong secret

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

    await redis.hdel('results', keyToDelete);
    await redis.zrem('leaderboard', userEntry.name);
    await redis.del(`completed:${userEntry.phone}`);
    await redis.del(`completed:${userEntry.name}`);

    res.status(200).json({ success: true, message: `Deleted ${userEntry.name}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}