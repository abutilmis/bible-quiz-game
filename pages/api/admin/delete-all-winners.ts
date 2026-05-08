import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'wOUR/4426/11';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).end();
  const { secret } = req.query;
  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    // Delete the main results hash and the leaderboard sorted set
    await redis.del('results');
    await redis.del('leaderboard');
    // Optional: delete all completion locks (keys starting with "completed:")
    const keys = await redis.keys('completed:*');
    if (keys.length) await redis.del(...keys);
    res.status(200).json({ success: true, message: 'All quiz data deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete all data' });
  }
}