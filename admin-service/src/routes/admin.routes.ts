import { Router } from 'express';
import {
  createAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
  getPlatformStats,
} from '../controllers/admin.controller';

export const adminRoutes = Router();

adminRoutes.get('/stats', getPlatformStats);
adminRoutes.post('/', createAdmin);
adminRoutes.get('/', getAdmins);
adminRoutes.put('/:id', updateAdmin);
adminRoutes.delete('/:id', deleteAdmin);

