import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';
import { UserResult } from '../../types';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, phone, telegramUsername, userId, score, totalQuestions, duration, answers } = req.body;
  
  if (!name || !phone || score === undefined || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if phone or device already took the quiz
    const [phoneLock, userLock] = await Promise.all([
      redis.exists(`completed:phone:${phone}`),
      redis.exists(`completed:user:${userId}`)
    ]);

    if (phoneLock || userLock) {
      return res.status(400).json({ error: 'This phone number or device has already taken the quiz.' });
    }

    const id = Date.now().toString();
    const result: UserResult = {
      id,
      name,
      phone,
      telegramUsername: telegramUsername || '',
      userId: userId || '',
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      duration: duration || 0,
      answers,
      timestamp: Date.now()
    };

    // Save result and set locks atomically using a pipeline
    const pipeline = redis.pipeline();
    pipeline.hset('results', { [id]: JSON.stringify(result) });
    pipeline.zadd('leaderboard', { score, member: name });
    pipeline.set(`completed:phone:${phone}`, 'true');
    pipeline.set(`completed:user:${userId}`, 'true');
    await pipeline.exec();

    console.log(`Saved: ${name} scored ${score}/${totalQuestions}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Redis save error:', error);
    res.status(500).json({ error: 'Database error' });
  }
}