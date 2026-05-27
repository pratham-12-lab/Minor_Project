import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sendMessage as ruleBasedChat } from '../controllers/chatbot.controller.js';
import { Job } from '../models/job.model.js';
import { Application } from '../models/application.model.js';
import { User } from '../models/user.model.js';
import { Chat } from '../models/chat.model.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { chatbotLimiter } from '../middlewares/rateLimiter.js';
import chatCache from '../utils/chatCache.js';

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

  const analyzeSkillGap = async (userId, jobTitle) => {
    try {
        const user = await User.findById(userId).select('profile.skills').lean();
        const userSkills = (user?.profile?.skills || []).map(s => s.toLowerCase());

        if (!jobTitle) {
            return { error: 'Please specify a job title to analyze.' };
        }

        const job = await Job.findOne({ title: { $regex: jobTitle, $options: 'i' } })
            .select('requirements')
            .sort({ createdAt: -1 })
            .lean();

        if (!job) {
            return { error: `I couldn't find a job matching the title "${jobTitle}" to compare against.` };
        }

        const requiredSkills = (job.requirements || []).map(r => r.toLowerCase());
        const missingSkills = requiredSkills.filter(skill => !userSkills.includes(skill));

        return {
            userSkills,
            requiredSkills,
            missingSkills,
            gap: missingSkills.length,
            jobTitle: jobTitle
        };
    } catch (error) {
        console.error('Error analyzing skill gap:', error);
        return { error: 'An error occurred while analyzing the skill gap.' };
    }
};

const checkProfileCompleteness = async (userId) => {
    try {
        const user = await User.findById(userId).select('profile').lean();
        if (!user || !user.profile) {
            return { score: 0, suggestions: ['Profile not found.'] };
        }

        const { profile } = user;
        let score = 0;
        const suggestions = [];

        // 1. Bio (25%)
        if (profile.bio && profile.bio.length > 50) {
            score += 25;
        } else if (profile.bio) {
            suggestions.push('Your bio is too short. Try to elaborate more on your professional background.');
        } else {
            suggestions.push('Add a professional summary or bio.');
        }

        // 2. Skills (25%)
        if (profile.skills && profile.skills.length >= 5) {
            score += 25;
        } else if (profile.skills && profile.skills.length > 0) {
            suggestions.push(`Add more skills to your profile. You currently have ${profile.skills.length}, aim for at least 5.`);
        } else {
            suggestions.push('Add skills to your profile (e.g., Python, React, Project Management).');
        }

        // 3. Resume (25%)
        if (profile.resume) {
            score += 25;
        } else {
            suggestions.push('Upload your resume.');
        }

        // 4. Profile Photo (25%)
        if (profile.profilePhoto) {
            score += 25;
        } else {
            suggestions.push('Upload a professional profile photo.');
        }

        return { score, suggestions };
    } catch (error) {
        console.error('Error checking profile completeness:', error);
        return { score: 0, suggestions: ['An error occurred while checking your profile.'] };
    }
};

const optimizeCV = async (userId, jobTitle) => {
    try {
        const user = await User.findById(userId).select('profile.skills profile.bio').lean();
        const job = await Job.findOne({ title: { $regex: jobTitle, $options: 'i' } }).select('description requirements').sort({ createdAt: -1 }).lean();

        if (!job) {
            return { error: `I couldn't find a job matching "${jobTitle}".` };
        }

        const userSkills = (user?.profile?.skills || []).map(s => s.toLowerCase());
        const userBio = (user?.profile?.bio || '').toLowerCase();
        const userText = userSkills.join(' ') + ' ' + userBio;

        const jobDescription = (job.description + ' ' + (job.requirements || []).join(' ')).toLowerCase();
        
        // A simple keyword extraction (can be improved with a proper NLP library)
        const stopWords = new Set(['and', 'the', 'is', 'in', 'a', 'an', 'to', 'for', 'of', 'with', 'on', 'as', 'at']);
        const jobKeywords = [...new Set(jobDescription.split(/[\s,.;:()]+/))].filter(word => word.length > 2 && !stopWords.has(word));

        let matchedKeywords = 0;
        const missingKeywords = [];

        jobKeywords.forEach(keyword => {
            if (userText.includes(keyword)) {
                matchedKeywords++;
            } else {
                missingKeywords.push(keyword);
            }
        });

        const matchScore = jobKeywords.length > 0 ? Math.round((matchedKeywords / jobKeywords.length) * 100) : 0;

        return {
            matchScore,
            missingKeywords: missingKeywords.slice(0, 5), // Return top 5 missing keywords
            jobTitle
        };
    } catch (error) {
        console.error('Error optimizing CV:', error);
        return { error: 'An error occurred during CV optimization.' };
    }
};

