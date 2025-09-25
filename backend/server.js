import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";


import chatRouter from "./routes/chatRoutes.js";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRouter.js";
import systemRouter from "./routes/systemRoutes.js"; 
import { notFound, errorHandler } from "./middleware/errorHandlers.js";
import aiRouter from "./routes/aiRoutes.js";
import vocabRouter from "./routes/vocabRoutes.js";
import lessonRouter from "./routes/lessonsRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());


app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));


app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 120, // requests per IP
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use("/api/system", systemRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/ai", aiRouter);   
app.use("/chat", chatRouter);  // chat routes
app.use("/api/vocab", vocabRouter); // vocab routes
app.use("/api/lessons", lessonRouter); // lessons routes

app.use(notFound);
app.use(errorHandler);


app.listen(PORT, async () => {
  console.log(`✅ API listening on http://localhost:${PORT}`);
  try {
    await connectDB();
  } catch (err) {
    console.error("❌ DB connection error:", err?.message);
  }
});
