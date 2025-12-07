import mongoose, { Schema, Document } from 'mongoose';

export interface IMoveAnalysis {
  moveNumber: number;
  from: string;
  to: string;
  evaluation: number;
  bestMove?: string;
  accuracy: number;
  blunder: boolean;
  mistake: boolean;
  inaccuracy: boolean;
}

export interface IAnalysis extends Document {
  gameId: string;
  userId: string;
  overallAccuracy: number;
  movesAnalysis: IMoveAnalysis[];
  averageEvaluation: number;
  blunders: number;
  mistakes: number;
  inaccuracies: number;
  bestMoves: number;
  createdAt: Date;
  updatedAt: Date;
}

const MoveAnalysisSchema = new Schema<IMoveAnalysis>({
  moveNumber: { type: Number, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  evaluation: { type: Number, required: true },
  bestMove: { type: String },
  accuracy: { type: Number, required: true },
  blunder: { type: Boolean, default: false },
  mistake: { type: Boolean, default: false },
  inaccuracy: { type: Boolean, default: false },
});

const AnalysisSchema = new Schema<IAnalysis>(
  {
    gameId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    overallAccuracy: { type: Number, required: true },
    movesAnalysis: [MoveAnalysisSchema],
    averageEvaluation: { type: Number, required: true },
    blunders: { type: Number, default: 0 },
    mistakes: { type: Number, default: 0 },
    inaccuracies: { type: Number, default: 0 },
    bestMoves: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

AnalysisSchema.index({ userId: 1, createdAt: -1 });

export const Analysis = mongoose.model<IAnalysis>('Analysis', AnalysisSchema);

