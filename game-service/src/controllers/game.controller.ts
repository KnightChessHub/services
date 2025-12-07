import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Game } from '../models/game.model';
import { toggleTurn, isValidSquare } from '../utils/chess';

export const createGame = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { gameType, blackPlayerId } = req.body;

    if (gameType === 'online' && !blackPlayerId) {
      return res.status(400).json({ error: 'blackPlayerId is required for online games' });
    }

    const game = new Game({
      gameType,
      whitePlayerId: userId,
      blackPlayerId: gameType === 'online' ? blackPlayerId : userId,
      status: gameType === 'offline' ? 'active' : 'pending',
      currentTurn: 'white',
      moves: [],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    });

    if (gameType === 'offline' || (gameType === 'online' && blackPlayerId)) {
      game.status = 'active';
      game.startedAt = new Date();
    }

    await game.save();

    res.status(201).json({
      success: true,
      data: {
        id: game._id.toString(),
        gameType: game.gameType,
        status: game.status,
        whitePlayerId: game.whitePlayerId,
        blackPlayerId: game.blackPlayerId,
        currentTurn: game.currentTurn,
        fen: game.fen,
        moves: game.moves,
        createdAt: game.createdAt,
        startedAt: game.startedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGame = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.whitePlayerId !== userId && game.blackPlayerId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      data: {
        id: game._id.toString(),
        gameType: game.gameType,
        status: game.status,
        whitePlayerId: game.whitePlayerId,
        blackPlayerId: game.blackPlayerId,
        currentTurn: game.currentTurn,
        fen: game.fen,
        moves: game.moves,
        result: game.result,
        winnerId: game.winnerId,
        createdAt: game.createdAt,
        startedAt: game.startedAt,
        finishedAt: game.finishedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyGames = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { status } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const query: any = {
      $or: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
    };

    if (status) {
      query.status = status;
    }

    const games = await Game.find(query).sort({ createdAt: -1 }).limit(50);

    res.json({
      success: true,
      data: games.map((game) => ({
        id: game._id.toString(),
        gameType: game.gameType,
        status: game.status,
        whitePlayerId: game.whitePlayerId,
        blackPlayerId: game.blackPlayerId,
        currentTurn: game.currentTurn,
        result: game.result,
        winnerId: game.winnerId,
        createdAt: game.createdAt,
        startedAt: game.startedAt,
        finishedAt: game.finishedAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const makeMove = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { from, to, promotion } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!isValidSquare(from) || !isValidSquare(to)) {
      return res.status(400).json({ error: 'Invalid square format' });
    }

    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'active') {
      return res.status(400).json({ error: 'Game is not active' });
    }

    if (game.whitePlayerId !== userId && game.blackPlayerId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const isWhiteTurn = game.currentTurn === 'white';
    const isPlayerWhite = game.whitePlayerId === userId;

    if (isWhiteTurn !== isPlayerWhite) {
      return res.status(400).json({ error: 'Not your turn' });
    }

    const move = {
      from,
      to,
      promotion,
      timestamp: new Date(),
    };

    game.moves.push(move);
    game.currentTurn = toggleTurn(game.currentTurn);
    game.updatedAt = new Date();

    await game.save();

    res.json({
      success: true,
      data: {
        id: game._id.toString(),
        move,
        currentTurn: game.currentTurn,
        fen: game.fen,
        moves: game.moves,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const resignGame = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'active') {
      return res.status(400).json({ error: 'Game is not active' });
    }

    if (game.whitePlayerId !== userId && game.blackPlayerId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const isPlayerWhite = game.whitePlayerId === userId;
    game.status = 'finished';
    game.result = isPlayerWhite ? 'black_wins' : 'white_wins';
    game.winnerId = isPlayerWhite ? game.blackPlayerId : game.whitePlayerId;
    game.finishedAt = new Date();

    await game.save();

    res.json({
      success: true,
      data: {
        id: game._id.toString(),
        status: game.status,
        result: game.result,
        winnerId: game.winnerId,
        finishedAt: game.finishedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const joinGame = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.gameType !== 'online') {
      return res.status(400).json({ error: 'Only online games can be joined' });
    }

    if (game.status !== 'pending') {
      return res.status(400).json({ error: 'Game is not available to join' });
    }

    if (game.whitePlayerId === userId) {
      return res.status(400).json({ error: 'You are already the white player' });
    }

    if (game.blackPlayerId) {
      return res.status(400).json({ error: 'Game already has a black player' });
    }

    game.blackPlayerId = userId;
    game.status = 'active';
    game.startedAt = new Date();

    await game.save();

    res.json({
      success: true,
      data: {
        id: game._id.toString(),
        gameType: game.gameType,
        status: game.status,
        whitePlayerId: game.whitePlayerId,
        blackPlayerId: game.blackPlayerId,
        currentTurn: game.currentTurn,
        startedAt: game.startedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

