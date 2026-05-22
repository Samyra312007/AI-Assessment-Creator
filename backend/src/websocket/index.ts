import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { config } from '../config';

let io: Server;

export function setupWebSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join:assignment', (data: { assignmentId: string }) => {
      const room = `assignment:${data.assignmentId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on('leave:assignment', (data: { assignmentId: string }) => {
      const room = `assignment:${data.assignmentId}`;
      socket.leave(room);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function emitJobProgress(data: {
  assignmentId: string;
  jobId: string;
  status: string;
  progress: number;
}): void {
  if (io) {
    io.to(`assignment:${data.assignmentId}`).emit('job:status', data);
  }
}

export function emitJobCompleted(data: {
  assignmentId: string;
  assessmentId: string;
}): void {
  if (io) {
    io.to(`assignment:${data.assignmentId}`).emit('job:completed', data);
  }
}

export function emitJobFailed(data: {
  assignmentId: string;
  error: string;
}): void {
  if (io) {
    io.to(`assignment:${data.assignmentId}`).emit('job:failed', data);
  }
}

export function getIO(): Server {
  return io;
}
