import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'No phone' });
  await redis.set(`completed:${phone}`, 'true');
  res.status(200).json({ success: true });
}