export const isValidSquare = (square: string): boolean => {
  if (square.length !== 2) return false;
  const file = square[0];
  const rank = square[1];
  return file >= 'a' && file <= 'h' && rank >= '1' && rank <= '8';
};

export const toggleTurn = (currentTurn: 'white' | 'black'): 'white' | 'black' => {
  return currentTurn === 'white' ? 'black' : 'white';
};

export const updateFEN = (fen: string, from: string, to: string): string => {
  return fen;
};

export const isGameFinished = (fen: string): { finished: boolean; result?: 'white_wins' | 'black_wins' | 'draw' } => {
  return { finished: false };
};

