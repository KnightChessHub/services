import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { File } from '../models/file.model';
import { saveFile, deleteFile } from '../utils/storage';

export const uploadFile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const file = req.file;
    const { type = 'other', relatedId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (!['profile', 'game', 'tournament', 'group', 'other'].includes(type)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    const savedFile = await saveFile(file, userId, type);

    const fileRecord = new File({
      userId,
      filename: savedFile.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: savedFile.size,
      path: savedFile.path,
      url: savedFile.url,
      type,
      relatedId,
    });

    await fileRecord.save();

    res.status(201).json({
      success: true,
      data: {
        id: fileRecord._id.toString(),
        url: fileRecord.url,
        filename: fileRecord.filename,
        originalName: fileRecord.originalName,
        mimeType: fileRecord.mimeType,
        size: fileRecord.size,
        type: fileRecord.type,
        relatedId: fileRecord.relatedId,
        createdAt: fileRecord.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.userId !== userId && file.type !== 'profile') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      data: {
        id: file._id.toString(),
        url: file.url,
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        type: file.type,
        relatedId: file.relatedId,
        createdAt: file.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyFiles = async (req: AuthRequest, res: Response) => {
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

    const files = await File.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      data: files.map((file) => ({
        id: file._id.toString(),
        url: file.url,
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        type: file.type,
        relatedId: file.relatedId,
        createdAt: file.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFileRecord = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await deleteFile(file.path);
    await File.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

