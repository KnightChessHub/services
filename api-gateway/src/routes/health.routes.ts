import { Router, Request, Response } from 'express';

export const healthRoutes = Router();

healthRoutes.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
  });
});

