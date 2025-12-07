import { Router } from 'express';
import { register, login, verify } from '../controllers/auth.controller';
import { validateRegister, validateLogin } from '../middleware/validator';

export const authRoutes = Router();

authRoutes.post('/register', validateRegister, register);
authRoutes.post('/login', validateLogin, login);
authRoutes.get('/verify', verify);

