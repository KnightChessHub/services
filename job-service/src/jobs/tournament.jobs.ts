import axios from 'axios';
import { Job } from '../models/job.model';

const TOURNAMENT_SERVICE_URL = process.env.TOURNAMENT_SERVICE_URL || 'http://localhost:3005';

export const processTournamentRounds = async (tournamentId: string) => {
  try {
    const response = await axios.post(`${TOURNAMENT_SERVICE_URL}/${tournamentId}/process-round`);
    return response.data;
  } catch (error: any) {
    throw new Error(`Tournament processing failed: ${error.message}`);
  }
};

export const runTournamentJobs = async (jobId: string) => {
  const job = await Job.findById(jobId);
  if (!job) return;

  job.status = 'processing';
  job.startedAt = new Date();
  await job.save();

  try {
    const tournamentId = job.data?.tournamentId;
    if (!tournamentId) {
      throw new Error('Tournament ID is required');
    }

    const result = await processTournamentRounds(tournamentId);

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

