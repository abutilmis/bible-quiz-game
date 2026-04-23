import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // zrange with rev: true returns an array of [member, score, member, score, ...]
    const raw = await redis.zrange('leaderboard', 0, 9, { rev: true, withScores: true });
    const leaderboard = [];
    for (let i = 0; i < raw.length; i += 2) {
      leaderboard.push({ name: raw[i] as string, score: raw[i+1] as number });
    }
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}