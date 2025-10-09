import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IConnection extends Document {
  uuid: string;
  participants: mongoose.Types.ObjectId[];
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  initiator: mongoose.Types.ObjectId;
  initialMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
}

const connectionSchema = new Schema<IConnection>(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    participants: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'blocked'],
      default: 'pending',
      required: true,
    },
    initiator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    initialMessage: {
      type: String,
      maxlength: 500,
    },
    lastMessageAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure participants array is sorted for consistent querying
connectionSchema.pre('save', function(this: IConnection, next) {
  if (this.participants && this.participants.length === 2) {
    this.participants.sort();
  }
  next();
});

// Index for efficient queries
connectionSchema.index({ participants: 1 });
connectionSchema.index({ initiator: 1 });
connectionSchema.index({ status: 1 });
connectionSchema.index({ lastMessageAt: -1 });

// Virtual for getting the other participant
connectionSchema.virtual('otherParticipant').get(function() {
  return this.participants.find((p: mongoose.Types.ObjectId) => p.toString() !== this.initiator.toString());
});

// Ensure virtuals are included in JSON output
connectionSchema.set('toJSON', { virtuals: true });

export const Connection = mongoose.model<IConnection>('Connection', connectionSchema);
