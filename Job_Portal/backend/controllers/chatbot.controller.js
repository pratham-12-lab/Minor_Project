import OpenAI from "openai";
import { Conversation } from '../models/conversation.model.js';
import chatbotTraining from '../services/chatbotTraining.js';

// Initialize OpenAI only (remove Gemini dependency)
// Check if it's an OpenRouter API key (starts with sk-or-)
const isOpenRouter = process.env.OPENAI_API_KEY?.startsWith('sk-or-');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    ...(isOpenRouter && { baseURL: "https://openrouter.ai/api/v1" })
});

// Force OpenAI provider only
const AI_PROVIDER = 'openai';

// Enhanced Job Portal Chatbot with OpenAI Only
export const sendMessage = async (req, res) => {
    try {
        const { message, userId, userRole, sessionId = generateSessionId() } = req.body;

        let conversation = null;
        
        // Only create/track conversations for authenticated users
        if (userId) {
            // Get or create conversation
            conversation = await Conversation.findOne({ userId, sessionId });
            if (!conversation) {
                conversation = new Conversation({
                    userId,
                    userRole: userRole || 'student',
                    sessionId,
                    messages: []
                });
            }

            // Add user message to conversation
            conversation.messages.push({
                role: 'user',
                content: message,
                timestamp: new Date()
            });
        }

        // Get enhanced context from training system (only for authenticated users)
        const enhancedContext = userId ? 
            await chatbotTraining.getEnhancedContext(userId, userRole, message) :
            { intent: 'general-inquiry', userSuggestions: [], contextualInfo: null };

        const userMessage = message.toLowerCase().trim();

        // Enhanced intent detection with better accuracy
        const detectedIntent = detectIntent(userMessage, userRole, enhancedContext);
        
        // Check if this is a simple query that can be handled by rules
        const simpleResponse = getSimpleResponse(userMessage, userRole, enhancedContext, detectedIntent);
        
        let reply, source;
        
        if (simpleResponse) {
            reply = simpleResponse;
            source = 'rule-based';
        } else {
            // Use OpenAI only with enhanced context and better prompting
            try {
                const conversationHistory = conversation ? conversation.messages : [];
                reply = await generateOpenAIResponse(message, userRole || 'guest', conversationHistory, enhancedContext, detectedIntent);
                source = 'ai-powered';
            } catch (aiError) {
                console.error('OpenAI generation error:', aiError);
                reply = getEnhancedResponse(userMessage, userRole || 'guest', enhancedContext, detectedIntent);
                source = 'enhanced-rules';
            }
        }

        let assistantMessage = null;
        
        // Only save to conversation if user is authenticated
        if (conversation) {
            // Add assistant response to conversation
            assistantMessage = {
                role: 'assistant',
                content: reply,
                timestamp: new Date(),
                source: source,
                intent: detectedIntent.primary
            };
            conversation.messages.push(assistantMessage);

            // Auto-tag conversation based on detected intent
            if (!conversation.tags.includes(detectedIntent.primary)) {
                conversation.tags.push(detectedIntent.primary);
            }

            await conversation.save();
        }

        res.status(200).json({
            success: true,
            reply: reply,
            source: source,
            intent: detectedIntent.primary,
            confidence: detectedIntent.confidence,
            conversationId: conversation ? conversation._id : null,
            messageId: assistantMessage ? assistantMessage._id : null,
            suggestions: enhancedContext.userSuggestions?.map(s => s.message || s) || [],
            contextualInfo: enhancedContext.contextualInfo
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process message',
            error: error.message
        });
    }
};

