// src/services/dashboardService.js
import api from '../utils/api';

export const dashboardService = {
  /**
   * Get dashboard summary stats
   */
  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  /**
   * Get paginated requests with filters
   */
  async getRequests(params = {}) {
    const response = await api.get('/dashboard/requests', { params });
    return response.data;
  },

  /**
   * Get top-priority AI analysis
   */
  async getAIPriority() {
    const response = await api.get('/dashboard/ai-priority');
    return response.data;
  },

  /**
   * Get hotspot map data
   */
  async getHotspots() {
    const response = await api.get('/dashboard/hotspots');
    return response.data;
  },

  /**
   * Update request status
   */
  async updateStatus(id, status) {
    const response = await api.patch(`/dashboard/requests/${id}/status`, { status });
    return response.data;
  },
};
