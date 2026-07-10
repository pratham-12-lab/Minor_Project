import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { useSocket } from './hooks/useSocket';
import { useSelector } from 'react-redux';

// Auth components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';

// Public components
import Home from './components/Home';
import Jobs from './components/Jobs';
import Browse from './components/Browse';
import Profile from './components/Profile';
import JobDescription from './components/JobDescription';
import EmailTest from './components/EmailTest';
import PendingVerification from './components/PendingVerification';
import SavedJobs from './components/SavedJobs'; 
import JobAlerts from './components/JobAlerts'; 

// Admin/Recruiter components
import Companies from './components/admin/Companies';
import CompanyCreate from './components/admin/CompanyCreate';
import CompanySetup from './components/admin/CompanySetup';
import AdminJobs from "./components/admin/AdminJobs";
import PostJob from './components/admin/PostJob';
import Applicants from './components/admin/Applicants';
import AdminDashboard from './components/admin/AdminDashboard';
import ProtectedRoute from './components/admin/ProtectedRoute';

import Chatbot from './components/Chatbot/Chatbot';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';

// Phase 2: Chat & Notifications
import ChatPage from './pages/Chat/ChatPage';
import MessagesPage from './pages/Messages/MessagesPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';

// New Advanced Features
import ApplicationReview from './components/recruiter/ApplicationReview';
import InterviewScheduling from './components/interview/InterviewScheduling';
import InterviewDashboard from './components/interview/InterviewDashboard';
import InterviewFeedback from './components/interview/InterviewFeedback';
import ProfileViews from './components/profile/ProfileViews';
import RecruiterDashboard from './components/recruiter/RecruiterDashboard';
import CandidateSearch from './components/recruiter/CandidateSearch';
import TestFeatures from './components/TestFeatures';

function App() {
  const { initializeSocket, disconnectSocket } = useSocket();
  const user = useSelector((state) => state.auth?.user);
  const token = localStorage.getItem('token');

  // Initialize socket connection when user logs in
  useEffect(() => {
    if (token && user) {
      initializeSocket(
        token,
        user._id || user.id,
        user.fullname || user.fullName || user.email,
        user.role || 'CANDIDATE'
      );
    }

    // Cleanup on unmount
    return () => {
      // Don't disconnect on unmount - keep connection alive for notifications
      // disconnectSocket();
    };
  }, [token, user, initializeSocket]);

  return (
    <NotificationProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route 
              path="/admin/jobs/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={["recruiter", "admin"]}>
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route path="/description/:id" element={<JobDescription />} />
            <Route path="/analytics/:id" element={<AnalyticsDashboard />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/job-alerts" element={<JobAlerts />} />
            <Route path="/test-email" element={<EmailTest />} />
            <Route path="/test-features" element={<TestFeatures />} />
            <Route path="/pending-verification" element={<PendingVerification />} />

            {/* Admin Dashboard */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Recruiter & Admin Routes */}
            <Route 
              path="/admin/companies" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <Companies />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/companies/create" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <CompanyCreate />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/companies/:id" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <CompanySetup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/jobs" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <AdminJobs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/jobs/create" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <PostJob />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/jobs/:id/applicants" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <Applicants />
                </ProtectedRoute>
              } 
            />

            {/* Phase 2: Chat & Notifications Routes */}
            <Route path="/chat/:roomId" element={<ChatPage />} />
            <Route path="/chat/user/:userId" element={<ChatPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Advanced Features Routes */}
            
            {/* Profile Views (Student) */}
            <Route path="/student/profile/views" element={<ProfileViews />} />

            {/* Interview Routes for Candidates */}
            <Route 
              path="/student/interviews" 
              element={
                <ProtectedRoute allowedRoles={['candidate', 'student']}>
                  <InterviewDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Recruiter Advanced Features */}
            <Route 
              path="/recruiter/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <RecruiterDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Interview Management for Recruiters */}
            <Route 
              path="/recruiter/interviews" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <InterviewDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/recruiter/applications/:jobId" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <ApplicationReview />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/recruiter/interviews/schedule/:applicationId" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <InterviewScheduling />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/recruiter/interviews/:interviewId/feedback" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <InterviewFeedback />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/recruiter/candidates/search" 
              element={
                <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                  <CandidateSearch />
                </ProtectedRoute>
              } 
            />
          </Routes>

          {/* ✅ Floating ChatBot available on all pages */}
          <Chatbot />
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;
