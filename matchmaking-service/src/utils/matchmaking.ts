export const findMatch = (
  userRating: number,
  queue: Array<{ userId: string; rating: number }>,
  ratingTolerance: number = 100
): { userId: string; rating: number } | null => {
  for (const entry of queue) {
    const ratingDiff = Math.abs(entry.rating - userRating);
    if (ratingDiff <= ratingTolerance) {
      return entry;
    }
  }

  const sorted = [...queue].sort((a, b) => Math.abs(a.rating - userRating) - Math.abs(b.rating - userRating));
  return sorted[0] || null;
};

export const calculateRatingTolerance = (waitTime: number): number => {
  const baseTolerance = 50;
  const maxTolerance = 300;
  const incrementPerMinute = 25;

  const tolerance = baseTolerance + (waitTime / 60) * incrementPerMinute;
  return Math.min(tolerance, maxTolerance);
};

