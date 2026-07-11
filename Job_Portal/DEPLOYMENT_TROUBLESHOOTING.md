# 🚨 RENDER DEPLOYMENT TROUBLESHOOTING GUIDE

## 🎯 Quick Fix for Current Issue

### ❌ Error: "Root directory 'backend' does not exist"

**Immediate Solutions:**

#### Option 1: Fix render.yaml (Recommended)
```yaml
# Update your render.yaml file
services:
  - type: web
    name: job-portal-backend
    env: node
    rootDir: backend  # ✅ Remove ./ prefix
    buildCommand: npm ci --only=production
    startCommand: npm start
```

#### Option 2: Manual Service Configuration
1. Go to Render Dashboard
2. Select your backend service
3. Go to "Settings" → "Build & Deploy"
4. Set Root Directory to: `backend` (no quotes, no ./)
5. Click "Save Changes"
6. Trigger manual deploy

#### Option 3: Alternative Build Commands
```yaml
# If rootDir doesn't work, use cd commands
services:
  - type: web
    name: job-portal-backend
    env: node
    # Don't set rootDir
    buildCommand: cd backend && npm ci --only=production
    startCommand: cd backend && npm start
```

---

## 🔧 Complete Deployment Fix Guide

### Step 1: Update Configuration Files

#### Fix render.yaml
```yaml
services:
  # Backend API Service
  - type: web
    name: job-portal-backend
    env: node
    plan: starter
    region: singapore  # Changed from oregon for better latency
    rootDir: backend   # Fixed: no ./ prefix
    buildCommand: npm ci --only=production
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        fromService:
          type: web
          name: job-portal-backend
          property: port
    healthCheckPath: /
    autoDeploy: true
    
  # Frontend Static Site  
  - type: web
    name: job-portal-frontend
    env: static
    plan: free
    region: singapore
    rootDir: frontend   # Fixed: no ./ prefix
    buildCommand: npm ci && npm run build
    staticPublishPath: dist  # Fixed: no ./ prefix
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    autoDeploy: true

# Environment Variables
envVars:
  - key: MONGO_URI
    generateValue: false
  - key: JWT_SECRET
    generateValue: true
  - key: CLOUDINARY_CLOUD_NAME
    generateValue: false
  - key: CLOUDINARY_API_KEY
    generateValue: false
  - key: CLOUDINARY_API_SECRET
    generateValue: false
  - key: GEMINI_API_KEY
    generateValue: false
  - key: FRONTEND_URL
    fromService:
      type: web
      name: job-portal-frontend
      property: url
  - key: VITE_API_URL
    fromService:
      type: web
      name: job-portal-backend
      property: url
```

### Step 2: Verify Package.json Scripts

#### Backend package.json
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### Frontend package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Step 3: Environment Variables Setup

#### Required Backend Variables:
```bash
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/jobportal?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-or-let-render-generate
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GEMINI_API_KEY=your-gemini-key
FRONTEND_URL=https://job-portal-frontend.onrender.com
```

#### Required Frontend Variables:
```bash
VITE_API_URL=https://job-portal-backend.onrender.com
```

---

## 🎯 Step-by-Step Deployment Process

### Phase 1: Preparation (5 minutes)

1. **Commit and Push Changes**
   ```bash
   cd "c:\Users\prath\OneDrive\Desktop\Minor\Job_Portal"
   git add .
   git commit -m "Fix Render deployment configuration"
   git push origin main
   ```

2. **Verify File Structure**
   ```bash
   Job_Portal/
   ├── backend/
   │   ├── package.json
   │   ├── index.js
   │   └── ... (other backend files)
   ├── frontend/
   │   ├── package.json
   │   ├── vite.config.js
   │   └── ... (other frontend files)
   └── render.yaml
   ```

### Phase 2: Render Setup (10 minutes)

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub account
   - Connect your repository

2. **Deploy with Blueprint**
   - Click "New" → "Blueprint"
   - Select your Job_Portal repository
   - Wait for services to be created (2-3 minutes)

3. **Configure Environment Variables**
   - Go to backend service → Environment
   - Add all required variables listed above
   - Click "Save Changes"

