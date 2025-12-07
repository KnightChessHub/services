import { Router } from 'express';
import { getMyActivity, getUserActivity, getActivityFeed } from '../controllers/activity.controller';

export const activityRoutes = Router();

activityRoutes.get('/my', getMyActivity);
activityRoutes.get('/feed', getActivityFeed);
activityRoutes.get('/user/:userId', getUserActivity);

