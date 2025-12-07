import { Router } from 'express';
import { uploadFile, getFile, getMyFiles, deleteFileRecord } from '../controllers/file.controller';
import { upload } from '../middleware/upload';

export const fileRoutes = Router();

fileRoutes.post('/', upload.single('file'), uploadFile);
fileRoutes.get('/my', getMyFiles);
fileRoutes.get('/:id', getFile);
fileRoutes.delete('/:id', deleteFileRecord);

