import { Router } from 'express';
import {
  createGame,
  getGame,
  getMyGames,
  makeMove,
  resignGame,
  joinGame,
} from '../controllers/game.controller';
import { validateCreateGame, validateMakeMove } from '../middleware/validator';

export const gameRoutes = Router();

gameRoutes.post('/', validateCreateGame, createGame);
gameRoutes.get('/', getMyGames);
gameRoutes.get('/:id', getGame);
gameRoutes.post('/:id/move', validateMakeMove, makeMove);
gameRoutes.post('/:id/resign', resignGame);
gameRoutes.post('/:id/join', joinGame);

