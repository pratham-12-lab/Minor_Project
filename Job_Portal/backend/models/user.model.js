import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['student', 'recruiter', 'admin'],
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    companyName: {
        type: String,
        default: ""
    },
    companyWebsite: {
        type: String,
        default: ""
    },
    rejectionReason: {
        type: String,
        default: ""
    },
    // ✅ NEW: Saved Jobs
    savedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }],
    
    // ✅ NEW: Saved Candidates (for recruiters)
    savedCandidates: [{
        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        notes: String,
        tags: [String],
        savedAt: {
            type: Date,
            default: Date.now
        }
    }],
    profile: {
        bio: { type: String },
        skills: [{ type: String }],
        resume: { type: String },
        resumeOriginalName: { type: String },
        company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
        profilePhoto: {
            type: String,
            default: ""
        }
    },
    // ✅ NEW: Profile Enhancements
    profileEnhancements: {
        professionalSummary: {
            summary: { type: String, default: '' },
            objectives: [{ type: String }],
            achievements: [{ type: String }]
        },
        workExperience: [{
            title: String,
            company: String,
            location: String,
            startDate: String,
            endDate: String,
            currentJob: { type: Boolean, default: false },
            employmentType: String,
            description: String,
            skills: [String]
        }],
        education: [{
            institution: String,
            degree: String,
            fieldOfStudy: String,
            startYear: String,
            endYear: String,
            currentlyStudying: { type: Boolean, default: false },
            grade: String,
            activities: String,
            description: String
        }],
        projects: [{
            title: String,
            description: String,
            technologies: [String],
            startDate: String,
            endDate: String,
            ongoing: { type: Boolean, default: false },
            liveUrl: String,
            githubUrl: String,
            imageUrl: String,
            highlights: [String]
        }],
        certifications: [{
            name: String,
            organization: String,
            issueDate: String,
            expirationDate: String,
            noExpiration: { type: Boolean, default: false },
            credentialId: String,
            credentialUrl: String,
            description: String,
            skills: [String]
        }],
        socialLinks: [{
            platform: String,
            url: String,
            username: String
        }]
    },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
