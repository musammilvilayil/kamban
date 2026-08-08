import Task from "../models/Task.js";

export const getTasks = async (_req, res) => {
  try { res.status(200).json(await Task.find().sort({ createdAt: -1 })); }
  catch (error) { res.status(500).json({ message: "Failed to fetch tasks", error: error.message }); }
};

export const createTask = async (req, res) => {
  try { res.status(201).json(await Task.create(req.body)); }
  catch (error) { res.status(error.name === "ValidationError" ? 400 : 500).json({ message: "Failed to create task", error: error.message }); }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
  } catch (error) { res.status(error.name === "ValidationError" ? 400 : 500).json({ message: "Failed to update task", error: error.message }); }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task deleted", id: task._id });
  } catch (error) { res.status(500).json({ message: "Failed to delete task", error: error.message }); }
};
