
import { Color } from './types';

export class Zobrist {
    private static pieceKeys: BigUint64Array;
    private static turnKey: bigint;
    private static castlingKeys: BigUint64Array;
    private static epKeys: BigUint64Array;

    private static initialized = false;

    static init() {
        if (this.initialized) return;

        this.pieceKeys = new BigUint64Array(64 * 16); // 64 squares * 16 possible piece values
        for (let i = 0; i < 64 * 16; i++) {
            this.pieceKeys[i] = this.random64();
        }

        this.turnKey = this.random64();

        this.castlingKeys = new BigUint64Array(16);
        for (let i = 0; i < 16; i++) {
            this.castlingKeys[i] = this.random64();
        }

        this.epKeys = new BigUint64Array(8); // Only need file for EP
        for (let i = 0; i < 8; i++) {
            this.epKeys[i] = this.random64();
        }

        this.initialized = true;
    }

    private static random64(): bigint {
        const high = BigInt(Math.floor(Math.random() * 0x100000000));
        const low = BigInt(Math.floor(Math.random() * 0x100000000));
        return (high << 32n) | low;
    }

    static calculateHash(board: Uint8Array, turn: Color, castlingRights: number, epSquare: number | null): bigint {
        this.init();
        let hash = 0n;

        for (let i = 0; i < 64; i++) {
            const piece = board[i];
            if (piece !== 0) {
                hash ^= this.pieceKeys[i * 16 + piece];
            }
        }

        if (turn === Color.BLACK) {
            hash ^= this.turnKey;
        }

        hash ^= this.castlingKeys[castlingRights];

        if (epSquare !== null) {
            hash ^= this.epKeys[epSquare % 8];
        }

        return hash;
    }
}