// Enhanced intent detection function
function detectIntent(message, userRole, enhancedContext) {
    const msg = message.toLowerCase();
    
    // Job search intents with higher accuracy
    if (msg.match(/\b(find|search|look|looking for|need|want)\b.*(job|position|role|work|career|opportunity)/)) {
        return { primary: 'job-search', confidence: 0.9 };
    }
    
    // Application related intents
    if (msg.match(/\b(application|apply|applied|status)\b/)) {
        return { primary: 'application-status', confidence: 0.9 };
    }
    
    // Profile and resume optimization
    if (msg.match(/\b(profile|resume|cv)\b.*(improve|optimize|enhance|update|complete)/)) {
        return { primary: 'profile-optimization', confidence: 0.9 };
    }
    
    // Interview preparation
    if (msg.match(/\b(interview|preparation|prepare|mock|practice)\b/)) {
        return { primary: 'interview-preparation', confidence: 0.8 };
    }
    
    // Salary negotiation
    if (msg.match(/\b(salary|negotiate|negotiation|pay|compensation|raise)\b/)) {
        return { primary: 'salary-negotiation', confidence: 0.8 };
    }
    
    // Career development
    if (msg.match(/\b(career|growth|development|path|advance|promotion)\b/)) {
        return { primary: 'career-development', confidence: 0.8 };
    }
    
    // Skills and learning
    if (msg.match(/\b(skill|skills|learn|learning|course|training|upskill)\b/)) {
        return { primary: 'skill-development', confidence: 0.8 };
    }
    
    // Company research
    if (msg.match(/\b(company|employer|organization|workplace)\b.*(research|info|about|culture)/)) {
        return { primary: 'company-research', confidence: 0.7 };
    }
    
    // Networking
    if (msg.match(/\b(network|networking|connect|connection|linkedin)\b/)) {
        return { primary: 'networking', confidence: 0.7 };
    }
    
    // Recruiter specific intents
    if (userRole === 'recruiter') {
        if (msg.match(/\b(post|create|add)\b.*(job|position|role)/)) {
            return { primary: 'job-posting', confidence: 0.9 };
        }
        if (msg.match(/\b(candidate|applicant|hire|hiring)\b/)) {
            return { primary: 'candidate-management', confidence: 0.8 };
        }
        if (msg.match(/\b(recruit|recruitment|sourcing|talent)\b/)) {
            return { primary: 'recruitment-strategy', confidence: 0.8 };
        }
    }
    
    // Greeting detection
    if (msg.match(/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)$/)) {
        return { primary: 'greeting', confidence: 1.0 };
    }
    
    // Help request
    if (msg.match(/\b(help|assist|support|guidance)\b/) && msg.length < 20) {
        return { primary: 'help-request', confidence: 0.9 };
    }
    
    return { primary: 'general-inquiry', confidence: 0.5 };
}

// Generate AI response with OpenAI only
async function generateOpenAIResponse(message, userRole, conversationHistory, enhancedContext, detectedIntent) {
    const intentPrimary = detectedIntent?.primary || 'general-inquiry';
    const intentConfidence = detectedIntent?.confidence || 0.5;
    
    const systemPrompt = `
You are an intelligent AI career assistant for JobPortal, specialized in providing accurate, actionable career advice.

USER CONTEXT:
- Role: ${userRole}
- Detected Intent: ${intentPrimary} (confidence: ${intentConfidence})
- Intent Category: ${getIntentCategory(intentPrimary)}
${enhancedContext?.contextualInfo ? `- Profile Status: ${JSON.stringify(enhancedContext.contextualInfo)}` : ''}

PERSONALIZED SUGGESTIONS:
${enhancedContext?.userSuggestions?.map(s => `- ${s.message || s}`).join('\n') || 'None available'}

RESPONSE GUIDELINES:
- Provide specific, actionable advice based on the detected intent
- Use data-driven insights when possible
- Reference user's context and profile information
- Be encouraging yet realistic
- Keep responses conversational but professional
- Use relevant emojis sparingly and appropriately
- Always end with a follow-up question or next step

INTENT-SPECIFIC INSTRUCTIONS:
${getIntentInstructions(intentPrimary, userRole)}

Current User Message: ${message}`;

    // Build conversation messages for OpenAI format
    const messages = [
        { role: 'system', content: systemPrompt }
    ];

    // Add conversation history (last 8 messages for better context)
    conversationHistory.slice(-8).forEach(msg => {
        messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
        });
    });

    // Add current message
    messages.push({ role: 'user', content: message });

    // Use appropriate model based on provider
    const model = isOpenRouter ? "openai/gpt-3.5-turbo" : "gpt-3.5-turbo";

    const completion = await openai.chat.completions.create({
        model: model,
        messages: messages,
        max_tokens: 600,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
    });

    return completion.choices[0].message.content;
}

