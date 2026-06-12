import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const registerUser = (data) => api.post('/auth/register/', data);
export const loginUser = (data) => api.post('/auth/login/', data);
export const getProfile = () => api.get('/auth/profile/');

// Courses APIs
export const getCourses = () => api.get('/courses/');
export const getCourse = (id) => api.get(`/courses/${id}/`);
export const createCourse = (data) => api.post('/courses/', data);
export const enrollCourse = (id) => api.post(`/courses/${id}/enroll/`);
export const getMyCourses = () => api.get('/courses/my-courses/');

// Lessons APIs
export const getLessons = (courseId) => api.get(`/courses/${courseId}/lessons/`);
export const createLesson = (courseId, data) => api.post(`/courses/${courseId}/lessons/`, data);

// Quiz APIs
export const getQuizzes = () => api.get('/quizzes/');
export const getQuiz = (id) => api.get(`/quizzes/${id}/`);
export const submitQuiz = (id, answers) => api.post(`/quizzes/${id}/submit/`, { answers });
export const getMyAttempts = () => api.get('/quizzes/my-attempts/');
export const getAttemptDetail = (attemptId) => api.get(`/quizzes/attempts/${attemptId}/`);
export const bookmarkQuestion = (questionId) => api.post(`/quizzes/questions/${questionId}/bookmark/`);
export const removeBookmark = (questionId) => api.delete(`/quizzes/questions/${questionId}/bookmark/`);
export const getMyBookmarks = () => api.get('/quizzes/my-bookmarks/');

// Chatbot APIs
export const sendMessage = (message, sessionId = null) => {
  const payload = { message };
  if (sessionId) payload.session_id = sessionId;
  return api.post('/chatbot/send/', payload);
};
export const getChatSessions = () => api.get('/chatbot/sessions/');

// Progress APIs
export const getDashboard = () => api.get('/progress/dashboard/');
export const markLessonComplete = (lessonId) => api.post(`/progress/lessons/${lessonId}/complete/`);

// Instructor Dashboard APIs
export const getInstructorDashboard = () => api.get('/instructor/dashboard/');

// Discussion APIs
export const getDiscussions = (courseId) => api.get(`/courses/${courseId}/discussions/`);
export const createDiscussion = (courseId, data) => api.post(`/courses/${courseId}/discussions/`, data);
export const getDiscussionComments = (discussionId) => api.get(`/discussions/${discussionId}/comments/`);
export const createComment = (discussionId, data) => api.post(`/discussions/${discussionId}/comments/`, data);

// Leaderboard APIs
export const getLeaderboard = (params = '') => api.get(`/leaderboard/${params}`);

// Achievements APIs
export const getAchievements = () => api.get('/achievements/');

// Notification Preferences APIs
export const getNotificationPreference = () => api.get('/notification-preference/');
export const updateNotificationPreference = (data) => api.put('/notification-preference/', data);

export default api;