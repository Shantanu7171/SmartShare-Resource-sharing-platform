import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const API = axios.create({
  baseURL,
});

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const now = Math.floor(Date.now() / 1000);
    // 10-second buffer
    return payload.exp < (now + 10);
  } catch (e) {
    return true;
  }
};

// Request Interceptor: Attach token, proactively refresh if expired
API.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('accessToken');

    if (token && isTokenExpired(token)) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${baseURL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccessToken = response.data.access;
          localStorage.setItem('accessToken', newAccessToken);

          try {
            const { setTokens } = (await import('../store/authStore')).useAuthStore.getState();
            setTokens(newAccessToken, refreshToken);
          } catch (e) {
            console.error("Zustand store not available yet", e);
          }
          token = newAccessToken;
        } catch (refreshError) {
          // If refresh fails, clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          try {
            const { logout } = (await import('../store/authStore')).useAuthStore.getState();
            logout();
          } catch (e) {
            console.error("Zustand store logout failed", e);
          }

          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Refresh token on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and request has not already been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await axios.post(`${baseURL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccessToken = response.data.access;

          // Update token in storage
          localStorage.setItem('accessToken', newAccessToken);

          // Try to update Zustand store if initialized
          try {
            const { setTokens } = (await import('../store/authStore')).useAuthStore.getState();
            setTokens(newAccessToken, refreshToken);
          } catch (e) {
            console.error("Zustand store not available yet", e);
          }

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return API(originalRequest);
        } catch (refreshError) {
          // If refresh fails, log out the user
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          try {
            const { logout } = (await import('../store/authStore')).useAuthStore.getState();
            logout();
          } catch (e) {
            console.error("Zustand store logout failed", e);
          }

          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register/', data),
  login: (data) => API.post('/auth/login/', data),
  getProfile: () => API.get('/auth/profile/'),
  updateProfile: (data) => API.put('/auth/profile/', data),
  getLeaderboard: () => API.get('/auth/leaderboard/'),
  getBookmarks: () => API.get('/auth/bookmarks/'),
  getUsersAdmin: () => API.get('/auth/users/'),
  deleteUser: (id) => API.delete(`/auth/users/${id}/`),
  updateUserAdmin: (id, data) => API.patch(`/auth/users/${id}/`, data),
  getUserProfile: (id) => API.get(`/auth/users/${id}/`),
  getColleges: () => API.get('/auth/colleges/'),
  getUniversities: () => API.get('/auth/universities/'),
  getFacultyStudents: () => API.get('/auth/students/'),
  verifyOTP: (data) => API.post('/auth/verify-otp/', data),
  resendOTP: (data) => API.post('/auth/resend-otp/', data),
  forgotPassword: (data) => API.post('/auth/forgot-password/', data),
  resetPassword: (data) => API.post('/auth/reset-password/', data),
};

export const resourceAPI = {
  getAll: (params) => API.get('/resources/', { params }),
  getOne: (id) => API.get(`/resources/${id}/`),
  upload: (formData) => API.post('/resources/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  bookmark: (id) => API.post(`/resources/${id}/bookmark/`),
  download: (id) => API.post(`/resources/${id}/download/`),
  approve: (id, status) => API.patch(`/resources/${id}/approve/`, { status }),
  delete: (id) => API.delete(`/resources/${id}/`),
};

export const reviewAPI = {
  create: (data) => API.post('/reviews/', data),
  listByResource: (resourceId) => API.get('/reviews/', { params: { resource: resourceId } }),
};

export const notificationAPI = {
  list: () => API.get('/notifications/'),
  markRead: (id) => API.patch(`/notifications/${id}/mark_read/`),
  markAllRead: () => API.post('/notifications/mark_all_read/'),
};

export const chatAPI = {
  getMessages: () => API.get('/chat/'),
  sendMessage: (message) => API.post('/chat/', { message }),
  deleteMessage: (id) => API.delete(`/chat/${id}/`),
  clearHistory: () => API.delete('/chat/clear/'),
};

export const aiQuizAPI = {
  generate: (data) => API.post('/ai/quizzes/generate/', data),
  listQuizzes: () => API.get('/ai/quizzes/'),
  getQuiz: (id) => API.get(`/ai/quizzes/${id}/`),
  submitQuiz: (id, data) => API.post(`/ai/quizzes/${id}/submit/`, data),
};

export default API;
