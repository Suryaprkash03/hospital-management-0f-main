
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWTPayload, SocketUser, NotificationData } from '@/types';

const connectedUsers = new Map<string, SocketUser>();

export const setupSocketHandlers = (io: Server) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      socket.data.userId = decoded.userId;
      socket.data.role = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const role = socket.data.role;

    // Store connected user
    connectedUsers.set(userId, {
      userId,
      socketId: socket.id,
      role,
      isOnline: true
    });

    console.log(`User ${userId} connected with role ${role}`);

    // Join role-based rooms
    socket.join(role);
    socket.join(`user_${userId}`);

    // Handle real-time notifications
    socket.on('join_department', (department: string) => {
      socket.join(`department_${department}`);
    });

    socket.on('leave_department', (department: string) => {
      socket.leave(`department_${department}`);
    });

    // Handle appointment updates
    socket.on('appointment_update', (data) => {
      socket.to(`user_${data.patientId}`).emit('appointment_updated', data);
      socket.to(`user_${data.doctorId}`).emit('appointment_updated', data);
    });

    // Handle visit updates
    socket.on('visit_update', (data) => {
      socket.to(`user_${data.patientId}`).emit('visit_updated', data);
      socket.to('DOCTOR').emit('visit_updated', data);
      socket.to('NURSE').emit('visit_updated', data);
    });

    // Handle emergency alerts
    socket.on('emergency_alert', (data) => {
      socket.to('DOCTOR').emit('emergency_alert', data);
      socket.to('NURSE').emit('emergency_alert', data);
      socket.to('ADMIN').emit('emergency_alert', data);
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
};

export const sendNotificationToUser = (io: Server, userId: string, notification: NotificationData) => {
  io.to(`user_${userId}`).emit('notification', notification);
};

export const sendNotificationToRole = (io: Server, role: string, notification: NotificationData) => {
  io.to(role).emit('notification', notification);
};

export const sendNotificationToDepartment = (io: Server, department: string, notification: NotificationData) => {
  io.to(`department_${department}`).emit('notification', notification);
};

export const broadcastNotification = (io: Server, notification: NotificationData) => {
  io.emit('notification', notification);
};

export const getConnectedUsers = (): SocketUser[] => {
  return Array.from(connectedUsers.values());
};

export const isUserOnline = (userId: string): boolean => {
  return connectedUsers.has(userId);
};
