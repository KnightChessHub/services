const K_FACTOR = 32;

export const calculateExpectedScore = (ratingA: number, ratingB: number): number => {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
};

export const calculateNewRating = (
  currentRating: number,
  opponentRating: number,
  actualScore: number
): number => {
  const expectedScore = calculateExpectedScore(currentRating, opponentRating);
  const newRating = currentRating + K_FACTOR * (actualScore - expectedScore);
  return Math.round(newRating);
};

export const calculateRatingChange = (
  currentRating: number,
  opponentRating: number,
  actualScore: number
): number => {
  const expectedScore = calculateExpectedScore(currentRating, opponentRating);
  return Math.round(K_FACTOR * (actualScore - expectedScore));
};

export const getActualScore = (result: 'win' | 'loss' | 'draw'): number => {
  switch (result) {
    case 'win':
      return 1;
    case 'loss':
      return 0;
    case 'draw':
      return 0.5;
    default:
      return 0;
  }
};

