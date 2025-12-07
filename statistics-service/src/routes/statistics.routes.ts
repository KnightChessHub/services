import { Router } from 'express';
import { getUserStatistics, getGlobalStatistics } from '../controllers/statistics.controller';

export const statisticsRoutes = Router();

statisticsRoutes.get('/global', getGlobalStatistics);
statisticsRoutes.get('/:userId?', getUserStatistics);

