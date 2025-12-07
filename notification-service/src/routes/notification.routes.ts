import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
} from '../controllers/notification.controller';

export const notificationRoutes = Router();

notificationRoutes.get('/', getNotifications);
notificationRoutes.get('/unread/count', getUnreadCount);
notificationRoutes.put('/:id/read', markAsRead);
notificationRoutes.put('/read/all', markAllAsRead);
notificationRoutes.delete('/:id', deleteNotification);

