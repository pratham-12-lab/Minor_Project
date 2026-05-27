import { Chat } from '../models/chat.model.js';
import mongoose from 'mongoose';

// GET /api/admin/chat-logs
export const getChatLogs = async (req, res) => {
  try {
    const { user, mode, flagged, page = 1, limit = 50, from, to } = req.query;
    const query = {};

    if (user && mongoose.Types.ObjectId.isValid(user)) query.user = user;
    if (mode) query.mode = mode;
    if (flagged === 'true') query.flagged = true;
    if (flagged === 'false') query.flagged = false;
    if (from || to) query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);

    const skip = (Math.max(parseInt(page, 10), 1) - 1) * Math.max(parseInt(limit, 10), 1);

    const [total, logs] = await Promise.all([
      Chat.countDocuments(query),
      Chat.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Math.max(parseInt(limit, 10), 1))
        .populate('user', 'fullname email role')
        .lean()
    ]);

    return res.status(200).json({ success: true, total, page: parseInt(page, 10), limit: parseInt(limit, 10), logs });
  } catch (error) {
    console.error('getChatLogs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch chat logs', error: error.message });
  }
};

// POST /api/admin/chat-logs/:id/flag
export const flagChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid chat id' });
    }

    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    chat.flagged = true;
    chat.flagReason = reason || 'Flagged by admin';
    await chat.save();

    return res.status(200).json({ success: true, message: 'Chat flagged', chat });
  } catch (error) {
    console.error('flagChat error:', error);
    return res.status(500).json({ success: false, message: 'Failed to flag chat', error: error.message });
  }
};
