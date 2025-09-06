// backend/routes/aiRoutes.js
import express from "express";
import { upload } from "../middleware/upload.js";
import { ocrProxy } from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.post("/ocr", upload.single("file"), ocrProxy);

export default aiRouter;
