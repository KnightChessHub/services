import { Router } from 'express';
import {
  sendMessage,
  getConversation,
  getConversations,
  markAsRead,
  getUnreadCount,
} from '../controllers/message.controller';

export const messageRoutes = Router();

messageRoutes.post('/', sendMessage);
messageRoutes.get('/conversations', getConversations);
messageRoutes.get('/conversations/:userId', getConversation);
messageRoutes.get('/unread/count', getUnreadCount);
messageRoutes.put('/:messageId/read', markAsRead);

