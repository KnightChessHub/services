import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { searchRoutes } from './routes/search.routes';
import { healthRoutes } from './routes/health.routes';
import { verifyToken } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { connectDB } from './db/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3013;

app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/', verifyToken, searchRoutes);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Search Service running on port ${PORT}`);
  });
});

