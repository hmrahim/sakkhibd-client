import axios from 'axios';
import { auth } from '../firebase/firebase';
import { getDeviceId } from '../utils/deviceId';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — সবসময় ব্রাউজার device-id পাঠায় (anonymous ট্র্যাকিং), আর
// ইউজার লগইন করা থাকলে সার্ভার-ভেরিফায়েবল Firebase ID Token ও যোগ করে দেয়,
// যাতে ব্যাকএন্ড নির্ভরযোগ্যভাবে বুঝতে পারে কে অনুরোধ করছে।
axiosInstance.interceptors.request.use(
  async (config) => {
    config.headers['X-Device-Id'] = getDeviceId();

    try {
      const currentUser = auth?.currentUser;
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        config.headers['Authorization'] = `Bearer ${idToken}`;
      }
    } catch (e) {
      // টোকেন রিফ্রেশ ব্যর্থ হলেও রিকোয়েস্ট থামানো হয় না — anonymous হিসেবে চলবে
      console.warn('Failed to attach Firebase ID token:', e?.message);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — global error handling
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
