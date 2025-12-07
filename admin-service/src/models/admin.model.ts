import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  userId: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ['super_admin', 'admin', 'moderator'], required: true, index: true },
    permissions: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);

