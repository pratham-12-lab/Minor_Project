/**
 * Message Model
 * Stores chat messages
 */

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
      description: 'Chat room ID (usually user1-user2 or group ID)',
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      description: 'For 1-to-1 chats, null for group chats',
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'emoji', 'link'],
      default: 'text',
    },
    attachments: [
      {
        type: String,
        url: String,
        name: String,
        size: Number,
        mimetype: String,
      },
    ],
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      index: true,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
    reactions: [
      {
        emoji: String,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    repliedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for searching
messageSchema.index({ content: 'text' });

// Create compound index for room queries
messageSchema.index({ roomId: 1, timestamp: -1 });

// Create index for unread messages
messageSchema.index({ recipientId: 1, read: 1 });

// Populate references
messageSchema.pre(/^find/, function (next) {
  this.populate('senderId', 'userName userRole profilePicture');
  next();
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
