import { Conversation } from '../models/conversation.model.js';
import { Job } from '../models/job.model.js';
import { User } from '../models/user.model.js';

/**
 * Advanced Chatbot Training System
 * Learns from user interactions and improves responses
 */
class ChatbotTrainingService {
    constructor() {
        this.knowledgeBase = {
            jobSearchPatterns: new Map(),
            userIntents: new Map(),
            successfulResponses: new Map(),
            improvementSuggestions: new Map()
        };
        
        this.initializeTrainingData();
    }

    /**
     * Initialize training data from existing conversations
     */
    async initializeTrainingData() {
        try {
            // Load successful conversations (high ratings)
            const goodConversations = await Conversation.find({
                averageRating: { $gte: 4 }
            }).limit(1000);

            // Analyze patterns in successful interactions
            goodConversations.forEach(conv => {
                this.analyzeConversationPatterns(conv);
            });

            console.log('✅ Chatbot training data initialized');
        } catch (error) {
            console.error('❌ Training data initialization failed:', error);
        }
    }

    /**
     * Analyze conversation patterns to improve responses
     */
    analyzeConversationPatterns(conversation) {
        conversation.messages.forEach((msg, index) => {
            if (msg.role === 'user') {
                const nextMsg = conversation.messages[index + 1];
                if (nextMsg && nextMsg.role === 'assistant' && nextMsg.feedback.helpful === true) {
                    // Store successful response patterns
                    const intent = this.extractIntent(msg.content);
                    if (!this.knowledgeBase.successfulResponses.has(intent)) {
                        this.knowledgeBase.successfulResponses.set(intent, []);
                    }
                    this.knowledgeBase.successfulResponses.get(intent).push({
                        userQuery: msg.content,
                        response: nextMsg.content,
                        userRole: conversation.userRole,
                        rating: nextMsg.feedback.rating || 5
                    });
                }
            }
        });
    }

    /**
     * Extract user intent from message
     */
    extractIntent(message) {
        const lowerMsg = message.toLowerCase();
        
        // Job search intents
        if (lowerMsg.includes('find job') || lowerMsg.includes('search job')) return 'job-search';
        if (lowerMsg.includes('apply') || lowerMsg.includes('application')) return 'job-application';
        if (lowerMsg.includes('profile') || lowerMsg.includes('resume')) return 'profile-optimization';
        if (lowerMsg.includes('interview')) return 'interview-preparation';
        if (lowerMsg.includes('salary') || lowerMsg.includes('negotiate')) return 'salary-negotiation';
        if (lowerMsg.includes('career') || lowerMsg.includes('growth')) return 'career-development';
        if (lowerMsg.includes('skill') || lowerMsg.includes('learn')) return 'skill-development';
        
        // Recruiter intents
        if (lowerMsg.includes('post job') || lowerMsg.includes('hire')) return 'job-posting';
        if (lowerMsg.includes('candidate') || lowerMsg.includes('recruit')) return 'candidate-management';
        if (lowerMsg.includes('company') || lowerMsg.includes('employer')) return 'company-profile';
        
        return 'general-inquiry';
    }

    /**
     * Get personalized response suggestions based on user data
     */
    async getPersonalizedSuggestions(userId, userRole) {
        try {
            const user = await User.findById(userId).populate('profile');
            const suggestions = [];

            if (userRole === 'student') {
                // Analyze user profile completeness
                const profileScore = this.calculateProfileCompleteness(user);
                
                if (profileScore < 70) {
                    suggestions.push({
                        type: 'profile-improvement',
                        priority: 'high',
                        message: `Your profile is ${profileScore}% complete. Completing it can increase job opportunities by 40%!`,
                        action: 'Complete your profile',
                        link: '/profile'
                    });
                }

                // Get job recommendations based on skills
                if (user.profile?.skills?.length > 0) {
                    const jobCount = await Job.countDocuments({
                        requirements: { $in: user.profile.skills }
                    });
                    
                    if (jobCount > 0) {
                        suggestions.push({
                            type: 'job-recommendation',
                            priority: 'medium',
                            message: `Found ${jobCount} jobs matching your skills!`,
                            action: 'View matching jobs',
                            link: '/jobs'
                        });
                    }
                }
            } else if (userRole === 'recruiter') {
                // Get recruitment insights
                const recentJobs = await Job.countDocuments({
                    created_by: userId,
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                });

                suggestions.push({
                    type: 'recruitment-insights',
                    priority: 'medium',
                    message: `You've posted ${recentJobs} jobs this month. Need help optimizing job descriptions?`,
                    action: 'Get recruitment tips'
                });
            }

            return suggestions;
        } catch (error) {
            console.error('Error getting personalized suggestions:', error);
            return [];
        }
    }

