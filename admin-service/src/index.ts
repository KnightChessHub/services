import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { adminRoutes } from './routes/admin.routes';
import { healthRoutes } from './routes/health.routes';
import { verifyToken, requireAdmin } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { connectDB } from './db/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3017;

app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/', verifyToken, requireAdmin, adminRoutes);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Admin Service running on port ${PORT}`);
  });
});

