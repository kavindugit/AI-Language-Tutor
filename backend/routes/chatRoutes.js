import express from "express";
import { chatController } from "../controllers/chatController.js";
const chatRouter = express.Router();

chatRouter.post("/", chatController);

export default chatRouter;
