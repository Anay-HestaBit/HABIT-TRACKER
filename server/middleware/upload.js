const multer = require('multer');
const path = require('path');

// FIX: Use memoryStorage instead of diskStorage.
// Render's free tier has an ephemeral filesystem — files written to disk
// disappear on restarts and are not shared across instances.
// With memoryStorage, file bytes stay in memory as req.file.buffer
// and are streamed directly to Cloudinary — no disk involved.
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;
