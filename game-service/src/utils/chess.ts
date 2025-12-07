import { Chess } from 'chess.js';

export const isValidSquare = (square: string): boolean => {
  if (square.length !== 2) return false;
  const file = square[0];
  const rank = square[1];
  return file >= 'a' && file <= 'h' && rank >= '1' && rank <= '8';
};

export const toggleTurn = (currentTurn: 'white' | 'black'): 'white' | 'black' => {
  return currentTurn === 'white' ? 'black' : 'white';
};

export const validateMove = (fen: string, from: string, to: string, promotion?: string): {
  valid: boolean;
  error?: string;
  san?: string;
  newFen?: string;
} => {
  try {
    const chess = new Chess(fen);
    
    const move = chess.move({
      from,
      to,
      promotion: promotion as any,
    });

    if (!move) {
      return { valid: false, error: 'Invalid move' };
    }

    return {
      valid: true,
      san: move.san,
      newFen: chess.fen(),
    };
  } catch (error: any) {
    return { valid: false, error: error.message || 'Invalid move' };
  }
};

export const updateFEN = (fen: string, from: string, to: string, promotion?: string): string => {
  const result = validateMove(fen, from, to, promotion);
  return result.newFen || fen;
};

export const isGameFinished = (fen: string): {
  finished: boolean;
  result?: 'white_wins' | 'black_wins' | 'draw';
  reason?: string;
} => {
  try {
    const chess = new Chess(fen);

    if (chess.isCheckmate()) {
      return {
        finished: true,
        result: chess.turn() === 'w' ? 'black_wins' : 'white_wins',
        reason: 'checkmate',
      };
    }

    if (chess.isDraw()) {
      let reason = 'draw';
      if (chess.isStalemate()) reason = 'stalemate';
      else if (chess.isThreefoldRepetition()) reason = 'threefold_repetition';
      else if (chess.isInsufficientMaterial()) reason = 'insufficient_material';
      else if (chess.isDraw()) reason = 'fifty_move_rule';

      return {
        finished: true,
        result: 'draw',
        reason,
      };
    }

    return { finished: false };
  } catch (error) {
    return { finished: false };
  }
};

export const getGameState = (fen: string): {
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isStalemate: boolean;
  legalMoves: string[];
} => {
  try {
    const chess = new Chess(fen);
    
    return {
      isCheck: chess.isCheck(),
      isCheckmate: chess.isCheckmate(),
      isDraw: chess.isDraw(),
      isStalemate: chess.isStalemate(),
      legalMoves: chess.moves({ verbose: true }).map((m) => `${m.from}${m.to}${m.promotion || ''}`),
    };
  } catch (error) {
    return {
      isCheck: false,
      isCheckmate: false,
      isDraw: false,
      isStalemate: false,
      legalMoves: [],
    };
  }
};
