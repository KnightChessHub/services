import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';
import { Replay } from '../models/replay.model';
import { generatePGN, generateReplayMoves } from '../utils/pgn';

const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:3004';

export const createReplay = async (gameId: string, gameData: any) => {
  const existingReplay = await Replay.findOne({ gameId });

  if (existingReplay) {
    return existingReplay;
  }

  const result = gameData.result === 'white_wins' ? '1-0' :
                 gameData.result === 'black_wins' ? '0-1' : '1/2-1/2';

  const pgn = generatePGN(gameData.moves || [], result);
  const replayMoves = generateReplayMoves(gameData.moves || []);

  const replay = new Replay({
    gameId,
    pgn,
    moves: replayMoves,
    whitePlayerId: gameData.whitePlayerId,
    blackPlayerId: gameData.blackPlayerId,
    result,
    timeControl: gameData.timeControl,
  });

  await replay.save();
  return replay;
};

export const getReplay = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { gameId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let replay = await Replay.findOne({ gameId });

    if (!replay) {
      try {
        const gameResponse = await axios.get(`${GAME_SERVICE_URL}/${gameId}`, {
          headers: { Authorization: req.headers.authorization },
        });

        if (gameResponse.data.success) {
          const game = gameResponse.data.data;

          if (game.whitePlayerId !== userId && game.blackPlayerId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
          }

          if (game.status !== 'finished') {
            return res.status(400).json({ error: 'Game must be finished to create replay' });
          }

          replay = await createReplay(gameId, game);
        } else {
          return res.status(404).json({ error: 'Game not found' });
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          return res.status(404).json({ error: 'Game not found' });
        }
        throw error;
      }
    }

    if (replay.whitePlayerId !== userId && replay.blackPlayerId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      data: {
        gameId: replay.gameId,
        pgn: replay.pgn,
        moves: replay.moves,
        whitePlayerId: replay.whitePlayerId,
        blackPlayerId: replay.blackPlayerId,
        result: replay.result,
        timeControl: replay.timeControl,
        createdAt: replay.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyReplays = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { limit = 50 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const replays = await Replay.find({
      $or: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      data: replays.map((replay) => ({
        gameId: replay.gameId,
        whitePlayerId: replay.whitePlayerId,
        blackPlayerId: replay.blackPlayerId,
        result: replay.result,
        timeControl: replay.timeControl,
        moveCount: replay.moves.length,
        createdAt: replay.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

