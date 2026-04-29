import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const resultsHash = await redis.hgetall('results');
  if (!resultsHash) {
    return res.status(200).json([]);
  }

  const results = Object.values(resultsHash)
    .map((v: any) => (typeof v === 'string' ? JSON.parse(v) : v))
    .filter(r => r !== null);

  results.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (a.duration !== b.duration) return a.duration - b.duration;
    return a.timestamp - b.timestamp;
  });

  const leaderboard = results.map(r => ({
    name: r.name,
    score: r.score,
    duration: r.duration,
    timestamp: r.timestamp
  }));

  res.status(200).json(leaderboard);
}