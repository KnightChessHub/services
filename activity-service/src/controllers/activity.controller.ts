import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Activity } from '../models/activity.model';

export const createActivity = async (userId: string, type: string, title: string, description: string, relatedId?: string, metadata?: Record<string, any>) => {
  const activity = new Activity({
    userId,
    type,
    title,
    description,
    relatedId,
    metadata,
  });

  await activity.save();
  return activity;
};

export const getMyActivity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { type, limit = 50 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const query: any = { userId };
    if (type) {
      query.type = type;
    }

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      data: activities.map((activity) => ({
        id: activity._id.toString(),
        type: activity.type,
        title: activity.title,
        description: activity.description,
        relatedId: activity.relatedId,
        metadata: activity.metadata,
        createdAt: activity.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserActivity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { userId: targetUserId } = req.params;
    const { limit = 50 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const activities = await Activity.find({ userId: targetUserId })
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      data: activities.map((activity) => ({
        id: activity._id.toString(),
        type: activity.type,
        title: activity.title,
        description: activity.description,
        relatedId: activity.relatedId,
        metadata: activity.metadata,
        createdAt: activity.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getActivityFeed = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { limit = 50 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const activities = await Activity.find({
      userId: { $ne: userId },
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      data: activities.map((activity) => ({
        id: activity._id.toString(),
        userId: activity.userId,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        relatedId: activity.relatedId,
        metadata: activity.metadata,
        createdAt: activity.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

