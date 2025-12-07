import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Rating } from '../models/rating.model';
import { calculateNewRating, getActualScore, calculateRatingChange } from '../utils/elo';
import { getCachedLeaderboard, setCachedLeaderboard, invalidateLeaderboardCache } from '../utils/cache';

export const updateRating = async (userId: string, opponentRating: number, result: 'win' | 'loss' | 'draw', timeControl: string = 'all') => {
  let rating = await Rating.findOne({ userId, timeControl });

  if (!rating) {
    rating = new Rating({
      userId,
      rating: 1200,
      peakRating: 1200,
      timeControl,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
    });
  }

  const actualScore = getActualScore(result);
  const newRating = calculateNewRating(rating.rating, opponentRating, actualScore);

  rating.rating = newRating;
  if (newRating > rating.peakRating) {
    rating.peakRating = newRating;
  }
  rating.gamesPlayed += 1;

  if (result === 'win') rating.wins += 1;
  else if (result === 'loss') rating.losses += 1;
  else rating.draws += 1;

  rating.winRate = rating.gamesPlayed > 0 ? (rating.wins / rating.gamesPlayed) * 100 : 0;
  rating.lastUpdated = new Date();

  await rating.save();
  return rating;
};

export const getRating = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { userId: targetUserId } = req.params;
    const { timeControl = 'all' } = req.query;

    const targetId = targetUserId || userId;

    if (!targetId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let rating = await Rating.findOne({ userId: targetId, timeControl });

    if (!rating) {
      rating = new Rating({
        userId: targetId,
        rating: 1200,
        peakRating: 1200,
        timeControl,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        winRate: 0,
      });
      await rating.save();
    }

    res.json({
      success: true,
      data: {
        userId: rating.userId,
        rating: rating.rating,
        peakRating: rating.peakRating,
        gamesPlayed: rating.gamesPlayed,
        wins: rating.wins,
        losses: rating.losses,
        draws: rating.draws,
        winRate: Math.round(rating.winRate * 100) / 100,
        timeControl: rating.timeControl,
        lastUpdated: rating.lastUpdated,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const { timeControl = 'all', limit = 100 } = req.query;

    const cacheKey = `${timeControl}:${limit}`;
    const cached = await getCachedLeaderboard(cacheKey, Number(limit));
    
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const ratings = await Rating.find({ timeControl })
      .sort({ rating: -1 })
      .limit(Number(limit));

    const data = ratings.map((rating, index) => ({
      rank: index + 1,
      userId: rating.userId,
      rating: rating.rating,
      peakRating: rating.peakRating,
      gamesPlayed: rating.gamesPlayed,
      wins: rating.wins,
      losses: rating.losses,
      draws: rating.draws,
      winRate: Math.round(rating.winRate * 100) / 100,
    }));

    await setCachedLeaderboard(cacheKey, Number(limit), data);

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const recordGameResult = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { opponentId, result, opponentRating, timeControl } = req.body;

    if (!opponentId || !result || opponentRating === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['win', 'loss', 'draw'].includes(result)) {
      return res.status(400).json({ error: 'Invalid result. Must be win, loss, or draw' });
    }

    const userRating = await updateRating(userId, opponentRating, result, timeControl || 'all');
    const opponentResult = result === 'win' ? 'loss' : result === 'loss' ? 'win' : 'draw';
    await updateRating(opponentId, userRating.rating, opponentResult, timeControl || 'all');

    await invalidateLeaderboardCache(timeControl || 'all');

    const oldRating = userRating.rating - calculateRatingChange(userRating.rating, opponentRating, getActualScore(result));
    const ratingChange = userRating.rating - oldRating;

    res.json({
      success: true,
      data: {
        userId: userRating.userId,
        newRating: userRating.rating,
        ratingChange,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