    /**
     * Calculate profile completeness score
     */
    calculateProfileCompleteness(user) {
        let score = 0;
        const maxScore = 100;

        if (user.fullname) score += 10;
        if (user.email) score += 10;
        if (user.phoneNumber) score += 10;
        if (user.profile?.bio && user.profile.bio.length > 50) score += 15;
        if (user.profile?.skills && user.profile.skills.length >= 5) score += 15;
        if (user.profile?.resume) score += 20;
        if (user.profile?.profilePhoto) score += 10;
        if (user.profile?.company) score += 10;

        return Math.round((score / maxScore) * 100);
    }

    /**
     * Learn from user feedback
     */
    async processFeedback(conversationId, messageId, feedback) {
        try {
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) return;

            const message = conversation.messages.id(messageId);
            if (!message) return;

            message.feedback = {
                ...message.feedback,
                ...feedback,
                timestamp: new Date()
            };

            await conversation.save();

            // Update knowledge base based on feedback
            if (feedback.helpful === false) {
                this.storeImprovementOpportunity(message, feedback);
            }

            console.log(`Feedback processed: ${feedback.helpful ? 'Positive' : 'Negative'} for message ${messageId}`);
        } catch (error) {
            console.error('Error processing feedback:', error);
        }
    }

    /**
     * Store improvement opportunities
     */
    storeImprovementOpportunity(message, feedback) {
        const intent = this.extractIntent(message.content);
        
        if (!this.knowledgeBase.improvementSuggestions.has(intent)) {
            this.knowledgeBase.improvementSuggestions.set(intent, []);
        }
        
        this.knowledgeBase.improvementSuggestions.get(intent).push({
            originalQuery: message.content,
            response: message.content,
            feedback: feedback,
            timestamp: new Date()
        });
    }

    /**
     * Get enhanced context for AI responses
     */
    async getEnhancedContext(userId, userRole, currentMessage) {
        const suggestions = await this.getPersonalizedSuggestions(userId, userRole);
        const intent = this.extractIntent(currentMessage);
        
        // Get similar successful responses
        const similarResponses = this.knowledgeBase.successfulResponses.get(intent) || [];
        
        return {
            userSuggestions: suggestions,
            similarSuccessfulResponses: similarResponses.slice(0, 3),
            intent: intent,
            contextualInfo: await this.getContextualInfo(userId, userRole)
        };
    }

    /**
     * Get contextual information about the user
     */
    async getContextualInfo(userId, userRole) {
        try {
            if (userRole === 'student') {
                const user = await User.findById(userId).populate('profile');
                const appliedJobsCount = await Job.countDocuments({
                    applications: userId
                });

                return {
                    profileCompleteness: this.calculateProfileCompleteness(user),
                    appliedJobs: appliedJobsCount,
                    skills: user.profile?.skills || [],
                    hasResume: !!user.profile?.resume
                };
            } else if (userRole === 'recruiter') {
                const postedJobs = await Job.countDocuments({ created_by: userId });
                return {
                    postedJobs: postedJobs,
                    recentActivity: 'active' // Could be expanded
                };
            }
            
            return {};
        } catch (error) {
            console.error('Error getting contextual info:', error);
            return {};
        }
    }

    /**
     * Get training analytics
     */
    async getTrainingAnalytics() {
        try {
            const totalConversations = await Conversation.countDocuments();
            const highRatedConversations = await Conversation.countDocuments({
                averageRating: { $gte: 4 }
            });
            
            const commonIntents = await Conversation.aggregate([
                { $unwind: '$tags' },
                { $group: { _id: '$tags', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);

            return {
                totalConversations,
                satisfactionRate: totalConversations > 0 ? (highRatedConversations / totalConversations) * 100 : 0,
                commonIntents: commonIntents.map(item => ({ intent: item._id, count: item.count })),
                knowledgeBaseSize: {
                    successfulResponses: this.knowledgeBase.successfulResponses.size,
                    improvementOpportunities: this.knowledgeBase.improvementSuggestions.size
                }
            };
        } catch (error) {
            console.error('Error getting training analytics:', error);
            return null;
        }
    }
}

export default new ChatbotTrainingService();