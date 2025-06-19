const multer = require('multer');

// Configure multer for MEMORY STORAGE ONLY (ImageKit integration)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Only allow image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed! Please upload JPG, PNG, GIF, or WebP files.'), false);
  }
};

const avatarUpload = multer({
  storage: storage, // Memory storage - NO disk writes
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit
    files: 1, // Single file only
  },
  fileFilter: fileFilter,
});

module.exports = avatarUpload;
