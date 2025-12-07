import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Report } from '../models/report.model';

export const createReport = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { reportedUserId, reportedGameId, reportedContentId, type, reason, description } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!['user', 'game', 'content', 'chat'].includes(type)) {
      return res.status(400).json({ error: 'Invalid report type' });
    }

    if (!['spam', 'harassment', 'cheating', 'inappropriate_content', 'other'].includes(reason)) {
      return res.status(400).json({ error: 'Invalid reason' });
    }

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const report = new Report({
      reporterId: userId,
      reportedUserId,
      reportedGameId,
      reportedContentId,
      type,
      reason,
      description,
      status: 'pending',
    });

    await report.save();

    res.status(201).json({
      success: true,
      data: {
        id: report._id.toString(),
        type: report.type,
        reason: report.reason,
        status: report.status,
        createdAt: report.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyReports = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const reports = await Report.find({ reporterId: userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reports.map((report) => ({
        id: report._id.toString(),
        type: report.type,
        reason: report.reason,
        status: report.status,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const { status, type, limit = 50 } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const reports = await Report.find(query).sort({ createdAt: -1 }).limit(Number(limit));

    res.json({
      success: true,
      data: reports.map((report) => ({
        id: report._id.toString(),
        reporterId: report.reporterId,
        reportedUserId: report.reportedUserId,
        reportedGameId: report.reportedGameId,
        reportedContentId: report.reportedContentId,
        type: report.type,
        reason: report.reason,
        description: report.description,
        status: report.status,
        moderatorId: report.moderatorId,
        moderatorNotes: report.moderatorNotes,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateReportStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { status, moderatorNotes } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!['pending', 'reviewing', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    report.status = status;
    report.moderatorId = userId;
    if (moderatorNotes) report.moderatorNotes = moderatorNotes;

    await report.save();

    res.json({
      success: true,
      data: {
        id: report._id.toString(),
        status: report.status,
        moderatorId: report.moderatorId,
        moderatorNotes: report.moderatorNotes,
        updatedAt: report.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

