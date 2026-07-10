# Job Portal Environment Setup Script (PowerShell)
# This script helps set up environment variables securely on Windows

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Job Portal Environment Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env already exists
if (Test-Path ".env") {
    Write-Host "⚠️  Warning: .env file already exists!" -ForegroundColor Yellow
    $backupChoice = Read-Host "Do you want to back up and create new? (y/n)"
    if ($backupChoice -eq "y") {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        Rename-Item ".env" ".env.backup_$timestamp"
        Write-Host "✅ Backed up existing .env to .env.backup_$timestamp" -ForegroundColor Green
    } else {
        Write-Host "❌ Setup cancelled. Please update existing .env manually." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📝 Please provide the following configuration values:" -ForegroundColor Cyan
Write-Host "   (Press Enter to use default values in parentheses)" -ForegroundColor Gray
Write-Host ""

# Server Configuration
$PORT = Read-Host "Port (8000)"
if ([string]::IsNullOrWhiteSpace($PORT)) { $PORT = "8000" }

$NODE_ENV = Read-Host "Node Environment (development)"
if ([string]::IsNullOrWhiteSpace($NODE_ENV)) { $NODE_ENV = "development" }

$FRONTEND_URL = Read-Host "Frontend URL (http://localhost:5173)"
if ([string]::IsNullOrWhiteSpace($FRONTEND_URL)) { $FRONTEND_URL = "http://localhost:5173" }

# Database Configuration
Write-Host ""
Write-Host "📊 Database Configuration:" -ForegroundColor Cyan
$MONGO_URI = Read-Host "MongoDB URI"

# Authentication
Write-Host ""
Write-Host "🔐 Authentication Configuration:" -ForegroundColor Cyan
$JWT_SECRET = Read-Host "JWT Secret (min 32 chars)"

if ($JWT_SECRET.Length -lt 32) {
    Write-Host "⚠️  Warning: JWT Secret should be at least 32 characters for security" -ForegroundColor Yellow
    $genJwt = Read-Host "Generate random JWT secret? (y/n)"
    if ($genJwt -eq "y") {
        # Generate random bytes and convert to base64
        $bytes = New-Object byte[] 24
        [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
        $JWT_SECRET = [Convert]::ToBase64String($bytes)
        Write-Host "✅ Generated secure JWT secret" -ForegroundColor Green
    }
}

# Cloudinary Configuration
Write-Host ""
Write-Host "☁️  Cloudinary Configuration:" -ForegroundColor Cyan
$CLOUDINARY_CLOUD_NAME = Read-Host "Cloud Name"
$CLOUDINARY_API_KEY = Read-Host "API Key"
$CLOUDINARY_API_SECRET = Read-Host "API Secret"

# Email Configuration
Write-Host ""
Write-Host "📧 Email Configuration:" -ForegroundColor Cyan
Write-Host "Note: For production, use dedicated email service (SendGrid, AWS SES)" -ForegroundColor Gray
$SMTP_HOST = Read-Host "SMTP Host (smtp.gmail.com)"
if ([string]::IsNullOrWhiteSpace($SMTP_HOST)) { $SMTP_HOST = "smtp.gmail.com" }

$SMTP_PORT = Read-Host "SMTP Port (587)"
if ([string]::IsNullOrWhiteSpace($SMTP_PORT)) { $SMTP_PORT = "587" }

$SMTP_SECURE = Read-Host "SMTP Secure (false)"
if ([string]::IsNullOrWhiteSpace($SMTP_SECURE)) { $SMTP_SECURE = "false" }

$SMTP_USER = Read-Host "SMTP User (email)"
$SMTP_PASS = Read-Host "SMTP Password/App Key"

# AI Services
Write-Host ""
Write-Host "🤖 AI Services Configuration:" -ForegroundColor Cyan
$GEMINI_API_KEY = Read-Host "Gemini API Key"

# Create .env file
Write-Host ""
Write-Host "Creating .env file..." -ForegroundColor Cyan

@"
# ============================================
# Job Portal Environment Configuration
# Generated: $(Get-Date)
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
"@ | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🔒 Security Checklist:" -ForegroundColor Cyan
Write-Host "   [ ] Remove old .env files from version control" -ForegroundColor Gray
Write-Host "   [ ] Add .env to .gitignore (already done)" -ForegroundColor Gray
Write-Host "   [ ] Set file permissions on .env" -ForegroundColor Gray
Write-Host "   [ ] Backup .env file securely" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  IMPORTANT:" -ForegroundColor Yellow
Write-Host "   1. NEVER commit .env to version control" -ForegroundColor Gray
Write-Host "   2. Store backups securely (password manager)" -ForegroundColor Gray
Write-Host "   3. Rotate secrets regularly (every 90 days)" -ForegroundColor Gray
Write-Host "   4. Use environment-specific files for different environments" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "   1. Update backend/.env with same values" -ForegroundColor Gray
Write-Host "   2. Start application: npm run dev" -ForegroundColor Gray
Write-Host ""

exit 0