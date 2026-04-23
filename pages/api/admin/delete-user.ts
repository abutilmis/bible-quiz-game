import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).end();
  const { name, phone, secret } = req.query;

  // Protect with a secret key (change to your own)
  if (secret !== 'wOUR/4426/11') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!name && !phone) {
    return res.status(400).json({ error: 'Provide name or phone' });
  }

  try {
    // 1. Find the user in the `results` hash
    const resultsHash = await redis.hgetall('results');
    let keyToDelete: string | null = null;
    let userEntry: any = null;

    for (const [key, value] of Object.entries(resultsHash || {})) {
      const parsed = JSON.parse(value as string);
      if (parsed.name === name || parsed.phone === phone) {
        keyToDelete = key;
        userEntry = parsed;
        break;
      }
    }

    if (!keyToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Delete from hash
    await redis.hdel('results', keyToDelete);

    // 3. Delete from leaderboard (sorted set)
    await redis.zrem('leaderboard', userEntry.name);

    res.status(200).json({ success: true, message: `Deleted user ${userEntry.name}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}