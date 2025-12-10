import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { healthRoutes } from './routes/health.routes';
import { createBroadcastRoutes } from './routes/broadcast.routes';
import { connectDB } from './db/client';
import { authenticateSocket } from './middleware/socketAuth';
import { SocketManager } from './utils/socketManager';
import { AuthenticatedSocket } from './middleware/socketAuth';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3014;

app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);

io.use(authenticateSocket);

const socketManager = new SocketManager(io);

// Broadcast routes for internal service communication
app.use('/broadcast', createBroadcastRoutes(socketManager));

io.on('connection', (socket: AuthenticatedSocket) => {
  socketManager.handleConnection(socket);
});

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Real-time Service running on port ${PORT}`);
  });
});

