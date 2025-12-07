import { Request, Response, NextFunction } from 'express';

export const validateCreateGame = (req: Request, res: Response, next: NextFunction) => {
  const { gameType } = req.body;

  if (!gameType || !['online', 'offline'].includes(gameType)) {
    return res.status(400).json({ error: 'Invalid game type. Must be "online" or "offline"' });
  }

  next();
};

export const validateMakeMove = (req: Request, res: Response, next: NextFunction) => {
  const { from, to, promotion } = req.body;

  if (!from || !to) {
    return res.status(400).json({ error: 'Missing required fields: from and to' });
  }

  if (typeof from !== 'string' || typeof to !== 'string') {
    return res.status(400).json({ error: 'from and to must be strings' });
  }

  if (from.length !== 2 || to.length !== 2) {
    return res.status(400).json({ error: 'Invalid move format. Use algebraic notation (e.g., "e2e4")' });
  }

  next();
};

