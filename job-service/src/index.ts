import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { jobRoutes } from './routes/job.routes';
import { healthRoutes } from './routes/health.routes';
import { verifyToken } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { connectDB } from './db/client';
import { Job } from './models/job.model';
import { runCleanupJobs } from './jobs/cleanup.jobs';
import { runStatisticsJobs } from './jobs/statistics.jobs';

dotenv.config();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3021;

app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/', verifyToken, jobRoutes);

app.use(errorHandler);

cron.schedule('*/5 * * * *', async () => {
  const pendingJobs = await Job.find({
    status: 'pending',
    scheduledAt: { $lte: new Date() },
  }).limit(10);

  for (const job of pendingJobs) {
    try {
      switch (job.type) {
        case 'cleanup':
          await runCleanupJobs(job._id.toString());
          break;
        case 'statistics':
          await runStatisticsJobs(job._id.toString());
          break;
      }
    } catch (error) {
      console.error(`Job ${job.jobId} failed:`, error);
    }
  }
});

cron.schedule('0 * * * *', async () => {
  const cleanupJob = new Job({
    jobId: `cleanup-${Date.now()}`,
    type: 'cleanup',
    status: 'pending',
    scheduledAt: new Date(),
  });
  await cleanupJob.save();
});

cron.schedule('0 */6 * * *', async () => {
  const statsJob = new Job({
    jobId: `stats-${Date.now()}`,
    type: 'statistics',
    status: 'pending',
    scheduledAt: new Date(),
  });
  await statsJob.save();
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Job Service running on port ${PORT}`);
  });
});

