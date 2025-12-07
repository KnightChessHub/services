import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';
import { QueueEntry } from '../models/queue.model';
import { findMatch, calculateRatingTolerance } from '../utils/matchmaking';

const RATING_SERVICE_URL = process.env.RATING_SERVICE_URL || 'http://localhost:3007';
const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:3004';

export const joinQueue = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { timeControl = 'rapid' } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!['blitz', 'rapid', 'classical', 'bullet'].includes(timeControl)) {
      return res.status(400).json({ error: 'Invalid time control' });
    }

    const existingEntry = await QueueEntry.findOne({ userId });

    if (existingEntry) {
      return res.status(400).json({ error: 'Already in queue' });
    }

    let rating = 1200;

    try {
      const ratingResponse = await axios.get(`${RATING_SERVICE_URL}/${userId}?timeControl=${timeControl}`, {
        headers: { Authorization: req.headers.authorization },
      });

      if (ratingResponse.data.success) {
        rating = ratingResponse.data.data.rating;
      }
    } catch (error) {
      console.error('Failed to fetch rating:', error);
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const queueEntry = new QueueEntry({
      userId,
      rating,
      timeControl,
      expiresAt,
    });

    await queueEntry.save();

    const queue = await QueueEntry.find({
      timeControl,
      userId: { $ne: userId },
      expiresAt: { $gt: new Date() },
    });

    const waitTime = (new Date().getTime() - queueEntry.joinedAt.getTime()) / 1000;
    const ratingTolerance = calculateRatingTolerance(waitTime);
    const match = findMatch(rating, queue, ratingTolerance);

    if (match) {
      await QueueEntry.deleteMany({ userId: { $in: [userId, match.userId] } });

      try {
        const gameResponse = await axios.post(
          `${GAME_SERVICE_URL}`,
          {
            gameType: 'online',
            blackPlayerId: match.userId,
          },
          {
            headers: { Authorization: req.headers.authorization },
          }
        );

        if (gameResponse.data.success) {
          return res.json({
            success: true,
            data: {
              matched: true,
              game: gameResponse.data.data,
              opponent: {
                userId: match.userId,
                rating: match.rating,
              },
            },
          });
        }
      } catch (error) {
        console.error('Failed to create game:', error);
      }
    }

    res.json({
      success: true,
      data: {
        matched: false,
        queuePosition: queue.length + 1,
        estimatedWaitTime: Math.max(30, queue.length * 10),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const leaveQueue = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await QueueEntry.deleteOne({ userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Not in queue' });
    }

    res.json({
      success: true,
      data: { message: 'Left queue successfully' },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getQueueStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const entry = await QueueEntry.findOne({ userId });

    if (!entry) {
      return res.status(404).json({ error: 'Not in queue' });
    }

    const queue = await QueueEntry.find({
      timeControl: entry.timeControl,
      expiresAt: { $gt: new Date() },
    }).sort({ rating: 1 });

    const position = queue.findIndex((e) => e.userId === userId) + 1;

    res.json({
      success: true,
      data: {
        timeControl: entry.timeControl,
        rating: entry.rating,
        position,
        queueSize: queue.length,
        waitTime: Math.floor((new Date().getTime() - entry.joinedAt.getTime()) / 1000),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

