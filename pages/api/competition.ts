import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'your-admin-secret';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const start = await redis.get('competition:start');
    const end = await redis.get('competition:end');
    return res.status(200).json({ start: start || null, end: end || null });
  }

  if (req.method === 'POST') {
    const { secret, start, end } = req.body;
    if (secret !== ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    if (start !== undefined) await redis.set('competition:start', start);
    if (end !== undefined) await redis.set('competition:end', end);
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}