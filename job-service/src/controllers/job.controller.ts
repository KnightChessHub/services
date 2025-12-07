import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import { Job } from '../models/job.model';
import { runCleanupJobs } from '../jobs/cleanup.jobs';
import { runStatisticsJobs } from '../jobs/statistics.jobs';
import { runTournamentJobs } from '../jobs/tournament.jobs';

export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const { type, data, scheduledAt } = req.body;

    if (!['cleanup', 'statistics', 'notification', 'tournament', 'custom'].includes(type)) {
      return res.status(400).json({ error: 'Invalid job type' });
    }

    const job = new Job({
      jobId: uuidv4(),
      type,
      data: data || {},
      status: 'pending',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
    });

    await job.save();

    res.status(201).json({
      success: true,
      data: {
        id: job._id.toString(),
        jobId: job.jobId,
        type: job.type,
        status: job.status,
        scheduledAt: job.scheduledAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getJobs = async (req: AuthRequest, res: Response) => {
  try {
    const { type, status, limit = 50 } = req.query;

    const query: any = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const jobs = await Job.find(query)
      .sort({ scheduledAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      data: jobs.map((job) => ({
        id: job._id.toString(),
        jobId: job.jobId,
        type: job.type,
        status: job.status,
        data: job.data,
        result: job.result,
        error: job.error,
        scheduledAt: job.scheduledAt,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const executeJob = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status === 'processing') {
      return res.status(400).json({ error: 'Job is already processing' });
    }

    switch (job.type) {
      case 'cleanup':
        await runCleanupJobs(id);
        break;
      case 'statistics':
        await runStatisticsJobs(id);
        break;
      case 'tournament':
        await runTournamentJobs(id);
        break;
      default:
        return res.status(400).json({ error: 'Job type not supported for execution' });
    }

    const updatedJob = await Job.findById(id);

    res.json({
      success: true,
      data: {
        id: updatedJob!._id.toString(),
        status: updatedJob!.status,
        result: updatedJob!.result,
        error: updatedJob!.error,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

