import { Router } from 'express';
import { getRating, getLeaderboard, recordGameResult } from '../controllers/rating.controller';

export const ratingRoutes = Router();

ratingRoutes.get('/leaderboard', getLeaderboard);
ratingRoutes.get('/:userId?', getRating);
ratingRoutes.post('/record', recordGameResult);

