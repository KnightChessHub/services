import mongoose, { Schema, Document } from 'mongoose';

export interface IConnection extends Document {
  userId: string;
  socketId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConnectionSchema = new Schema<IConnection>(
  {
    userId: { type: String, required: true, index: true },
    socketId: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ['online', 'away', 'offline'], default: 'online' },
    lastSeen: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

ConnectionSchema.index({ userId: 1, status: 1 });

export const Connection = mongoose.model<IConnection>('Connection', ConnectionSchema);

