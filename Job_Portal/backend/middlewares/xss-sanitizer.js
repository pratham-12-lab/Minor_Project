// XSS Sanitization Middleware (Alternative to deprecated xss-clean)
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a window object for DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string|object} input - Input to sanitize
 * @returns {string|object} Sanitized input
 */
const sanitizeHTML = (input) => {
  if (typeof input === 'string') {
    return purify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'title', 'target'],
    });
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeHTML(item));
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const key in input) {
      sanitized[key] = sanitizeHTML(input[key]);
    }
    return sanitized;
  }

  return input;
};

/**
 * XSS Sanitization Middleware
 * Sanitizes request body, query, and params to prevent XSS attacks
 */
export const xssSanitizer = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    req.body = sanitizeHTML(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeHTML(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeHTML(req.params);
  }

  next();
};

/**
 * Sanitize user input for specific fields
 * @param {object} data - Data to sanitize
 * @param {string[]} fields - Fields to sanitize
 * @returns {object} Sanitized data
 */
export const sanitizeUserInput = (data, fields = []) => {
  const sanitized = { ...data };
  
  fields.forEach(field => {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      sanitized[field] = purify.sanitize(sanitized[field], {
        ALLOWED_TAGS: [], // Remove all HTML tags
        ALLOWED_ATTR: [], // Remove all attributes
      }).trim();
    }
  });

  return sanitized;
};

/**
 * Validate and sanitize file upload metadata
 * @param {object} file - File object from multer
 * @returns {object} Sanitized file metadata
 */
export const sanitizeFileMetadata = (file) => {
  if (!file) return null;

  return {
    originalname: purify.sanitize(file.originalname, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    }),
    mimetype: file.mimetype,
    size: file.size,
    // Note: file.buffer should be handled separately
  };
};

export default {
  xssSanitizer,
  sanitizeUserInput,
  sanitizeFileMetadata,
  sanitizeHTML,
};