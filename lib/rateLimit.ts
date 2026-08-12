export const MAX_ATTEMPTS = 5;
export const WINDOW_MINUTES = 15;

export function isRateLimited(recentAttemptTimestamps: Date[], now: Date = new Date()): boolean {
  const windowStart = new Date(now.getTime() - WINDOW_MINUTES * 60 * 1000);
  const attemptsInWindow = recentAttemptTimestamps.filter((t) => t >= windowStart);
  return attemptsInWindow.length >= MAX_ATTEMPTS;
}
