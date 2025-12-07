import mongoose, { Schema, Document } from 'mongoose';

export interface ITimer extends Document {
  gameId: string;
  timeControl: 'blitz' | 'rapid' | 'classical' | 'bullet';
  whiteTimeRemaining: number;
  blackTimeRemaining: number;
  whiteIncrement?: number;
  blackIncrement?: number;
  isRunning: boolean;
  currentPlayer: 'white' | 'black';
  lastMoveTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TimerSchema = new Schema<ITimer>(
  {
    gameId: { type: String, required: true, unique: true, index: true },
    timeControl: { type: String, enum: ['blitz', 'rapid', 'classical', 'bullet'], required: true },
    whiteTimeRemaining: { type: Number, required: true },
    blackTimeRemaining: { type: Number, required: true },
    whiteIncrement: { type: Number, default: 0 },
    blackIncrement: { type: Number, default: 0 },
    isRunning: { type: Boolean, default: false },
    currentPlayer: { type: String, enum: ['white', 'black'], default: 'white' },
    lastMoveTime: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Timer = mongoose.model<ITimer>('Timer', TimerSchema);

