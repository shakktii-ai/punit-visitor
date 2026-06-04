import { v2 as cloudinary } from 'cloudinary';

// Configure cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a base64 string to Cloudinary.
 * If the string is already a URL or is empty, it returns the string as is.
 * @param {string} base64Str - The image string (could be base64 or a URL)
 * @param {string} folder - The folder to upload to in Cloudinary
 * @returns {Promise<string>} The secure URL of the uploaded image
 */
export const uploadToCloudinary = async (base64Str, folder = 'visitors') => {
  if (!base64Str) return base64Str;
  
  // If it's already a URL (e.g. starts with http), return it directly
  if (base64Str.startsWith('http://') || base64Str.startsWith('https://')) {
    return base64Str;
  }
  
  // If it's not a base64 image data string, return it as is
  if (!base64Str.startsWith('data:image/')) {
    return base64Str;
  }

  try {
    const res = await cloudinary.uploader.upload(base64Str, {
      folder,
    });
    return res.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Image upload failed: ${error.message || error}`);
  }
};
