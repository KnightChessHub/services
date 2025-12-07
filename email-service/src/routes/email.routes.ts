import { Router } from 'express';
import { sendEmail, getEmails } from '../controllers/email.controller';

export const emailRoutes = Router();

emailRoutes.post('/', sendEmail);
emailRoutes.get('/', getEmails);

