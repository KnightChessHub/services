import { Router } from 'express';
import { joinQueue, leaveQueue, getQueueStatus } from '../controllers/matchmaking.controller';

export const matchmakingRoutes = Router();

matchmakingRoutes.post('/queue', joinQueue);
matchmakingRoutes.delete('/queue', leaveQueue);
matchmakingRoutes.get('/queue/status', getQueueStatus);

