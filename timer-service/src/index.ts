import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { timerRoutes } from './routes/timer.routes';
import { healthRoutes } from './routes/health.routes';
import { verifyToken } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { connectDB } from './db/client';
import { Timer } from './models/timer.model';
import { calculateTimeRemaining } from './utils/timeControls';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3020;

app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/', verifyToken, timerRoutes);

app.use(errorHandler);

cron.schedule('* * * * *', async () => {
  const runningTimers = await Timer.find({ isRunning: true });

  for (const timer of runningTimers) {
    if (timer.lastMoveTime) {
      const elapsed = (new Date().getTime() - timer.lastMoveTime.getTime()) / 1000;
      
      if (timer.currentPlayer === 'white') {
        timer.whiteTimeRemaining = calculateTimeRemaining(timer.whiteTimeRemaining, elapsed);
      } else {
        timer.blackTimeRemaining = calculateTimeRemaining(timer.blackTimeRemaining, elapsed);
      }

      if (timer.whiteTimeRemaining <= 0 || timer.blackTimeRemaining <= 0) {
        timer.isRunning = false;
      }

      await timer.save();
    }
  }
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Timer Service running on port ${PORT}`);
  });
});

