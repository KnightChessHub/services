import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const saveFile = async (file: Express.Multer.File, userId: string, type: string): Promise<{
  filename: string;
  path: string;
  url: string;
  size: number;
}> => {
  const fileExtension = path.extname(file.originalname);
  const filename = `${uuidv4()}${fileExtension}`;
  const userDir = path.join(UPLOAD_DIR, userId);
  
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  const filePath = path.join(userDir, filename);
  const url = `/uploads/${userId}/${filename}`;

  if (file.mimetype.startsWith('image/')) {
    await sharp(file.buffer)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .toFile(filePath);
  } else {
    fs.writeFileSync(filePath, file.buffer);
  }

  const stats = fs.statSync(filePath);

  return {
    filename,
    path: filePath,
    url,
    size: stats.size,
  };
};

export const deleteFile = async (filePath: string): Promise<void> => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const getFileUrl = (userId: string, filename: string): string => {
  return `/uploads/${userId}/${filename}`;
};

