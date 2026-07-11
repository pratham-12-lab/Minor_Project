# 🚀 MANUAL RENDER SETUP (Alternative Method)

## If Root Directory keeps failing, use this manual setup:

### Backend Service Configuration:
```
Service Type: Web Service
Name: job-portal-backend
Environment: Node
Repository: pratham-12-lab/Minor_Project
Branch: main
Root Directory: (LEAVE EMPTY)
Build Command: cd backend && npm ci --only=production
Start Command: cd backend && npm start
Auto-Deploy: Yes
```

### Frontend Service Configuration:
```
Service Type: Static Site
Name: job-portal-frontend
Environment: Static Site
Repository: pratham-12-lab/Minor_Project
Branch: main
Root Directory: (LEAVE EMPTY)
Build Command: cd frontend && npm ci && npm run build
Publish Directory: frontend/dist
Auto-Deploy: Yes
```

### Environment Variables for Backend:
```
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_key
FRONTEND_URL=https://job-portal-frontend.onrender.com
```

### Environment Variables for Frontend:
```
VITE_API_URL=https://job-portal-backend.onrender.com
```

## This method uses cd commands instead of Root Directory setting!