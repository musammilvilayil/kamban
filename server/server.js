import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import aiRoutes from "./routes/aiRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing from environment variables");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};
startServer();
