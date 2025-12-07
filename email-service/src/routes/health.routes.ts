import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { verifyEmailConfig } from '../utils/emailClient';

export const healthRoutes = Router();

healthRoutes.get('/health', async (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const emailStatus = await verifyEmailConfig();
  const status = dbStatus === 'connected' && emailStatus ? 'healthy' : 'unhealthy';
  
  res.status(status === 'healthy' ? 200 : 503).json({
    status,
    service: 'email-service',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    email: emailStatus ? 'configured' : 'not configured',
  });
});

