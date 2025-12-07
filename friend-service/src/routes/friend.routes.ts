import { Router } from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getFriendRequests,
  removeFriend,
  blockUser,
} from '../controllers/friend.controller';

export const friendRoutes = Router();

friendRoutes.post('/request', sendFriendRequest);
friendRoutes.get('/requests', getFriendRequests);
friendRoutes.put('/requests/:id/accept', acceptFriendRequest);
friendRoutes.delete('/requests/:id', rejectFriendRequest);
friendRoutes.get('/list', getFriends);
friendRoutes.delete('/:friendId', removeFriend);
friendRoutes.post('/block/:userId', blockUser);

