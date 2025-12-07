import mongoose, { Schema, Document } from 'mongoose';

export interface IQueueEntry extends Document {
  userId: string;
  rating: number;
  timeControl: 'blitz' | 'rapid' | 'classical' | 'bullet';
  joinedAt: Date;
  expiresAt: Date;
}

const QueueEntrySchema = new Schema<IQueueEntry>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    rating: { type: Number, required: true, index: true },
    timeControl: { type: String, enum: ['blitz', 'rapid', 'classical', 'bullet'], required: true, index: true },
    joinedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

QueueEntrySchema.index({ timeControl: 1, rating: 1 });
QueueEntrySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const QueueEntry = mongoose.model<IQueueEntry>('QueueEntry', QueueEntrySchema);

