import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';
import { Game, IGame } from '../models/game.model';
import { toggleTurn, isValidSquare, getGameState, validateMove, isGameFinished } from '../utils/chess';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const REALTIME_SERVICE_URL = process.env.REALTIME_SERVICE_URL || 'http://localhost:3014';

export const createGame = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { gameType, blackPlayerId, preferredSide } = req.body; // preferredSide: 'white' | 'black' | 'random'

    // Determine which side the creator wants to play
    let whitePlayerId: string;
    let blackPlayerIdFinal: string | undefined;
    
    if (gameType === 'offline') {
      // Offline games: creator plays both sides
      whitePlayerId = userId;
      blackPlayerIdFinal = userId;
    } else {
      // Online games: determine side based on preferredSide
      const side = preferredSide === 'random' 
        ? (Math.random() < 0.5 ? 'white' : 'black')
        : (preferredSide || 'white');
      
      if (side === 'white') {
        whitePlayerId = userId;
        blackPlayerIdFinal = blackPlayerId || undefined;
      } else {
        // Creator wants to play black, so they become blackPlayerId
        whitePlayerId = blackPlayerId || undefined; // If blackPlayerId provided, they become white
        blackPlayerIdFinal = userId;
      }
    }

    // Allow online games without both players (for matchmaking - will be in 'pending' status)
    // If both players are provided, game starts immediately
    const hasBothPlayers = gameType === 'offline' || (whitePlayerId && blackPlayerIdFinal);
    
    const game = new Game({
      gameType,
      whitePlayerId,
      blackPlayerId: blackPlayerIdFinal,
      status: hasBothPlayers ? 'active' : 'pending',
      currentTurn: 'white',
      moves: [],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    });

    // Start game if offline or if online with both players
    if (hasBothPlayers) {
      game.status = 'active';
      game.startedAt = new Date();
    }

    await game.save();

    // Fetch usernames for players
    let whitePlayerUsername: string | undefined;
    let blackPlayerUsername: string | undefined;

    try {
      if (game.whitePlayerId) {
        const whiteUserResponse = await axios.get(`${USER_SERVICE_URL}/${game.whitePlayerId}`, {
          headers: { Authorization: req.headers.authorization },
        });
        if (whiteUserResponse.data?.success) {
          whitePlayerUsername = whiteUserResponse.data.data.username;
        }
      }
    } catch (error) {
      console.error('Failed to fetch white player username:', error);
    }

    try {
      if (game.blackPlayerId) {
        const blackUserResponse = await axios.get(`${USER_SERVICE_URL}/${game.blackPlayerId}`, {
          headers: { Authorization: req.headers.authorization },
        });
        if (blackUserResponse.data?.success) {
          blackPlayerUsername = blackUserResponse.data.data.username;
        }
      }
    } catch (error) {
      console.error('Failed to fetch black player username:', error);
    }

    res.status(201).json({
      success: true,
      data: {
        id: game._id.toString(),
        gameType: game.gameType,
        status: game.status,
        whitePlayerId: game.whitePlayerId,
        blackPlayerId: game.blackPlayerId,
        whitePlayerUsername,
        blackPlayerUsername,
        currentTurn: game.currentTurn,
        fen: game.fen,
        moves: game.moves || [],
        result: game.result,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
        startedAt: game.startedAt,
        finishedAt: game.finishedAt,
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

    const gameState = getGameState(game.fen);

    // Fetch usernames for players
    let whitePlayerUsername: string | undefined;
    let blackPlayerUsername: string | undefined;

    try {
      if (game.whitePlayerId) {
        const whiteUserResponse = await axios.get(`${USER_SERVICE_URL}/${game.whitePlayerId}`, {
          headers: { Authorization: req.headers.authorization },
        });
        if (whiteUserResponse.data?.success) {
          whitePlayerUsername = whiteUserResponse.data.data.username;
        }
      }
    } catch (error) {
      console.error('Failed to fetch white player username:', error);
    }

    try {
      if (game.blackPlayerId) {
        const blackUserResponse = await axios.get(`${USER_SERVICE_URL}/${game.blackPlayerId}`, {
          headers: { Authorization: req.headers.authorization },
        });
        if (blackUserResponse.data?.success) {
          blackPlayerUsername = blackUserResponse.data.data.username;
        }
      }
    } catch (error) {
      console.error('Failed to fetch black player username:', error);
    }

    res.json({
      success: true,
      data: {
        id: game._id.toString(),
        gameType: game.gameType,
        status: game.status,
        whitePlayerId: game.whitePlayerId,
        blackPlayerId: game.blackPlayerId,
        whitePlayerUsername,
        blackPlayerUsername,
        currentTurn: game.currentTurn,
        fen: game.fen,
        moves: game.moves,
        result: game.result,
        winnerId: game.winnerId,
        gameState,
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

    // Fetch usernames for all games
    const gamesWithUsernames = await Promise.all(
      games.map(async (game) => {
        let whitePlayerUsername: string | undefined;
        let blackPlayerUsername: string | undefined;

        try {
          if (game.whitePlayerId) {
            const whiteUserResponse = await axios.get(`${USER_SERVICE_URL}/${game.whitePlayerId}`, {
              headers: { Authorization: req.headers.authorization },
            });
            if (whiteUserResponse.data?.success) {
              whitePlayerUsername = whiteUserResponse.data.data.username;
            }
          }
        } catch (error) {
          console.error('Failed to fetch white player username:', error);
        }

        try {
          if (game.blackPlayerId) {
            const blackUserResponse = await axios.get(`${USER_SERVICE_URL}/${game.blackPlayerId}`, {
              headers: { Authorization: req.headers.authorization },
            });
            if (blackUserResponse.data?.success) {
              blackPlayerUsername = blackUserResponse.data.data.username;
            }
          }
        } catch (error) {
          console.error('Failed to fetch black player username:', error);
        }

        return {
          id: (game as any)._id.toString(),
          gameType: game.gameType,
          status: game.status,
          whitePlayerId: game.whitePlayerId,
          blackPlayerId: game.blackPlayerId,
          whitePlayerUsername,
          blackPlayerUsername,
          currentTurn: game.currentTurn,
          result: game.result,
          winnerId: game.winnerId,
          createdAt: game.createdAt,
          startedAt: game.startedAt,
          finishedAt: game.finishedAt,
        };
      })
    );

    res.json({
      success: true,
      data: gamesWithUsernames,
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

    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'active') {
      return res.status(400).json({ error: 'Game is not active' });
    }

    // Use string comparison to handle ObjectId vs string
    const userIdStr = String(userId);
    const whitePlayerIdStr = game.whitePlayerId ? String(game.whitePlayerId) : '';
    const blackPlayerIdStr = game.blackPlayerId ? String(game.blackPlayerId) : '';

    if (userIdStr !== whitePlayerIdStr && userIdStr !== blackPlayerIdStr) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const isWhiteTurn = game.currentTurn === 'white';
    const isPlayerWhite = userIdStr === whitePlayerIdStr;

    if (isWhiteTurn !== isPlayerWhite) {
      return res.status(400).json({ error: 'Not your turn' });
    }

    const moveValidation = validateMove(game.fen, from, to, promotion);

    if (!moveValidation.valid) {
      return res.status(400).json({ error: moveValidation.error || 'Invalid move' });
    }

    const move = {
      from,
      to,
      promotion,
      san: moveValidation.san,
      timestamp: new Date(),
    };

    game.moves.push(move);
    game.fen = moveValidation.newFen || game.fen;
    game.currentTurn = game.currentTurn === 'white' ? 'black' : 'white';
    game.updatedAt = new Date();

    const gameResult = isGameFinished(game.fen);

    if (gameResult.finished) {
      game.status = 'finished';
      game.result = gameResult.result || null;
      game.winnerId = gameResult.result === 'white_wins' 
        ? game.whitePlayerId 
        : gameResult.result === 'black_wins' 
        ? game.blackPlayerId 
        : undefined;
      game.finishedAt = new Date();
    }

    await game.save();

    const gameState = getGameState(game.fen);

    // Fetch usernames for players
    let whitePlayerUsername: string | undefined;
    let blackPlayerUsername: string | undefined;

    try {
      if (game.whitePlayerId) {
        const whiteUserResponse = await axios.get(`${USER_SERVICE_URL}/${game.whitePlayerId}`, {
          headers: { Authorization: req.headers.authorization },
        });
        if (whiteUserResponse.data?.success) {
          whitePlayerUsername = whiteUserResponse.data.data.username;
        }
      }
    } catch (error) {
      console.error('Failed to fetch white player username:', error);
    }

    try {
      if (game.blackPlayerId) {
        const blackUserResponse = await axios.get(`${USER_SERVICE_URL}/${game.blackPlayerId}`, {
          headers: { Authorization: req.headers.authorization },
        });
        if (blackUserResponse.data?.success) {
          blackPlayerUsername = blackUserResponse.data.data.username;
        }
      }
    } catch (error) {
      console.error('Failed to fetch black player username:', error);
    }

    // Notify realtime service to broadcast the move (after fetching usernames)
    try {
      await axios.post(`${REALTIME_SERVICE_URL}/broadcast/game/${id}/move`, {
        game: {
          _id: game._id.toString(),
          id: game._id.toString(),
          gameType: game.gameType,
          status: game.status,
          whitePlayer: game.whitePlayerId,
          whitePlayerId: game.whitePlayerId,
          blackPlayer: game.blackPlayerId,
          blackPlayerId: game.blackPlayerId,
          whitePlayerUsername,
          blackPlayerUsername,
          currentTurn: game.currentTurn,
          fen: game.fen,
          moves: game.moves.map((m: any) => m.san || m),
          result: game.result,
          winnerId: game.winnerId,
          timeControl: game.timeControl,
          createdAt: game.createdAt,
          updatedAt: game.updatedAt,
          startedAt: game.startedAt,
          finishedAt: game.finishedAt,
        },
        move,
      });
    } catch (error) {
      console.error('Failed to broadcast move to realtime service:', error);
      // Don't fail the request if broadcast fails
    }

    res.json({
      success: true,
      data: {
        id: game._id.toString(),
        gameType: game.gameType,
        status: game.status,
        whitePlayerId: game.whitePlayerId,
        blackPlayerId: game.blackPlayerId,
        whitePlayerUsername,
        blackPlayerUsername,
        currentTurn: game.currentTurn,
        fen: game.fen,
        moves: game.moves,
        result: game.result,
        winnerId: game.winnerId,
        gameState,
        move,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
        startedAt: game.startedAt,
        finishedAt: game.finishedAt,
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

    // Use string comparison to handle ObjectId vs string
    // Only compare if the player IDs actually exist (not null/undefined)
    const userIdStr = String(userId);
    const whitePlayerIdStr = game.whitePlayerId ? String(game.whitePlayerId) : null;
    const blackPlayerIdStr = game.blackPlayerId ? String(game.blackPlayerId) : null;

    // Debug logging
    console.log('Join game check:', {
      userId: userIdStr,
      whitePlayerId: whitePlayerIdStr,
      blackPlayerId: blackPlayerIdStr,
      gameId: id,
      gameStatus: game.status
    });

    // Only check if player IDs exist and match
    if (whitePlayerIdStr && userIdStr === whitePlayerIdStr) {
      return res.status(400).json({ error: 'You are already in this game as white player' });
    }

    if (blackPlayerIdStr && userIdStr === blackPlayerIdStr) {
      return res.status(400).json({ error: 'You are already in this game as black player' });
    }

    // Determine which side needs a player and join accordingly
    if (!game.whitePlayerId) {
      // White slot is empty, join as white
      game.whitePlayerId = userId;
    } else if (!game.blackPlayerId) {
      // Black slot is empty, join as black
      game.blackPlayerId = userId;
    } else {
      return res.status(400).json({ error: 'Game already has both players' });
    }
    game.status = 'active';
    game.startedAt = new Date();

    await game.save();

    // Fetch usernames for players
    let whitePlayerUsername: string | undefined;
    let blackPlayerUsername: string | undefined;

    try {
      if (game.whitePlayerId) {
        const whiteUserResponse = await axios.get(`${USER_SERVICE_URL}/${game.whitePlayerId}`, {
          headers: { Authorization: req.headers.authorization },
        });
        if (whiteUserResponse.data?.success) {
          whitePlayerUsername = whiteUserResponse.data.data.username;
        }
      }
    } catch (error) {
      console.error('Failed to fetch white player username:', error);
    }

    try {
      if (game.blackPlayerId) {
        const blackUserResponse = await axios.get(`${USER_SERVICE_URL}/${game.blackPlayerId}`, {
          headers: { Authorization: req.headers.authorization },
        });
        if (blackUserResponse.data?.success) {
          blackPlayerUsername = blackUserResponse.data.data.username;
        }
      }
    } catch (error) {
      console.error('Failed to fetch black player username:', error);
    }

    res.json({
      success: true,
      data: {
        id: game._id.toString(),
        gameType: game.gameType,
        status: game.status,
        whitePlayerId: game.whitePlayerId,
        blackPlayerId: game.blackPlayerId,
        whitePlayerUsername,
        blackPlayerUsername,
        currentTurn: game.currentTurn,
        startedAt: game.startedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

