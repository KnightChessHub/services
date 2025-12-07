import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  jobId: string;
  type: 'cleanup' | 'statistics' | 'notification' | 'tournament' | 'custom';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data: Record<string, any>;
  result?: Record<string, any>;
  error?: string;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    jobId: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ['cleanup', 'statistics', 'notification', 'tournament', 'custom'], required: true, index: true },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending', index: true },
    data: { type: Schema.Types.Mixed },
    result: { type: Schema.Types.Mixed },
    error: { type: String },
    scheduledAt: { type: Date, required: true, index: true },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

JobSchema.index({ type: 1, status: 1 });
JobSchema.index({ scheduledAt: 1, status: 1 });

export const Job = mongoose.model<IJob>('Job', JobSchema);

