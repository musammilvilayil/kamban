import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import aiRoutes from "./routes/aiRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Reuse a single connection across warm serverless invocations.
const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) return;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from environment variables");
  }

  await mongoose.connect(process.env.MONGO_URI);
};

app.use(async (_req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);

export { connectDatabase };
export default app;
