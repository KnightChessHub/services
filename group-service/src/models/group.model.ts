import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true },
    description: { type: String },
    ownerId: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const Group = mongoose.model<IGroup>('Group', GroupSchema);

export interface IGroupMember extends Document {
  groupId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

const GroupMemberSchema = new Schema<IGroupMember>(
  {
    groupId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
  },
  {
    timestamps: { createdAt: 'joinedAt', updatedAt: false },
  }
);

GroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });

export const GroupMember = mongoose.model<IGroupMember>('GroupMember', GroupMemberSchema);

