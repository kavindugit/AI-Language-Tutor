// backend/config/mongodb.js
import mongoose from "mongoose";

let dbReady = false;               // <-- readiness flag
export const getDbReady = () => dbReady;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing in environment");

  // Connection event hooks keep the readiness flag accurate
  mongoose.connection.on("connected", () => {
    dbReady = true;
    console.log("✅ MongoDB connected");
  });

  mongoose.connection.on("error", (err) => {
    dbReady = false;
    console.error("❌ MongoDB error:", err?.message);
  });

  mongoose.connection.on("disconnected", () => {
    dbReady = false;
    console.warn("⚠️ MongoDB disconnected");
  });

  // Connect (works for local and Atlas SRV URIs)
  await mongoose.connect(uri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
  });

  return mongoose.connection;
};

export default connectDB;