// Get intent-specific instructions for better response accuracy
function getIntentInstructions(intent, userRole) {
    const instructions = {
        'job-search': `
- Ask about specific job titles, locations, and requirements
- Suggest relevant job search strategies
- Offer tips for standing out in applications
- Recommend networking approaches`,
        
        'application-status': `
- Help track and understand application status
- Suggest follow-up strategies
- Provide tips for improving future applications
- Offer encouragement and next steps`,
        
        'profile-optimization': `
- Focus on specific profile improvement areas
- Suggest keyword optimization for their field
- Recommend sections to strengthen
- Provide examples of effective profile elements`,
        
        'interview-preparation': `
- Offer specific interview preparation strategies
- Suggest common questions for their field
- Recommend research areas about the company
- Provide confidence-building tips`,
        
        'salary-negotiation': `
- Provide market research suggestions
- Offer negotiation strategies and timing
- Suggest ways to demonstrate value
- Include scripts for difficult conversations`,
        
        'skill-development': `
- Recommend specific courses and resources
- Suggest skill prioritization based on career goals
- Provide learning path recommendations
- Offer ways to practice and demonstrate new skills`,
        
        'career-development': `
- Help identify career advancement opportunities
- Suggest professional development activities
- Recommend mentorship approaches
- Provide goal-setting frameworks`,
        
        'job-posting': userRole === 'recruiter' ? `
- Help create compelling job descriptions
- Suggest effective requirements and qualifications
- Recommend posting strategies and platforms
- Provide tips for attracting top candidates` : '',
        
        'candidate-management': userRole === 'recruiter' ? `
- Offer candidate evaluation strategies
- Suggest effective screening processes
- Recommend interview techniques
- Provide tips for candidate experience` : '',
    };
    
    return instructions[intent] || 'Provide helpful, accurate information relevant to their career goals.';
}

// Categorize intents for better processing
function getIntentCategory(intent) {
    const categories = {
        'job-search': 'Job Discovery',
        'application-status': 'Application Management',
        'profile-optimization': 'Profile Enhancement',
        'interview-preparation': 'Interview Success',
        'salary-negotiation': 'Compensation',
        'skill-development': 'Learning & Growth',
        'career-development': 'Career Advancement',
        'company-research': 'Market Intelligence',
        'networking': 'Professional Relationships',
        'job-posting': 'Talent Acquisition',
        'candidate-management': 'Recruiting',
        'recruitment-strategy': 'Hiring Strategy'
    };
    
    return categories[intent] || 'General Career Support';
}

