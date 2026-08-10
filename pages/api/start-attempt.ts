import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

// Claims the one-time-attempt lock the instant the user presses "Agree &
// Start" — BEFORE they see question 1. This is what makes the lock
// abuse-proof: a page refresh (or leaving mid-quiz) can no longer grant a
// fresh attempt, because the lock was already taken before any questions
// were shown, not at submission time.
//
// Uses Redis SETNX (set-if-not-exists) so two near-simultaneous requests
// (e.g. a double click, or two tabs) can't both win the lock.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const userId = req.body?.userId?.toString().trim();
  const phone = req.body?.phone?.toString().trim();

  if (!userId || !phone) {
    return res.status(400).json({ error: 'Missing userId or phone' });
  }

  try {
    const [userSet, phoneSet] = await Promise.all([
      redis.set(`completed:user:${userId}`, 'true', { nx: true }),
      redis.set(`completed:phone:${phone}`, 'true', { nx: true }),
    ]);

    const userAcquired = userSet === 'OK';
    const phoneAcquired = phoneSet === 'OK';

    if (!userAcquired || !phoneAcquired) {
      // Someone already holds one (or both) of these locks — this device or
      // phone number has already used its one attempt. Roll back whichever
      // key we just newly claimed, since the attempt as a whole is rejected.
      const rollback: Promise<unknown>[] = [];
      if (userAcquired) rollback.push(redis.del(`completed:user:${userId}`));
      if (phoneAcquired) rollback.push(redis.del(`completed:phone:${phone}`));
      if (rollback.length) await Promise.all(rollback);

      return res.status(409).json({
        error: 'This phone number or device has already taken the quiz.',
        alreadyTaken: true,
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('start-attempt error:', error);
    res.status(500).json({ error: 'Database error' });
  }
}
