const multer = require('multer');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const fileUploadMiddleware = multer({
  limits: 500000,
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    const error = isValid ? null : new Error('Invalid mime type');
    cb(error, isValid);
  },
});

module.exports = fileUploadMiddleware;