import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const keys = await redis.keys('*');
    const leaderboard = await redis.zrange('leaderboard', 0, -1, { withScores: true });
    const resultsHash = await redis.hgetall('results');
    res.status(200).json({ keys, leaderboard, resultsHash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}