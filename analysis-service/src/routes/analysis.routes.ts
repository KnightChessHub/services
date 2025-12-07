import { Router } from 'express';
import {
  analyzeGame,
  getAnalysis,
  getMyAnalyses,
} from '../controllers/analysis.controller';

export const analysisRoutes = Router();

analysisRoutes.post('/analyze', analyzeGame);
analysisRoutes.get('/my', getMyAnalyses);
analysisRoutes.get('/:gameId', getAnalysis);

