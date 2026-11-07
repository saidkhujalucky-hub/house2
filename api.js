const config = window.MARKETPLACE_CONFIG || {};
const API_BASE_URL = String(config.apiBaseUrl || 'http://localhost:3000').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, token } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new ApiError(`Backendga ulana olmadik (${API_BASE_URL}). Server ishlayotganini tekshiring.`);
  }
  let data = null;
  try { data = await response.json(); } catch { /* empty response */ }
  if (!response.ok) {
    const detail = Array.isArray(data?.message) ? data.message.join(' • ') : data?.message;
    throw new ApiError(detail || `So‘rov bajarilmadi (HTTP ${response.status})`, response.status);
  }
  return data;
}

export const api = {
  baseUrl: API_BASE_URL,
  health: () => request('/categories'),
  categories: () => request('/categories'),
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  authMe: (token) => request('/auth/me', { token }),
  profile: (token) => request('/users/me', { token }),
  editProfile: (token, body) => request('/users/me', { method: 'PATCH', token, body }),
  addCategory: (token, body) => request('/categories', { method: 'POST', token, body }),
  editCategory: (token, id, body) => request(`/categories/${encodeURIComponent(id)}`, { method: 'PATCH', token, body }),
  deleteCategory: (token, id) => request(`/categories/${encodeURIComponent(id)}`, { method: 'DELETE', token }),
};
