
import { Position } from './Position';
import { Color, MoveFlags, PIECE_MASK, PieceType } from './types';
import type { Move } from './types';
import { Zobrist } from './Zobrist';

export interface GameHistoryEntry {
    move: Move;
    undo: { castlingRights: number, epSquare: number | null, halfMoveClock: number };
    hash: bigint;
    san: string;
}

export class ChessGame {
    position: Position;
    history: GameHistoryEntry[] = [];
    positionHistory: Map<bigint, number> = new Map();

    constructor(fen?: string) {
        this.position = new Position(fen);
        this.updatePositionHistory();
    }

    private updatePositionHistory() {
        const hash = Zobrist.calculateHash(
            this.position.board,
            this.position.turn,
            this.position.castlingRights,
            this.position.epSquare
        );
        const count = this.positionHistory.get(hash) || 0;
        this.positionHistory.set(hash, count + 1);
        return hash;
    }

    move(sanOrMove: string | Move): boolean {
        let move: Move | undefined;
        if (typeof sanOrMove === 'string') {
            move = this.parseSan(sanOrMove);
        } else {
            move = sanOrMove;
        }

        if (!move) return false;

        const san = this.moveToSan(move);
        const undo = this.position.makeMove(move);
        const hash = this.updatePositionHistory();

        this.history.push({ move, undo, hash, san });
        return true;
    }

    undo() {
        const entry = this.history.pop();
        if (!entry) return;

        const count = this.positionHistory.get(entry.hash)!;
        if (count === 1) {
            this.positionHistory.delete(entry.hash);
        } else {
            this.positionHistory.set(entry.hash, count - 1);
        }

        this.position.unmakeMove(entry.move, entry.undo);
    }

    isGameOver(): { over: boolean; result?: string; reason?: string } {
        const moves = this.position.generateMoves();
        const inCheck = this.position.isAttacked(this.position.findKing(this.position.turn), this.position.turn === Color.WHITE ? Color.BLACK : Color.WHITE);

        if (moves.length === 0) {
            if (inCheck) {
                return { over: true, result: this.position.turn === Color.WHITE ? '0-1' : '1-0', reason: 'checkmate' };
            } else {
                return { over: true, result: '1/2-1/2', reason: 'stalemate' };
            }
        }

        if (this.position.halfMoveClock >= 100) {
            return { over: true, result: '1/2-1/2', reason: '50-move rule' };
        }

        // Threefold repetition
        const hash = Zobrist.calculateHash(this.position.board, this.position.turn, this.position.castlingRights, this.position.epSquare);
        if ((this.positionHistory.get(hash) || 0) >= 3) {
            return { over: true, result: '1/2-1/2', reason: 'threefold repetition' };
        }

        // Insufficient material
        if (this.isInsufficientMaterial()) {
            return { over: true, result: '1/2-1/2', reason: 'insufficient material' };
        }

        return { over: false };
    }

    private isInsufficientMaterial(): boolean {
        const pieces: number[] = [];
        for (let i = 0; i < 64; i++) {
            if (this.position.board[i] !== 0) pieces.push(this.position.board[i]);
        }

        if (pieces.length === 2) return true; // K vs K
        if (pieces.length === 3) {
            const other = pieces.find(p => (p & PIECE_MASK) !== PieceType.KING)!;
            const type = other & PIECE_MASK;
            if (type === PieceType.KNIGHT || type === PieceType.BISHOP) return true;
        }

        return false;
    }

