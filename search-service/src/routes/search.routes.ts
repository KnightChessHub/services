import { Router } from 'express';
import { searchAll, searchUsers } from '../controllers/search.controller';

export const searchRoutes = Router();

searchRoutes.get('/', searchAll);
searchRoutes.get('/users', searchUsers);

