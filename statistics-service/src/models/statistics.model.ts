import mongoose, { Schema, Document } from 'mongoose';

export interface IUserStatistics extends Document {
  userId: string;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageGameLength: number;
  longestWinStreak: number;
  currentWinStreak: number;
  favoriteOpening: string;
  timeControls: {
    blitz: { games: number; wins: number; losses: number; draws: number };
    rapid: { games: number; wins: number; losses: number; draws: number };
    classical: { games: number; wins: number; losses: number; draws: number };
    bullet: { games: number; wins: number; losses: number; draws: number };
  };
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TimeControlStatsSchema = new Schema({
  games: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
});

const UserStatisticsSchema = new Schema<IUserStatistics>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    totalGames: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    averageGameLength: { type: Number, default: 0 },
    longestWinStreak: { type: Number, default: 0 },
    currentWinStreak: { type: Number, default: 0 },
    favoriteOpening: { type: String },
    timeControls: {
      blitz: TimeControlStatsSchema,
      rapid: TimeControlStatsSchema,
      classical: TimeControlStatsSchema,
      bullet: TimeControlStatsSchema,
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const UserStatistics = mongoose.model<IUserStatistics>('UserStatistics', UserStatisticsSchema);

