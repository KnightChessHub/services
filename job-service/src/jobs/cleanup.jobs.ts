import mongoose from 'mongoose';
import { Job } from '../models/job.model';

const getCleanupDB = () => {
  if (mongoose.connections.length > 0 && mongoose.connections[0].readyState === 1) {
    return mongoose.connections[0];
  }
  const MONGODB_URI = process.env.MONGODB_URI || '';
  return mongoose.createConnection(MONGODB_URI);
};

const cleanupDB = getCleanupDB();

const QueueEntrySchema = new mongoose.Schema({
  userId: String,
  rating: Number,
  timeControl: String,
  joinedAt: Date,
  expiresAt: Date,
}, { collection: 'queueentries' });

const ConnectionSchema = new mongoose.Schema({
  userId: String,
  socketId: String,
  status: String,
  lastSeen: Date,
}, { collection: 'connections' });

const QueueEntry = cleanupDB.models.QueueEntry || cleanupDB.model('QueueEntry', QueueEntrySchema, 'queueentries');
const Connection = cleanupDB.models.Connection || cleanupDB.model('Connection', ConnectionSchema, 'connections');

export const cleanupExpiredQueueEntries = async () => {
  try {
    const expired = await QueueEntry.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    return { deleted: expired.deletedCount };
  } catch (error: any) {
    throw new Error(`Cleanup failed: ${error.message}`);
  }
};

export const cleanupStaleConnections = async () => {
  try {
    const staleTime = new Date();
    staleTime.setMinutes(staleTime.getMinutes() - 30);

    const deleted = await Connection.deleteMany({
      lastSeen: { $lt: staleTime },
    });

    return { deleted: deleted.deletedCount };
  } catch (error: any) {
    throw new Error(`Connection cleanup failed: ${error.message}`);
  }
};

export const runCleanupJobs = async (jobId: string) => {
  const job = await Job.findById(jobId);
  if (!job) return;

  job.status = 'processing';
  job.startedAt = new Date();
  await job.save();

  try {
    const queueResult = await cleanupExpiredQueueEntries();
    const connectionResult = await cleanupStaleConnections();

    job.status = 'completed';
    job.result = {
      queueEntries: queueResult,
      connections: connectionResult,
    };
    job.completedAt = new Date();
    await job.save();
  } catch (error: any) {
    job.status = 'failed';
    job.error = error.message;
    job.completedAt = new Date();
    await job.save();
  }
};
