// backend/controllers/vocabController.js
import Vocab from "../models/vocabModel.js";
import { nanoid } from "nanoid";

export const addVocab = async (req, res) => {
  const { term, meaning } = req.body;
  const userId = req.userId;   // ✅ comes from userAuth
  try {
    const exists = await Vocab.findOne({ userId, term });
    if (exists) {
      return res.json({ success: false, message: "Already exists" });
    }

    const vocabId = nanoid(10);   // ✅ generate ID here

    const vocab = await Vocab.create({
      vocabId,
      userId,
      term,
      meaning,
      strength: 0.1,
    });

    return res.json({ success: true, vocab });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const listVocab = async (req, res) => {
  const userId = req.userId;
  const vocab = await Vocab.find({ userId });
  res.json({ success: true, vocab });
};

export const reviewWeakest = async (req, res) => {
  const userId = req.userId;
  const weakest = await Vocab.find({ userId }).sort({ strength: 1 }).limit(1);
  res.json({ success: true, weakest: weakest[0] || null });
};
