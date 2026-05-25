import type { Move, Piece } from './types';
import { Color, PieceType, Square, MoveFlags, PIECE_MASK, COLOR_MASK, INITIAL_FEN } from './types';

export class Position {
    board: Uint8Array;
    turn: Color = Color.WHITE;
    castlingRights: number = 0; // 1: WK, 2: WQ, 4: BK, 8: BQ
    epSquare: number | null = null;
    halfMoveClock: number = 0;
    fullMoveNumber: number = 1;

    constructor(fen: string = INITIAL_FEN) {
        this.board = new Uint8Array(64);
        this.loadFen(fen);
    }

    loadFen(fen: string) {
        const parts = fen.split(' ');
        const rows = parts[0].split('/');

        let square = 0;
        for (const row of rows) {
            for (const char of row) {
                if (/\d/.test(char)) {
                    square += parseInt(char);
                } else {
                    this.board[square] = this.charToPiece(char);
                    square++;
                }
            }
        }

        this.turn = parts[1] === 'w' ? Color.WHITE : Color.BLACK;

        this.castlingRights = 0;
        if (parts[2].includes('K')) this.castlingRights |= 1;
        if (parts[2].includes('Q')) this.castlingRights |= 2;
        if (parts[2].includes('k')) this.castlingRights |= 4;
        if (parts[2].includes('q')) this.castlingRights |= 8;

        this.epSquare = parts[3] === '-' ? null : this.algebraicToSquare(parts[3]);
        this.halfMoveClock = parseInt(parts[4]) || 0;
        this.fullMoveNumber = parseInt(parts[5]) || 1;
    }

    private charToPiece(char: string): Piece {
        const lower = char.toLowerCase();
        let type = PieceType.NONE;
        switch (lower) {
            case 'p': type = PieceType.PAWN; break;
            case 'n': type = PieceType.KNIGHT; break;
            case 'b': type = PieceType.BISHOP; break;
            case 'r': type = PieceType.ROOK; break;
            case 'q': type = PieceType.QUEEN; break;
            case 'k': type = PieceType.KING; break;
        }
        const color = char === char.toUpperCase() ? Color.WHITE : Color.BLACK;
        return type | color;
    }

    private algebraicToSquare(s: string): number {
        const file = s.charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = 8 - parseInt(s[1]);
        return rank * 8 + file;
    }

    generateMoves(): Move[] {
        const moves: Move[] = [];
        const us = this.turn;
        const them = us === Color.WHITE ? Color.BLACK : Color.WHITE;

        for (let i = 0; i < 64; i++) {
            const piece = this.board[i];
            if ((piece & COLOR_MASK) !== us) continue;

            const type = piece & PIECE_MASK;
            switch (type) {
                case PieceType.PAWN: this.generatePawnMoves(i, us, moves); break;
                case PieceType.KNIGHT: this.generateKnightMoves(i, us, moves); break;
                case PieceType.BISHOP: this.generateSlidingMoves(i, us, [[-1, -1], [-1, 1], [1, -1], [1, 1]], moves); break;
                case PieceType.ROOK: this.generateSlidingMoves(i, us, [[-1, 0], [1, 0], [0, -1], [0, 1]], moves); break;
                case PieceType.QUEEN: this.generateSlidingMoves(i, us, [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]], moves); break;
                case PieceType.KING: this.generateKingMoves(i, us, moves); break;
            }
        }

