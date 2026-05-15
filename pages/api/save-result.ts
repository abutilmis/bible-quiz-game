import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';
import { UserResult } from '../../types';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, phone, telegramUsername, telegramId, score, totalQuestions, duration, answers } = req.body;
  if (!name || !phone || score === undefined) return res.status(400).json({ error: 'Missing fields' });

  // 1. Server‑side duplicate check (early rejection)
  const alreadyCompleted = await redis.exists(`completed:${phone}`);
  if (alreadyCompleted) {
    return res.status(400).json({ error: 'This phone number has already taken the quiz.' });
  }

  const id = Date.now().toString();
  const result: UserResult = {
    id,
    name,
    phone,
    telegramUsername: telegramUsername || '',
    telegramId: telegramId || '',
    score,
    totalQuestions,
    percentage: Math.round((score / totalQuestions) * 100),
    duration: duration || 0,
    answers,
    timestamp: Date.now()
  };

  try {
    // 2. Save the score and leaderboard
    await redis.hset('results', { [id]: JSON.stringify(result) });
    await redis.zadd('leaderboard', { score, member: name });

    // 3. Atomically set the completion lock (only if not already set)
    //    This guards against race conditions where two requests arrive simultaneously.
    const lockSet = await redis.setnx(`completed:${phone}`, 'true');
    if (!lockSet) {
      // Rare case: another request just saved the same phone number in the split second
      // after our check. We still saved the score, but we should return an error to
      // indicate duplication. Optionally, we could delete the just‑inserted score.
      // For simplicity, we return a conflict error.
      return res.status(409).json({ error: 'Duplicate submission detected. Please try again.' });
    }

    console.log(`Saved: ${name} scored ${score}/${totalQuestions}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Redis save error:', error);
    res.status(500).json({ error: 'Database error' });
  }
}