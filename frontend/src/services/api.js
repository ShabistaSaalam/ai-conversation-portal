import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Conversation APIs
export const conversationAPI = {
  // Get all conversations
  getAll: async (params = {}) => {
    const response = await api.get('/conversations/', { params });
    return response.data;
  },

  // Get single conversation
  get: async (id) => {
    const response = await api.get(`/conversations/${id}/`);
    return response.data;
  },

  // Create new conversation
  create: async (data) => {
    const response = await api.post('/conversations/', data);
    return response.data;
  },

  // Send message
  sendMessage: async (id, content) => {
    const response = await api.post(`/conversations/${id}/send_message/`, { content });
    return response.data;
  },

  // End conversation
  end: async (id) => {
    const response = await api.post(`/conversations/${id}/end_conversation/`, {});
    return response.data;
  },

  // Query conversations
  query: async (data) => {
    const response = await api.post('/conversations/query_conversations/', data);
    return response.data;
  },

  // Update conversation title (partial update)
  updateTitle: async (id, data) => {
    const response = await api.patch(`/conversations/${id}/`, data);
    return response.data;
  },

  // Delete conversation
  delete: async (id) => {
    const response = await api.delete(`/conversations/${id}/`);
    return response.data;
  },

  // Get analytics
  getAnalytics: async (params = {}) => {
    const response = await api.get('/conversations/analytics/', { params });
    return response.data;
  },
};

// Error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

export default api;
