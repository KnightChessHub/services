import { Request, Response, NextFunction } from 'express';

export const validateCreateTournament = (req: Request, res: Response, next: NextFunction) => {
  const { name, format, timeControl, maxParticipants, startDate } = req.body;

  if (!name || !format || !timeControl || !maxParticipants || !startDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!['swiss', 'round_robin', 'elimination', 'single_elimination', 'double_elimination'].includes(format)) {
    return res.status(400).json({ error: 'Invalid tournament format' });
  }

  if (!['blitz', 'rapid', 'classical', 'bullet'].includes(timeControl)) {
    return res.status(400).json({ error: 'Invalid time control' });
  }

  if (maxParticipants < 2) {
    return res.status(400).json({ error: 'Max participants must be at least 2' });
  }

  if (new Date(startDate) < new Date()) {
    return res.status(400).json({ error: 'Start date must be in the future' });
  }

  next();
};

