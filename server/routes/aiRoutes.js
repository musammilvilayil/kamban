import express from "express";
import OpenAI from "openai";
import Task from "../models/Task.js";

const router = express.Router();

const weekdays = { sunday:0, monday:1, tuesday:2, wednesday:3, thursday:4, friday:5, saturday:6 };
const toYmd = (date) => date.toISOString().slice(0,10);

const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw Object.assign(new Error("OPENAI_API_KEY is missing from server/.env"), { statusCode: 500 });
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const resolveRelativeDeadline = (prompt) => {
  const text = prompt.toLowerCase();
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  if (/\bby tomorrow\b|\btomorrow\b/.test(text)) {
    const d = new Date(today); d.setUTCDate(d.getUTCDate()+1); return toYmd(d);
  }

  const match = text.match(/\b(?:by|before|on)\s+(?:next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
  if (match) {
    const target = weekdays[match[1]];
    let diff = (target - today.getUTCDay() + 7) % 7;
    if (diff === 0) diff = 7;
    const d = new Date(today); d.setUTCDate(d.getUTCDate()+diff); return toYmd(d);
  }

  return null;
};

router.post("/parse", async (req, res) => {
  try {
    const prompt = req.body?.prompt?.trim();
    if (!prompt) return res.status(400).json({ message: "Prompt is required" });

    const openai = getOpenAI();
    const today = new Date().toISOString().slice(0,10);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        { role: "system", content: `Today is ${today}. Convert the request into one task. Return JSON only as {"taskTitle":"...","assignee":"...","deadline":"YYYY-MM-DD or null"}. Remove deadline wording such as "by Monday" from taskTitle. Use "Unassigned" if no assignee is named. For a weekday such as "by Monday", always use the next future occurrence; if today is Monday, use the Monday 7 days later.` },
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
    const deterministicDeadline = resolveRelativeDeadline(prompt);
    const deadline = deterministicDeadline || (parsed.deadline ? String(parsed.deadline).slice(0,10) : null);
    if (!taskTitle) return res.status(502).json({ message: "AI did not return a task title" });

    const task = await Task.create({ title: taskTitle, assignee, deadline, status: "TO DO" });
    res.status(201).json(task);
  } catch (error) {
    console.error("AI parse error:", error);
    res.status(error.statusCode || 500).json({ message: "Failed to parse task with AI", error: error.message });
  }
});

export default router;
