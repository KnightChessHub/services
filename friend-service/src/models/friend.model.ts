import mongoose, { Schema, Document } from 'mongoose';

export interface IFriend extends Document {
  requesterId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

const FriendSchema = new Schema<IFriend>(
  {
    requesterId: { type: String, required: true, index: true },
    recipientId: { type: String, required: true, index: true },
    status: { type: String, enum: ['pending', 'accepted', 'blocked'], default: 'pending', index: true },
  },
  {
    timestamps: true,
  }
);

FriendSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });
FriendSchema.index({ requesterId: 1, status: 1 });
FriendSchema.index({ recipientId: 1, status: 1 });

export const Friend = mongoose.model<IFriend>('Friend', FriendSchema);

