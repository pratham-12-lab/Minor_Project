import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./utils/db.js";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import { generalLimiter } from "./middlewares/rateLimiter.js";
import { 
  securityHeaders, 
  requestSanitization, 
  securityLogger,
  corsConfig,
  authLimiter,
  apiLimiter,
  fileUploadLimiter 
} from "./middlewares/security.js";
import { xssSanitizer } from "./middlewares/xss-sanitizer.js";
import { requestLogger, errorLogger } from "./utils/logger.js";
import http from "http";
import SocketManager from "./websocket/socket-manager.js";
import chatHandler from "./websocket/chat-handler.js";
import notificationHandler from "./websocket/notification-handler.js";

// Import routes
import userRoutes from "./routes/user.route.js";
import companyRoutes from "./routes/company.route.js";
import jobRoutes from "./routes/job.route.js";
import applicationRoutes from "./routes/application.route.js";
import emailRoutes from "./routes/email.route.js";
import adminRoutes from "./routes/admin.route.js";
import savedJobRoutes from "./routes/savedJob.route.js";
import jobAlertRoutes from "./routes/jobAlert.route.js";
import chatbotRoutes from './routes/chatbot.routes.js';
import analyticsRoutes from './routes/analytics.route.js';
import careerRoutes from './routes/career.route.js';
import messageRoutes from './routes/message.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import profileEnhancementRoutes from './routes/profile-enhancement.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import profileViewRoutes from './routes/profileView.routes.js';
import recruiterRoutes from './routes/recruiter.routes.js';
import dns from 'dns';

// Configure DNS for better reliability
dns.setServers(["1.1.1.1", "8.8.8.8", "0.0.0.0"]);

connectDB();

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ========================
// SECURITY MIDDLEWARE STACK
// ========================

// 1. CORS Configuration (MUST BE FIRST!)
app.use(cors(corsConfig));

// 2. Security Headers
app.use(securityHeaders);

// 3. Rate Limiting (Apply before other middleware for efficiency)
app.use(generalLimiter); // General rate limiter

// 4. Request Sanitization
app.use(requestSanitization);

// 5. Security Logger
app.use(securityLogger);

// 8. Request Logger (for monitoring and analytics)
app.use(requestLogger);

// 9. Body Parsing with size limits
app.use(express.json({
  limit: '10kb', // Limit JSON body size
  verify: (req, res, buf) => {
    // Check for malformed JSON
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      throw new Error('Malformed JSON');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true,
  limit: '10kb' // Limit URL-encoded body size
}));

// 10. Cookie Parser with security
app.use(cookieParser({
  secret: process.env.JWT_SECRET || 'default-secret',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// ========================
// ROUTES WITH SPECIFIC SECURITY
// ========================

// Authentication routes - stricter rate limiting
app.use("/api/users", authLimiter, userRoutes);

// API routes - standard rate limiting
app.use("/api/users", authLimiter, userRoutes);
app.use("/api/companies", apiLimiter, companyRoutes);
app.use("/api/jobs", apiLimiter, jobRoutes);
app.use("/api/applications", apiLimiter, applicationRoutes);
app.use("/api/email", apiLimiter, emailRoutes);
app.use("/api/admin", apiLimiter, adminRoutes);
app.use("/api/saved-jobs", apiLimiter, savedJobRoutes);
app.use("/api/job-alerts", apiLimiter, jobAlertRoutes);
app.use('/api/chatbot', apiLimiter, chatbotRoutes);
app.use('/api/analytics', apiLimiter, analyticsRoutes);
app.use('/api/career', apiLimiter, careerRoutes);
app.use('/api/messages', apiLimiter, messageRoutes);
app.use('/api/notifications', apiLimiter, notificationRoutes);
app.use('/api/profile-enhancements', apiLimiter, profileEnhancementRoutes);
app.use('/api/interviews', apiLimiter, interviewRoutes);
app.use('/api/profile-views', apiLimiter, profileViewRoutes);
app.use('/api/recruiter', apiLimiter, recruiterRoutes);

// File upload routes - stricter limits
app.use("/api/upload", fileUploadLimiter);

// ========================
// HEALTH & SECURITY CHECK ROUTES
// ========================

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "✅ Job Portal API is running",
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    security: {
      headers: "enabled",
      rateLimiting: "enabled",
      sanitization: "enabled",
      cors: "enabled"
    }
  });
});

// Security check endpoint (for monitoring)
app.get("/api/security/check", (req, res) => {
  const securityStatus = {
    status: "secure",
    checks: {
      headers: true,
      rateLimiting: true,
      sanitization: true,
      cors: true,
      https: process.env.NODE_ENV === 'production',
      timestamp: new Date().toISOString(),
    },
    recommendations: process.env.NODE_ENV === 'production' ? [
      "Enable HTTPS in production",
      "Regular security audits",
      "Monitor rate limiting logs"
    ] : []
  };
  
  res.json(securityStatus);
});

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error logging middleware (logs errors before handling)
app.use(errorLogger);

// Global error handler
app.use((err, req, res, next) => {
  // Security-related errors
  if (err.name === 'ValidationError' || err.message === 'Malformed JSON') {
    return res.status(400).json({
      success: false,
      message: "Bad Request - Invalid input",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      timestamp: new Date().toISOString()
    });
  }

  // Rate limiting errors
  if (err.name === 'RateLimitError') {
    return res.status(429).json({
      success: false,
      message: "Too Many Requests",
      retryAfter: err.retryAfter,
      timestamp: new Date().toISOString()
    });
  }

  // Authentication errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      timestamp: new Date().toISOString()
    });
  }

  // Database errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      success: false,
      message: "Database error occurred",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode >= 500
    ? "Internal Server Error"
    : err.message || "An unexpected error occurred";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack,
    }),
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 8000;

// ========================
// WEBSOCKET SETUP (PHASE 2)
// ========================

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Initialize Socket Manager (handles Socket.IO setup internally)
const socketManager = new SocketManager(server);
socketManager.initialize(chatHandler, notificationHandler);

// Store socketManager in app for use in routes
app.set('socketManager', socketManager);

// Add message and notification routes
app.use("/api/messages", apiLimiter, messageRoutes);
app.use("/api/notifications", apiLimiter, notificationRoutes);

// ========================
// START SERVER
// ========================

server.listen(PORT, () => {
  console.log(`
========================================
✅ Job Portal API Server Started
========================================
🌐 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Port: ${PORT}
🔒 Security Features:
   - Rate Limiting: ✅ Enabled
   - XSS Protection: ✅ Enabled  
   - NoSQL Injection Protection: ✅ Enabled
   - Security Headers: ✅ Enabled
   - CORS: ✅ Configured
   - Input Validation: ✅ Enabled
🔌 WebSocket Features (PHASE 2):
   - Socket.IO: ✅ Enabled
   - Real-Time Chat: ✅ Ready
   - Push Notifications: ✅ Ready
📊 Health Check: http://localhost:${PORT}/
🔐 Security Check: http://localhost:${PORT}/api/security/check
💬 Chat API: http://localhost:${PORT}/api/messages
🔔 Notifications API: http://localhost:${PORT}/api/notifications
========================================
  `);
  
  // Security startup check
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('your_')) {
    console.warn('⚠️  WARNING: JWT_SECRET is using default value. Update in .env file!');
  }
  
  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('your_')) {
    console.warn('⚠️  WARNING: MONGO_URI is using default value. Update in .env file!');
  }
});
