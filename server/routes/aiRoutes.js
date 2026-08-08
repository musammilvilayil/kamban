import express from "express";
import OpenAI from "openai";
import Task from "../models/Task.js";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/parse", async (req, res) => {
  try {
    const prompt = req.body?.prompt?.trim();
    if (!prompt) return res.status(400).json({ message: "Prompt is required" });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        { role: "system", content: 'Convert the user request into one task. Return JSON only with this exact shape: {"taskTitle":"...","assignee":"..."}. Use "Unassigned" when no assignee is clearly provided. Keep taskTitle concise and actionable.' },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return res.status(502).json({ message: "AI returned an empty response" });

    let parsed;
    try { parsed = JSON.parse(content); }
    catch { return res.status(502).json({ message: "AI returned invalid JSON" }); }

    const taskTitle = String(parsed.taskTitle || "").trim();
    const assignee = String(parsed.assignee || "Unassigned").trim() || "Unassigned";
    if (!taskTitle) return res.status(502).json({ message: "AI did not return a task title" });

    const task = await Task.create({ title: taskTitle, assignee, status: "TO DO" });
    res.status(201).json(task);
  } catch (error) {
    console.error("AI parse error:", error);
    res.status(500).json({ message: "Failed to parse task with AI", error: error.message });
  }
});

export default router;
