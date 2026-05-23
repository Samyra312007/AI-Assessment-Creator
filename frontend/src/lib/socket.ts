'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const rawWsUrl = process.env.NEXT_PUBLIC_WS_URL;
const SOCKET_URL = rawWsUrl
  ? rawWsUrl.startsWith('http://') || rawWsUrl.startsWith('https://')
    ? rawWsUrl
    : `https://${rawWsUrl}`
  : 'http://localhost:5000';

interface JobStatusEvent {
  assignmentId: string;
  jobId: string;
  status: string;
  progress: number;
}

interface JobCompletedEvent {
  assignmentId: string;
  assessmentId: string;
}

interface JobFailedEvent {
  assignmentId: string;
  error: string;
}

let globalSocket: Socket | null = null;

function getSocket(): Socket {
  if (!globalSocket) {
    globalSocket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return globalSocket;
}

export function useSocket(assignmentId?: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<{
    onStatus?: (data: JobStatusEvent) => void;
    onCompleted?: (data: JobCompletedEvent) => void;
    onFailed?: (data: JobFailedEvent) => void;
  }>({});

  const connect = useCallback(() => {
    const socket = getSocket();
    socketRef.current = socket;
    if (!socket.connected) {
      socket.connect();
    }
    if (assignmentId) {
      socket.emit('join:assignment', { assignmentId });
    }
  }, [assignmentId]);

  const disconnect = useCallback(() => {
    if (socketRef.current && assignmentId) {
      socketRef.current.emit('leave:assignment', { assignmentId });
    }
    if (globalSocket) {
      globalSocket.removeAllListeners();
      globalSocket.disconnect();
      globalSocket = null;
    }
  }, [assignmentId]);

  const onStatus = useCallback((cb: (data: JobStatusEvent) => void) => {
    listenersRef.current.onStatus = cb;
    const socket = socketRef.current || getSocket();
    socket.off('job:status');
    socket.on('job:status', cb);
  }, []);

  const onCompleted = useCallback((cb: (data: JobCompletedEvent) => void) => {
    listenersRef.current.onCompleted = cb;
    const socket = socketRef.current || getSocket();
    socket.off('job:completed');
    socket.on('job:completed', cb);
  }, []);

  const onFailed = useCallback((cb: (data: JobFailedEvent) => void) => {
    listenersRef.current.onFailed = cb;
    const socket = socketRef.current || getSocket();
    socket.off('job:failed');
    socket.on('job:failed', cb);
  }, []);

  useEffect(() => {
    return () => {
      if (socketRef.current && assignmentId) {
        socketRef.current.emit('leave:assignment', { assignmentId });
      }
    };
  }, [assignmentId]);

  return { connect, disconnect, onStatus, onCompleted, onFailed };
}

export function emitJoin(assignmentId: string) {
  const socket = getSocket();
  if (!socket.connected) socket.connect();
  socket.emit('join:assignment', { assignmentId });
}
