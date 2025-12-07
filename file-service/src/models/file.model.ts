import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  type: 'profile' | 'game' | 'tournament' | 'group' | 'other';
  relatedId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>(
  {
    userId: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['profile', 'game', 'tournament', 'group', 'other'], default: 'other', index: true },
    relatedId: { type: String, index: true },
  },
  {
    timestamps: true,
  }
);

FileSchema.index({ userId: 1, type: 1 });
FileSchema.index({ relatedId: 1, type: 1 });

export const File = mongoose.model<IFile>('File', FileSchema);