const interviewQuestions = {
    "frontend developer": [
        "Explain the difference between null and undefined in JavaScript.",
        "What is the Box Model in CSS?",
        "What are React Hooks? Can you name a few?",
        "Describe the concept of 'state' in a React component."
    ],
    "backend developer": [
        "What is the difference between SQL and NoSQL databases?",
        "Explain the concept of RESTful APIs.",
        "What is middleware in the context of Express.js?",
        "How do you handle authentication in a web application?"
    ],
    "data scientist": [
        "What is the difference between supervised and unsupervised learning?",
        "Explain overfitting and how you would prevent it.",
        "Describe a project where you used data cleaning techniques.",
        "What is your favorite machine learning algorithm and why?"
    ],
    "product manager": [
        "How would you decide which features to build next?",
        "Describe a time you had to influence a team without direct authority.",
        "What's a product you love and why? What would you improve?",
        "How do you measure the success of a product?"
    ],
    "ui/ux designer": [
        "Can you describe your design process?",
        "What is the difference between UI and UX?",
        "Tell me about a project you're particularly proud of and why.",
        "How do you handle negative feedback on your designs?"
    ],
    "general": [
        "Tell me about yourself.",
        "What are your biggest strengths?",
        "What are your biggest weaknesses?",
        "Where do you see yourself in 5 years?",
        "Why are you interested in this field?"
    ]
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

const buildApplicationSummary = (userContext, fetchAll = false) => {
  const { user, applications } = userContext || {};
  if (!applications || applications.length === 0) {
    return {
      reply: `I couldn't find any applications linked to your account yet. Once you apply for roles, I'll keep track of their status here.`,
      data: []
    };
  }

  const userSkills = (user?.profile?.skills || []).map(skill => skill.toLowerCase());

  const applicationCards = applications.map((app) => {
    const job = app.job || {};
    const companyName = job.company?.name || 'Unknown Company';
    const status = (app.status || 'pending').toLowerCase();
    const jobRequirements = Array.isArray(job.requirements) ? job.requirements : [];
    const missingSkills = jobRequirements
      .map(req => req?.toString?.().trim())
      .filter(Boolean)
      .filter(req => !userSkills.includes(req.toLowerCase()));

    return {
      id: app._id.toString(),
      jobTitle: job.title || 'Unknown Role',
      companyName,
      status,
      feedback: app.feedback || '',
      appliedOn: app.createdAt,
      updatedAt: app.updatedAt,
      suggestedSkills: missingSkills
    };
  });

  const count = fetchAll ? applicationCards.length : 'recent';
  let reply = `Here is the latest update on your ${count} applications:`;
  applicationCards.forEach((card, index) => {
    reply += `\n${index + 1}. ${card.jobTitle} at ${card.companyName} — Status: ${card.status.toUpperCase()}.`;
    if (card.feedback) {
      reply += ` Feedback from the employer: ${card.feedback}.`;
    } else if (card.status === 'rejected') {
      reply += ` No specific feedback was provided.`;
    }
    if (card.suggestedSkills.length > 0) {
      reply += ` Suggested skills to strengthen: ${card.suggestedSkills.join(', ')}.`;
    }
  });

  if (!fetchAll) {
    reply += `\n\nLet me know if you'd like help improving any of those skills or finding similar roles.`;
  }

  return { reply, data: applicationCards };
};

// Initialize Gemini AI
let genAI;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('✅ Gemini AI initialized successfully');
} else {
  console.log('⚠️  GEMINI_API_KEY not found - Using rule-based chatbot fallback');
}

// GET /api/chatbot/test
router.get('/test', (req, res) => {
  const isConfigured = !!process.env.GEMINI_API_KEY;
  
  res.json({ 
    success: true, 
    message: isConfigured ? 'Gemini chatbot is configured and ready!' : 'Gemini chatbot is NOT configured',
    configured: isConfigured,
    model: 'gemini-2.0-flash-exp',  // ✅ Updated
    provider: 'Google AI (2025)',
    timestamp: new Date()
  });
});

// Require authentication for personalized chatbot interactions
router.use(isAuthenticated);

