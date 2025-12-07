import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth.routes';
import { healthRoutes } from './routes/health.routes';
import { errorHandler } from './middleware/errorHandler';
import { initDatabase } from './db/init';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/', authRoutes);

app.use(errorHandler);

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
  });
});

