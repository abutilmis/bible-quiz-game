import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';
import { UserResult } from '../../types';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { name, score, totalQuestions, duration, answers } = req.body;
  const phone = String(req.body.phone || '').trim();
  const userId = String(req.body.userId || '').trim();
  const telegramUsername = String(req.body.telegramUsername || '').trim();

  if (!phone || !userId) {
    return res.status(400).json({ error: 'Missing phone or device ID' });
  }

  try {
    // 1. Check if locks exist (using a simple, direct check)
    const pExist = await redis.exists(`completed:phone:${phone}`);
    const uExist = await redis.exists(`completed:user:${userId}`);

    if (pExist > 0 || uExist > 0) {
      console.log(`Blocked attempt: ${phone} / ${userId}`);
      return res.status(400).json({ error: 'ALREADY_TAKEN' });
    }

    // 2. Prepare result
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

    // 3. Save and LOCK atomically
    const p = redis.pipeline();
    p.hset('results', { [id]: JSON.stringify(result) });
    p.zadd('leaderboard', { score, member: name });
    p.set(`completed:phone:${phone}`, 'true');
    p.set(`completed:user:${userId}`, 'true');
    await p.exec();

    console.log(`Saved: ${name} scored ${score}/${totalQuestions}`);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Redis error:', error);
    res.status(500).json({ error: error.message });
  }
}