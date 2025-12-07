import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';
import { UserStatistics } from '../models/statistics.model';

const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:3004';

export const getUserStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { userId: targetUserId } = req.params;

    const targetId = targetUserId || userId;

    if (!targetId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let stats = await UserStatistics.findOne({ userId: targetId });

    if (!stats) {
      stats = new UserStatistics({
        userId: targetId,
        totalGames: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        winRate: 0,
        averageGameLength: 0,
        longestWinStreak: 0,
        currentWinStreak: 0,
        timeControls: {
          blitz: { games: 0, wins: 0, losses: 0, draws: 0 },
          rapid: { games: 0, wins: 0, losses: 0, draws: 0 },
          classical: { games: 0, wins: 0, losses: 0, draws: 0 },
          bullet: { games: 0, wins: 0, losses: 0, draws: 0 },
        },
      });
      await stats.save();
    }

    try {
      const gamesResponse = await axios.get(`${GAME_SERVICE_URL}`, {
        headers: { Authorization: req.headers.authorization },
        params: { status: 'finished' },
      });

      if (gamesResponse.data.success && gamesResponse.data.data) {
        const games = Array.isArray(gamesResponse.data.data) 
          ? gamesResponse.data.data.filter((g: any) => 
              g.whitePlayerId === targetId || g.blackPlayerId === targetId
            )
          : [];

        stats.totalGames = games.length;
        stats.wins = games.filter((g: any) => g.winnerId === targetId).length;
        stats.losses = games.filter((g: any) => 
          g.result && g.winnerId && g.winnerId !== targetId
        ).length;
        stats.draws = games.filter((g: any) => g.result === 'draw').length;
        stats.winRate = stats.totalGames > 0 ? (stats.wins / stats.totalGames) * 100 : 0;

        const gameLengths = games.map((g: any) => g.moves?.length || 0);
        stats.averageGameLength = gameLengths.length > 0
          ? gameLengths.reduce((a: number, b: number) => a + b, 0) / gameLengths.length
          : 0;

        stats.lastUpdated = new Date();
        await stats.save();
      }
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }

    res.json({
      success: true,
      data: {
        userId: stats.userId,
        totalGames: stats.totalGames,
        wins: stats.wins,
        losses: stats.losses,
        draws: stats.draws,
        winRate: Math.round(stats.winRate * 100) / 100,
        averageGameLength: Math.round(stats.averageGameLength * 100) / 100,
        longestWinStreak: stats.longestWinStreak,
        currentWinStreak: stats.currentWinStreak,
        favoriteOpening: stats.favoriteOpening,
        timeControls: stats.timeControls,
        lastUpdated: stats.lastUpdated,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGlobalStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await UserStatistics.countDocuments();
    const totalGames = await UserStatistics.aggregate([
      { $group: { _id: null, total: { $sum: '$totalGames' } } },
    ]);

    const averageWinRate = await UserStatistics.aggregate([
      { $group: { _id: null, avg: { $avg: '$winRate' } } },
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalGames: totalGames[0]?.total || 0,
        averageWinRate: Math.round((averageWinRate[0]?.avg || 0) * 100) / 100,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

