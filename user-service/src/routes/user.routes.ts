import { Router } from 'express';
import { getMe, getUserById, updateMe } from '../controllers/user.controller';

export const userRoutes = Router();

userRoutes.get('/me', getMe);
userRoutes.get('/:id', getUserById);
userRoutes.put('/me', updateMe);

