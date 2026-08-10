import mongoose from "mongoose";
import OpenAI from "openai";
import Task from "../../server/models/Task.js";

const STATUSES = ["TO DO", "IN PROGRESS", "PAUSED", "SUBMITTED", "APPROVED"];
const allowedTaskFields = ["title", "assignee", "status", "date", "deadline"];
const weekdays = { sunday:0, monday:1, tuesday:2, wednesday:3, thursday:4, friday:5, saturday:6 };

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  },
  body: JSON.stringify(body),
});

const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing");
  await mongoose.connect(process.env.MONGO_URI);
};

const getPath = (event) => {
  let path = event.path || event.rawUrl || "/";
  path = path.replace(/^https?:\/\/[^/]+/, "");
  path = path.replace(/^\/\.netlify\/functions\/api/, "");
  if (!path.startsWith("/")) path = `/${path}`;
  if (!path.startsWith("/api/")) path = `/api${path}`;
  return path.split("?")[0];
};

const parseBody = (event) => {
  if (!event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); }
  catch { throw Object.assign(new Error("Request body must be valid JSON"), { statusCode: 400 }); }
};

const cleanTaskPayload = (body) => {
  const payload = Object.fromEntries(
    Object.entries(body || {}).filter(([key]) => allowedTaskFields.includes(key)),
  );
  if (typeof payload.title === "string") payload.title = payload.title.trim();
  if (typeof payload.assignee === "string") payload.assignee = payload.assignee.trim() || "Unassigned";
  if (payload.deadline === "") payload.deadline = null;
  return payload;
};

const toYmd = (date) => date.toISOString().slice(0,10);
const resolveRelativeDeadline = (prompt) => {
  const text = String(prompt || "").toLowerCase();
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

export const handler = async (event) => {
  try {
    const method = (event.httpMethod || "GET").toUpperCase();
    const path = getPath(event);
    await connectDatabase();

    if (method === "GET" && path === "/api/health") return json(200, { status: "ok" });

    if (method === "GET" && path === "/api/tasks") {
      const tasks = await Task.find().sort({ createdAt: -1 }).lean();
      return json(200, tasks);
    }

    if (method === "POST" && path === "/api/tasks") {
      const payload = cleanTaskPayload(parseBody(event));
      if (!payload.title) return json(400, { message: "Task title is required" });
      if (payload.status && !STATUSES.includes(payload.status)) return json(400, { message: "Invalid task status" });
      const task = await Task.create({
        ...payload,
        assignee: payload.assignee || "Unassigned",
        status: payload.status || "TO DO",
      });
      return json(201, task);
    }

    const taskMatch = path.match(/^\/api\/tasks\/([^/]+)$/);
    if (taskMatch && method === "PUT") {
      const payload = cleanTaskPayload(parseBody(event));
      if (!Object.keys(payload).length) return json(400, { message: "No valid task fields supplied" });
      if (payload.status && !STATUSES.includes(payload.status)) return json(400, { message: "Invalid task status" });
      if (Object.prototype.hasOwnProperty.call(payload, "title") && !payload.title) return json(400, { message: "Task title is required" });

      const task = await Task.findByIdAndUpdate(
        taskMatch[1],
        { $set: payload },
        { new: true, runValidators: true },
      );
      if (!task) return json(404, { message: "Task not found" });
      return json(200, task);
    }

    if (taskMatch && method === "DELETE") {
      const task = await Task.findByIdAndDelete(taskMatch[1]);
      if (!task) return json(404, { message: "Task not found" });
      return json(200, { message: "Task deleted", id: task._id });
    }

    if (method === "POST" && path === "/api/ai/parse") {
      const { prompt } = parseBody(event);
      const cleanPrompt = String(prompt || "").trim();
      if (!cleanPrompt) return json(400, { message: "Prompt is required" });
      if (!process.env.OPENAI_API_KEY) return json(500, { message: "OPENAI_API_KEY is missing" });

      const today = new Date().toISOString().slice(0,10);
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `Today is ${today}. Convert the request into one task. Return JSON only as {"taskTitle":"...","assignee":"...","deadline":"YYYY-MM-DD or null"}. Deadline wording such as "by Monday" must NOT appear in taskTitle. Use "Unassigned" if no assignee is named. A weekday deadline always means the next future occurrence; if today is Monday, "by Monday" means the Monday 7 days later.`,
          },
          { role: "user", content: cleanPrompt },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) return json(502, { message: "AI returned an empty response" });

      let parsed;
      try { parsed = JSON.parse(content); }
      catch { return json(502, { message: "AI returned invalid JSON" }); }

      const taskTitle = String(parsed.taskTitle || "").trim();
      const assignee = String(parsed.assignee || "Unassigned").trim() || "Unassigned";
      const deterministicDeadline = resolveRelativeDeadline(cleanPrompt);
      const deadline = deterministicDeadline || (parsed.deadline ? String(parsed.deadline).slice(0,10) : null);
      if (!taskTitle) return json(502, { message: "AI did not return a task title" });

      const task = await Task.create({ title: taskTitle, assignee, deadline, status: "TO DO" });
      return json(201, task);
    }

    return json(404, { message: `API route not found: ${method} ${path}` });
  } catch (error) {
    console.error("Netlify API error:", error);
    const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);
    return json(statusCode, {
      message: error.name === "ValidationError" ? "Task validation failed" : "Server request failed",
      error: error.message,
    });
  }
};
