import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  userId: string;
  rating: number;
  peakRating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  timeControl: 'blitz' | 'rapid' | 'classical' | 'bullet' | 'all';
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    rating: { type: Number, default: 1200, index: true },
    peakRating: { type: Number, default: 1200 },
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    timeControl: { type: String, enum: ['blitz', 'rapid', 'classical', 'bullet', 'all'], default: 'all' },
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

RatingSchema.index({ rating: -1 });
RatingSchema.index({ timeControl: 1, rating: -1 });

export const Rating = mongoose.model<IRating>('Rating', RatingSchema);

