import { Router } from 'express';
import { getReplay, getMyReplays } from '../controllers/replay.controller';

export const replayRoutes = Router();

replayRoutes.get('/my', getMyReplays);
replayRoutes.get('/:gameId', getReplay);

