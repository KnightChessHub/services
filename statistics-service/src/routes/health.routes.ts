import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

export const healthRoutes = Router();

healthRoutes.get('/health', (req: Request, res: Response) => {
  const status = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
  
  res.status(status === 'healthy' ? 200 : 503).json({
    status,
    service: 'statistics-service',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

