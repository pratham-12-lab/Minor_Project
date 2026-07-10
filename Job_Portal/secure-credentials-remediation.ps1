# Job Portal - Secure Credentials Remediation Script
# Use this script to safely remove exposed credentials and set up secure configuration

Write-Host "==========================================" -ForegroundColor Red
Write-Host "  CRITICAL SECURITY ALERT" -ForegroundColor Red
Write-Host "==========================================" -ForegroundColor Red
Write-Host ""
Write-Host "⚠️  WARNING: Your credentials are exposed in the codebase!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Exposed Credentials Found:" -ForegroundColor Yellow
Write-Host "1. MongoDB Atlas credentials" -ForegroundColor Yellow
Write-Host "2. Cloudinary API keys and secrets" -ForegroundColor Yellow
Write-Host "3. Gmail SMTP credentials" -ForegroundColor Yellow
Write-Host "4. Gemini API key" -ForegroundColor Yellow
Write-Host "5. JWT secret keys" -ForegroundColor Yellow
Write-Host ""
Write-Host "Immediate Actions Required:" -ForegroundColor Red
Write-Host ""

# Backup existing .env files
Write-Host "📦 Backing up existing configuration files..." -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "env_backup_$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Backup all .env files
Get-ChildItem -Path . -Filter ".env" -Recurse | ForEach-Object {
    $backupPath = Join-Path $backupDir $_.FullName.Substring((Get-Location).Path.Length + 1)
    $backupDirPath = Split-Path $backupPath -Parent
    New-Item -ItemType Directory -Path $backupDirPath -Force | Out-Null
    Copy-Item $_.FullName $backupPath
    Write-Host "  ✅ Backed up: $($_.FullName)" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔐 Creating secure configuration..." -ForegroundColor Cyan

# Create .env files with placeholders
$envTemplate = @"
# ============================================
# Job Portal - SECURE CONFIGURATION
# Generated: $(Get-Date)
# ============================================
# WARNING: Previous credentials were exposed and should be revoked immediately
# Follow instructions in SECURITY_GUIDELINES.md
# ============================================

# SERVER CONFIGURATION
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# DATABASE CONFIGURATION
# ⚠️ REVOKE OLD CREDENTIALS IMMEDIATELY
# Create new user in MongoDB Atlas and update below
MONGO_URI=mongodb+srv://NEW_USERNAME:NEW_PASSWORD@cluster.mongodb.net/job_portal?retryWrites=true&w=majority

# AUTHENTICATION & SECURITY
# ⚠️ Generate new secure JWT secret
JWT_SECRET=generate_secure_random_secret_min_32_chars
JWT_EXPIRY=7d

# FILE STORAGE (CLOUDINARY)
# ⚠️ Generate new API keys in Cloudinary dashboard
CLOUDINARY_CLOUD_NAME=your_new_cloud_name
CLOUDINARY_API_KEY=your_new_api_key
CLOUDINARY_API_SECRET=your_new_api_secret

# EMAIL SERVICE
# ⚠️ Change Gmail password and enable 2FA
# Consider using dedicated email service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_new_app_password

# AI SERVICES
# ⚠️ Revoke old key and generate new in Google Cloud Console
GEMINI_API_KEY=your_new_gemini_api_key

# APPLICATION SETTINGS
APP_NAME=Job-Portal
"@

# Create new .env files
$envTemplate | Out-File -FilePath ".env" -Encoding UTF8
$envTemplate | Out-File -FilePath "backend/.env" -Encoding UTF8

Write-Host ""
Write-Host "✅ New secure configuration files created" -ForegroundColor Green
Write-Host ""
Write-Host "🚨 IMMEDIATE ACTIONS REQUIRED:" -ForegroundColor Red
Write-Host ""
Write-Host "1. REVOKE EXPOSED CREDENTIALS:" -ForegroundColor Yellow
Write-Host "   a) MongoDB Atlas: Delete user 'gaikwadpratham26'" -ForegroundColor Yellow
Write-Host "   b) Cloudinary: Generate new API keys" -ForegroundColor Yellow
Write-Host "   c) Gmail: Change password + enable 2FA" -ForegroundColor Yellow
Write-Host "   d) Google Cloud: Revoke Gemini API key" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. UPDATE NEW CREDENTIALS:" -ForegroundColor Yellow
Write-Host "   Run: .\setup-environment.ps1" -ForegroundColor Cyan
Write-Host "   Or manually update .env files with new credentials" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. VERIFY GIT IGNORE:" -ForegroundColor Yellow
Write-Host "   Ensure .env files are not tracked in git" -ForegroundColor Cyan
Write-Host "   Run: git status --ignored" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. BACKUP SECURELY:" -ForegroundColor Yellow
Write-Host "   Store new credentials in password manager" -ForegroundColor Cyan
Write-Host "   Delete backup folder after verification: $backupDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Backup location: $backupDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔒 Security Checklist:" -ForegroundColor Cyan
Write-Host "   [ ] Revoked MongoDB credentials" -ForegroundColor Gray
Write-Host "   [ ] Revoked Cloudinary API keys" -ForegroundColor Gray
Write-Host "   [ ] Changed Gmail password + 2FA" -ForegroundColor Gray
Write-Host "   [ ] Revoked Gemini API key" -ForegroundColor Gray
Write-Host "   [ ] Updated .env with new credentials" -ForegroundColor Gray
Write-Host "   [ ] Verified .env not in git" -ForegroundColor Gray
Write-Host "   [ ] Stored credentials securely" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Detailed instructions in: SECURITY_GUIDELINES.md" -ForegroundColor Cyan
Write-Host ""

# Check git status for .env files
Write-Host "Checking git status..." -ForegroundColor Cyan
git status | Select-String ".env" | ForEach-Object {
    Write-Host "  ⚠️  .env file detected in git status" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next: Run the setup script to configure new credentials:" -ForegroundColor Green
Write-Host "  .\setup-environment.ps1" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""

exit 0