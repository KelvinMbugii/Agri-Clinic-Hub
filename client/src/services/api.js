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

export async function updateBookingStatusRequest(id, status) {
  const res = await api.patch(`/api/bookings/${id}/status`, { status });
  return res.data;
}

export async function createArticleRequest(payload) {
  const res = await api.post('/api/articles', payload);
  return res.data;
}

export async function updateArticleRequest(id, payload) {
  const res = await api.put(`/api/articles/${id}`, payload);
  return res.data;
}

export async function deleteArticleRequest(id) {
  const res = await api.delete(`/api/articles/${id}`);
  return res.data;
}

// Admin
export async function getUsersRequest() {
  const res = await api.get('/api/users');
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

