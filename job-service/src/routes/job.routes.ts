import { Router } from 'express';
import { createJob, getJobs, executeJob } from '../controllers/job.controller';

export const jobRoutes = Router();

jobRoutes.post('/', createJob);
jobRoutes.get('/', getJobs);
jobRoutes.post('/:id/execute', executeJob);

