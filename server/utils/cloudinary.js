const cloudinary = require('cloudinary').v2;
const logger = require('./logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * FIX: Accepts a Buffer instead of a file path.
 * Uses upload_stream so we never write to disk — required because
 * Render's free tier has an ephemeral filesystem and multer now uses memoryStorage.
 *
 * @param {Buffer} fileBuffer  - File bytes from multer's memoryStorage (req.file.buffer)
 * @param {string} folder      - Cloudinary destination folder
 * @returns {Promise<string>}  - Secure URL of the uploaded image
 */
const uploadToCloudinary = (fileBuffer, folder = 'profile_pics') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          return reject(new Error('Failed to upload image to Cloudinary'));
        }
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

module.exports = { uploadToCloudinary };
