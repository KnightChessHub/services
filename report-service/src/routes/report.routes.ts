import { Router } from 'express';
import { createReport, getMyReports, getReports, updateReportStatus } from '../controllers/report.controller';

export const reportRoutes = Router();

reportRoutes.post('/', createReport);
reportRoutes.get('/my', getMyReports);
reportRoutes.get('/', getReports);
reportRoutes.put('/:id/status', updateReportStatus);

