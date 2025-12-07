import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Message } from '../models/message.model';

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { recipientId, content, type = 'direct', relatedId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!recipientId || !content) {
      return res.status(400).json({ error: 'Missing recipientId or content' });
    }

    if (userId === recipientId) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    const message = new Message({
      senderId: userId,
      recipientId,
      content,
      type,
      relatedId,
      read: false,
    });

    await message.save();

    res.status(201).json({
      success: true,
      data: {
        id: message._id.toString(),
        senderId: message.senderId,
        recipientId: message.recipientId,
        content: message.content,
        type: message.type,
        relatedId: message.relatedId,
        read: message.read,
        createdAt: message.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { userId: otherUserId } = req.params;
    const { limit = 50 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    await Message.updateMany(
      { senderId: otherUserId, recipientId: userId, read: false },
      { read: true }
    );

    res.json({
      success: true,
      data: messages.reverse().map((msg) => ({
        id: msg._id.toString(),
        senderId: msg.senderId,
        recipientId: msg.recipientId,
        content: msg.content,
        type: msg.type,
        relatedId: msg.relatedId,
        read: msg.read,
        createdAt: msg.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { recipientId: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', userId] },
              '$recipientId',
              '$senderId',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$recipientId', userId] }, { $eq: ['$read', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          userId: '$_id',
          lastMessage: {
            id: '$lastMessage._id',
            senderId: '$lastMessage.senderId',
            recipientId: '$lastMessage.recipientId',
            content: '$lastMessage.content',
            type: '$lastMessage.type',
            read: '$lastMessage.read',
            createdAt: '$lastMessage.createdAt',
          },
          unreadCount: 1,
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { messageId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const message = await Message.findOne({ _id: messageId, recipientId: userId });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    message.read = true;
    await message.save();

    res.json({
      success: true,
      data: {
        id: message._id.toString(),
        read: message.read,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const count = await Message.countDocuments({ recipientId: userId, read: false });

    res.json({
      success: true,
      data: { count },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

