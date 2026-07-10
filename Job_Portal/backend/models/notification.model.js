/**
 * Notification Model
 * Stores user notifications
 */

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['APPLICATION', 'MESSAGE', 'INTERVIEW', 'JOB', 'PROFILE', 'ADMIN', 'OFFER', 'RECOMMENDATION'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    actionUrl: {
      type: String,
      description: 'URL to navigate to when notification is clicked',
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      description: 'ID of related object (job, application, etc.)',
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
      // Auto-delete after 30 days
      expires: 2592000,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for querying user notifications
notificationSchema.index({ userId: 1, createdAt: -1 });

// Create index for unread notifications
notificationSchema.index({ userId: 1, read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
