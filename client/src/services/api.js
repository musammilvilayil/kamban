const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, { headers: { "Content-Type": "application/json", ...options.headers }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};
export const taskApi = {
  getAll: () => request("/tasks"),
  create: (payload) => request("/tasks", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
  parseWithAI: (prompt) => request("/ai/parse", { method: "POST", body: JSON.stringify({ prompt }) }),
};
