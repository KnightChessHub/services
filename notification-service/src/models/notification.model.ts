import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'game_move' | 'game_invite' | 'tournament_start' | 'tournament_result' | 'friend_request' | 'system';

export interface INotification extends Document {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['game_move', 'game_invite', 'tournament_start', 'tournament_result', 'friend_request', 'system'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

