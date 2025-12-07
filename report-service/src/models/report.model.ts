import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  reporterId: string;
  reportedUserId?: string;
  reportedGameId?: string;
  reportedContentId?: string;
  type: 'user' | 'game' | 'content' | 'chat';
  reason: 'spam' | 'harassment' | 'cheating' | 'inappropriate_content' | 'other';
  description: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  moderatorId?: string;
  moderatorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporterId: { type: String, required: true, index: true },
    reportedUserId: { type: String, index: true },
    reportedGameId: { type: String, index: true },
    reportedContentId: { type: String, index: true },
    type: { type: String, enum: ['user', 'game', 'content', 'chat'], required: true, index: true },
    reason: { type: String, enum: ['spam', 'harassment', 'cheating', 'inappropriate_content', 'other'], required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'reviewing', 'resolved', 'dismissed'], default: 'pending', index: true },
    moderatorId: { type: String },
    moderatorNotes: { type: String },
  },
  {
    timestamps: true,
  }
);

ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ type: 1, status: 1 });

export const Report = mongoose.model<IReport>('Report', ReportSchema);

