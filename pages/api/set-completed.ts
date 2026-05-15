import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, phone } = req.body;
  if (userId) await redis.set(`completed:user:${userId}`, 'true');
  if (phone) await redis.set(`completed:phone:${phone}`, 'true');
  res.status(200).json({ success: true });
}