// Generate session ID
function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Simple rule-based responses for common queries with better accuracy
function getSimpleResponse(userMessage, userRole, context, detectedIntent) {
    const { primary: intent, confidence } = detectedIntent;
    
    // High confidence greeting responses
    if (intent === 'greeting' && confidence > 0.9) {
        const personalizedGreeting = context.contextualInfo?.profileCompleteness < 70 ? 
            `\n\n💡 **Quick Tip**: Your profile is ${context.contextualInfo.profileCompleteness}% complete. Boost it to increase job opportunities!` : '';
            
        const timeBasedGreeting = getTimeBasedGreeting();
        
        return `${timeBasedGreeting} Welcome back to JobPortal! I'm your AI career assistant. 🚀

${userRole === 'recruiter' ? `
🏢 **Recruiter Dashboard:**
• Post and manage job listings
• Review candidate applications  
• Find qualified talent
• Get recruitment insights
• Access candidate analytics` : `
🎯 **Your Career Hub:**
• Find your dream job (${context.contextualInfo?.appliedJobs || 0} applications so far)
• Optimize your profile
• Track application status
• Get interview prep help
• Discover skill development opportunities`}${personalizedGreeting}

What specific career challenge can I help you tackle today?`;
    }

    // High confidence help requests with personalized context
    if (intent === 'help-request' && confidence > 0.8) {
        const contextualHelp = context.userSuggestions?.length > 0 ? 
            `\n\n🎯 **Personalized for you:**\n${context.userSuggestions.slice(0, 3).map(s => `• ${s.message}`).join('\n')}` : '';

        return `🤖 I'm here to provide expert guidance on your ${userRole === 'recruiter' ? 'recruitment' : 'career'} journey!

${userRole === 'recruiter' ? `
**🔥 Popular recruiter questions:**
• "How do I write compelling job descriptions?"
• "What are the best candidate sourcing strategies?"
• "How to improve my hiring process efficiency?"
• "Tips for building a strong employer brand"
• "How to screen candidates effectively?"` : `
**🔥 Popular career questions:**
• "How do I optimize my job search strategy?"
• "Help me improve my profile for better visibility"
• "What should I include in my resume for [role]?"
• "How to prepare for technical interviews?"
• "Show me my application status and feedback"
• "What skills should I learn for career growth?"`}${contextualHelp}

What specific area would you like expert advice on? I'm here to help! 💪`;
    }

    // Enhanced job search responses
    if (intent === 'job-search' && confidence > 0.7) {
        const skillBasedTip = context.contextualInfo?.skills?.length > 0 ? 
            `\n💡 **Based on your skills (${context.contextualInfo.skills.slice(0, 3).join(', ')}), I can help you find targeted opportunities that match your expertise.** ` : '';

        return `🔍 **Smart Job Search Strategy - Let's find your perfect role!**

**🎯 1. Targeted Search Approach**
• Use specific keywords from your field + location
• Set up job alerts for automatic notifications
• Focus on companies that align with your values
• Apply within 24-48 hours of job postings

**📊 2. Application Success Tips**  
• Customize each application for the specific role
• Include relevant keywords from job descriptions
• Follow up professionally after 1 week
• Track all applications for better insights${skillBasedTip}

**🚀 Ready to start?** Tell me:
• What specific role/title are you targeting?
• Preferred location or remote work?
• Any specific companies you're interested in?

I'll help you find the best opportunities! 🎯`;
    }

    return null; // Let AI handle complex queries
}

