import mongoose, { Schema, Document } from 'mongoose';

export interface IReplay extends Document {
  gameId: string;
  pgn: string;
  moves: Array<{
    moveNumber: number;
    white?: string;
    black?: string;
    fen: string;
    timestamp: Date;
  }>;
  whitePlayerId: string;
  blackPlayerId: string;
  result: string;
  timeControl: string;
  createdAt: Date;
  updatedAt: Date;
}

const MoveSchema = new Schema({
  moveNumber: { type: Number, required: true },
  white: { type: String },
  black: { type: String },
  fen: { type: String, required: true },
  timestamp: { type: Date, required: true },
});

const ReplaySchema = new Schema<IReplay>(
  {
    gameId: { type: String, required: true, unique: true, index: true },
    pgn: { type: String, required: true },
    moves: [MoveSchema],
    whitePlayerId: { type: String, required: true, index: true },
    blackPlayerId: { type: String, required: true, index: true },
    result: { type: String, required: true },
    timeControl: { type: String },
  },
  {
    timestamps: true,
  }
);

ReplaySchema.index({ whitePlayerId: 1, createdAt: -1 });
ReplaySchema.index({ blackPlayerId: 1, createdAt: -1 });

export const Replay = mongoose.model<IReplay>('Replay', ReplaySchema);

