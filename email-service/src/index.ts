import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { emailRoutes } from './routes/email.routes';
import { healthRoutes } from './routes/health.routes';
import { verifyToken } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { connectDB } from './db/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3022;

app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/', verifyToken, emailRoutes);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Email Service running on port ${PORT}`);
  });
});

