import { Router } from 'express';
import { startTimer, stopTimer, getTimer, pauseTimer } from '../controllers/timer.controller';

export const timerRoutes = Router();

timerRoutes.get('/:gameId', getTimer);
timerRoutes.post('/:gameId/start', startTimer);
timerRoutes.post('/:gameId/stop', stopTimer);
timerRoutes.post('/:gameId/pause', pauseTimer);

