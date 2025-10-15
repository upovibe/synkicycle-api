import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { User } from '@models/User';
import { config } from '@config/env';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    _id: string;
    username?: string;
    name?: string;
    email: string;
    [key: string]: unknown;
  };
}

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private activeConnections: Map<string, string> = new Map(); // userId -> connectionId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: config.CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string; email: string };
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        (socket as AuthenticatedSocket).userId = user._id.toString();
        (socket as AuthenticatedSocket).user = {
          _id: user._id.toString(),
          username: user.username,
          name: user.name,
          email: user.email,
        };
        next();
      } catch {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket;
      console.log(`🔌 User ${authSocket.userId} connected with socket ${socket.id}`);

      // Store user connection
      if (authSocket.userId) {
        this.connectedUsers.set(authSocket.userId, socket.id);
        
        // Update user's socketId in database
        User.findByIdAndUpdate(authSocket.userId, { socketId: socket.id })
          .catch(err => console.error('Error updating user socketId:', err));
        
        // Broadcast user online status to all connected clients
        this.io.emit('user:online', { userId: authSocket.userId });
      }

      // Handle user online status
      socket.on('user:online', () => {
        this.handleUserOnline(authSocket);
      });

      // Handle user typing
      socket.on('typing', (data: { connectionId: string }) => {
        this.handleTyping(authSocket, data);
      });

      socket.on('stop-typing', (data: { connectionId: string }) => {
        this.handleStopTyping(authSocket, data);
      });

      // Join and leave connection rooms
      socket.on('join-connection', (data: { connectionId: string }) => {
        socket.join(data.connectionId);
        // Track active connection for this user
        if (socket.userId) {
          this.setActiveConnection(socket.userId, data.connectionId);
        }
      });

      socket.on('leave-connection', (data: { connectionId: string }) => {
        socket.leave(data.connectionId);
        // Clear active connection for this user
        if (socket.userId) {
          this.clearActiveConnection(socket.userId);
        }
      });

      // Handle real-time message broadcasting
      socket.on('send-message', (data: { connectionId: string; message: unknown }) => {
        // Broadcast to all users in the connection room (including sender for multi-device sync)
        this.io.to(data.connectionId).emit('new-message', {
          connectionId: data.connectionId,
          message: data.message,
        });
      });

      // Handle message read events
      socket.on('message-read', (data: { connectionId: string; messageIds: string[] }) => {
        // Broadcast to all users in the connection room
        this.io.to(data.connectionId).emit('message-read', {
          connectionId: data.connectionId,
          messageIds: data.messageIds,
          readBy: socket.userId,
        });
      });

      // Handle unread count requests
      socket.on('get-unread-counts', async () => {
        await this.handleUnreadCountsRequest(authSocket);
      });

      // Handle private messages
      socket.on('message:private', (data: { 
        targetUserId: string; 
        message: string; 
        type?: 'text' | 'image' | 'file' 
      }) => {
        this.handlePrivateMessage(authSocket, data);
      });

      // Handle user location updates
      socket.on('location:update', (data: { 
        latitude: number; 
        longitude: number; 
        accuracy?: number 
      }) => {
        this.handleLocationUpdate(authSocket, data);
      });

      // Handle user interests/availability updates
      socket.on('profile:update', (data: { 
        interests?: string[]; 
        profession?: string; 
        bio?: string; 
        available?: boolean 
      }) => {
        this.handleProfileUpdate(authSocket, data);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(authSocket);
      });
    });
  }

  private async handleUserOnline(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    // Update user's lastActive timestamp
    await User.findByIdAndUpdate(socket.userId, { lastActive: new Date() });
    
    // Notify other users that this user is online
    socket.broadcast.emit('user:status', {
      userId: socket.userId,
      status: 'online',
      lastActive: new Date(),
    });
  }

  private handleTyping(socket: AuthenticatedSocket, data: { connectionId: string }) {
    if (!socket.userId) return;
    
    // Broadcast typing to all users in the connection room (except sender)
    socket.to(data.connectionId).emit('user-typing', {
      connectionId: data.connectionId,
      userId: socket.userId,
      isTyping: true,
    });
  }

  private handleStopTyping(socket: AuthenticatedSocket, data: { connectionId: string }) {
    if (!socket.userId) return;
    
    // Broadcast stop typing to all users in the connection room (except sender)
    socket.to(data.connectionId).emit('user-stopped-typing', {
      connectionId: data.connectionId,
      userId: socket.userId,
      isTyping: false,
    });
  }

  private async handlePrivateMessage(socket: AuthenticatedSocket, data: { 
    targetUserId: string; 
    message: string; 
    type?: 'text' | 'image' | 'file' 
  }) {
    if (!socket.userId) return;

    const targetSocketId = this.connectedUsers.get(data.targetUserId);
    
    if (targetSocketId) {
      // Send message to target user
      this.io.to(targetSocketId).emit('message:received', {
        fromUserId: socket.userId,
        fromUserName: socket.user?.name,
        message: data.message,
        type: data.type || 'text',
        timestamp: new Date(),
      });
    }

    // Send confirmation back to sender
    socket.emit('message:sent', {
      targetUserId: data.targetUserId,
      message: data.message,
      timestamp: new Date(),
    });
  }

  private handleLocationUpdate(socket: AuthenticatedSocket, data: { 
    latitude: number; 
    longitude: number; 
    accuracy?: number 
  }) {
    if (!socket.userId) return;

    // Broadcast location to nearby users (you can add proximity logic here)
    socket.broadcast.emit('user:location', {
      userId: socket.userId,
      userName: socket.user?.name,
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
      },
      timestamp: new Date(),
    });
  }

  private async handleProfileUpdate(socket: AuthenticatedSocket, data: { 
    interests?: string[]; 
    profession?: string; 
    bio?: string; 
    available?: boolean 
  }) {
    if (!socket.userId) return;

    // Update user profile in database
    await User.findByIdAndUpdate(socket.userId, {
      interests: data.interests,
      profession: data.profession,
      bio: data.bio,
      lastActive: new Date(),
    });

    // Notify other users about profile update
    socket.broadcast.emit('user:profile:updated', {
      userId: socket.userId,
      userName: socket.user?.name,
      updates: data,
      timestamp: new Date(),
    });
  }

  private async handleDisconnect(socket: AuthenticatedSocket) {
    console.log(`🔌 User ${socket.userId} disconnected`);

    if (socket.userId) {
      // Remove from connected users
      this.connectedUsers.delete(socket.userId);
      
      // Update user's socketId in database
      await User.findByIdAndUpdate(socket.userId, { socketId: null });
      
      // Broadcast user offline status to all connected clients
      this.io.emit('user:offline', { userId: socket.userId });
      
      // Also emit the old event for backward compatibility
      socket.broadcast.emit('user:status', {
        userId: socket.userId,
        status: 'offline',
        lastActive: new Date(),
      });
    }
  }

  // Public methods for external use
  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  public getUserSocketId(userId: string): string | undefined {
    return this.connectedUsers.get(userId);
  }

  public sendToUser(userId: string, event: string, data: unknown): boolean {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  public broadcast(event: string, data: unknown): void {
    this.io.emit(event, data);
  }

  public setActiveConnection(userId: string, connectionId: string): void {
    this.activeConnections.set(userId, connectionId);
  }

  public getActiveConnection(userId: string): string | undefined {
    return this.activeConnections.get(userId);
  }

  public clearActiveConnection(userId: string): void {
    this.activeConnections.delete(userId);
  }

  private async handleUnreadCountsRequest(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    try {
      const { Connection } = await import('@models/Connection');
      const { Message } = await import('@models/Message');

      // Get all connections where user is a participant
      const connections = await Connection.find({
        participants: socket.userId,
        status: 'accepted',
      });

      // Get unread counts for each connection
      const unreadCounts = await Promise.all(
        connections.map(async (connection) => {
          const count = await Message.countDocuments({
            connectionId: connection._id,
            receiverId: socket.userId,
            status: { $ne: 'read' },
          });

          return {
            connectionId: connection._id,
            unreadCount: count,
          };
        })
      );

      // Filter out connections with 0 unread messages
      const connectionsWithUnread = unreadCounts.filter(item => item.unreadCount > 0);

      // Send unread counts to the requesting socket
      socket.emit('unread-counts', {
        unreadCounts: connectionsWithUnread,
        totalUnread: connectionsWithUnread.reduce((sum, item) => sum + item.unreadCount, 0),
      });
    } catch (error) {
      console.error('Error getting unread counts:', error);
      socket.emit('error', { message: 'Failed to get unread counts' });
    }
  }
}

export default SocketService;
