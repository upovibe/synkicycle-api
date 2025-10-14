import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  conversationId: string;
  userId: string;
  title?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  messageCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    lastMessage: {
      type: String,
      maxlength: [200, 'Last message preview cannot exceed 200 characters'],
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
conversationSchema.index({ userId: 1, lastMessageAt: -1 });
conversationSchema.index({ conversationId: 1 });

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
