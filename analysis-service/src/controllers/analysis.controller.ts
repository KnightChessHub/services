import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';
import { Analysis } from '../models/analysis.model';
import { analyzeMove, calculateOverallAccuracy, countStats } from '../utils/analysis';

const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:3004';

export const analyzeGame = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { gameId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!gameId) {
      return res.status(400).json({ error: 'Game ID is required' });
    }

    const existingAnalysis = await Analysis.findOne({ gameId });

    if (existingAnalysis) {
      return res.json({
        success: true,
        data: {
          id: existingAnalysis._id.toString(),
          gameId: existingAnalysis.gameId,
          overallAccuracy: existingAnalysis.overallAccuracy,
          movesAnalysis: existingAnalysis.movesAnalysis,
          averageEvaluation: existingAnalysis.averageEvaluation,
          blunders: existingAnalysis.blunders,
          mistakes: existingAnalysis.mistakes,
          inaccuracies: existingAnalysis.inaccuracies,
          bestMoves: existingAnalysis.bestMoves,
          createdAt: existingAnalysis.createdAt,
        },
      });
    }

    try {
      const gameResponse = await axios.get(`${GAME_SERVICE_URL}/${gameId}`, {
        headers: { Authorization: req.headers.authorization },
      });

      const game = gameResponse.data.data;

      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      if (game.whitePlayerId !== userId && game.blackPlayerId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (game.status !== 'finished') {
        return res.status(400).json({ error: 'Game must be finished to analyze' });
      }

      const movesAnalysis = game.moves.map((move: any, index: number) => {
        const moveNumber = Math.floor(index / 2) + 1;
        const evaluation = Math.random() * 2 - 1;
        const bestEvaluation = evaluation + (Math.random() * 0.5 - 0.25);

        return analyzeMove(
          moveNumber,
          move.from,
          move.to,
          evaluation,
          bestEvaluation,
          `${move.from}${move.to}`
        );
      });

      const overallAccuracy = calculateOverallAccuracy(movesAnalysis);
      const stats = countStats(movesAnalysis);
      const averageEvaluation = movesAnalysis.reduce((sum, m) => sum + m.evaluation, 0) / movesAnalysis.length;

      const analysis = new Analysis({
        gameId,
        userId,
        overallAccuracy,
        movesAnalysis,
        averageEvaluation,
        blunders: stats.blunders,
        mistakes: stats.mistakes,
        inaccuracies: stats.inaccuracies,
        bestMoves: stats.bestMoves,
      });

      await analysis.save();

      res.status(201).json({
        success: true,
        data: {
          id: analysis._id.toString(),
          gameId: analysis.gameId,
          overallAccuracy: analysis.overallAccuracy,
          movesAnalysis: analysis.movesAnalysis,
          averageEvaluation: analysis.averageEvaluation,
          blunders: analysis.blunders,
          mistakes: analysis.mistakes,
          inaccuracies: analysis.inaccuracies,
          bestMoves: analysis.bestMoves,
          createdAt: analysis.createdAt,
        },
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        return res.status(404).json({ error: 'Game not found' });
      }
      throw error;
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { gameId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const analysis = await Analysis.findOne({ gameId });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    if (analysis.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      data: {
        id: analysis._id.toString(),
        gameId: analysis.gameId,
        overallAccuracy: analysis.overallAccuracy,
        movesAnalysis: analysis.movesAnalysis,
        averageEvaluation: analysis.averageEvaluation,
        blunders: analysis.blunders,
        mistakes: analysis.mistakes,
        inaccuracies: analysis.inaccuracies,
        bestMoves: analysis.bestMoves,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyAnalyses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const analyses = await Analysis.find({ userId }).sort({ createdAt: -1 }).limit(50);

    res.json({
      success: true,
      data: analyses.map((analysis) => ({
        id: analysis._id.toString(),
        gameId: analysis.gameId,
        overallAccuracy: analysis.overallAccuracy,
        averageEvaluation: analysis.averageEvaluation,
        blunders: analysis.blunders,
        mistakes: analysis.mistakes,
        inaccuracies: analysis.inaccuracies,
        bestMoves: analysis.bestMoves,
        createdAt: analysis.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

