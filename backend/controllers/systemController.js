// backend/controllers/systemController.js

const startedAt = Date.now();

export const healthCheck = (req, res) => {
  res.status(200).json({
    ok: true,
    uptime: Math.floor((Date.now() - startedAt) / 1000),
  });
};

import { getDbReady } from "../config/mongodb.js";

export const readinessCheck = (req, res) => {
  const dbReady = getDbReady();
  if (!dbReady) {
    return res.status(503).json({ ready: false, db: "connecting" });
  }
  return res.status(200).json({ ready: true, db: "connected" });
};

export const versionInfo = (req, res) => {
  res.json({
    version: process.env.APP_VERSION || "0.1.0",
    env: process.env.NODE_ENV || "development",
    commit: process.env.GIT_COMMIT || "dev",
    buildTime: process.env.BUILD_TIME || new Date().toISOString(),
  });
};
