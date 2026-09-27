const STORAGE_KEY = 'ghush_device_id';

/**
 * প্রতিটা ব্রাউজারের জন্য একটা স্থায়ী, র‍্যান্ডম UUID জেনারেট করে localStorage এ সেভ করে।
 * লগইন না করা ইউজারদের কমেন্ট/রিপ্লাই ট্র্যাক করার জন্য এই আইডি ব্যবহার হয় —
 * কে লাইক করেছে, কে মালিক (এডিট/ডিলিট করতে পারবে কিনা) তা এই আইডি দিয়েই যাচাই হয়।
 * ব্রাউজার/localStorage পরিবর্তন হলে নতুন আইডি জেনারেট হবে (এটা expected — কুকি/ফিঙ্গারপ্রিন্টের
 * মতো ক্রস-ডিভাইস ট্র্যাকিং করা হয় না, প্রাইভেসি সচেতন থেকে)।
 */
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older browsers without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getDeviceId = () => {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = generateUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch (e) {
    // localStorage ব্লক করা থাকলে (প্রাইভেট মোড ইত্যাদি) সেশনের জন্য একটা ইন-মেমরি আইডি ব্যবহার করি
    if (!window.__ghushSessionDeviceId) {
      window.__ghushSessionDeviceId = generateUUID();
    }
    return window.__ghushSessionDeviceId;
  }
};

export default getDeviceId;
