import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  lessonId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  done: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const lessonModel = mongoose.models.lesson || mongoose.model("Lesson", lessonSchema);
export default lessonModel;
