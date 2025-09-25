import mongoose from "mongoose";

const vocabSchema = new mongoose.Schema({
  vocabId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
  },
  term: {
    type: String,
    required: true,
  },
  meaning: {
    type: String,
    default: "",
  },
  strength: {
    type: Number,
    default: 0.1, // spaced repetition: 0–1
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const vocabModel = mongoose.models.vocab || mongoose.model("Vocab", vocabSchema);
export default vocabModel;
