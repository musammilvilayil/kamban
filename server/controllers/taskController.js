import Task from "../models/Task.js";

const allowedUpdates = ["title", "assignee", "status", "date", "deadline"];

export const getTasks = async (_req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    const tasks = await Task.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(error.name === "ValidationError" ? 400 : 500).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedUpdates.includes(key)),
    );

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "No valid task fields supplied" });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.set("Cache-Control", "no-store");
    res.status(200).json(task);
  } catch (error) {
    res.status(error.name === "ValidationError" ? 400 : 500).json({
      message: "Failed to update task",
      error: error.message,
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task deleted", id: task._id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error: error.message });
  }
};
