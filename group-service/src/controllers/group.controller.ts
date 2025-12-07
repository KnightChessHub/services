import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { Group, GroupMember } from '../models/group.model';

export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const group = new Group({
      name,
      description,
      ownerId: userId,
    });

    await group.save();

    const member = new GroupMember({
      groupId: group._id.toString(),
      userId: userId,
      role: 'owner',
    });

    await member.save();

    res.status(201).json({
      success: true,
      data: {
        id: group._id.toString(),
        name: group.name,
        description: group.description,
        ownerId: group.ownerId,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroups = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const members = await GroupMember.find({ userId });

    const groupIds = members.map((m) => m.groupId).filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (groupIds.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const groups = await Group.find({ _id: { $in: groupIds.map((id) => new mongoose.Types.ObjectId(id)) } });

    res.json({
      success: true,
      data: groups.map((group) => ({
        id: group._id.toString(),
        name: group.name,
        description: group.description,
        ownerId: group.ownerId,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGroupById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const member = await GroupMember.findOne({ groupId: id, userId });

    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      success: true,
      data: {
        id: group._id.toString(),
        name: group.name,
        description: group.description,
        ownerId: group.ownerId,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateGroup = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const member = await GroupMember.findOne({ groupId: id, userId });

    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (member.role !== 'owner' && member.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { name, description } = req.body;
    const updateData: any = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const group = await Group.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      success: true,
      data: {
        id: group._id.toString(),
        name: group.name,
        description: group.description,
        ownerId: group.ownerId,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteGroup = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.ownerId !== userId) {
      return res.status(403).json({ error: 'Only owner can delete group' });
    }

    await Group.findByIdAndDelete(id);
    await GroupMember.deleteMany({ groupId: id });

    res.json({
      success: true,
      data: { message: 'Group deleted successfully' },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addMember = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { userId: newUserId, role = 'member' } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!newUserId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const member = await GroupMember.findOne({ groupId: id, userId });

    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (member.role !== 'owner' && member.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const newMember = new GroupMember({
      groupId: id,
      userId: newUserId,
      role,
    });

    await newMember.save();

    res.status(201).json({
      success: true,
      data: {
        id: newMember._id.toString(),
        groupId: newMember.groupId,
        userId: newMember.userId,
        role: newMember.role,
        joinedAt: newMember.joinedAt,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'User is already a member' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const getMembers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const memberCheck = await GroupMember.findOne({ groupId: id, userId });

    if (!memberCheck) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const members = await GroupMember.find({ groupId: id });

    res.json({
      success: true,
      data: members.map((member) => ({
        id: member._id.toString(),
        groupId: member.groupId,
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id, userId: targetUserId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const member = await GroupMember.findOne({ groupId: id, userId });

    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (member.role !== 'owner' && member.role !== 'admin') {
      if (userId !== targetUserId) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    }

    await GroupMember.deleteOne({ groupId: id, userId: targetUserId });

    res.json({
      success: true,
      data: { message: 'Member removed successfully' },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

