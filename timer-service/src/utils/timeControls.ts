export const TIME_CONTROLS = {
  bullet: { initial: 60, increment: 0 },
  blitz: { initial: 300, increment: 3 },
  rapid: { initial: 600, increment: 5 },
  classical: { initial: 1800, increment: 10 },
};

export const getTimeControlConfig = (timeControl: string) => {
  return TIME_CONTROLS[timeControl as keyof typeof TIME_CONTROLS] || TIME_CONTROLS.rapid;
};

export const calculateTimeRemaining = (
  timeRemaining: number,
  elapsed: number,
  increment: number = 0
): number => {
  const newTime = timeRemaining - elapsed + increment;
  return Math.max(0, newTime);
};

