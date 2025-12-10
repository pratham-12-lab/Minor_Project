import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  reply: { type: String, required: true },
  mode: { type: String, enum: ['rule-based','ai-powered','rule-based-fallback','ai-fallback','cached'], default: 'rule-based' },
  jobs: [{ type: mongoose.Schema.Types.Mixed }],
  flagged: { type: Boolean, default: false },
  flagReason: { type: String, default: '' },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

export const Chat = mongoose.model('Chat', ChatSchema);
