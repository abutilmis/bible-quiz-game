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
    // Note: the `completed:*` locks are claimed the moment the quiz STARTS
    // (see /api/start-attempt), so they'll already exist for the person
    // legitimately submitting their own result — that's expected and is not
    // a reason to reject. What we guard against here is a *duplicate
    // submission* for the same attempt (double-click, retried request,
    // direct API abuse, etc.), using its own atomic lock.
    const [phoneSubmitted, userSubmitted] = await Promise.all([
      redis.set(`submitted:phone:${phone}`, 'true', { nx: true }),
      redis.set(`submitted:user:${userId}`, 'true', { nx: true }),
    ]);

    if (phoneSubmitted !== 'OK' || userSubmitted !== 'OK') {
      return res.status(400).json({ error: 'This phone number or device has already submitted a result.' });
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

    // Save result and make sure the attempt locks are set too (they should
    // already be, from start-attempt — this just guarantees consistency for
    // any legacy/edge-case flow that reaches here without having called it).
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