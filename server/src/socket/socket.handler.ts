import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.utils';

export const initializeSocket = (io: Server) => {
  // authenticate socket connections
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.data.user = decoded;
      next();
    } catch (error) {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    console.log(`✅ Socket connected: ${socket.id} | User: ${user.userId} | Role: ${user.role}`);

    // join role-based room automatically
    socket.join(`role:${user.role}`);
    console.log(`User ${user.userId} joined room: role:${user.role}`);

    // join a specific proposal room
    socket.on('join:proposal', (proposalId: number) => {
      socket.join(`proposal:${proposalId}`);
      console.log(`User ${user.userId} joined proposal room: ${proposalId}`);
    });

    // leave a specific proposal room
    socket.on('leave:proposal', (proposalId: number) => {
      socket.leave(`proposal:${proposalId}`);
      console.log(`User ${user.userId} left proposal room: ${proposalId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};