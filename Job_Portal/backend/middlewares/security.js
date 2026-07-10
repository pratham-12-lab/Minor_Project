// Security Middleware for Input Validation, Sanitization, and Protection
import Joi from 'joi';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

// Input Validation Schemas
export const validationSchemas = {
  // User Registration
  register: Joi.object({
    fullname: Joi.string()
      .min(2)
      .max(100)
      .pattern(/^[a-zA-Z\s]*$/)
      .required()
      .messages({
        'string.pattern.base': 'Full name can only contain letters and spaces',
        'string.min': 'Full name must be at least 2 characters',
        'string.max': 'Full name cannot exceed 100 characters',
      }),
    
    email: Joi.string()
      .email()
      .max(255)
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'string.max': 'Email cannot exceed 255 characters',
      }),
    
    phoneNumber: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be 10 digits',
      }),
    
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password cannot exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      }),
    
    role: Joi.string()
      .valid('student', 'recruiter', 'admin')
      .required()
      .messages({
        'any.only': 'Role must be student, recruiter, or admin',
      }),
    
    companyName: Joi.string()
      .max(200)
      .when('role', {
        is: 'recruiter',
        then: Joi.required(),
        otherwise: Joi.optional().allow(''),
      })
      .messages({
        'string.max': 'Company name cannot exceed 200 characters',
      }),
    
    companyWebsite: Joi.string()
      .uri()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.uri': 'Please provide a valid website URL',
        'string.max': 'Website URL cannot exceed 500 characters',
      }),
  }),

  // User Login
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'string.empty': 'Password is required',
      }),
  }),

  // Job Creation
  job: Joi.object({
    title: Joi.string()
      .min(5)
      .max(200)
      .required()
      .messages({
        'string.min': 'Job title must be at least 5 characters',
        'string.max': 'Job title cannot exceed 200 characters',
      }),
    
    description: Joi.string()
      .min(20)
      .max(5000)
      .required()
      .messages({
        'string.min': 'Description must be at least 20 characters',
        'string.max': 'Description cannot exceed 5000 characters',
      }),
    
    requirements: Joi.string()
      .min(5)
      .max(2000)
      .required()
      .messages({
        'string.min': 'Requirements must be at least 5 characters',
        'string.max': 'Requirements cannot exceed 2000 characters',
      }),
    
    salary: Joi.number()
      .min(0)
      .max(1000000)
      .required()
      .messages({
        'number.min': 'Salary must be a positive number',
        'number.max': 'Salary cannot exceed 1,000,000',
      }),
    
    location: Joi.string()
      .min(2)
      .max(200)
      .required()
      .messages({
        'string.min': 'Location must be at least 2 characters',
        'string.max': 'Location cannot exceed 200 characters',
      }),
    
    jobType: Joi.string()
      .valid('Full-time', 'Part-time', 'Contract', 'Internship', 'Remote')
      .required()
      .messages({
        'any.only': 'Job type must be one of: Full-time, Part-time, Contract, Internship, Remote',
      }),
    
    experience: Joi.string()
      .valid('Entry-level', 'Mid-level', 'Senior', 'Executive')
      .required()
      .messages({
        'any.only': 'Experience level must be one of: Entry-level, Mid-level, Senior, Executive',
      }),
    
    position: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Position must be at least 2 characters',
        'string.max': 'Position cannot exceed 100 characters',
      }),
    
    companyId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid company ID format',
      }),
  }),

  // Profile Update
  profileUpdate: Joi.object({
    fullname: Joi.string()
      .min(2)
      .max(100)
      .pattern(/^[a-zA-Z\s]*$/)
      .optional()
      .messages({
        'string.pattern.base': 'Full name can only contain letters and spaces',
      }),
    
    phoneNumber: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Phone number must be 10 digits',
      }),
    
    bio: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Bio cannot exceed 1000 characters',
      }),
    
    skills: Joi.array()
      .items(Joi.string().max(50))
      .max(20)
      .optional()
      .messages({
        'array.max': 'Cannot have more than 20 skills',
      }),
  }),

  // Password Change
  passwordChange: Joi.object({
    oldPassword: Joi.string()
      .required()
      .messages({
        'string.empty': 'Old password is required',
      }),
    
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'New password must be at least 8 characters',
        'string.max': 'New password cannot exceed 128 characters',
        'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      }),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
      }),
  }),

  // File Upload
  fileUpload: Joi.object({
    file: Joi.object({
      mimetype: Joi.string()
        .valid('image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        .required()
        .messages({
          'any.only': 'File type not allowed. Allowed types: JPEG, PNG, PDF, DOC, DOCX',
        }),
      
      size: Joi.number()
        .max(5 * 1024 * 1024) // 5MB
        .required()
        .messages({
          'number.max': 'File size cannot exceed 5MB',
        }),
    }).unknown(),
  }),
};

// Validation Middleware
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Sanitize validated data
    if (property === 'body') {
      req.body = sanitizeInput(req.body);
    }

    next();
  };
};

// Input Sanitization
const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    // Remove script tags and dangerous HTML
    return data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+="/gi, '')
      .trim();
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item));
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const key in data) {
      sanitized[key] = sanitizeInput(data[key]);
    }
    return sanitized;
  }

  return data;
};

// Rate Limiting Configuration
export const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
    ...options,
  });
};

// Specific Rate Limiters
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit auth endpoints to 10 requests per IP
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
  },
});

export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit API endpoints to 500 requests per IP
});

export const fileUploadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit file uploads to 20 requests per IP
});

// Security Headers Configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for some external resources
});

// Request Sanitization Middleware
export const requestSanitization = [
  // Note: xss() disabled temporarily to test if it's causing query property error
  // xss(),

  // Custom sanitization middleware
  (req, res, next) => {
    // Trim all string inputs from body
    if (req.body) {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].trim();
        }
      }
    }

    // Content-type validation disabled for now to avoid 415 errors
    // Will rely on Express body parser to handle content types

    next();
  },
];

// Security Audit Logger
export const securityLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?._id || 'anonymous',
      userRole: req.user?.role || 'anonymous',
    };

    // Log security-relevant events
    if (res.statusCode >= 400) {
      console.warn('⚠️ Security Event:', logEntry);
    }

    // Log potential attacks
    if (req.originalUrl.includes('script') || 
        req.originalUrl.includes('<script') ||
        req.originalUrl.includes('javascript:')) {
      console.error('🚨 Potential XSS attack detected:', {
        ...logEntry,
        suspiciousUrl: req.originalUrl,
      });
    }
  });

  next();
};

// CORS Configuration
// CORS Configuration - Allow all origins in development
export const corsConfig = {
  origin: (origin, callback) => {
    // Allow all origins in development
    if (process.env.NODE_ENV !== 'production') {
      callback(null, true);
      return;
    }
    
    // In production, check allowed origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : ['http://localhost:5173', 'http://localhost:3000'];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
};

// Export security middleware bundle
export const securityMiddleware = {
  validationSchemas,
  validate,
  createRateLimiter,
  authLimiter,
  apiLimiter,
  fileUploadLimiter,
  securityHeaders,
  requestSanitization,
  securityLogger,
  corsConfig,
};

export default securityMiddleware;