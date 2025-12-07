export const calculateAccuracy = (evaluation: number, bestEvaluation: number): number => {
  const diff = Math.abs(evaluation - bestEvaluation);
  const maxDiff = 5.0;
  const accuracy = Math.max(0, 100 - (diff / maxDiff) * 100);
  return Math.round(accuracy);
};

export const classifyMove = (evaluation: number, bestEvaluation: number): {
  blunder: boolean;
  mistake: boolean;
  inaccuracy: boolean;
} => {
  const diff = Math.abs(evaluation - bestEvaluation);
  
  return {
    blunder: diff >= 3.0,
    mistake: diff >= 1.5 && diff < 3.0,
    inaccuracy: diff >= 0.5 && diff < 1.5,
  };
};

export const analyzeMove = (
  moveNumber: number,
  from: string,
  to: string,
  evaluation: number,
  bestEvaluation: number,
  bestMove?: string
) => {
  const accuracy = calculateAccuracy(evaluation, bestEvaluation);
  const classification = classifyMove(evaluation, bestEvaluation);

  return {
    moveNumber,
    from,
    to,
    evaluation,
    bestMove,
    accuracy,
    ...classification,
  };
};

export const calculateOverallAccuracy = (movesAnalysis: any[]): number => {
  if (movesAnalysis.length === 0) return 0;
  const sum = movesAnalysis.reduce((acc, move) => acc + move.accuracy, 0);
  return Math.round(sum / movesAnalysis.length);
};

export const countStats = (movesAnalysis: any[]) => {
  return {
    blunders: movesAnalysis.filter((m) => m.blunder).length,
    mistakes: movesAnalysis.filter((m) => m.mistake).length,
    inaccuracies: movesAnalysis.filter((m) => m.inaccuracy).length,
    bestMoves: movesAnalysis.filter((m) => !m.blunder && !m.mistake && !m.inaccuracy).length,
  };
};

