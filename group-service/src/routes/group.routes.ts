import { Router } from 'express';
import {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addMember,
  getMembers,
  removeMember,
} from '../controllers/group.controller';

export const groupRoutes = Router();

groupRoutes.post('/', createGroup);
groupRoutes.get('/', getGroups);
groupRoutes.get('/:id', getGroupById);
groupRoutes.put('/:id', updateGroup);
groupRoutes.delete('/:id', deleteGroup);
groupRoutes.post('/:id/members', addMember);
groupRoutes.get('/:id/members', getMembers);
groupRoutes.delete('/:id/members/:userId', removeMember);

