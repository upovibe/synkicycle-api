import mongoose, { Schema, Document } from 'mongoose';

export interface SuggestedUser {
  userId: string;
  name: string;
  username?: string;
  profession?: string;
  bio?: string;
  avatar?: string;
  matchScore?: number;
  reason?: string;
  connectionType?: 'professional' | 'social' | 'both';
  matchReason?: string;
}

export interface ChatMessageMetadata {
  suggestedUsers?: SuggestedUser[];
  actionType?: 'view_profile' | 'send_message' | 'add_interest' | 'improve_bio';
  actionData?: {
    userId?: string;
    message?: string;
    interest?: string;
    skill?: string;
  };
  profileScore?: number;
  profileSuggestions?: string[];
}

export interface IChatMessage extends Document {
  _id: mongoose.Types.ObjectId;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'ai';
  message: string;
  messageType: 'text' | 'suggestion' | 'action' | 'profile_analysis';
  metadata?: ChatMessageMetadata;
  timestamp: Date;
  isRead: boolean;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    conversationId: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    senderType: {
      type: String,
      enum: ['user', 'ai'],
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    messageType: {
      type: String,
      enum: ['text', 'suggestion', 'action', 'profile_analysis'],
      default: 'text',
    },
    metadata: {
      suggestedUsers: [{
        userId: String,
        name: String,
        username: String,
        profession: String,
        bio: String,
        avatar: String,
        matchScore: Number,
        reason: String,
        connectionType: String,
        matchReason: String,
      }],
      actionType: String,
      actionData: {
        userId: String,
        message: String,
        interest: String,
        skill: String,
      },
      profileScore: Number,
      profileSuggestions: [String],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
chatMessageSchema.index({ conversationId: 1, timestamp: -1 });
chatMessageSchema.index({ senderId: 1, timestamp: -1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
