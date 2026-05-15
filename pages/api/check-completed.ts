import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, phone } = req.query;
  
  if (!userId && !phone) {
    return res.status(200).json({ completed: false });
  }

  try {
    const [userLock, phoneLock] = await Promise.all([
      userId ? redis.exists(`completed:user:${userId as string}`) : 0,
      phone ? redis.exists(`completed:phone:${phone as string}`) : 0
    ]);

    const completed = userLock === 1 || phoneLock === 1;
    res.status(200).json({ completed });
  } catch (error) {
    console.error('Check completed error:', error);
    res.status(500).json({ error: 'Database error' });
  }
}