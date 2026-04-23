import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const resultsHash = await redis.hgetall('results');
    if (!resultsHash) {
      return res.status(200).json([]);
    }
    // Values may be strings or already objects. Handle both.
    const results = Object.values(resultsHash).map((entry: any) => {
      if (typeof entry === 'string') {
        return JSON.parse(entry);
      }
      return entry;
    });
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(200).json([]);
  }
}