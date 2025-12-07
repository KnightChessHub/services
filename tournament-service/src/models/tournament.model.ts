import mongoose, { Schema, Document } from 'mongoose';

export type TournamentStatus = 'upcoming' | 'registration' | 'active' | 'finished' | 'cancelled';
export type TournamentFormat = 'swiss' | 'round_robin' | 'elimination' | 'single_elimination' | 'double_elimination';
export type TournamentTimeControl = 'blitz' | 'rapid' | 'classical' | 'bullet';

export interface IParticipant {
  userId: string;
  rating?: number;
  score: number;
  wins: number;
  losses: number;
  draws: number;
  joinedAt: Date;
}

export interface IRound {
  roundNumber: number;
  games: string[];
  status: 'pending' | 'active' | 'finished';
  startedAt?: Date;
  finishedAt?: Date;
}

export interface ITournament extends Document {
  name: string;
  description?: string;
  organizerId: string;
  format: TournamentFormat;
  timeControl: TournamentTimeControl;
  maxParticipants: number;
  status: TournamentStatus;
  participants: IParticipant[];
  rounds: IRound[];
  currentRound: number;
  startDate: Date;
  endDate?: Date;
  prizePool?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>({
  userId: { type: String, required: true },
  rating: { type: Number },
  score: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
});

const RoundSchema = new Schema<IRound>({
  roundNumber: { type: Number, required: true },
  games: [{ type: String }],
  status: { type: String, enum: ['pending', 'active', 'finished'], default: 'pending' },
  startedAt: { type: Date },
  finishedAt: { type: Date },
});

const TournamentSchema = new Schema<ITournament>(
  {
    name: { type: String, required: true },
    description: { type: String },
    organizerId: { type: String, required: true, index: true },
    format: { type: String, enum: ['swiss', 'round_robin', 'elimination', 'single_elimination', 'double_elimination'], required: true },
    timeControl: { type: String, enum: ['blitz', 'rapid', 'classical', 'bullet'], required: true },
    maxParticipants: { type: Number, required: true },
    status: { type: String, enum: ['upcoming', 'registration', 'active', 'finished', 'cancelled'], default: 'upcoming' },
    participants: [ParticipantSchema],
    rounds: [RoundSchema],
    currentRound: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    prizePool: { type: Number },
  },
  {
    timestamps: true,
  }
);

TournamentSchema.index({ organizerId: 1, status: 1 });
TournamentSchema.index({ status: 1 });
TournamentSchema.index({ startDate: 1 });

export const Tournament = mongoose.model<ITournament>('Tournament', TournamentSchema);

