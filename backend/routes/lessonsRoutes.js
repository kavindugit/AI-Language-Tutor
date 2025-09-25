import express from "express";
import { addLesson, listLessons, completeLesson } from "../controllers/lessonController.js";
import userAuth from "../middleware/userAuth.js";

const lessonRouter = express.Router();
lessonRouter.use(userAuth);

lessonRouter.get("/", listLessons);
lessonRouter.post("/", addLesson);
lessonRouter.put("/:id/complete", completeLesson);

export default lessonRouter;
