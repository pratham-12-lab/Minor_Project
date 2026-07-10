import mongoose from "mongoose";

const profileViewSchema = new mongoose.Schema({
    viewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    viewedProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // View Details
    viewType: {
        type: String,
        enum: ['profile', 'resume', 'application', 'search-result'],
        default: 'profile'
    },
    
    // Context of the view
    context: {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job'
        },
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application'
        },
        searchQuery: String,
        source: {
            type: String,
            enum: ['job-application', 'candidate-search', 'profile-link', 'recommendation'],
            default: 'profile-link'
        }
    },
    
    // Tracking
    ipAddress: String,
    userAgent: String,
    sessionId: String,
    
    // Engagement
    timeSpent: {
        type: Number, // in seconds
        default: 0
    },
    actionsPerformed: [{
        action: {
            type: String,
            enum: ['view-resume', 'view-experience', 'view-projects', 'download-resume', 'contact', 'save-candidate']
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Interest Level (calculated based on actions)
    interestLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },
    
    // Analytics
    isUnique: {
        type: Boolean,
        default: true
    },
    viewCount: {
        type: Number,
        default: 1
    },
    
}, { timestamps: true });

// Compound index to prevent duplicate views in short time
profileViewSchema.index({ 
    viewer: 1, 
    viewedProfile: 1, 
    createdAt: 1 
});

// Index for analytics
profileViewSchema.index({ viewedProfile: 1, createdAt: -1 });
profileViewSchema.index({ viewer: 1, createdAt: -1 });

export const ProfileView = mongoose.model("ProfileView", profileViewSchema);