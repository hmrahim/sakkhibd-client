import axiosInstance from './axiosInstance';

/**
 * Sync Firebase user to MongoDB backend
 * Signup or login howar pore call kora hoy
 */
export const syncUserToBackend = (payload) =>
  axiosInstance.post('/users/sync', payload);

/**
 * Firebase UID diye user profile fetch kora
 */
export const fetchUserProfile = (uid) =>
  axiosInstance.get('/users/me/' + uid);
