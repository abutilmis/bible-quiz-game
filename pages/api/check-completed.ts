import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle both string and string[] from query params, then trim
  const userId = (Array.isArray(req.query.userId) ? req.query.userId[0] : req.query.userId)?.toString().trim();
  const phone = (Array.isArray(req.query.phone) ? req.query.phone[0] : req.query.phone)?.toString().trim();
  
  if (!userId && !phone) {
    return res.status(200).json({ completed: false });
  }

  try {
    const [userLock, phoneLock] = await Promise.all([
      userId ? redis.exists(`completed:user:${userId}`) : 0,
      phone ? redis.exists(`completed:phone:${phone}`) : 0
    ]);

    // Check if either lock exists (exists returns number of matches)
    const completed = (Number(userLock) > 0) || (Number(phoneLock) > 0);
    res.status(200).json({ completed });
  } catch (error) {
    console.error('Check completed error:', error);
    res.status(500).json({ error: 'Database error' });
  }
}