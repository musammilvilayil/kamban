const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const request = async (path, options = {}) => {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
  } catch {
    throw new Error("Cannot reach the API. Check the deployment and network connection.");
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : null;

  if (!response.ok) {
    if (data?.message) throw new Error(data.message);
    if (response.status === 404) throw new Error("API route not found. The backend deployment needs to be updated.");
    if (response.status >= 500) throw new Error("Server error. Check the database/API deployment configuration.");
    throw new Error(`Request failed (${response.status})`);
  }

  if (!data) {
    throw new Error("The API returned an invalid response. Check the backend routing configuration.");
  }

  return data;
};

export const taskApi = {
  getAll: () => request("/tasks"),
  create: (payload) =>
    request("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    request(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  remove: (id) =>
    request(`/tasks/${id}`, {
      method: "DELETE",
    }),
  parseWithAI: (prompt) =>
    request("/ai/parse", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    }),
};
