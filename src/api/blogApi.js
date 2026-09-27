import axiosInstance from './axiosInstance';

/**
 * Blog (আর্টিকেল/সচেতনতামূলক লেখা) API — ghush অ্যাপের "Report" (অভিযোগ) থেকে
 * আলাদা কনটেন্ট টাইপ। প্যাটার্ন reportApi.js এর সাথে সামঞ্জস্যপূর্ণ।
 */

// সব ব্লগ পোস্ট (search, category, page, limit)
export const getBlogsApi = async (params = {}) => {
  return await axiosInstance.get('/blogs', { params });
};

// একটা নির্দিষ্ট ব্লগ পোস্ট
export const getBlogByIdApi = async (id) => {
  return await axiosInstance.get(`/blogs/${id}`);
};

// নতুন ব্লগ পোস্ট তৈরি (admin)
export const createBlogApi = async (blogData) => {
  return await axiosInstance.post('/blogs', blogData);
};

// ব্লগ পোস্ট আপডেট (admin)
export const updateBlogApi = async (id, updatedFields) => {
  return await axiosInstance.put(`/blogs/${id}`, updatedFields);
};

// ব্লগ পোস্ট ডিলিট (admin)
export const deleteBlogApi = async (id) => {
  return await axiosInstance.delete(`/blogs/${id}`);
};

// ব্লগ পোস্টে রিয়েক্ট (like, love, angry, sad, wow) — Facebook-style, DB-তে সেভ হয়
export const reactToBlogApi = async (id, payload) => {
  return await axiosInstance.post(`/blogs/${id}/react`, payload);
};

// কে কোন রিয়েক্ট দিয়েছে — তালিকা (Facebook-style "who reacted" list)
export const getBlogReactorsApi = async (id) => {
  return await axiosInstance.get(`/blogs/${id}/reactors`);
};
