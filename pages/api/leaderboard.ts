import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const resultsHash = await redis.hgetall('results');
    if (!resultsHash) {
      return res.status(200).json([]);
    }
    let results = Object.values(resultsHash).map((v: any) => {
      // If v is already an object, return it directly, otherwise parse JSON
      if (typeof v === 'object' && v !== null) return v;
      try {
        return JSON.parse(v);
      } catch {
        return null;
      }
    }).filter(r => r !== null);
    // Sort: higher score first, then earlier timestamp
    results.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return a.timestamp - b.timestamp;
    });
    const top10 = results.slice(0, 10).map((r) => ({ name: r.name, score: r.score }));
    res.status(200).json(top10);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}