const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://job-portal-backend-7ef9.onrender.com/api';

export const USER_API_END_POINT = `${API_BASE_URL}/users`;
export const JOB_API_END_POINT = `${API_BASE_URL}/jobs`;
export const APPLICATION_API_END_POINT = `${API_BASE_URL}/applications`;
export const COMPANY_API_END_POINT = `${API_BASE_URL}/companies`;
export const EMAIL_API_END_POINT = `${API_BASE_URL}/email`;
export const SAVED_JOBS_API_END_POINT = `${API_BASE_URL}/saved-jobs`;
export const JOB_ALERT_API_END_POINT = `${API_BASE_URL}/job-alerts`; // ✅ NEW
export const CHATBOT_API_END_POINT = `${API_BASE_URL}/chatbot`; // ✅ Chatbot endpoint
export const ANALYTICS_API_END_POINT = `${API_BASE_URL}/analytics`;
