import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Friend } from '../models/friend.model';

export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { recipientId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!recipientId) {
      return res.status(400).json({ error: 'recipientId is required' });
    }

    if (userId === recipientId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    const existing = await Friend.findOne({
      $or: [
        { requesterId: userId, recipientId },
        { requesterId: recipientId, recipientId: userId },
      ],
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ error: 'Already friends' });
      }
      if (existing.status === 'blocked') {
        return res.status(400).json({ error: 'Cannot send request to blocked user' });
      }
      if (existing.requesterId === userId) {
        return res.status(400).json({ error: 'Friend request already sent' });
      }
      if (existing.recipientId === userId) {
        existing.status = 'accepted';
        await existing.save();
        return res.json({
          success: true,
          data: {
            id: existing._id.toString(),
            requesterId: existing.requesterId,
            recipientId: existing.recipientId,
            status: existing.status,
            createdAt: existing.createdAt,
            updatedAt: existing.updatedAt,
          },
        });
      }
    }

    const friendRequest = new Friend({
      requesterId: userId,
      recipientId,
      status: 'pending',
    });

    await friendRequest.save();

    res.status(201).json({
      success: true,
      data: {
        id: friendRequest._id.toString(),
        requesterId: friendRequest.requesterId,
        recipientId: friendRequest.recipientId,
        status: friendRequest.status,
        createdAt: friendRequest.createdAt,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Friend request already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const acceptFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const friendRequest = await Friend.findById(id);

    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (friendRequest.recipientId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Friend request is not pending' });
    }

    friendRequest.status = 'accepted';
    await friendRequest.save();

    res.json({
      success: true,
      data: {
        id: friendRequest._id.toString(),
        requesterId: friendRequest.requesterId,
        recipientId: friendRequest.recipientId,
        status: friendRequest.status,
        updatedAt: friendRequest.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const rejectFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const friendRequest = await Friend.findById(id);

    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (friendRequest.recipientId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Friend.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Friend request rejected',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFriends = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { status = 'accepted' } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const friends = await Friend.find({
      $or: [
        { requesterId: userId, status },
        { recipientId: userId, status },
      ],
    });

    const friendIds = friends.map((f) =>
      f.requesterId === userId ? f.recipientId : f.requesterId
    );

    res.json({
      success: true,
      data: friendIds,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFriendRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { type = 'received' } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const query =
      type === 'sent'
        ? { requesterId: userId, status: 'pending' }
        : { recipientId: userId, status: 'pending' };

    const requests = await Friend.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests.map((req) => ({
        id: req._id.toString(),
        requesterId: req.requesterId,
        recipientId: req.recipientId,
        status: req.status,
        createdAt: req.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const removeFriend = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { friendId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const friendship = await Friend.findOne({
      $or: [
        { requesterId: userId, recipientId: friendId },
        { requesterId: friendId, recipientId: userId },
      ],
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    await Friend.deleteOne({ _id: friendship._id });

    res.json({
      success: true,
      message: 'Friend removed',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const blockUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { userId: blockUserId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (userId === blockUserId) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }

    const existing = await Friend.findOne({
      $or: [
        { requesterId: userId, recipientId: blockUserId },
        { requesterId: blockUserId, recipientId: userId },
      ],
    });

    if (existing) {
      existing.status = 'blocked';
      existing.requesterId = userId;
      existing.recipientId = blockUserId;
      await existing.save();
    } else {
      const block = new Friend({
        requesterId: userId,
        recipientId: blockUserId,
        status: 'blocked',
      });
      await block.save();
    }

    res.json({
      success: true,
      message: 'User blocked',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

