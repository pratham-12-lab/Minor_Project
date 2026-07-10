import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Check if SMTP is enabled
const smtpEnabled = process.env.SMTP_ENABLED === 'true';

let transporter = null;

if (smtpEnabled) {
  // Validate required SMTP environment variables
  const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missingEnv = requiredEnv.filter((key) => !process.env[key] || process.env[key].trim() === '');
  
  if (missingEnv.length) {
    console.error('❌ Missing required SMTP environment variable(s):', missingEnv.join(', '));
    console.error('👉 Please update your .env file and set SMTP_ENABLED=true to enable email functionality.');
  } else {
    transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    transporter.verify(function (error, success) {
      if (error) {
        console.log('❌ SMTP Connection Error:', error.message);
      } else {
        console.log('✅ SMTP Server is ready to send emails');
      }
    });
  }
} else {
  console.log('📧 SMTP Disabled - Email functionality not available');
  
  // Create a mock transporter for development
  transporter = {
    sendMail: (options) => {
      console.log('📧 Mock Email (SMTP disabled):', {
        to: options.to,
        subject: options.subject,
        text: options.text?.substring(0, 100) + '...'
      });
      return Promise.resolve({ messageId: 'mock-' + Date.now() });
    }
  };
}

export default transporter;