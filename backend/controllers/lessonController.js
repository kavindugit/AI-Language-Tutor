// backend/controllers/lessonController.js
import Lesson from "../models/lessonModel.js";
import { nanoid } from "nanoid";

// Create a new lesson (optional if you want to allow adding custom lessons)
export const addLesson = async (req, res) => {
  const { title } = req.body;
  const userId = req.userId;   // ✅ from middleware

  try {
    const lessonId = nanoid(10);   // generate unique lessonId

    const lesson = await Lesson.create({
      lessonId,
      userId,
      title,
      done: false,
    });

    return res.json({ success: true, lesson });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// List all lessons for the user
export const listLessons = async (req, res) => {
  const userId = req.userId;   // ✅
  try {
    const lessons = await Lesson.find({ userId });
    return res.json({ success: true, lessons });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Mark a lesson as complete
export const completeLesson = async (req, res) => {
  const { id } = req.params;   // lessonId from route param
  const userId = req.userId;

  try {
    const updated = await Lesson.findOneAndUpdate(
      { lessonId: id, userId },
      { $set: { done: true } },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Lesson not found or not owned by user" });
    }

    return res.json({ success: true, lesson: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
