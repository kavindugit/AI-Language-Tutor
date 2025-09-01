// backend/routes/systemRoutes.js
import express from "express";
import { healthCheck, readinessCheck, versionInfo } from "../controllers/systemController.js";

const systemRouter = express.Router();

// Health / readiness / version endpoints
systemRouter.get("/healthz", healthCheck);
systemRouter.get("/readyz", readinessCheck);
systemRouter.get("/version", versionInfo);

export default systemRouter;
