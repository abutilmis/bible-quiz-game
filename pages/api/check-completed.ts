import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

const redis = Redis.fromEnv();

// `completed:*` is claimed the instant the quiz STARTS (see start-attempt.ts)
// — it's really an "attempt claimed" flag, not a "finished" flag. Reporting
// that as `completed: true` on every page load is what used to lock a user
// out entirely the moment they refreshed mid-quiz: the lock was already
// there from when they clicked Start, so the frontend treated a refresh
// exactly like an already-finished quiz.
//
// `submitted:*` is only set once a result has actually been saved (see
// save-result.ts), so it's the correct signal for "truly finished, do not
// allow another attempt."
//
// We still return `started` (the old `completed:*` flag) so the frontend
// can tell the difference between "never began" and "began but not
// finished" — the latter is the case a refresh should resume, not block.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle both string and string[] from query params, then trim
  const userId = (Array.isArray(req.query.userId) ? req.query.userId[0] : req.query.userId)?.toString().trim();
  const phone = (Array.isArray(req.query.phone) ? req.query.phone[0] : req.query.phone)?.toString().trim();

  if (!userId && !phone) {
    return res.status(200).json({ completed: false, submitted: false, started: false });
  }

  try {
    const [userStarted, phoneStarted, userSubmitted, phoneSubmitted] = await Promise.all([
      userId ? redis.exists(`completed:user:${userId}`) : 0,
      phone ? redis.exists(`completed:phone:${phone}`) : 0,
      userId ? redis.exists(`submitted:user:${userId}`) : 0,
      phone ? redis.exists(`submitted:phone:${phone}`) : 0,
    ]);

    const started = (Number(userStarted) > 0) || (Number(phoneStarted) > 0);
    const submitted = (Number(userSubmitted) > 0) || (Number(phoneSubmitted) > 0);

    // `completed` kept for backwards compatibility, now means "truly done".
    res.status(200).json({ completed: submitted, submitted, started });
  } catch (error) {
    console.error('Check completed error:', error);
    res.status(500).json({ error: 'Database error' });
  }
}