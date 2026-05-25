
import { ChessGame } from '../engine/core/ChessGame';
import { Color } from '../engine/core/types';

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
    const game = new ChessGame(fen);
    const moves = game.position.generateMoves();

    const algebraicToSquare = (s: string) => {
      const f = s.charCodeAt(0) - 'a'.charCodeAt(0);
      const r = 8 - parseInt(s[1]);
      return r * 8 + f;
    };

    const fromSq = algebraicToSquare(from);
    const toSq = algebraicToSquare(to);

    const move = moves.find(m => m.from === fromSq && m.to === toSq &&
      (!promotion || (m.promotion === charToPieceType(promotion))));

    if (!move) {
      return { valid: false, error: 'Invalid move' };
    }

    const san = game.moveToSan(move);
    game.move(move);

    return {
      valid: true,
      san,
      newFen: game.position.getFen(),
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
    const game = new ChessGame(fen);
    const over = game.isGameOver();

    if (over.over) {
      let result: 'white_wins' | 'black_wins' | 'draw' = 'draw';
      if (over.result === '1-0') result = 'white_wins';
      else if (over.result === '0-1') result = 'black_wins';

      return {
        finished: true,
        result,
        reason: over.reason,
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
    const game = new ChessGame(fen);
    const moves = game.position.generateMoves();
    const over = game.isGameOver();

    return {
      isCheck: game.position.isAttacked(game.position.findKing(game.position.turn), game.position.turn === Color.WHITE ? Color.BLACK : Color.WHITE),
      isCheckmate: over.reason === 'checkmate',
      isDraw: over.over && over.reason !== 'checkmate',
      isStalemate: over.reason === 'stalemate',
      legalMoves: moves.map(m => `${squareToAlgebraic(m.from)}${squareToAlgebraic(m.to)}${m.promotion ? pieceTypeToChar(m.promotion) : ''}`),
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

function charToPieceType(c: string) {
  switch (c.toLowerCase()) {
    case 'p': return 1;
    case 'n': return 2;
    case 'b': return 3;
    case 'r': return 4;
    case 'q': return 5;
    case 'k': return 6;
  }
  return 0;
}

function pieceTypeToChar(t: number) {
  switch (t) {
    case 1: return 'p';
    case 2: return 'n';
    case 3: return 'b';
    case 4: return 'r';
    case 5: return 'q';
    case 6: return 'k';
  }
  return '';
}

function squareToAlgebraic(sq: number): string {
  const file = String.fromCharCode('a'.charCodeAt(0) + (sq % 8));
  const rank = 8 - Math.floor(sq / 8);
  return `${file}${rank}`;
}
