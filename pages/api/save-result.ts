import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';
import { UserResult } from '../../types';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, phone, score, totalQuestions, answers } = req.body;
  if (!name || !phone || score === undefined) return res.status(400).json({ error: 'Missing fields' });

  const id = Date.now().toString();
  const result: UserResult = {
    id,
    name,
    phone,
    score,
    totalQuestions,
    percentage: Math.round((score / totalQuestions) * 100),
    answers,
    timestamp: Date.now()
  };

  try {
    // Store in hash (key: 'results', field: id, value: JSON string)
    await redis.hset('results', { [id]: JSON.stringify(result) });
    // Store in sorted set for leaderboard
    await redis.zadd('leaderboard', { score, member: name });
    console.log(`Saved: ${name} scored ${score}/${totalQuestions}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Redis save error:', error);
    res.status(500).json({ error: 'Database error' });
  }
}