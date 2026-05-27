import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Validate required SMTP environment variables so we fail fast and provide a clear message
const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
const missingEnv = requiredEnv.filter((key) => !process.env[key] || process.env[key].trim() === '');
if (missingEnv.length) {
  console.error('❌ Missing required SMTP environment variable(s):', missingEnv.join(', '));
  console.error('👉 Please update your .env file (e.g. SMTP_USER=you@example.com, SMTP_PASS=<app-password>) and restart the server.');
  // Throw so app doesn\'t run in a broken state.
  throw new Error(`Missing SMTP env vars: ${missingEnv.join(', ')}`);
}

const transporter = nodemailer.createTransport({
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

export default transporter;
