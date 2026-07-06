// src/services/citizenService.js
import api from '../utils/api';

export const citizenService = {
  /**
   * Submit a new citizen request
   */
  async submitRequest(formData) {
    const response = await api.post('/citizen/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Get all requests (for citizen view)
   */
  async getRequests(params = {}) {
    const response = await api.get('/citizen/requests', { params });
    return response.data;
  },

  /**
   * Get a single request by ID
   */
  async getRequestById(id) {
    const response = await api.get(`/citizen/requests/${id}`);
    return response.data;
  },
};
