import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, phone } = req.query;
  let completed = false;
  if (userId) completed = await redis.exists(`completed:user:${userId}`) === 1;
  if (!completed && phone) completed = await redis.exists(`completed:phone:${phone}`) === 1;
  res.status(200).json({ completed });
}