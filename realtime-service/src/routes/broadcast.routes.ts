import { Router, Request, Response } from 'express';
import { SocketManager } from '../utils/socketManager';

export function createBroadcastRoutes(socketManager: SocketManager): Router {
  const router = Router();

  // Internal endpoint for game-service to broadcast moves
  router.post('/game/:gameId/move', async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      const { game, move } = req.body;

      // Broadcast move to all players in the game room
      socketManager.broadcastToGame(gameId, 'game:move', {
        gameId,
        game,
        move,
      });

      // Also emit game_update for compatibility
      socketManager.broadcastToGame(gameId, 'game_update', {
        gameId,
        game,
      });

      // If game is finished, emit game_finished
      if (game?.status === 'finished') {
        socketManager.broadcastToGame(gameId, 'game_finished', {
          gameId,
          game,
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Broadcast error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Internal endpoint for game-service to broadcast game updates
  router.post('/game/:gameId/update', async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      const { game } = req.body;

      socketManager.broadcastToGame(gameId, 'game_update', {
        gameId,
        game,
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Broadcast error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