    parseSan(san: string): Move | undefined {
        const moves = this.position.generateMoves();
        // Simplified SAN parser for now
        // A real SAN parser would handle disambiguation like Nf3, R1a3, etc.
        // Let's implement a decent one.

        if (san === 'O-O') {
            return moves.find(m => (m.flags & MoveFlags.CASTLE_KINGSIDE));
        }
        if (san === 'O-O-O') {
            return moves.find(m => (m.flags & MoveFlags.CASTLE_QUEENSIDE));
        }

        const cleanSan = san.replace(/[+#x]/g, '');
        const promotionMatch = san.match(/=([QRNB])/);
        const promotion = promotionMatch ? this.charToPieceType(promotionMatch[1]) : undefined;

        const toStr = cleanSan.slice(-2);
        const toSq = this.algebraicToSquare(toStr);

        let pieceType = PieceType.PAWN;
        let fromFile: number | undefined;
        let fromRank: number | undefined;

        if (/^[KQRBN]/.test(cleanSan)) {
            pieceType = this.charToPieceType(cleanSan[0]);
            const rest = cleanSan.slice(1, -2);
            if (rest.length === 1) {
                if (/[a-h]/.test(rest)) fromFile = rest.charCodeAt(0) - 'a'.charCodeAt(0);
                else fromRank = 8 - parseInt(rest);
            } else if (rest.length === 2) {
                fromFile = rest.charCodeAt(0) - 'a'.charCodeAt(0);
                fromRank = 8 - parseInt(rest[1]);
            }
        } else {
            // Pawn move
            const rest = cleanSan.slice(0, -2);
            if (rest.length === 1) {
                fromFile = rest.charCodeAt(0) - 'a'.charCodeAt(0);
            }
        }

        return moves.find(m => {
            if (m.to !== toSq) return false;
            if ((m.piece & PIECE_MASK) !== pieceType) return false;
            if (fromFile !== undefined && (m.from % 8) !== fromFile) return false;
            if (fromRank !== undefined && Math.floor(m.from / 8) !== fromRank) return false;
            if (promotion && m.promotion !== promotion) return false;
            return true;
        });
    }

    moveToSan(move: Move): string {
        if (move.flags & MoveFlags.CASTLE_KINGSIDE) return "O-O";
        if (move.flags & MoveFlags.CASTLE_QUEENSIDE) return "O-O-O";

        const type = move.piece & PIECE_MASK;
        let san = "";

        if (type !== PieceType.PAWN) {
            san += this.pieceTypeToChar(type).toUpperCase();
            // Disambiguation logic normally goes here
        }

        if (move.flags & MoveFlags.CAPTURE) {
            if (type === PieceType.PAWN) {
                san += String.fromCharCode('a'.charCodeAt(0) + (move.from % 8));
            }
            san += "x";
        }

        san += this.squareToAlgebraic(move.to);

        if (move.flags & MoveFlags.PROMOTION) {
            san += "=" + this.pieceTypeToChar(move.promotion!).toUpperCase();
        }

        // Check/Mate suffixes
        const undo = this.position.makeMove(move);
        const inCheck = this.position.isAttacked(this.position.findKing(this.position.turn), this.position.turn === Color.WHITE ? Color.BLACK : Color.WHITE);
        const hasMoves = this.position.generateMoves().length > 0;
        this.position.unmakeMove(move, undo);

        if (inCheck) {
            san += hasMoves ? "+" : "#";
        }

        return san;
    }

    private charToPieceType(c: string): PieceType {
        switch (c.toUpperCase()) {
            case 'P': return PieceType.PAWN;
            case 'N': return PieceType.KNIGHT;
            case 'B': return PieceType.BISHOP;
            case 'R': return PieceType.ROOK;
            case 'Q': return PieceType.QUEEN;
            case 'K': return PieceType.KING;
        }
        return PieceType.NONE;
    }

    private pieceTypeToChar(t: PieceType): string {
        switch (t) {
            case PieceType.PAWN: return 'p';
            case PieceType.KNIGHT: return 'n';
            case PieceType.BISHOP: return 'b';
            case PieceType.ROOK: return 'r';
            case PieceType.QUEEN: return 'q';
            case PieceType.KING: return 'k';
        }
        return '';
    }

    private algebraicToSquare(s: string): number {
        const file = s.charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = 8 - parseInt(s[1]);
        return rank * 8 + file;
    }

    private squareToAlgebraic(sq: number): string {
        const file = String.fromCharCode('a'.charCodeAt(0) + (sq % 8));
        const rank = 8 - Math.floor(sq / 8);
        return `${file}${rank}`;
    }
}
