import axiosInstance from './axiosInstance';

// Get comments (with replies) for a report — paginated
export const getCommentsApi = async (reportId, params = {}) => {
  return await axiosInstance.get(`/comments/report/${reportId}`, { params });
};

// Post a new top-level comment on a report
export const addCommentApi = async (reportId, payload) => {
  return await axiosInstance.post(`/comments/report/${reportId}`, payload);
};

// Reply to a comment
export const addReplyApi = async (commentId, payload) => {
  return await axiosInstance.post(`/comments/${commentId}/replies`, payload);
};

// Edit a comment (owner only)
export const updateCommentApi = async (commentId, payload) => {
  return await axiosInstance.patch(`/comments/${commentId}`, payload);
};

// Edit a reply (owner only)
export const updateReplyApi = async (commentId, replyId, payload) => {
  return await axiosInstance.patch(`/comments/${commentId}/replies/${replyId}`, payload);
};

// Toggle like on a comment
export const toggleLikeCommentApi = async (commentId) => {
  return await axiosInstance.post(`/comments/${commentId}/like`);
};

// Toggle like on a reply
export const toggleLikeReplyApi = async (commentId, replyId) => {
  return await axiosInstance.post(`/comments/${commentId}/replies/${replyId}/like`);
};

// Delete a comment (owner or admin)
export const deleteCommentApi = async (commentId) => {
  return await axiosInstance.delete(`/comments/${commentId}`);
};

// Delete a reply (owner or admin)
export const deleteReplyApi = async (commentId, replyId) => {
  return await axiosInstance.delete(`/comments/${commentId}/replies/${replyId}`);
};

// ── Admin moderation ──────────────────────────────────────────────────

// List ALL comments across ALL reports (admin only), paginated & searchable
export const getAllCommentsAdminApi = async (params = {}) => {
  return await axiosInstance.get('/comments/admin/all', { params });
};

// Hide / restore a comment without deleting it (admin only)
export const moderateCommentApi = async (commentId, status) => {
  return await axiosInstance.patch(`/comments/${commentId}/status`, { status });
};

// Hide / restore a single reply without deleting it (admin only)
export const moderateReplyApi = async (commentId, replyId, status) => {
  return await axiosInstance.patch(`/comments/${commentId}/replies/${replyId}/status`, { status });
};

// List reports that have at least one comment, with comment/reply stats — paginated & searchable (admin only)
export const getAdminReportsWithCommentsApi = async (params = {}) => {
  return await axiosInstance.get('/comments/admin/reports', { params });
};

// Full comment + reply thread (any status) for a single report, oldest -> newest (admin only)
export const getReportCommentsAdminApi = async (reportId) => {
  return await axiosInstance.get(`/comments/admin/report/${reportId}`);
};