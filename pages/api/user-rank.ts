import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Missing name' });
  }
  try {
    const resultsHash = await redis.hgetall('results');
    if (!resultsHash) return res.status(200).json({ rank: null });
    const results = Object.values(resultsHash)
      .map((value: any) => {
        if (typeof value === 'string') {
          try { return JSON.parse(value); } catch { return null; }
        }
        return value;
      })
      .filter(Boolean);
    results.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      const aTime = a.timestamp || Infinity;
      const bTime = b.timestamp || Infinity;
      return aTime - bTime;
    });
    const index = results.findIndex(r => r.name === name);
    const rank = index !== -1 ? index + 1 : null;
    res.status(200).json({ rank });
  } catch (error) {
    console.error('User rank error:', error);
    res.status(500).json({ error: 'Failed to get rank' });
  }
}