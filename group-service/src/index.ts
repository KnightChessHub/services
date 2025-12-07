import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { groupRoutes } from './routes/group.routes';
import { healthRoutes } from './routes/health.routes';
import { verifyToken } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { connectDB } from './db/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/', verifyToken, groupRoutes);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Group Service running on port ${PORT}`);
  });
});

