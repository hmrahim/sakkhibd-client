/**
 * Upload single or multiple images to ImgBB
 * API Key is read from env or fallback to provided key
 */

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || 'd637fcd727b7cf596b8be8804cc06d86';

export const uploadSingleImageToImgBB = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (data && data.success) {
    return data.data.url;
  } else {
    throw new Error(data?.error?.message || 'Failed to upload image to ImgBB');
  }
};

export const uploadMultipleImagesToImgBB = async (fileList) => {
  if (!fileList || fileList.length === 0) return [];
  
  const uploadPromises = fileList.map((item) => {
    // If it's already a URL string
    if (typeof item === 'string') return Promise.resolve(item);
    // If it has file property
    const file = item.file || item;
    return uploadSingleImageToImgBB(file);
  });

  return await Promise.all(uploadPromises);
};
