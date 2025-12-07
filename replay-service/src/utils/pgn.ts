import { Chess } from 'chess.js';

export const generatePGN = (moves: Array<{ from: string; to: string; promotion?: string; san?: string }>, result: string): string => {
  const chess = new Chess();
  const pgnMoves: string[] = [];

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const chessMove = chess.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion as any,
    });

    if (chessMove) {
      if (i % 2 === 0) {
        pgnMoves.push(`${Math.floor(i / 2) + 1}. ${chessMove.san}`);
      } else {
        const lastMove = pgnMoves[pgnMoves.length - 1];
        pgnMoves[pgnMoves.length - 1] = `${lastMove} ${chessMove.san}`;
      }
    }
  }

  return pgnMoves.join(' ') + ` ${result}`;
};

export const generateReplayMoves = (moves: Array<{ from: string; to: string; promotion?: string; timestamp: Date }>): Array<{
  moveNumber: number;
  white?: string;
  black?: string;
  fen: string;
  timestamp: Date;
}> => {
  const chess = new Chess();
  const replayMoves: Array<{
    moveNumber: number;
    white?: string;
    black?: string;
    fen: string;
    timestamp: Date;
  }> = [];

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const chessMove = chess.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion as any,
    });

    if (chessMove) {
      const moveNumber = Math.floor(i / 2) + 1;
      const isWhite = i % 2 === 0;

      if (isWhite) {
        replayMoves.push({
          moveNumber,
          white: chessMove.san,
          fen: chess.fen(),
          timestamp: move.timestamp,
        });
      } else {
        const lastMove = replayMoves[replayMoves.length - 1];
        if (lastMove) {
          lastMove.black = chessMove.san;
          lastMove.fen = chess.fen();
        }
      }
    }
  }

  return replayMoves;
};

