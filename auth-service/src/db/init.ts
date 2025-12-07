import { connectDB } from './client';

export async function initDatabase() {
  await connectDB();
}

