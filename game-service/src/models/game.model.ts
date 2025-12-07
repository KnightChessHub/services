import mongoose, { Schema, Document } from 'mongoose';

export type GameType = 'online' | 'offline';
export type GameStatus = 'pending' | 'active' | 'finished' | 'abandoned';
export type GameResult = 'white_wins' | 'black_wins' | 'draw' | null;

export interface IMove {
  from: string;
  to: string;
  promotion?: string;
  san?: string;
  timestamp: Date;
}

export interface IGame extends Document {
  gameType: GameType;
  status: GameStatus;
  whitePlayerId: string;
  blackPlayerId?: string;
  currentTurn: 'white' | 'black';
  moves: IMove[];
  fen: string;
  result: GameResult;
  winnerId?: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
}

const MoveSchema = new Schema<IMove>({
  from: { type: String, required: true },
  to: { type: String, required: true },
  promotion: { type: String },
  san: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const GameSchema = new Schema<IGame>(
  {
    gameType: { type: String, enum: ['online', 'offline'], required: true },
    status: { type: String, enum: ['pending', 'active', 'finished', 'abandoned'], default: 'pending' },
    whitePlayerId: { type: String, required: true, index: true },
    blackPlayerId: { type: String, index: true },
    currentTurn: { type: String, enum: ['white', 'black'], default: 'white' },
    moves: [MoveSchema],
    fen: { type: String, default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' },
    result: { type: String, enum: ['white_wins', 'black_wins', 'draw', null], default: null },
    winnerId: { type: String },
    startedAt: { type: Date },
    finishedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

GameSchema.index({ whitePlayerId: 1, status: 1 });
GameSchema.index({ blackPlayerId: 1, status: 1 });
GameSchema.index({ status: 1 });

export const Game = mongoose.model<IGame>('Game', GameSchema);

