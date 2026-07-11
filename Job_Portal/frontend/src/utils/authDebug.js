/**
 * Authentication Debug Utility
 * Helper functions to debug authentication issues
 */

export const debugAuth = () => {
  console.group('🔍 Authentication Debug Info');
  
  // Check localStorage
  const userFromStorage = localStorage.getItem('user');
  const tokenFromStorage = localStorage.getItem('token');
  
  console.log('📦 localStorage user:', userFromStorage ? JSON.parse(userFromStorage) : null);
  console.log('🔑 localStorage token:', tokenFromStorage);
  
  // Check cookies
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {});
  
  console.log('🍪 Cookies:', cookies);
  
  // Check Redux store (if available)
  try {
    const state = window.__REDUX_STORE_STATE__;
    if (state) {
      console.log('🏪 Redux auth state:', state.auth);
    }
  } catch (e) {
    console.log('🏪 Redux state not available');
  }
  
  console.groupEnd();
};

export const testAuthAPI = async () => {
  console.group('🧪 Testing Auth API');
  
  try {
    // Test with cookies
    const cookieResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://job-portal-backend-7ef9.onrender.com/api'}/messages/conversations`, {
      credentials: 'include',
    });
    console.log('🍪 Cookie auth response:', cookieResponse.status, await cookieResponse.text());
  } catch (error) {
    console.error('🍪 Cookie auth error:', error);
  }
  
  try {
    // Test with token
    const token = localStorage.getItem('token');
    if (token) {
      const tokenResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://job-portal-backend-7ef9.onrender.com/api'}/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('🔑 Token auth response:', tokenResponse.status, await tokenResponse.text());
    }
  } catch (error) {
    console.error('🔑 Token auth error:', error);
  }
  
  console.groupEnd();
};