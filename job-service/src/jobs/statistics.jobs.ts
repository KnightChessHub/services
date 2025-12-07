import axios from 'axios';
import { Job } from '../models/job.model';

const STATISTICS_SERVICE_URL = process.env.STATISTICS_SERVICE_URL || 'http://localhost:3010';
const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:3004';

export const updateGlobalStatistics = async () => {
  try {
    const response = await axios.get(`${STATISTICS_SERVICE_URL}/global`);
    return response.data;
  } catch (error: any) {
    throw new Error(`Statistics update failed: ${error.message}`);
  }
};

export const runStatisticsJobs = async (jobId: string) => {
  const job = await Job.findById(jobId);
  if (!job) return;

  job.status = 'processing';
  job.startedAt = new Date();
  await job.save();

  try {
    const result = await updateGlobalStatistics();

    job.status = 'completed';
    job.result = result;
    job.completedAt = new Date();
    await job.save();
  } catch (error: any) {
    job.status = 'failed';
    job.error = error.message;
    job.completedAt = new Date();
    await job.save();
  }
};

