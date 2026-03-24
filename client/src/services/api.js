import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ach_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export async function signupRequest(payload) {
  const res = await api.post('/api/auth/signup', payload);
  return res.data;
}

export async function loginRequest(payload) {
  const res = await api.post('/api/auth/login', payload);
  return res.data;
}

export async function forgotPasswordRequest(email) {
  const res = await api.post('/api/auth/forgot-password', { email });
  return res.data;
}

export async function resetPasswordRequest(token, password) {
  const res = await api.put(`/api/auth/reset-password/${token}`, { password });
  return res.data;
}

// AI chat
export async function chatRequest(payload) {
  const res = await api.post('/api/ai/chat', payload);
  return res.data;
}

export async function getChatHistoryRequest() {
  const res = await api.get('/api/ai/chat/history');
  return res.data;
}

export async function clearChatHistoryRequest() {
  const res = await api.delete('/api/ai/chat/history');
  return res.data;
}

// Farmer
export async function detectDiseaseRequest(file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await api.post('/api/ai/detect-disease', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function createBookingRequest(payload) {
  const res = await api.post('/api/bookings', payload);
  return res.data;
}

export async function getMyBookingsRequest() {
  const res = await api.get('/api/bookings/my');
  return res.data;
}

export async function getArticlesRequest() {
  const res = await api.get('/api/articles');
  return res.data;
}

// Officer
export async function getAssignedBookingsRequest() {
  const res = await api.get('/api/bookings/assigned');
  return res.data;
}

export async function updateBookingStatusRequest(id, status, meetingLink) {
  const payload = { status };
  if (meetingLink !== undefined) payload.meetingLink = meetingLink;
  const res = await api.patch(`/api/bookings/${id}/status`, payload);
  return res.data;
}

export async function createArticleRequest(payload) {
  const headers = payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
  const res = await api.post('/api/articles', payload, { headers });
  return res.data;
}

export async function updateArticleRequest(id, payload) {
  const headers = payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
  const res = await api.put(`/api/articles/${id}`, payload, { headers });
  return res.data;
}

export async function deleteArticleRequest(id) {
  const res = await api.delete(`/api/articles/${id}`);
  return res.data;
}

export async function deleteUserRequest(id) {
  const res = await api.delete(`/api/users/${id}`);
  return res.data;
}

// Admin
export async function getUsersRequest() {
  const res = await api.get('/api/users');
  return res.data;
}

export async function getOfficersRequest() {
  const res = await api.get('/api/users/officers');
  return res.data;
}

export async function verifyOfficerRequest(id) {
  const res = await api.patch(`/api/users/${id}/verify`);
  return res.data;
}

export async function getAiLogsRequest() {
  const res = await api.get('/api/ai/logs');
  return res.data;
}

export async function addDiseaseKnowledgeRequest(payload) {
  const res = await api.post('/api/ai/knowledge', payload);
  return res.data;
}

export async function retrainAiModelRequest() {
  const res = await api.post('/api/ai/retrain');
  return res.data;
}

export async function extractKnowledgeRequest(payload) {
  const res = await api.post('/api/ai/extract-knowledge', payload);
  return res.data;
}

export async function uploadKnowledgeDocumentRequest(file, extractData = true) {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('extractData', extractData);
  const res = await api.post('/api/ai/upload-knowledge', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

// Weather
export async function getWeatherRequest(params) {
  const queryParams = {};
  
  if (typeof params === 'string') {
    queryParams.location = params.trim().replace(/ /g, '+');
  } else {
    if (params.location) queryParams.location = params.location.trim().replace(/ /g, '+');
    if (params.lat) queryParams.lat = params.lat;
    if (params.lon) queryParams.lon = params.lon;
  }

  if (!queryParams.location && (!queryParams.lat || !queryParams.lon)) {
    throw new Error('Location or coordinates are required');
  }

  const res = await api.get('/api/weather', { params: queryParams });
  return res.data;
}

export async function getForecastRequest(params) {
  const queryParams = {};
  
  if (typeof params === 'string') {
    queryParams.location = params.trim();
  } else {
    if (params.location) queryParams.location = params.location.trim();
    if (params.lat) queryParams.lat = params.lat;
    if (params.lon) queryParams.lon = params.lon;
  }

  if (!queryParams.location && (!queryParams.lat || !queryParams.lon)) {
    throw new Error('Location or coordinates are required');
  }

  const res = await api.get('/api/weather/forecast', { params: queryParams });
  return res.data;
}