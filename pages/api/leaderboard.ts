import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const resultsHash = await redis.hgetall('results');
    if (!resultsHash) {
      return res.status(200).json([]);
    }
    // Safely parse each value (handle both string and object)
    const results = Object.values(resultsHash)
      .map((value: any) => {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return null;
          }
        }
        return value;
      })
      .filter(Boolean);
    
    // Sort: highest score first, then shortest duration, then earliest
    // timestamp, then id — same tie-break order as /api/leaderboard-public
    // so the two lists never disagree on ranking.
    results.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      const aDuration = typeof a.duration === 'number' ? a.duration : Infinity;
      const bDuration = typeof b.duration === 'number' ? b.duration : Infinity;
      if (aDuration !== bDuration) return aDuration - bDuration;
      const aTime = a.timestamp || Infinity;
      const bTime = b.timestamp || Infinity;
      if (aTime !== bTime) return aTime - bTime;
      return 0;
    });
    const top10 = results.slice(0, 10).map(r => ({ name: r.name, score: r.score }));
    res.status(200).json(top10);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}