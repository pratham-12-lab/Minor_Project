import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true }, // e.g., 'Frontend', 'Backend', 'DevOps'
    demand: { type: Number, default: 0 }, // 0-100 scale
    trend: { type: Number, default: 0 }, // -1 (decreasing), 0 (stable), 1 (increasing)
    alternatives: [{ type: String }],
    lastUpdated: { type: Date, default: Date.now }
});

const careerPathSchema = new mongoose.Schema({
    title: { type: String, required: true },
    level: { type: String, enum: ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'], required: true },
    requiredSkills: [{
        skill: { type: String, required: true },
        importance: { type: Number, min: 1, max: 5, required: true },
        isCore: { type: Boolean, default: false }
    }],
    nextSteps: [{
        title: String,
        level: String,
        probability: { type: Number, min: 0, max: 1 }
    }],
    averageSalary: {
        min: Number,
        max: Number,
        currency: { type: String, default: 'USD' }
    },
    industry: { type: String, required: true },
    description: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes for faster queries
careerPathSchema.index({ title: 1, level: 1 }, { unique: true });
careerPathSchema.index({ 'requiredSkills.skill': 1 });
careerPathSchema.index({ industry: 1 });

// Pre-save hook to update timestamps
careerPathSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

export const Skill = mongoose.model('Skill', skillSchema);
export const CareerPath = mongoose.model('CareerPath', careerPathSchema);
