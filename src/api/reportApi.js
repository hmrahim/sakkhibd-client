import axiosInstance from './axiosInstance';

/**
 * Report API services for ghush application
 */

// Get all reports with optional query params (search, category, division, district, status, sortBy, order, page, limit)
export const getReportsApi = async (params = {}) => {
  return await axiosInstance.get('/reports', { params });
};

// Get single report by ID
export const getReportByIdApi = async (id) => {
  return await axiosInstance.get(`/reports/${id}`);
};

// Create a new complaint / report
export const createReportApi = async (reportData) => {
  return await axiosInstance.post('/reports', reportData);
};

// Update an existing report (status, fields)
export const updateReportApi = async (id, updatedFields) => {
  return await axiosInstance.put(`/reports/${id}`, updatedFields);
};

// Delete a single report
export const deleteReportApi = async (id) => {
  return await axiosInstance.delete(`/reports/${id}`);
};

// Bulk delete reports
export const bulkDeleteReportsApi = async (ids) => {
  return await axiosInstance.post('/reports/bulk-delete', { ids });
};

// React to a report
export const reactToReportApi = async (id, payload) => {
  return await axiosInstance.post(`/reports/${id}/react`, payload);
};

// কে কোন রিয়েক্ট দিয়েছে — তালিকা (Facebook-style "who reacted" list)
export const getReportReactorsApi = async (id) => {
  return await axiosInstance.get(`/reports/${id}/reactors`);
};

// Add comment to a report
export const addCommentApi = async (id, payload) => {
  return await axiosInstance.post(`/reports/${id}/comments`, payload);
};

// Get analytics summary
export const getAnalyticsSummaryApi = async () => {
  return await axiosInstance.get('/reports/analytics/summary');
};
