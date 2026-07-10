import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userRole: {
        type: String,
        enum: ['student', 'recruiter', 'admin'],
        required: true
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        source: {
            type: String,
            enum: ['rule-based', 'ai-powered', 'enhanced-rules'],
            default: 'rule-based'
        },
        feedback: {
            helpful: { type: Boolean, default: null },
            rating: { type: Number, min: 1, max: 5, default: null },
            comment: { type: String, default: '' }
        }
    }],
    sessionId: {
        type: String,
        required: true
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    totalMessages: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    tags: [{
        type: String // e.g., 'job-search', 'profile-help', 'resume-tips'
    }],
    resolved: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Indexes for better performance
conversationSchema.index({ userId: 1, sessionId: 1 });
conversationSchema.index({ userRole: 1, lastActive: -1 });
conversationSchema.index({ tags: 1 });

// Update last active timestamp on save
conversationSchema.pre('save', function(next) {
    this.lastActive = new Date();
    this.totalMessages = this.messages.length;
    
    // Calculate average rating
    const ratedMessages = this.messages.filter(msg => msg.feedback.rating);
    if (ratedMessages.length > 0) {
        const sum = ratedMessages.reduce((acc, msg) => acc + msg.feedback.rating, 0);
        this.averageRating = sum / ratedMessages.length;
    }
    
    next();
});

export const Conversation = mongoose.model('Conversation', conversationSchema);