// POST /api/chatbot/chat - Main chat endpoint
router.post('/chat', chatbotLimiter, async (req, res) => {
  let { message, history, conversationContext } = req.body;
  let userContext = { user: null, applications: [] };
  let applicationSummary = { reply: '', data: [] };
  let jobs = [];
  let searchCriteria = {};
  let isJobSearchQuery = false;
  
  try {
    // Handle ongoing interview simulation
    if (conversationContext && conversationContext.inInterview) {
        const { jobTitle, questionIndex } = conversationContext;
        const questions = interviewQuestions[jobTitle];

        if (message.toLowerCase().includes('stop interview')) {
            return res.json({
                success: true,
                reply: "You have ended the mock interview. Feel free to ask me anything else!",
                conversationContext: { inInterview: false }
            });
        }

        const nextQuestionIndex = questionIndex + 1;
        if (nextQuestionIndex < questions.length) {
            return res.json({
                success: true,
                reply: `Great, let's move to the next question.\n\n**Question ${nextQuestionIndex + 1}:** ${questions[nextQuestionIndex]}`,
                conversationContext: { ...conversationContext, questionIndex: nextQuestionIndex }
            });
        } else {
            return res.json({
                success: true,
                reply: "You have completed the mock interview! That was the last question. I hope that was helpful.  Gook luck for your interview",
                conversationContext: { inInterview: false }
            });
        }
    }

    // Standard message processing
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message is required and must be a string' });
    }

    userContext = await getUserContext(req.id);
    applicationSummary = buildApplicationSummary(userContext);

    const cached = chatCache.get(req.id, message);
    if (cached) {
      await Chat.create({ user: req.id, message, reply: cached.reply, mode: cached.mode || 'cached', jobs: cached.jobs || [] }).catch(()=>{});
      return res.status(200).json({ success: true, ...cached, timestamp: new Date(), mode: 'cached' });
    }

    const normalizedMessage = message.toLowerCase();
    const applicationKeywords = ['application status', 'my application', 'status of my application', 'application update', 'applied job', 'application feedback', 'did i get the job', 'was i selected', 'selection status'];
    const askWhyRejected = normalizedMessage.includes('why') && normalizedMessage.includes('reject');

    const isApplicationHistoryQuery = normalizedMessage.includes('application history') || normalizedMessage.includes('all my applications');
    if (isApplicationHistoryQuery) {
        userContext = await getUserContext(req.id, true);
        applicationSummary = buildApplicationSummary(userContext, true);
        return res.status(200).json({ success: true, reply: applicationSummary.reply, applications: applicationSummary.data, mode: 'application-history' });
    }

    const isApplicationStatusQuery = applicationKeywords.some(keyword => normalizedMessage.includes(keyword)) || (normalizedMessage.includes('application') && normalizedMessage.includes('status')) || askWhyRejected;
    if (isApplicationStatusQuery) {
      const company = extractCompany(message);
      let finalApplications = applicationSummary.data.filter(app => !company || app.companyName.toLowerCase().includes(company.toLowerCase()));
      let reply = `Here is the latest update on your applications${company ? ` for ${company}` : ''}:`;
      if (finalApplications.length === 0) reply = `I couldn't find any applications for ${company || 'your account'}.`;
      else finalApplications.forEach((card, index) => { reply += `\n${index + 1}. ${card.jobTitle} at ${card.companyName} — Status: ${card.status.toUpperCase()}.`; });
      return res.status(200).json({ success: true, reply, applications: finalApplications, jobs: [], location: null, timestamp: new Date(), mode: 'application-status' });
    }

    const isSkillGapQuery = normalizedMessage.includes('skill gap') || normalizedMessage.includes('missing skills');
    if (isSkillGapQuery) {
        const jobTitle = extractJobTitle(message);
        if (!jobTitle) return res.json({ success: true, reply: "Please specify a job title so I can analyze your skill gap. For example: 'skill gap for software engineer'." });
        const gapAnalysis = await analyzeSkillGap(req.id, jobTitle);
        let reply = '';
        if (gapAnalysis.error) reply = gapAnalysis.error;
        else if (gapAnalysis.gap === 0) reply = `Congratulations! Your skills seem to be a perfect match for a "${jobTitle}" role. You have all the required skills: ${gapAnalysis.requiredSkills.join(', ')}.`;
        else {
            reply = `For a "${jobTitle}" role, you're missing ${gapAnalysis.gap} key skill(s): **${gapAnalysis.missingSkills.join(', ')}**.`;
            if (gapAnalysis.userSkills.length > 0) reply += `\n\nYou currently have these relevant skills: ${gapAnalysis.userSkills.join(', ')}.`;
            reply += `\n\nI can suggest some resources to help you learn these skills. Just ask!`;
        }
        return res.json({ success: true, reply, mode: 'skill-gap-analysis' });
    }

    const isProfileCheckQuery = normalizedMessage.includes('profile complete') || normalizedMessage.includes('check my profile');
    if (isProfileCheckQuery) {
        const completeness = await checkProfileCompleteness(req.id);
        let reply = `Your profile is **${completeness.score}%** complete.`;
        if (completeness.suggestions.length > 0) reply += `\n\nHere are some suggestions to improve it:\n- ${completeness.suggestions.join('\n- ')}`;
        else reply += `\n\nGreat job! Your profile is looking sharp.`;
        return res.json({ success: true, reply, mode: 'profile-completeness' });
    }

    const isGuidanceQuery = normalizedMessage.includes('upload my resume') || normalizedMessage.includes('upskilling') || normalizedMessage.includes('interview prep');
    if (isGuidanceQuery) {
        let reply = '';
        if (normalizedMessage.includes('upload my resume')) reply = 'You can upload your resume on your profile page. [Go to Profile](/profile)';
        else if (normalizedMessage.includes('upskilling')) reply = `Improving your skills is a great idea! Check out platforms like Coursera, Udemy, or LinkedIn Learning.`;
        else if (normalizedMessage.includes('interview prep')) reply = `Here are a few tips:\n- **Research the Company**\n- **Know Your Resume**\n- **Practice the STAR Method**`;
        return res.json({ success: true, reply, mode: 'guidance' });
    }

    const isCVOptimizeQuery = normalizedMessage.includes('optimize cv') || normalizedMessage.includes('optimize my resume');
    if (isCVOptimizeQuery) {
        const jobTitle = extractJobTitle(message);
        if (!jobTitle) return res.json({ success: true, reply: "Please specify a job title to optimize your CV for. Example: 'optimize cv for software engineer'." });
        const cvAnalysis = await optimizeCV(req.id, jobTitle);
        let reply = '';
        if (cvAnalysis.error) reply = cvAnalysis.error;
        else {
            reply = `Your profile has a **${cvAnalysis.matchScore}%** keyword match for a "${cvAnalysis.jobTitle}" role.`;
            if (cvAnalysis.missingKeywords.length > 0) reply += `\n\nTo improve your match, consider adding these keywords:\n- **${cvAnalysis.missingKeywords.join('**\n- **')}**`;
            else reply += `\n\nExcellent! Your profile seems well-optimized for this role.`;
        }
        return res.json({ success: true, reply, mode: 'cv-optimization' });
    }

    const isInterviewQuery = normalizedMessage.includes('mock interview') || normalizedMessage.includes('start interview') || normalizedMessage.includes('general interview');
    if (isInterviewQuery) {
        const jobTitle = Object.keys(interviewQuestions).find(key => normalizedMessage.includes(key));

        if (jobTitle && interviewQuestions[jobTitle]) {
            const firstQuestion = interviewQuestions[jobTitle][0];
            const reply = `Okay, let's start a mock interview for a ${jobTitle}.\n\n**Question 1:** ${firstQuestion}\n\nYou can say "stop interview" at any time to end it.`;
            return res.json({
                success: true,
                reply,
                conversationContext: {
                    inInterview: true,
                    jobTitle: jobTitle,
                    questionIndex: 0
                }
            });
        } else {
            return res.json({ success: true, reply: "I can conduct interviews for roles like 'frontend developer', 'backend developer', or you can request a 'general' interview for common behavioral questions. What would you like to do?" });
        }
    }

    searchCriteria = { title: extractJobTitle(message), location: extractLocation(message), salary: extractSalary(message) };
    isJobSearchQuery = searchCriteria.title || searchCriteria.location || searchCriteria.salary;
    if (isJobSearchQuery) {
        jobs = await fetchJobsByCriteria(searchCriteria, 5);
    }

    if (!genAI) {
        console.log('📝 Using rule-based chatbot fallback (No AI Key)');
        const mockReq = { body: { message, userId: req.id, userRole: userContext.user?.role, conversationHistory: history, userContext } };
        const mockRes = { status: (code) => ({ json: (data) => {
            if (!data.success) return res.status(code).json(data);
            let reply = data.reply;
            if (isJobSearchQuery) {
                let summary = `\n\nI found ${jobs.length} job${jobs.length > 1 ? 's' : ''}`;
                if (searchCriteria.title) summary += ` for "${searchCriteria.title}"`;
                if (searchCriteria.location) summary += ` in ${searchCriteria.location}`;
                if (searchCriteria.salary) summary += ` with a salary over ${searchCriteria.salary} LPA`;
                if (jobs.length > 0) reply += `${summary}. Here they are:`;
                else reply += `\n\nNo jobs found matching your criteria. Try broadening your search.`;
            }
            return res.status(200).json({ success: true, reply, jobs, applications: applicationSummary.data, location: searchCriteria.location, timestamp: new Date(), mode: 'rule-based' });
        }}),};
        return await ruleBasedChat(mockReq, mockRes);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    let chatHistory = (history || []).filter(msg => msg.role === 'user' || msg.role === 'assistant').map(msg => ({ role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: msg.content }] }));
    if (chatHistory.length > 0 && chatHistory[0].role !== 'user') chatHistory.shift();
    
    const systemContext = `You are a helpful AI assistant for a Job Portal platform...`; // Abridged for brevity
    const personalizedContext = `User Profile: Name: ${userContext.user?.fullname || 'Unknown'}...`; // Abridged
    const messageToSend = chatHistory.length === 0 ? `${systemContext}\n\n${personalizedContext}\n\nUser: ${message}` : message;

    const chat = model.startChat({ history: chatHistory, generationConfig: { maxOutputTokens: 300, temperature: 0.7 } });
    const result = await chat.sendMessage(messageToSend);
    let reply = result.response.text();

    if (isJobSearchQuery) {
        let summary = `\n\nI found ${jobs.length} job${jobs.length > 1 ? 's' : ''}`;
        if (searchCriteria.title) summary += ` for "${searchCriteria.title}"`;
        if (searchCriteria.location) summary += ` in ${searchCriteria.location}`;
        if (searchCriteria.salary) summary += ` with a salary over ${searchCriteria.salary} LPA`;
        if (jobs.length > 0) reply += `${summary}. Here's what I found:`;
        else reply += `${summary}. Try broadening your search criteria.`;
    }

    res.status(200).json({ success: true, reply, jobs, applications: applicationSummary.data, location: searchCriteria.location, timestamp: new Date(), mode: 'ai-powered' });
    await Chat.create({ user: req.id, message, reply, mode: 'ai-powered', jobs }).catch(() => {});
    chatCache.set(req.id, message, { reply, jobs, applications: applicationSummary.data, location: searchCriteria.location }, 5 * 60 * 1000);

  } catch (error) {
    console.error('❌ Chatbot Error:', error.message);
    console.error('Error stack:', error.stack);
    
    console.log('📝 Falling back to rule-based chatbot due to error');
    try {
        // Ensure user context is available for fallback
        if (!userContext.user) {
            userContext = await getUserContext(req.id);
        }

        // Re-run job search if it might have failed
        searchCriteria = { title: extractJobTitle(message), location: extractLocation(message), salary: extractSalary(message) };
        isJobSearchQuery = searchCriteria.title || searchCriteria.location || searchCriteria.salary;
        if (isJobSearchQuery && jobs.length === 0) {
            jobs = await fetchJobsByCriteria(searchCriteria, 5);
        }

      const mockReq = { body: { message, userId: req.id, userRole: userContext.user?.role, conversationHistory: history, userContext } };
      const mockRes = { status: (code) => ({ json: (data) => {
          if (!data.success) return res.status(code).json(data);
          let reply = data.reply;
          if (isJobSearchQuery) {
              let summary = `\n\nI found ${jobs.length} job${jobs.length > 1 ? 's' : ''}`;
              if (searchCriteria.title) summary += ` for "${searchCriteria.title}"`;
              if (searchCriteria.location) summary += ` in ${searchCriteria.location}`;
              if (searchCriteria.salary) summary += ` with a salary over ${searchCriteria.salary} LPA`;
              if (jobs.length > 0) reply += `${summary}. Here they are:`;
              else reply += `\n\nNo jobs found matching your criteria. Try broadening your search.`;
          }
          return res.status(200).json({ success: true, reply, jobs, applications: applicationSummary.data, location: searchCriteria.location, timestamp: new Date(), mode: 'rule-based-fallback' });
      }}),};
      return await ruleBasedChat(mockReq, mockRes);
    } catch (fallbackError) {
      console.error('❌ Fallback chatbot also failed:', fallbackError);
      res.status(500).json({ success: false, message: 'Chatbot service temporarily unavailable.' });
    }
  }
});

export default router;
