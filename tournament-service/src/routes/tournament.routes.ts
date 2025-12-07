import { Router } from 'express';
import {
  createTournament,
  getTournaments,
  getTournament,
  joinTournament,
  leaveTournament,
  startTournament,
  getMyTournaments,
} from '../controllers/tournament.controller';
import { validateCreateTournament } from '../middleware/validator';

export const tournamentRoutes = Router();

tournamentRoutes.post('/', validateCreateTournament, createTournament);
tournamentRoutes.get('/', getTournaments);
tournamentRoutes.get('/my', getMyTournaments);
tournamentRoutes.get('/:id', getTournament);
tournamentRoutes.post('/:id/join', joinTournament);
tournamentRoutes.post('/:id/leave', leaveTournament);
tournamentRoutes.post('/:id/start', startTournament);