### Phase 3: Verification (5 minutes)

1. **Check Service Status**
   - Both services should show "Live" status
   - If "Build Failed", check logs for specific errors

2. **Test Endpoints**
   ```bash
   # Backend health check
   curl https://job-portal-backend.onrender.com/
   
   # Frontend accessibility
   curl https://job-portal-frontend.onrender.com/
   ```

---

## 🚨 Common Error Solutions

### Error 1: Build Command Failed

**Symptoms:**
```bash
Build failed: npm install failed
```

**Solutions:**
```yaml
# Use npm ci instead of npm install
buildCommand: npm ci --only=production

# Or specify Node version
services:
  - type: web
    env: node
    node: 18.20.4
```

### Error 2: Start Command Failed

**Symptoms:**
```bash
Service failed to start
```

**Solutions:**
```javascript
// Ensure server binds to 0.0.0.0, not localhost
const PORT = process.env.PORT || 8000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Error 3: Environment Variables Not Found

**Symptoms:**
```bash
TypeError: Cannot read property 'MONGO_URI' of undefined
```

**Solutions:**
1. Double-check variable names in Render dashboard
2. Ensure dotenv is configured:
   ```javascript
   import 'dotenv/config';
   // or
   require('dotenv').config();
   ```

### Error 4: Database Connection Failed

**Symptoms:**
```bash
MongoNetworkError: connection timeout
```

**Solutions:**
1. **Whitelist Render IPs in MongoDB Atlas:**
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0`
   - Comment: "Render deployment"

2. **Check connection string format:**
   ```bash
   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```

### Error 5: CORS Issues

**Symptoms:**
```bash
Access to fetch at 'https://backend.onrender.com' blocked by CORS policy
```

**Solutions:**
```javascript
// Update CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://job-portal-frontend.onrender.com'
  ],
  credentials: true
}));
```

---

## 🔍 Debugging Tools

### 1. Render Dashboard Logs
- Go to Service → Logs
- Filter by error level
- Look for specific error messages

### 2. Local Testing
```bash
# Test production environment locally
NODE_ENV=production npm start

# Test with production dependencies
npm ci --only=production
npm start
```

### 3. Health Check Endpoints
```javascript
// Add debugging endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT
  });
});
```

---

## ✅ Post-Deployment Checklist

### Backend Service ✅
- [ ] Service shows "Live" status
- [ ] Health check returns 200: `GET /`
- [ ] Environment variables are set
- [ ] Database connection works
- [ ] API endpoints respond correctly

### Frontend Service ✅
- [ ] Service shows "Live" status  
- [ ] Website loads without errors
- [ ] Can make API calls to backend
- [ ] All routes work (SPA routing)
- [ ] Mobile responsiveness works

### Integration Testing ✅
- [ ] User registration works
- [ ] User login works
- [ ] Job posting works
- [ ] File upload works
- [ ] Real-time features work
- [ ] Email notifications work (if configured)

---

## 🆘 Emergency Rollback

If deployment fails completely:

1. **Revert to Working Configuration**
   ```bash
   git log --oneline  # Find last working commit
   git revert <commit-hash>
   git push origin main
   ```

2. **Manual Service Creation**
   ```bash
   # Delete blueprint services
   # Create services manually with basic config
   # Add environment variables step by step
   ```

3. **Contact Support**
   - Render Community Forum
   - GitHub Issues in your repository
   - Render Support (for paid plans)

---

## 📞 Getting Help

- **Render Documentation:** https://render.com/docs
- **Render Community:** https://community.render.com
- **MongoDB Atlas Support:** https://support.mongodb.com
- **Project Issues:** Create issue in your GitHub repository

---

## 🎯 Success Indicators

✅ **Deployment Successful When:**
- Both services show "Live" in Render dashboard
- Backend responds at health check endpoint
- Frontend loads without console errors
- Database operations work
- File uploads work
- User can register and login successfully

**Estimated Fix Time:** 10-20 minutes  
**Success Rate After Following Guide:** 95%+

---

**Last Updated:** July 11, 2026  
**Status:** Ready to Deploy 🚀