import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const resultsHash = await redis.hgetall('results');
  if (!resultsHash) {
    return res.status(200).json([]);
  }

  const results = Object.entries(resultsHash)
    .map(([key, value]) => {
      let parsed;
      try {
        parsed = typeof value === 'string' ? JSON.parse(value) : value;
      } catch {
        return null;
      }
      if (!parsed) return null;
      return {
        ...parsed,
        id: key,
        duration: typeof parsed.duration === 'number' ? parsed.duration : 0,
        timestamp: parsed.timestamp || 0,
      };
    })
    .filter(r => r !== null);

  // Sort: highest score first, then shortest duration, then earliest timestamp, then by id
  results.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (a.duration !== b.duration) return a.duration - b.duration;
    if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
    // final tie‑breaker: compare ids (guaranteed unique)
    return a.id.localeCompare(b.id);
  });

  const leaderboard = results.map(r => ({
    name: r.name,
    score: r.score,
    duration: r.duration,
    timestamp: r.timestamp,
  }));

  res.status(200).json(leaderboard);
}