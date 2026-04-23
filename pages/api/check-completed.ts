import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: 'No phone' });
  const completed = await redis.exists(`completed:${phone}`);
  res.status(200).json({ completed: completed === 1 });
}