// Enhanced rule-based responses with better personalization
function getEnhancedResponse(userMessage, userRole, context, detectedIntent) {
    const personalizedTips = context.userSuggestions?.length > 0 ? 
        `\n\n🎯 **Personalized recommendations:**\n${context.userSuggestions.slice(0, 3).map(s => `• ${s.message}`).join('\n')}` : '';

    const { primary: intent } = detectedIntent;

    // Intent-specific enhanced responses
    switch (intent) {
        case 'profile-optimization':
            const profileScore = context.contextualInfo?.profileCompleteness || 0;
            return `📝 **Profile Optimization Expert Advice**

Your profile is currently **${profileScore}%** complete. Here's how to boost it:

**🚀 High-Impact Improvements:**
• **Professional Summary**: Write a compelling 3-line summary highlighting your key strengths
• **Skills Section**: Add at least 10 relevant skills with endorsements
• **Experience Details**: Use action verbs and quantify achievements (increased sales by 20%)
• **Professional Photo**: Upload a clear, professional headshot

**💼 Industry-Specific Tips:**
• Research trending keywords in your field
• Showcase projects and portfolio work
• Include relevant certifications and courses
• Add volunteer work and side projects${personalizedTips}

Want me to review a specific section of your profile for detailed feedback? 🔍`;

        case 'interview-preparation':
            return `🎯 **Interview Success Masterclass**

**📚 Pre-Interview Research (48 hours before):**
• Company mission, values, and recent news
• Role-specific requirements and challenges
• Common interview questions for your field
• Prepare your STAR method examples

**💪 Day-of Interview Strategy:**
• Practice your 60-second elevator pitch
• Prepare thoughtful questions about the role
• Dress appropriately for company culture
• Arrive 10 minutes early, bring extra copies of resume

**🔥 Expert Tips:**
• Focus on specific achievements with metrics
• Show enthusiasm for the company and role
• Ask about team dynamics and growth opportunities${personalizedTips}

Would you like me to help you prepare for a specific type of interview? 🎤`;

        case 'salary-negotiation':
            return `💰 **Salary Negotiation Mastery**

**📊 Research Phase (Before Negotiating):**
• Use Glassdoor, PayScale, and LinkedIn Salary Insights
• Research industry standards for your location
• Document your achievements and added value
• Know your minimum acceptable offer

**🎯 Negotiation Strategy:**
• Wait for the offer before discussing salary
• Express enthusiasm first, then negotiate
• Focus on total compensation package
• Practice your negotiation conversation

**💡 Pro Scripts:**
"Thank you for the offer. Based on my research and the value I'll bring, I was expecting closer to $X. Can we discuss this?"${personalizedTips}

Ready to research salary ranges for your target role? 📈`;

        default:
            return `I understand you're asking about "${userMessage}". 

${userRole === 'recruiter' ? `
**🏢 As a recruiter, I can help you with:**
🎯 Creating compelling job descriptions that attract top talent
📋 Streamlining your candidate evaluation process  
🔍 Sourcing strategies for hard-to-fill positions
📊 Improving recruitment metrics and efficiency
💡 Building a strong employer brand that candidates love` : `
**🚀 I'm here to accelerate your career:**
🔍 Job search optimization and strategy
📝 Profile and resume enhancement
📈 Career development and growth planning  
💼 Interview preparation and confidence building
🎯 Skill development recommendations
💰 Salary negotiation strategies`}${personalizedTips}

What specific career challenge can I help you solve today? Let's make progress together! 🌟`;
    }
}

// Time-based greeting function
function getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Good morning!';
    if (hour < 17) return '☀️ Good afternoon!';
    if (hour < 21) return '🌇 Good evening!';
    return '🌙 Good evening!';
}

// Feedback processing endpoint
export const processFeedback = async (req, res) => {
    try {
        const { conversationId, messageId, feedback } = req.body;

        await chatbotTraining.processFeedback(conversationId, messageId, feedback);

        res.status(200).json({
            success: true,
            message: 'Feedback processed successfully'
        });
    } catch (error) {
        console.error('Feedback processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process feedback'
        });
    }
};

// Get conversation history
export const getConversationHistory = async (req, res) => {
    try {
        const { userId, sessionId } = req.params;

        const conversation = await Conversation.findOne({ userId, sessionId })
            .select('messages sessionId lastActive totalMessages averageRating');

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        res.status(200).json({
            success: true,
            conversation: conversation
        });
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get conversation history'
        });
    }
};

// Get chatbot analytics (admin only)
export const getChatbotAnalytics = async (req, res) => {
    try {
        const analytics = await chatbotTraining.getTrainingAnalytics();

        res.status(200).json({
            success: true,
            analytics: analytics
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get analytics'
        });
    }
};

// Get chatbot configuration
export const getChatbotConfig = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            config: {
                provider: AI_PROVIDER,
                hasOpenAI: !!process.env.OPENAI_API_KEY,
                isOpenRouter: isOpenRouter,
                features: {
                    conversationHistory: true,
                    personalizedResponses: true,
                    feedbackLearning: true,
                    openRouterSupport: isOpenRouter,
                    aiPowered: true
                }
            }
        });
    } catch (error) {
        console.error('Config error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get chatbot configuration'
        });
    }
};
