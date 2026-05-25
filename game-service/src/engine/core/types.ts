
export enum Color {
    WHITE = 0,
    BLACK = 8,
}

export enum PieceType {
    NONE = 0,
    PAWN = 1,
    KNIGHT = 2,
    BISHOP = 3,
    ROOK = 4,
    QUEEN = 5,
    KING = 6,
}

export const PIECE_MASK = 0x07;
export const COLOR_MASK = 0x08;

export type Piece = number; // PieceType | (Color)

export enum Square {
    A8 = 0, B8, C8, D8, E8, F8, G8, H8,
    A7 = 8, B7, C7, D7, E7, F7, G7, H7,
    A6 = 16, B6, C6, D6, E6, F6, G6, H6,
    A5 = 24, B5, C5, D5, E5, F5, G5, H5,
    A4 = 32, B4, C4, D4, E4, F4, G4, H4,
    A3 = 40, B3, C3, D3, E3, F3, G3, H3,
    A2 = 48, B2, C2, D2, E2, F2, G2, H2,
    A1 = 56, B1, C1, D1, E1, F1, G1, H1,
}

export interface Move {
    from: number;
    to: number;
    piece: Piece;
    captured?: Piece;
    promotion?: PieceType;
    flags: MoveFlags;
}

export enum MoveFlags {
    QUIET = 0,
    PAWN_PUSH = 1,
    PAWN_DOUBLE_PUSH = 2,
    CAPTURE = 4,
    EN_PASSANT = 8,
    CASTLE_KINGSIDE = 16,
    CASTLE_QUEENSIDE = 32,
    PROMOTION = 64,
}

export const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
