import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();
// Hardcoded secret – change this to something strong
const ADMIN_SECRET = 'wOUR/4426/11'; // ← change to a strong secret

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).end();
  const { secret } = req.query;
  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    await redis.del('results');
    await redis.del('leaderboard');
    const [completedKeys, submittedKeys] = await Promise.all([
      redis.keys('completed:*'),
      redis.keys('submitted:*'),
    ]);
    const allKeys = [...completedKeys, ...submittedKeys];
    if (allKeys.length) await redis.del(...allKeys);
    res.status(200).json({ success: true, message: 'All quiz data deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete all data' });
  }
}