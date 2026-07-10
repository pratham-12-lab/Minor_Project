// Comprehensive Logging System with Security Monitoring
import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  security: 5, // Custom level for security events
};

// Log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
  security: 'cyan',
};

winston.addColors(colors);

// Custom format for security logs
const securityFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `🚨 [${timestamp}] [${level.toUpperCase()}] ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
  })
);

// Custom format for application logs
const appFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaString}`;
  })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
try {
  // This will be created when logs are written
} catch (error) {
  console.error('Failed to create logs directory:', error);
}

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: appFormat,
  defaultMeta: { service: 'job-portal-api' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    }),

    // Daily rotate file for all logs
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d', // Keep logs for 30 days
      level: 'info',
      format: appFormat,
    }),

    // Error logs (separate file)
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '90d', // Keep error logs for 90 days
      level: 'error',
      format: appFormat,
    }),

    // Security logs (separate file)
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDir, 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '90d', // Keep security logs for 90 days
      level: 'security',
      format: securityFormat,
    }),
  ],

  // Handle exceptions
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '90d',
    }),
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],

  // Handle rejections
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '90d',
    }),
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

// Custom log methods for different use cases
export const log = {
  // Application logs
  info: (message, meta = {}) => {
    logger.info(message, meta);
  },

  error: (message, error = null, meta = {}) => {
    const logMeta = {
      ...meta,
      ...(error && {
        errorMessage: error.message,
        errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        errorName: error.name,
      }),
    };
    logger.error(message, logMeta);
  },

  warn: (message, meta = {}) => {
    logger.warn(message, meta);
  },

  debug: (message, meta = {}) => {
    logger.debug(message, meta);
  },

  http: (message, meta = {}) => {
    logger.http(message, meta);
  },

  // Security logs
  security: {
    attack: (type, details, req = null) => {
      const meta = {
        type,
        ...details,
        ...(req && {
          ip: req.ip,
          method: req.method,
          url: req.originalUrl,
          userAgent: req.get('user-agent'),
          userId: req.user?._id || 'anonymous',
        }),
      };
      logger.log('security', `Security attack detected: ${type}`, meta);
    },

    suspicious: (activity, details, req = null) => {
      const meta = {
        activity,
        ...details,
        ...(req && {
          ip: req.ip,
          method: req.method,
          url: req.originalUrl,
        }),
      };
      logger.log('security', `Suspicious activity: ${activity}`, meta);
    },

    auth: (event, userId, details = {}) => {
      logger.log('security', `Authentication event: ${event}`, {
        event,
        userId,
        ...details,
      });
    },

    access: (action, resource, userId, details = {}) => {
      logger.log('security', `Access control: ${action} on ${resource}`, {
        action,
        resource,
        userId,
        ...details,
      });
    },
  },

  // Business logs
  business: {
    job: (action, jobId, userId, details = {}) => {
      logger.info(`Job ${action}`, {
        category: 'business',
        action,
        jobId,
        userId,
        ...details,
      });
    },

    application: (action, applicationId, userId, details = {}) => {
      logger.info(`Application ${action}`, {
        category: 'business',
        action,
        applicationId,
        userId,
        ...details,
      });
    },

    user: (action, userId, details = {}) => {
      logger.info(`User ${action}`, {
        category: 'business',
        action,
        userId,
        ...details,
      });
    },
  },

  // Performance logs
  performance: (operation, duration, details = {}) => {
    logger.info(`Performance: ${operation} took ${duration}ms`, {
      category: 'performance',
      operation,
      duration,
      ...details,
    });
  },

  // Audit logs (for compliance)
  audit: (action, actor, target, details = {}) => {
    logger.info(`Audit: ${action}`, {
      category: 'audit',
      action,
      actor,
      target,
      timestamp: new Date().toISOString(),
      ...details,
    });
  },
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?._id || 'anonymous',
      userRole: req.user?.role || 'anonymous',
      contentLength: res.get('content-length') || '0',
    };

    // Log based on status code
    if (res.statusCode >= 500) {
      log.error('Server error', null, logData);
    } else if (res.statusCode >= 400) {
      log.warn('Client error', logData);
    } else {
      log.http('Request completed', logData);
    }

    // Log performance for slow requests
    if (duration > 1000) {
      log.performance(`${req.method} ${req.originalUrl}`, duration, {
        threshold: '1s',
        ...logData,
      });
    }
  });

  next();
};

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  log.error('Unhandled error', err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?._id || 'anonymous',
  });
  next(err);
};

// Export logger instance and methods
export default {
  logger,
  log,
  requestLogger,
  errorLogger,
  levels,
};