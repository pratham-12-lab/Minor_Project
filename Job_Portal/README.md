# 🚀 Job Portal - AI-Powered Career Platform

<div align="center">

![Job Portal Banner](https://img.shields.io/badge/Job_Portal-AI_Powered-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)

**A modern, full-stack job portal powered by AI to connect job seekers with their dream careers**

[🌐 Live Demo](#-live-deployment) • [✨ Features](#-key-features) • [🛠️ Tech Stack](#️-tech-stack) • [📦 Installation](#-installation) • [📚 Documentation](#-api-documentation)

</div>

---

## 🌐 Live Deployment

### **Production Links**

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | [https://job-portal-frontend-2du2.onrender.com/](https://job-portal-frontend-2du2.onrender.com/) | 🟢 Live |
| **Backend API** | [https://job-portal-backend-7ef9.onrender.com/](https://job-portal-backend-7ef9.onrender.com/) | 🟢 Live |

> **Note**: The application is deployed on Render's free tier. Initial load may take 30-60 seconds due to cold starts.

---

## 📖 Overview

**Job Portal** is a comprehensive, AI-enhanced career platform designed to revolutionize the job search and recruitment process. Built with modern technologies and best practices, it provides an intuitive interface for job seekers to find opportunities and recruiters to discover top talent.

### 🎯 **Problem We Solve**

- **For Job Seekers**: Finding the right job is time-consuming and overwhelming
- **For Recruiters**: Screening candidates and finding qualified talent is inefficient
- **For Both**: Communication gaps and lack of real-time updates

### 💡 **Our Solution**

An intelligent platform that leverages AI to:
- Match candidates with relevant opportunities
- Provide personalized career guidance through AI chatbot
- Streamline the application and hiring process
- Offer real-time communication and updates
- Enhance profiles with AI-powered suggestions

---

## ✨ Key Features

### 👨‍💼 **For Job Seekers**

- 🔍 **Smart Job Search** - Advanced filtering by location, salary, job type, and experience level
- 📝 **Profile Builder** - Create comprehensive professional profiles with resume upload
- 🤖 **AI Career Assistant** - Get personalized job recommendations and career advice powered by Groq AI
- 📊 **Application Tracking** - Monitor all your applications in one dashboard
- 💾 **Save Jobs** - Bookmark interesting opportunities for later
- 🔔 **Job Alerts** - Receive email notifications for matching positions
- 💬 **Real-time Chat** - Communicate directly with recruiters via Socket.io
- 🎯 **Profile Enhancement** - AI-powered suggestions to improve your profile
- 📈 **Career Insights** - View who's viewing your profile and get analytics

### 🏢 **For Recruiters**

- 📢 **Job Posting** - Create and manage job listings with rich descriptions
- 👥 **Candidate Management** - View, filter, and shortlist applicants efficiently
- 🔍 **Talent Search** - Find candidates based on skills and experience
- 📊 **Analytics Dashboard** - Track job performance and application metrics
- 💼 **Company Profile** - Showcase your company with logos and descriptions
- 📧 **Automated Notifications** - Keep candidates informed about application status
- 🤝 **Interview Scheduling** - Manage interview processes seamlessly
- 💬 **Direct Messaging** - Chat with candidates in real-time

### 🛡️ **Admin Features**

- 👤 **User Management** - Manage job seekers and recruiters
- ✅ **Verification System** - Verify recruiter accounts for authenticity
- 📊 **Platform Analytics** - Monitor platform usage and statistics
- 🔐 **Security Controls** - Manage access and permissions

---

## 🤖 AI-Powered Features

### **Groq AI Integration**

Our platform leverages **Groq AI** (openai/gpt-oss-120b) for blazing-fast AI responses:

- **Career Chatbot**: Instant, intelligent responses to career questions
- **Job Recommendations**: Personalized job matching based on profile
- **Profile Optimization**: AI suggestions to improve profile visibility
- **Interview Prep**: Get tips and practice questions
- **Salary Insights**: Market-based compensation guidance

**Performance**: 
- ⚡ 500 tokens/second inference speed
- 🧠 120B parameter model for high-quality responses
- 💬 Context-aware conversations with history

---

## 🛠️ Tech Stack

### **Frontend**
- ⚛️ **React 18+** - Modern UI library with hooks
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🔄 **Redux Toolkit** - State management
- 🚀 **Vite** - Fast build tool and dev server
- 📡 **Axios** - HTTP client for API calls
- 🔌 **Socket.io Client** - Real-time communication
- 🎭 **Shadcn/ui** - Beautiful component library

### **Backend**
- 🟢 **Node.js 20+** - JavaScript runtime
- 🚂 **Express 5** - Web application framework
- 🍃 **MongoDB** - NoSQL database with Mongoose ODM
- 🔐 **JWT** - Secure authentication
- 🤖 **Groq SDK** - AI chatbot integration
- 🔌 **Socket.io** - WebSocket for real-time features
- 📧 **Nodemailer** - Email notifications
- ☁️ **Cloudinary** - Media storage and optimization

### **DevOps & Tools**
- 🐳 **Docker** - Containerization
- 🔄 **Jenkins** - CI/CD pipeline
- 📊 **SonarQube** - Code quality analysis
- 🧪 **Jest & Vitest** - Testing frameworks
- 🔍 **Winston** - Logging
- 🛡️ **Helmet** - Security headers
- ⚡ **Rate Limiting** - API protection

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Job Search │  │   Profile    │  │  AI Chatbot  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API / WebSocket
┌────────────────────────────┴────────────────────────────────┐
│                      Backend (Node.js/Express)               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │    Auth    │  │    Jobs    │  │   Chatbot  │           │
│  │ Controller │  │ Controller │  │ Controller │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└────────┬───────────────┬────────────────┬──────────────────┘
         │               │                │
┌────────┴────────┐ ┌───┴────────┐ ┌────┴──────────┐
│    MongoDB      │ │ Cloudinary │ │   Groq AI     │
│   (Database)    │ │  (Storage) │ │  (AI Model)   │
└─────────────────┘ └────────────┘ └───────────────┘
```

---

## 📦 Installation

### **Prerequisites**

- Node.js 20+ and npm 9+
- MongoDB (local or Atlas)
- Cloudinary account
- Groq API key

### **Quick Start**

#### **1️⃣ Clone the Repository**

```bash
git clone <your-repo-url>
cd Job_Portal
```

#### **2️⃣ Install Dependencies**

```bash
# Install all dependencies (backend + frontend)
npm install

# Or install separately
npm run install:backend
npm run install:frontend
```

#### **3️⃣ Environment Setup**

Create `.env` files:

**Backend** (`backend/.env`):
```env
# Database
MONGO_URI=mongodb+srv://your-mongodb-uri

# Server
PORT=8000
SECRET_KEY=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUD_NAME=your_cloudinary_name
API_KEY=your_cloudinary_key
API_SECRET=your_cloudinary_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_ENABLED=true

# AI Chatbot
GROQ_API_KEY=your_groq_api_key
CHATBOT_PROVIDER=groq

# Admin Account
ADMIN_NAME=Admin Name
ADMIN_EMAIL=admin@jobportal.com
ADMIN_PASSWORD=Admin@12345
ADMIN_PHONE=1234567890
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8000
```

#### **4️⃣ Run the Application**

```bash
# Development mode (both frontend & backend)
npm run dev

# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend

# Production mode
npm run build
npm start
```

#### **5️⃣ Access the Application**

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/v1

---

## 🐳 Docker Deployment

### **Using Docker Compose**

```bash
# Build and start containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

Access:
- Frontend: http://localhost:80
- Backend: http://localhost:8000

For detailed Docker instructions, see [RUN_DOCKER_GUIDE.md](./RUN_DOCKER_GUIDE.md)

---

## 📚 API Documentation

### **Base URLs**

- **Local**: http://localhost:8000/api/v1
- **Production**: https://job-portal-backend-7ef9.onrender.com/api/v1

### **Main Endpoints**

#### **Authentication**
```
POST   /user/register          # Register new user
POST   /user/login             # Login
GET    /user/logout            # Logout
POST   /user/profile/update    # Update profile
```

#### **Jobs**
```
GET    /job                    # Get all jobs
GET    /job/:id                # Get job by ID
POST   /job/post               # Post new job (recruiter)
GET    /job/getadminjobs       # Get recruiter's jobs
```

#### **Applications**
```
POST   /application/apply/:id  # Apply for job
GET    /application/get        # Get user's applications
GET    /application/:id/applicants # Get job applicants (recruiter)
PATCH  /application/status/:id/update # Update application status
```

#### **AI Chatbot**
```
POST   /chatbot/chat           # Send message to AI chatbot
GET    /chatbot/test           # Test chatbot configuration
POST   /chatbot/message        # Authenticated chat
GET    /chatbot/conversation/:userId/:sessionId # Get chat history
```

#### **Analytics**
```
GET    /analytics/jobs/:jobId  # Job statistics
GET    /analytics/recruiter    # Recruiter analytics
GET    /analytics/admin        # Platform analytics (admin)
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Backend tests
npm run test:backend

# Frontend tests
npm run test:frontend

# Watch mode
npm run test:watch

# Coverage report
npm run test:all
```

---

## 🗂️ Project Structure

```
Job_Portal/
├── backend/
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── middlewares/       # Custom middleware
│   ├── services/          # Business logic
│   ├── utils/             # Helper functions
│   ├── config/            # Configuration files
│   ├── __tests__/         # Test files
│   └── index.js           # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── redux/         # Redux store
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utilities
│   │   └── App.jsx        # Main app component
│   └── public/            # Static assets
│
├── docker-compose.yml     # Docker configuration
├── Jenkinsfile           # CI/CD pipeline
├── package.json          # Root dependencies
└── README.md             # This file
```

---

## 🔐 Security Features

- 🔒 **JWT Authentication** - Secure token-based auth
- 🛡️ **Password Hashing** - Bcrypt encryption
- 🚫 **Rate Limiting** - Prevent API abuse
- 🧹 **Input Sanitization** - MongoDB injection protection
- 🔐 **Helmet.js** - Security headers
- ✅ **XSS Protection** - Cross-site scripting prevention
- 🔑 **CORS Configuration** - Controlled access
- 📧 **Email Verification** - Account confirmation

---

## 📊 Key Metrics

- ⚡ **API Response Time**: < 200ms average
- 🚀 **Build Time**: ~30 seconds
- 📦 **Bundle Size**: Optimized with code splitting
- 🧪 **Test Coverage**: 70%+
- 🔄 **Uptime**: 99.5% (monitored)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Code Style**

- Use ESLint and Prettier configurations
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## 🐛 Known Issues & Roadmap

### **Current Known Issues**
- Cold start delay on Render free tier (~30s)
- Email notifications may be delayed during high traffic

### **Upcoming Features** 🚀
- [ ] Video interview scheduling
- [ ] Skills assessment tests
- [ ] Advanced search filters with AI
- [ ] Mobile application (React Native)
- [ ] LinkedIn integration
- [ ] Resume parser with AI
- [ ] Salary insights by location
- [ ] Company reviews and ratings
- [ ] Referral system

---

## 📄 License

This project is licensed under the ISC License.

---

## 👥 Team

**Developed with ❤️ by the Job Portal Team**

---

## 📞 Support

- 📧 **Email**: support@jobportal.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Node.js](https://nodejs.org/) - Runtime environment
- [MongoDB](https://www.mongodb.com/) - Database
- [Groq](https://groq.com/) - AI inference
- [Cloudinary](https://cloudinary.com/) - Media management
- [Render](https://render.com/) - Hosting platform
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- All open-source contributors

---

## 📈 Stats

![GitHub stars](https://img.shields.io/github/stars/your-repo?style=social)
![GitHub forks](https://img.shields.io/github/forks/your-repo?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/your-repo?style=social)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ and lots of ☕

[⬆ Back to Top](#-job-portal---ai-powered-career-platform)

</div>
