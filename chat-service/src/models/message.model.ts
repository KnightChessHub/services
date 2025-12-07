import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  senderId: string;
  recipientId: string;
  content: string;
  type: 'direct' | 'game' | 'group';
  relatedId?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: { type: String, required: true, index: true },
    recipientId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['direct', 'game', 'group'], default: 'direct', index: true },
    relatedId: { type: String, index: true },
    read: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 });
MessageSchema.index({ recipientId: 1, read: 1, createdAt: -1 });
MessageSchema.index({ type: 1, relatedId: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);

