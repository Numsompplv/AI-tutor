
const BASE_URL = "http://localhost:8000";

// ── Helper ──
const request = async (method, path, body = null, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Something went wrong");
  return data;
};

// ── Auth ──
export const authAPI = {
  register: (username, email, phone, password, provider) =>
    request("POST", "/api/auth/register", { username, email, phone, password, provider }),

  login: (identifier, password) =>
    request("POST", "/api/auth/login", { identifier, password }),

  googleSignIn: (name, email, avatar) =>
    request("POST", "/api/auth/google", { name, email, avatar }),

  getMe: (token) =>
    request("GET", "/api/auth/me", null, token),

  updateProfile: (token, data) =>
    request("PUT", "/api/auth/me", data, token),
};

// ── Token storage ──
export const saveToken = (token) => localStorage.setItem("token", token);
export const getToken = () => localStorage.getItem("token");
export const clearToken = () => localStorage.removeItem("token");
