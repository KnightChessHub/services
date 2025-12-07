import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Timer } from '../models/timer.model';
import { getTimeControlConfig, calculateTimeRemaining } from '../utils/timeControls';

const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:3004';

export const createTimer = async (gameId: string, timeControl: string) => {
  const config = getTimeControlConfig(timeControl);
  
  const timer = new Timer({
    gameId,
    timeControl: timeControl as any,
    whiteTimeRemaining: config.initial,
    blackTimeRemaining: config.initial,
    whiteIncrement: config.increment,
    blackIncrement: config.increment,
    isRunning: false,
    currentPlayer: 'white',
  });

  await timer.save();
  return timer;
};

export const startTimer = async (req: AuthRequest, res: Response) => {
  try {
    const { gameId } = req.params;

    const timer = await Timer.findOne({ gameId });

    if (!timer) {
      return res.status(404).json({ error: 'Timer not found' });
    }

    if (timer.isRunning) {
      return res.status(400).json({ error: 'Timer is already running' });
    }

    timer.isRunning = true;
    timer.lastMoveTime = new Date();
    await timer.save();

    res.json({
      success: true,
      data: {
        gameId: timer.gameId,
        whiteTimeRemaining: timer.whiteTimeRemaining,
        blackTimeRemaining: timer.blackTimeRemaining,
        isRunning: timer.isRunning,
        currentPlayer: timer.currentPlayer,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const stopTimer = async (req: AuthRequest, res: Response) => {
  try {
    const { gameId } = req.params;
    const { player } = req.body;

    const timer = await Timer.findOne({ gameId });

    if (!timer) {
      return res.status(404).json({ error: 'Timer not found' });
    }

    if (!timer.isRunning) {
      return res.status(400).json({ error: 'Timer is not running' });
    }

    if (timer.lastMoveTime) {
      const elapsed = (new Date().getTime() - timer.lastMoveTime.getTime()) / 1000;
      
      if (player === 'white') {
        timer.whiteTimeRemaining = calculateTimeRemaining(
          timer.whiteTimeRemaining,
          elapsed,
          timer.whiteIncrement
        );
      } else {
        timer.blackTimeRemaining = calculateTimeRemaining(
          timer.blackTimeRemaining,
          elapsed,
          timer.blackIncrement
        );
      }
    }

    timer.isRunning = false;
    timer.currentPlayer = timer.currentPlayer === 'white' ? 'black' : 'white';
    timer.lastMoveTime = new Date();
    await timer.save();

    if (timer.whiteTimeRemaining <= 0 || timer.blackTimeRemaining <= 0) {
      const winner = timer.whiteTimeRemaining <= 0 ? 'black' : 'white';
      return res.json({
        success: true,
        data: {
          gameId: timer.gameId,
          whiteTimeRemaining: timer.whiteTimeRemaining,
          blackTimeRemaining: timer.blackTimeRemaining,
          isRunning: timer.isRunning,
          timeOut: true,
          winner,
        },
      });
    }

    res.json({
      success: true,
      data: {
        gameId: timer.gameId,
        whiteTimeRemaining: timer.whiteTimeRemaining,
        blackTimeRemaining: timer.blackTimeRemaining,
        isRunning: timer.isRunning,
        currentPlayer: timer.currentPlayer,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTimer = async (req: AuthRequest, res: Response) => {
  try {
    const { gameId } = req.params;

    const timer = await Timer.findOne({ gameId });

    if (!timer) {
      return res.status(404).json({ error: 'Timer not found' });
    }

    let whiteTimeRemaining = timer.whiteTimeRemaining;
    let blackTimeRemaining = timer.blackTimeRemaining;

    if (timer.isRunning && timer.lastMoveTime) {
      const elapsed = (new Date().getTime() - timer.lastMoveTime.getTime()) / 1000;
      
      if (timer.currentPlayer === 'white') {
        whiteTimeRemaining = calculateTimeRemaining(timer.whiteTimeRemaining, elapsed);
      } else {
        blackTimeRemaining = calculateTimeRemaining(timer.blackTimeRemaining, elapsed);
      }
    }

    res.json({
      success: true,
      data: {
        gameId: timer.gameId,
        timeControl: timer.timeControl,
        whiteTimeRemaining: Math.max(0, whiteTimeRemaining),
        blackTimeRemaining: Math.max(0, blackTimeRemaining),
        isRunning: timer.isRunning,
        currentPlayer: timer.currentPlayer,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const pauseTimer = async (req: AuthRequest, res: Response) => {
  try {
    const { gameId } = req.params;

    const timer = await Timer.findOne({ gameId });

    if (!timer) {
      return res.status(404).json({ error: 'Timer not found' });
    }

    if (!timer.isRunning) {
      return res.status(400).json({ error: 'Timer is not running' });
    }

    if (timer.lastMoveTime) {
      const elapsed = (new Date().getTime() - timer.lastMoveTime.getTime()) / 1000;
      
      if (timer.currentPlayer === 'white') {
        timer.whiteTimeRemaining = calculateTimeRemaining(timer.whiteTimeRemaining, elapsed);
      } else {
        timer.blackTimeRemaining = calculateTimeRemaining(timer.blackTimeRemaining, elapsed);
      }
    }

    timer.isRunning = false;
    await timer.save();

    res.json({
      success: true,
      data: {
        gameId: timer.gameId,
        whiteTimeRemaining: timer.whiteTimeRemaining,
        blackTimeRemaining: timer.blackTimeRemaining,
        isRunning: timer.isRunning,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

