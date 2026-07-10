import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    
    // Interview Details
    type: {
        type: String,
        enum: ['phone', 'video', 'in-person', 'technical', 'hr', 'final'],
        required: true
    },
    round: {
        type: Number,
        default: 1
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    
    // Scheduling
    scheduledDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        default: 60
    },
    timeZone: {
        type: String,
        default: 'UTC'
    },
    
    // Meeting Details
    meetingLink: {
        type: String,
        default: ''
    },
    meetingId: {
        type: String,
        default: ''
    },
    meetingPassword: {
        type: String,
        default: ''
    },
    location: {
        address: String,
        city: String,
        state: String,
        country: String,
        instructions: String
    },
    
    // Status
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rescheduled', 'no-show'],
        default: 'scheduled'
    },
    
    // Participants
    interviewers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: String,
        email: String,
        role: String,
        confirmed: {
            type: Boolean,
            default: false
        }
    }],
    
    // Confirmation
    candidateConfirmed: {
        type: Boolean,
        default: false
    },
    candidateConfirmedAt: {
        type: Date
    },
    
    // Preparation
    preparationInstructions: {
        type: String,
        default: ''
    },
    requiredDocuments: [String],
    technicalRequirements: [String],
    
    // Feedback and Results
    feedback: {
        overall: {
            rating: { type: Number, min: 1, max: 5 },
            comments: String,
            recommendation: {
                type: String,
                enum: ['hire', 'no-hire', 'maybe', 'next-round']
            }
        },
        technical: {
            rating: { type: Number, min: 1, max: 5 },
            comments: String,
            skills: [{
                skill: String,
                rating: { type: Number, min: 1, max: 5 },
                comments: String
            }]
        },
        communication: {
            rating: { type: Number, min: 1, max: 5 },
            comments: String
        },
        cultural: {
            rating: { type: Number, min: 1, max: 5 },
            comments: String
        },
        questions: [{
            question: String,
            answer: String,
            rating: { type: Number, min: 1, max: 5 }
        }],
        strengths: [String],
        concerns: [String],
        nextSteps: String
    },
    
    // Candidate Feedback
    candidateFeedback: {
        rating: { type: Number, min: 1, max: 5 },
        experience: String,
        interviewerRating: { type: Number, min: 1, max: 5 },
        processRating: { type: Number, min: 1, max: 5 },
        suggestions: String,
        wouldRecommendCompany: Boolean
    },
    
    // Notifications and Reminders
    reminders: [{
        type: {
            type: String,
            enum: ['24h', '1h', '15min']
        },
        sent: {
            type: Boolean,
            default: false
        },
        sentAt: Date
    }],
    
    // Additional Data
    notes: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: String,
        createdAt: {
            type: Date,
            default: Date.now
        },
        private: {
            type: Boolean,
            default: false
        }
    }],
    
    // Recording and Documents
    recordingUrl: String,
    documents: [{
        name: String,
        url: String,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Cancellation/Rescheduling
    cancellationReason: String,
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cancelledAt: Date,
    
    rescheduledFrom: Date,
    rescheduledReason: String,
    rescheduledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
}, { timestamps: true });

// Indexes for better performance
interviewSchema.index({ candidate: 1, status: 1 });
interviewSchema.index({ recruiter: 1, status: 1 });
interviewSchema.index({ scheduledDate: 1 });
interviewSchema.index({ company: 1, status: 1 });

export const Interview = mongoose.model("Interview", interviewSchema);