// backend/middleware/upload.js
import multer from "multer";

const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 25);

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_UPLOAD_MB * 1024 * 1024,
  },
});
