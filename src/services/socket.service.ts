import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { User } from '@models/User';
import { config } from '@config/env';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    _id: string;
    username: string;
    name: string;
    email: string;
    [key: string]: unknown;
  };
}

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

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
      }

      // Handle user online status
      socket.on('user:online', () => {
        this.handleUserOnline(authSocket);
      });

      // Handle user typing
      socket.on('typing:start', (data: { targetUserId: string }) => {
        this.handleTypingStart(authSocket, data);
      });

      socket.on('typing:stop', (data: { targetUserId: string }) => {
        this.handleTypingStop(authSocket, data);
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

  private handleTypingStart(socket: AuthenticatedSocket, data: { targetUserId: string }) {
    if (!socket.userId) return;

    const targetSocketId = this.connectedUsers.get(data.targetUserId);
    if (targetSocketId) {
      this.io.to(targetSocketId).emit('typing:start', {
        userId: socket.userId,
        userName: socket.user?.name,
      });
    }
  }

  private handleTypingStop(socket: AuthenticatedSocket, data: { targetUserId: string }) {
    if (!socket.userId) return;

    const targetSocketId = this.connectedUsers.get(data.targetUserId);
    if (targetSocketId) {
      this.io.to(targetSocketId).emit('typing:stop', {
        userId: socket.userId,
      });
    }
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
      
      // Notify other users that this user is offline
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
}

export default SocketService;
