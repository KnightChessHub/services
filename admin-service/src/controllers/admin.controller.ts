import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';
import { Admin } from '../models/admin.model';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:3004';

export const createAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role, permissions = [] } = req.body;

    if (!['super_admin', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existing = await Admin.findOne({ userId });

    if (existing) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    const admin = new Admin({
      userId,
      role,
      permissions,
    });

    await admin.save();

    res.status(201).json({
      success: true,
      data: {
        id: admin._id.toString(),
        userId: admin.userId,
        role: admin.role,
        permissions: admin.permissions,
        createdAt: admin.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAdmins = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.query;

    const query: any = {};
    if (role) {
      query.role = role;
    }

    const admins = await Admin.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: admins.map((admin) => ({
        id: admin._id.toString(),
        userId: admin.userId,
        role: admin.role,
        permissions: admin.permissions,
        createdAt: admin.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, permissions } = req.body;

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    if (role && !['super_admin', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (role) admin.role = role;
    if (permissions) admin.permissions = permissions;

    await admin.save();

    res.json({
      success: true,
      data: {
        id: admin._id.toString(),
        userId: admin.userId,
        role: admin.role,
        permissions: admin.permissions,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await Admin.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Admin removed',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPlatformStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = {
      totalUsers: 0,
      totalGames: 0,
      activeGames: 0,
      totalTournaments: 0,
      totalAdmins: await Admin.countDocuments(),
    };

    try {
      const usersResponse = await axios.get(`${USER_SERVICE_URL}`, {
        headers: { Authorization: req.headers.authorization },
      });
      if (usersResponse.data.success) {
        stats.totalUsers = Array.isArray(usersResponse.data.data) ? usersResponse.data.data.length : 0;
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }

    try {
      const gamesResponse = await axios.get(`${GAME_SERVICE_URL}`, {
        headers: { Authorization: req.headers.authorization },
      });
      if (gamesResponse.data.success && Array.isArray(gamesResponse.data.data)) {
        const games = gamesResponse.data.data;
        stats.totalGames = games.length;
        stats.activeGames = games.filter((g: any) => g.status === 'active').length;
      }
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

