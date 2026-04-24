import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const resultsHash = await redis.hgetall('results');
  if (!resultsHash) {
    return res.status(200).json([]);
  }

  const results = Object.values(resultsHash)
    .map((v: any) => {
      // If it's already an object, return it directly
      if (typeof v === 'object' && v !== null) return v;
      // If it's a string, parse it
      try {
        return JSON.parse(v);
      } catch {
        return null;
      }
    })
    .filter(r => r !== null);

  results.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return a.timestamp - b.timestamp;
  });

  const top10 = results.slice(0, 10).map(r => ({ name: r.name, score: r.score }));
  res.status(200).json(top10);
}