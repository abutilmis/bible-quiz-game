import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';
import { UserResult } from '../../types';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  // Extract and clean inputs
  const { name, score, totalQuestions, duration, answers } = req.body;
  const phone = req.body.phone?.toString().trim();
  const userId = req.body.userId?.toString().trim();
  const telegramUsername = req.body.telegramUsername?.toString().trim() || '';

  if (!name || !phone || score === undefined || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check locks with clean strings (exists returns number of keys found)
    const [phoneLock, userLock] = await Promise.all([
      redis.exists(`completed:phone:${phone}`),
      redis.exists(`completed:user:${userId}`)
    ]);

    if (phoneLock > 0 || userLock > 0) {
      return res.status(400).json({ error: 'This phone number or device has already taken the quiz.' });
    }

    const id = Date.now().toString();
    const result: UserResult = {
      id,
      name,
      phone,
      userId,
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      duration: duration || 0,
      answers,
      timestamp: Date.now(),
      telegramUsername
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