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
    let results = Object.values(resultsHash).map((v: any) => JSON.parse(v));
    results.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return a.timestamp - b.timestamp;
    });
    const index = results.findIndex((r) => r.name === name);
    const rank = index !== -1 ? index + 1 : null;
    res.status(200).json({ rank });
  } catch (error) {
    console.error('User rank error:', error);
    res.status(500).json({ error: 'Failed to get rank' });
  }
}