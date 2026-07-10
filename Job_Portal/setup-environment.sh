#!/bin/bash

# Job Portal Environment Setup Script
# This script helps set up environment variables securely

echo "=========================================="
echo "  Job Portal Environment Setup"
echo "=========================================="
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  Warning: .env file already exists!"
    read -p "Do you want to back up and create new? (y/n): " backup_choice
    if [ "$backup_choice" = "y" ]; then
        timestamp=$(date +%Y%m%d_%H%M%S)
        mv .env ".env.backup_$timestamp"
        echo "✅ Backed up existing .env to .env.backup_$timestamp"
    else
        echo "❌ Setup cancelled. Please update existing .env manually."
        exit 1
    fi
fi

echo ""
echo "📝 Please provide the following configuration values:"
echo "   (Press Enter to use default values in parentheses)"
echo ""

# Server Configuration
read -p "Port (8000): " PORT
PORT=${PORT:-8000}

read -p "Node Environment (development): " NODE_ENV
NODE_ENV=${NODE_ENV:-development}

read -p "Frontend URL (http://localhost:5173): " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-http://localhost:5173}

# Database Configuration
echo ""
echo "📊 Database Configuration:"
read -p "MongoDB URI: " MONGO_URI

# Authentication
echo ""
echo "🔐 Authentication Configuration:"
read -p "JWT Secret (min 32 chars): " JWT_SECRET

if [ ${#JWT_SECRET} -lt 32 ]; then
    echo "⚠️  Warning: JWT Secret should be at least 32 characters for security"
    read -p "Generate random JWT secret? (y/n): " gen_jwt
    if [ "$gen_jwt" = "y" ]; then
        JWT_SECRET=$(openssl rand -base64 32)
        echo "✅ Generated secure JWT secret"
    fi
fi

# Cloudinary Configuration
echo ""
echo "☁️  Cloudinary Configuration:"
read -p "Cloud Name: " CLOUDINARY_CLOUD_NAME
read -p "API Key: " CLOUDINARY_API_KEY
read -p "API Secret: " CLOUDINARY_API_SECRET

# Email Configuration
echo ""
echo "📧 Email Configuration:"
echo "Note: For production, use dedicated email service (SendGrid, AWS SES)"
read -p "SMTP Host (smtp.gmail.com): " SMTP_HOST
SMTP_HOST=${SMTP_HOST:-smtp.gmail.com}

read -p "SMTP Port (587): " SMTP_PORT
SMTP_PORT=${SMTP_PORT:-587}

read -p "SMTP Secure (false): " SMTP_SECURE
SMTP_SECURE=${SMTP_SECURE:-false}

read -p "SMTP User (email): " SMTP_USER
read -p "SMTP Password/App Key: " SMTP_PASS

# AI Services
echo ""
echo "🤖 AI Services Configuration:"
read -p "Gemini API Key: " GEMINI_API_KEY

# Create .env file
echo ""
echo "Creating .env file..."

cat > .env << EOF
# ============================================
# Job Portal Environment Configuration
# Generated: $(date)
# ============================================

# SERVER CONFIGURATION
PORT=$PORT
NODE_ENV=$NODE_ENV
FRONTEND_URL=$FRONTEND_URL

# DATABASE CONFIGURATION
MONGO_URI=$MONGO_URI

# AUTHENTICATION & SECURITY
JWT_SECRET=$JWT_SECRET
JWT_EXPIRY=7d
BCRYPT_SALT_ROUNDS=12

# FILE STORAGE
CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET

# EMAIL SERVICE
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_SECURE=$SMTP_SECURE
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS

# AI SERVICES
GEMINI_API_KEY=$GEMINI_API_KEY

# APPLICATION SETTINGS
APP_NAME=Job-Portal
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# LOGGING
LOG_LEVEL=info
EOF

echo "✅ .env file created successfully!"
echo ""
echo "🔒 Security Checklist:"
echo "   [ ] Remove old .env files from version control"
echo "   [ ] Add .env to .gitignore (already done)"
echo "   [ ] Set file permissions: chmod 600 .env"
echo "   [ ] Backup .env file securely"
echo ""
echo "⚠️  IMPORTANT:"
echo "   1. NEVER commit .env to version control"
echo "   2. Store backups securely (password manager)"
echo "   3. Rotate secrets regularly (every 90 days)"
echo "   4. Use environment-specific files for different environments"
echo ""
echo "Next steps:"
echo "   1. Run: chmod 600 .env"
echo "   2. Update backend/.env with same values"
echo "   3. Start application: npm run dev"
echo ""

# Set secure permissions
chmod 600 .env 2>/dev/null || echo "Note: Could not set permissions on .env"

exit 0