// backend/routes/vocabRoutes.js
import express from "express";
import { addVocab, listVocab, reviewWeakest } from "../controllers/vocabController.js";
import userAuth from '../middleware/userAuth.js';


const vocabRouter = express.Router();
vocabRouter.use(userAuth);

vocabRouter.get("/", listVocab);
vocabRouter.post("/", addVocab);
vocabRouter.get("/review", reviewWeakest);

export default vocabRouter;