        // Filter out moves that leave king in check
        return moves.filter(move => {
            const undo = this.makeMove(move);
            const inCheck = this.isAttacked(this.findKing(us), them);
            this.unmakeMove(move, undo);
            return !inCheck;
        });
    }

    private generatePawnMoves(sq: number, color: Color, moves: Move[]) {
        const r = Math.floor(sq / 8);
        const c = sq % 8;
        const dir = color === Color.WHITE ? -1 : 1;
        const startRank = color === Color.WHITE ? 6 : 1;
        const promoRank = color === Color.WHITE ? 0 : 7;

        // Push
        const nextSq = sq + dir * 8;
        if (this.board[nextSq] === PieceType.NONE) {
            if (Math.floor(nextSq / 8) === promoRank) {
                this.addPromotionMoves(sq, nextSq, moves);
            } else {
                moves.push({ from: sq, to: nextSq, piece: this.board[sq], flags: MoveFlags.PAWN_PUSH });
                const doubleSq = sq + dir * 16;
                if (r === startRank && this.board[doubleSq] === PieceType.NONE) {
                    moves.push({ from: sq, to: doubleSq, piece: this.board[sq], flags: MoveFlags.PAWN_DOUBLE_PUSH });
                }
            }
        }

        // Captures
        for (const dc of [-1, 1]) {
            const nextC = c + dc;
            if (nextC < 0 || nextC > 7) continue;
            const targetSq = (r + dir) * 8 + nextC;
            const targetPiece = this.board[targetSq];

            if (targetPiece !== PieceType.NONE && (targetPiece & COLOR_MASK) !== color) {
                if (Math.floor(targetSq / 8) === promoRank) {
                    this.addPromotionMoves(sq, targetSq, moves, targetPiece);
                } else {
                    moves.push({ from: sq, to: targetSq, piece: this.board[sq], captured: targetPiece, flags: MoveFlags.CAPTURE });
                }
            } else if (targetSq === this.epSquare) {
                const epCaptured = PieceType.PAWN | (color === Color.WHITE ? Color.BLACK : Color.WHITE);
                moves.push({ from: sq, to: targetSq, piece: this.board[sq], captured: epCaptured, flags: MoveFlags.EN_PASSANT });
            }
        }
    }

    private addPromotionMoves(from: number, to: number, moves: Move[], captured?: Piece) {
        const piece = this.board[from];
        const flags = MoveFlags.PROMOTION | (captured ? MoveFlags.CAPTURE : MoveFlags.QUIET);
        moves.push({ from, to, piece, captured, promotion: PieceType.QUEEN, flags });
        moves.push({ from, to, piece, captured, promotion: PieceType.ROOK, flags });
        moves.push({ from, to, piece, captured, promotion: PieceType.BISHOP, flags });
        moves.push({ from, to, piece, captured, promotion: PieceType.KNIGHT, flags });
    }

    private generateKnightMoves(sq: number, color: Color, moves: Move[]) {
        const jumps = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        const r = Math.floor(sq / 8);
        const c = sq % 8;
        for (const [dr, dc] of jumps) {
            const nr = r + dr, nc = c + dc;
            if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
            const targetSq = nr * 8 + nc;
            const targetPiece = this.board[targetSq];
            if (targetPiece === PieceType.NONE) {
                moves.push({ from: sq, to: targetSq, piece: this.board[sq], flags: MoveFlags.QUIET });
            } else if ((targetPiece & COLOR_MASK) !== color) {
                moves.push({ from: sq, to: targetSq, piece: this.board[sq], captured: targetPiece, flags: MoveFlags.CAPTURE });
            }
        }
    }

    private generateSlidingMoves(sq: number, color: Color, dirs: number[][], moves: Move[]) {
        const r = Math.floor(sq / 8);
        const c = sq % 8;
        for (const [dr, dc] of dirs) {
            let nr = r + dr, nc = c + dc;
            while (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
                const targetSq = nr * 8 + nc;
                const targetPiece = this.board[targetSq];
                if (targetPiece === PieceType.NONE) {
                    moves.push({ from: sq, to: targetSq, piece: this.board[sq], flags: MoveFlags.QUIET });
                } else {
                    if ((targetPiece & COLOR_MASK) !== color) {
                        moves.push({ from: sq, to: targetSq, piece: this.board[sq], captured: targetPiece, flags: MoveFlags.CAPTURE });
                    }
                    break;
                }
                nr += dr; nc += dc;
            }
        }
    }

    private generateKingMoves(sq: number, color: Color, moves: Move[]) {
        const r = Math.floor(sq / 8);
        const c = sq % 8;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
                const targetSq = nr * 8 + nc;
                const targetPiece = this.board[targetSq];
                if (targetPiece === PieceType.NONE) {
                    moves.push({ from: sq, to: targetSq, piece: this.board[sq], flags: MoveFlags.QUIET });
                } else if ((targetPiece & COLOR_MASK) !== color) {
                    moves.push({ from: sq, to: targetSq, piece: this.board[sq], captured: targetPiece, flags: MoveFlags.CAPTURE });
                }
            }
        }

        // Castling
        const them = color === Color.WHITE ? Color.BLACK : Color.WHITE;
        if (color === Color.WHITE) {
            if ((this.castlingRights & 1) && this.board[Square.F1] === 0 && this.board[Square.G1] === 0) {
                if (!this.isAttacked(Square.E1, them) && !this.isAttacked(Square.F1, them) && !this.isAttacked(Square.G1, them)) {
                    moves.push({ from: sq, to: Square.G1, piece: this.board[sq], flags: MoveFlags.CASTLE_KINGSIDE });
                }
            }
            if ((this.castlingRights & 2) && this.board[Square.D1] === 0 && this.board[Square.C1] === 0 && this.board[Square.B1] === 0) {
                if (!this.isAttacked(Square.E1, them) && !this.isAttacked(Square.D1, them) && !this.isAttacked(Square.C1, them)) {
                    moves.push({ from: sq, to: Square.C1, piece: this.board[sq], flags: MoveFlags.CASTLE_QUEENSIDE });
                }
            }
        } else {
            if ((this.castlingRights & 4) && this.board[Square.F8] === 0 && this.board[Square.G8] === 0) {
                if (!this.isAttacked(Square.E8, them) && !this.isAttacked(Square.F8, them) && !this.isAttacked(Square.G8, them)) {
                    moves.push({ from: sq, to: Square.G8, piece: this.board[sq], flags: MoveFlags.CASTLE_KINGSIDE });
                }
            }
            if ((this.castlingRights & 8) && this.board[Square.D8] === 0 && this.board[Square.C8] === 0 && this.board[Square.B8] === 0) {
                if (!this.isAttacked(Square.E8, them) && !this.isAttacked(Square.D8, them) && !this.isAttacked(Square.C8, them)) {
                    moves.push({ from: sq, to: Square.C8, piece: this.board[sq], flags: MoveFlags.CASTLE_QUEENSIDE });
                }
            }
        }
    }

    isAttacked(sq: number, attackerColor: Color): boolean {
        // Knight
        const jumps = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        const r = Math.floor(sq / 8), c = sq % 8;
        for (const [dr, dc] of jumps) {
            const nr = r + dr, nc = c + dc;
            if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
            const p = this.board[nr * 8 + nc];
            if (p === (PieceType.KNIGHT | attackerColor)) return true;
        }

        // King
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
                if (this.board[nr * 8 + nc] === (PieceType.KING | attackerColor)) return true;
            }
        }

        // Pawns
        const pawnDir = attackerColor === Color.WHITE ? 1 : -1;
        for (const dc of [-1, 1]) {
            const nr = r + pawnDir, nc = c + dc;
            if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
            if (this.board[nr * 8 + nc] === (PieceType.PAWN | attackerColor)) return true;
        }

        // Sliding
        if (this.isAttackedBySliding(sq, attackerColor, [[-1, 0], [1, 0], [0, -1], [0, 1]], [PieceType.ROOK, PieceType.QUEEN])) return true;
        if (this.isAttackedBySliding(sq, attackerColor, [[-1, -1], [-1, 1], [1, -1], [1, 1]], [PieceType.BISHOP, PieceType.QUEEN])) return true;

        return false;
    }

    private isAttackedBySliding(sq: number, color: Color, dirs: number[][], types: PieceType[]): boolean {
        const r = Math.floor(sq / 8), c = sq % 8;
        for (const [dr, dc] of dirs) {
            let nr = r + dr, nc = c + dc;
            while (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
                const p = this.board[nr * 8 + nc];
                if (p !== PieceType.NONE) {
                    if ((p & COLOR_MASK) === color && types.includes(p & PIECE_MASK)) return true;
                    break;
                }
                nr += dr; nc += dc;
            }
        }
        return false;
    }

    findKing(color: Color): number {
        const target = PieceType.KING | color;
        for (let i = 0; i < 64; i++) {
            if (this.board[i] === target) return i;
        }
        return -1;
    }

    makeMove(move: Move): { castlingRights: number, epSquare: number | null, halfMoveClock: number } {
        const undo = {
            castlingRights: this.castlingRights,
            epSquare: this.epSquare,
            halfMoveClock: this.halfMoveClock
        };

        const { from, to, piece, flags, promotion } = move;
        const type = piece & PIECE_MASK;

        // Update board
        this.board[from] = PieceType.NONE;
        if (flags & MoveFlags.PROMOTION) {
            this.board[to] = promotion! | (piece & COLOR_MASK);
        } else {
            this.board[to] = piece;
        }

        // Special moves
        if (flags & MoveFlags.EN_PASSANT) {
            const captureRow = (piece & COLOR_MASK) === Color.WHITE ? Math.floor(to / 8) + 1 : Math.floor(to / 8) - 1;
            this.board[captureRow * 8 + (to % 8)] = PieceType.NONE;
        } else if (flags & MoveFlags.CASTLE_KINGSIDE) {
            const r = Math.floor(to / 8);
            this.board[r * 8 + 7] = PieceType.NONE;
            this.board[r * 8 + 5] = PieceType.ROOK | (piece & COLOR_MASK);
        } else if (flags & MoveFlags.CASTLE_QUEENSIDE) {
            const r = Math.floor(to / 8);
            this.board[r * 8 + 0] = PieceType.NONE;
            this.board[r * 8 + 3] = PieceType.ROOK | (piece & COLOR_MASK);
        }

        // Ep square
        this.epSquare = (flags & MoveFlags.PAWN_DOUBLE_PUSH) ? (from + to) / 2 : null;

        // Castling rights
        if (type === PieceType.KING) {
            this.castlingRights &= (piece & COLOR_MASK) === Color.WHITE ? ~3 : ~12;
        }
        if (type === PieceType.ROOK) {
            if (from === Square.A1) this.castlingRights &= ~2;
            if (from === Square.H1) this.castlingRights &= ~1;
            if (from === Square.A8) this.castlingRights &= ~8;
            if (from === Square.H8) this.castlingRights &= ~4;
        }
        // Also if a rook is captured
        if (to === Square.A1) this.castlingRights &= ~2;
        if (to === Square.H1) this.castlingRights &= ~1;
        if (to === Square.A8) this.castlingRights &= ~8;
        if (to === Square.H8) this.castlingRights &= ~4;

        // Clocks
        if (type === PieceType.PAWN || (flags & MoveFlags.CAPTURE)) {
            this.halfMoveClock = 0;
        } else {
            this.halfMoveClock++;
        }

        if (this.turn === Color.BLACK) {
            this.fullMoveNumber++;
        }
        this.turn = this.turn === Color.WHITE ? Color.BLACK : Color.WHITE;

        return undo;
    }

    unmakeMove(move: Move, undo: { castlingRights: number, epSquare: number | null, halfMoveClock: number }) {
        const { from, to, piece, captured, flags } = move;

        this.board[from] = piece;
        this.board[to] = captured || PieceType.NONE;

        if (flags & MoveFlags.EN_PASSANT) {
            this.board[to] = PieceType.NONE;
            const captureRow = (piece & COLOR_MASK) === Color.WHITE ? Math.floor(to / 8) + 1 : Math.floor(to / 8) - 1;
            this.board[captureRow * 8 + (to % 8)] = captured!;
        } else if (flags & MoveFlags.CASTLE_KINGSIDE) {
            const r = Math.floor(to / 8);
            this.board[r * 8 + 5] = PieceType.NONE;
            this.board[r * 8 + 7] = PieceType.ROOK | (piece & COLOR_MASK);
        } else if (flags & MoveFlags.CASTLE_QUEENSIDE) {
            const r = Math.floor(to / 8);
            this.board[r * 8 + 3] = PieceType.NONE;
            this.board[r * 8 + 0] = PieceType.ROOK | (piece & COLOR_MASK);
        }

        this.castlingRights = undo.castlingRights;
        this.epSquare = undo.epSquare;
        this.halfMoveClock = undo.halfMoveClock;
        this.turn = this.turn === Color.WHITE ? Color.BLACK : Color.WHITE;
        if (this.turn === Color.BLACK) {
            this.fullMoveNumber--;
        }
    }

    getFen(): string {
        let fen = "";
        for (let r = 0; r < 8; r++) {
            let empty = 0;
            for (let c = 0; c < 8; c++) {
                const p = this.board[r * 8 + c];
                if (p === PieceType.NONE) {
                    empty++;
                } else {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    fen += this.pieceToChar(p);
                }
            }
            if (empty > 0) fen += empty;
            if (r < 7) fen += "/";
        }

        fen += ` ${this.turn === Color.WHITE ? 'w' : 'b'}`;

        let rights = "";
        if (this.castlingRights & 1) rights += 'K';
        if (this.castlingRights & 2) rights += 'Q';
        if (this.castlingRights & 4) rights += 'k';
        if (this.castlingRights & 8) rights += 'q';
        fen += ` ${rights || '-'}`;

        fen += ` ${this.epSquare === null ? '-' : this.squareToAlgebraic(this.epSquare)}`;
        fen += ` ${this.halfMoveClock} ${this.fullMoveNumber}`;

        return fen;
    }

    private pieceToChar(p: Piece): string {
        const type = p & PIECE_MASK;
        const color = p & COLOR_MASK;
        let char = "";
        switch (type) {
            case PieceType.PAWN: char = 'p'; break;
            case PieceType.KNIGHT: char = 'n'; break;
            case PieceType.BISHOP: char = 'b'; break;
            case PieceType.ROOK: char = 'r'; break;
            case PieceType.QUEEN: char = 'q'; break;
            case PieceType.KING: char = 'k'; break;
        }
        return color === Color.WHITE ? char.toUpperCase() : char;
    }

    private squareToAlgebraic(sq: number): string {
        const file = String.fromCharCode('a'.charCodeAt(0) + (sq % 8));
        const rank = 8 - Math.floor(sq / 8);
        return `${file}${rank}`;
    }
}
