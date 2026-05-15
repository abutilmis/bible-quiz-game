import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const keys = await redis.keys('completed:*');
    const results = await redis.hgetall('results');
    res.status(200).json({ 
      activeLocks: keys,
      totalResults: Object.keys(results || {}).length 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}