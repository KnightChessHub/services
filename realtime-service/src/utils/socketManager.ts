import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/socketAuth';
import { Connection } from '../models/connection.model';

export class SocketManager {
  private io: SocketIOServer;
  private gameRooms: Map<string, Set<string>> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  async handleConnection(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    const connection = new Connection({
      userId: socket.userId,
      socketId: socket.id,
      status: 'online',
      lastSeen: new Date(),
    });

    await connection.save();

    socket.join(`user:${socket.userId}`);
    this.io.emit('user:online', { userId: socket.userId });

    socket.on('game:join', async (gameId: string) => {
      await this.joinGame(socket, gameId);
    });

    socket.on('game:leave', async (gameId: string) => {
      await this.leaveGame(socket, gameId);
    });

    socket.on('game:move', async (data: { gameId: string; move: any }) => {
      await this.broadcastMove(socket, data.gameId, data.move);
    });

    socket.on('chat:message', async (data: { recipientId: string; message: any }) => {
      await this.sendChatMessage(socket, data.recipientId, data.message);
    });

    socket.on('disconnect', async () => {
      await this.handleDisconnect(socket);
    });
  }

  private async joinGame(socket: AuthenticatedSocket, gameId: string) {
    socket.join(`game:${gameId}`);
    
    if (!this.gameRooms.has(gameId)) {
      this.gameRooms.set(gameId, new Set());
    }
    this.gameRooms.get(gameId)?.add(socket.userId!);

    socket.to(`game:${gameId}`).emit('game:player-joined', {
      gameId,
      userId: socket.userId,
    });
  }

  private async leaveGame(socket: AuthenticatedSocket, gameId: string) {
    socket.leave(`game:${gameId}`);
    this.gameRooms.get(gameId)?.delete(socket.userId!);

    socket.to(`game:${gameId}`).emit('game:player-left', {
      gameId,
      userId: socket.userId,
    });
  }

  private async broadcastMove(socket: AuthenticatedSocket, gameId: string, move: any) {
    socket.to(`game:${gameId}`).emit('game:move', {
      gameId,
      move,
      userId: socket.userId,
    });
  }

  private async sendChatMessage(socket: AuthenticatedSocket, recipientId: string, message: any) {
    this.io.to(`user:${recipientId}`).emit('chat:message', {
      senderId: socket.userId,
      message,
    });
  }

  private async handleDisconnect(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    await Connection.deleteOne({ socketId: socket.id });

    const remainingConnections = await Connection.countDocuments({ userId: socket.userId });

    if (remainingConnections === 0) {
      this.io.emit('user:offline', { userId: socket.userId });
    }
  }

  async getUserStatus(userId: string): Promise<'online' | 'offline'> {
    const connection = await Connection.findOne({ userId, status: 'online' });
    return connection ? 'online' : 'offline';
  }

  async broadcastToGame(gameId: string, event: string, data: any) {
    this.io.to(`game:${gameId}`).emit(event, data);
  }

  async broadcastToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }
}

