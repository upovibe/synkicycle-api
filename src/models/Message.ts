import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IMessage extends Document {
  uuid: string;
  connectionId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  status: 'sent' | 'delivered' | 'read';
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    connectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Connection',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
      required: true,
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
      required: true,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
messageSchema.index({ connectionId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ receiverId: 1 });
messageSchema.index({ status: 1 });

// Update readAt when status changes to 'read'
messageSchema.pre('save', function(this: IMessage, next) {
  if (this.isModified('status') && this.status === 'read' && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

export const Message = mongoose.model<IMessage>('Message', messageSchema);
