import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: [true, "Task title is required"], trim: true },
  assignee: { type: String, default: "Unassigned", trim: true },
  status: { type: String, enum: ["TO DO", "IN PROGRESS", "PAUSED", "SUBMITTED", "APPROVED"], default: "TO DO" },
  date: { type: Date, default: Date.now },
  deadline: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
