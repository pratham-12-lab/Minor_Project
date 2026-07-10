import express from 'express';
import { 
  sendMessage as ruleBasedChat, 
  processFeedback, 
  getConversationHistory, 
  getChatbotAnalytics,
  getChatbotConfig 
} from '../controllers/chatbot.controller.js';
import { Job } from '../models/job.model.js';
import { Application } from '../models/application.model.js';
import { User } from '../models/user.model.js';
import { Chat } from '../models/chat.model.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { chatbotLimiter } from '../middlewares/rateLimiter.js';
import chatCache from '../utils/chatCache.js';
import isAdmin from '../middlewares/isAdmin.js';

const router = express.Router();

// Helper function to extract location from message
const extractLocation = (message) => {
  const locationPatterns = [
    /(?:jobs?|positions?|opportunities?|openings?)\s+(?:in|near|at|around)\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|,|\.|\?)/i,
    /(?:in|near|at|around)\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|,|\.|\?)/i,
    /(?:show|find|search|get|list)\s+(?:me\s+)?(?:jobs?|positions?)\s+(?:in|near|at|around)\s+([A-Z][a-zA-Z\s]+?)(?:\s|$|,|\.|\?)/i,
  ];
  
  for (const pattern of locationPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Check for common city names
  const commonCities = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'pune', 'kolkata', 'ahmedabad', 'jaipur', 'surat'];
  const lowerMessage = message.toLowerCase();
  for (const city of commonCities) {
    if (lowerMessage.includes(city)) {
      return city.charAt(0).toUpperCase() + city.slice(1);
    }
  }
  
  return null;
};

const extractSalary = (message) => {
    const salaryPatterns = [
      /(?:salary|pay|compensation)\s+(?:of|over|above|more than|greater than|>)\s*(\d{1,2}(?:\.\d{1,2})?)\s*(?:lakhs?|lpa)/i,
      /(\d{1,2}(?:\.\d{1,2})?)\s*lpa/i,
      /over\s*(\d{1,2}(?:\.\d{1,2})?)\s*lakhs?/i,
    ];
  
    for (const pattern of salaryPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return parseFloat(match[1]); // Return salary in Lakhs
      }
    }
  
    return null;
  };
  const extractJobTitle = (message) => {
    const jobTitlePatterns = [
      // For skill gap queries: "skill gap for data administrator"
      /(?:skill gap for|missing skills for)\s+([a-zA-Z\s\/]+)/i,
      
      // For job search queries: "find software engineer jobs"
      /(?:find|show me|search for)\s+([a-zA-Z\s\/]+?)\s+jobs/i,
      
      // For simple job title mentions: "software engineer jobs"
      /([a-zA-Z\s\/]+?)\s+jobs/i
    ];
  
    for (const pattern of jobTitlePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        // Avoid matching generic words
        const title = match[1].trim();
        if (['a', 'an', 'the', 'any'].includes(title.toLowerCase())) continue;
        return title;
      }
    }
  
    return null;
  };

  const extractCompany = (message) => {
    const companyPatterns = [
        /(?:status of|application for|my)\s+([A-Z][a-zA-Z]+)/i,
    ];

    for (const pattern of companyPatterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }

    return null;
};

// Helper function to fetch jobs by multiple criteria
const fetchJobsByCriteria = async (criteria, limit = 5) => {
    try {
        const query = {};
        if (criteria.title) {
            query.title = { $regex: criteria.title, $options: 'i' };
        }
        if (criteria.location) {
            query.location = { $regex: criteria.location, $options: 'i' };
        }
        if (criteria.salary) {
            // Assuming salary is stored in LPA (Lakhs Per Annum)
            query.salary = { $gte: criteria.salary };
        }

      const jobs = await Job.find(query)
        .populate('company')
        .sort({ createdAt: -1 })
        .limit(limit);
      
      return jobs.map(job => ({
        _id: job._id,
        title: job.title || 'No title',
        description: job.description ? (job.description.length > 150 ? job.description.substring(0, 150) + '...' : job.description) : 'No description available',
        location: job.location || 'Not specified',
        salary: job.salary || 0,
        jobType: job.jobType || 'Not specified',
        experienceLevel: job.experienceLevel || 0,
        position: job.position || 1,
        company: {
          _id: job.company?._id || null,
          name: job.company?.name || 'Unknown Company',
          logo: job.company?.logo || null
        },
        createdAt: job.createdAt || new Date()
      }));
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  };

const getUserContext = async (userId, fetchAll = false) => {
  try {
    const user = await User.findById(userId)
      .select('fullname role profile verificationStatus rejectionReason')
      .lean();

    const query = Application.find({ applicant: userId })
      .sort({ updatedAt: -1 })
      .populate({
        path: 'job',
        select: 'title location jobType salary experienceLevel requirements company',
        populate: { path: 'company', select: 'name logo' }
      });

    const applications = await (fetchAll ? query.lean() : query.limit(5).lean());

    return { user, applications };
  } catch (error) {
    console.error('Error fetching user context:', error);
    return { user: null, applications: [] };
  }
};
// OpenAI-only chatbot test endpoint
router.get('/test', (req, res) => {
  const isConfigured = !!process.env.OPENAI_API_KEY;
  
  res.json({ 
    success: true, 
    message: isConfigured ? 'OpenAI chatbot is configured and ready!' : 'OpenAI chatbot is NOT configured',
    configured: isConfigured,
    provider: 'OpenAI',
    isOpenRouter: process.env.OPENAI_API_KEY?.startsWith('sk-or-'),
    timestamp: new Date()
  });
});

// Main chat endpoint using enhanced OpenAI-only controller
router.post('/chat', chatbotLimiter, async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required and must be a string' 
      });
    }

    // Add user info for authenticated users, allow anonymous access
    req.body.userId = req.id || null;
    req.body.userRole = req.user?.role || 'guest';
    req.body.sessionId = req.body.sessionId || `guest_${Date.now()}`;

    // Use the enhanced OpenAI-only controller
    return await ruleBasedChat(req, res);
    
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Chatbot service temporarily unavailable'
    });
  }
});

// Enhanced chatbot message endpoint (requires authentication)
router.post('/message', isAuthenticated, chatbotLimiter, async (req, res) => {
    try {
        // Add user info from authentication middleware
        req.body.userId = req.id;
        req.body.userRole = req.user?.role || 'student';
        
        // Use the enhanced controller
        return await ruleBasedChat(req, res);
    } catch (error) {
        console.error('Enhanced chatbot error:', error);
        res.status(500).json({
            success: false,
            message: 'Chatbot service error'
        });
    }
});

// Process user feedback (requires authentication)
router.post('/feedback', isAuthenticated, processFeedback);
// Get conversation history (requires authentication)
router.get('/conversation/:userId/:sessionId', isAuthenticated, getConversationHistory);

// Get chatbot analytics (admin only)
router.get('/analytics', isAuthenticated, isAdmin, getChatbotAnalytics);

// Get chatbot configuration
router.get('/config', getChatbotConfig);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    provider: 'OpenAI-only',
    timestamp: new Date()
  });
});

export default router;