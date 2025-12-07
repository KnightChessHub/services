import mongoose, { Schema, Document } from 'mongoose';

export interface IEmail extends Document {
  to: string;
  subject: string;
  type: 'welcome' | 'password_reset' | 'game_invite' | 'tournament' | 'notification' | 'custom';
  status: 'pending' | 'sent' | 'failed';
  html?: string;
  text?: string;
  error?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailSchema = new Schema<IEmail>(
  {
    to: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    type: { type: String, enum: ['welcome', 'password_reset', 'game_invite', 'tournament', 'notification', 'custom'], required: true, index: true },
    status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending', index: true },
    html: { type: String },
    text: { type: String },
    error: { type: String },
    sentAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

EmailSchema.index({ status: 1, createdAt: -1 });
EmailSchema.index({ type: 1, status: 1 });

export const Email = mongoose.model<IEmail>('Email', EmailSchema);

