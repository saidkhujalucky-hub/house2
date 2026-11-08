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
  properties: (params={}) => request('/properties?'+new URLSearchParams(params)),
  myProperties: token => request('/properties/mine',{token}),
  createProperty: (token,body) => request('/properties',{method:'POST',token,body}),
  deleteProperty: (token,id) => request('/properties/'+encodeURIComponent(id),{method:'DELETE',token}),
  getFavorites: token => request('/favorites',{token}),
  addFavorite: (token,id) => request('/favorites/'+encodeURIComponent(id),{method:'POST',token}),
  removeFavorite: (token,id) => request('/favorites/'+encodeURIComponent(id),{method:'DELETE',token}),
  inquiries: token => request('/properties/inquiries/received',{token}),
  sendInquiry: (token,id,body) => request('/properties/'+encodeURIComponent(id)+'/inquiries',{method:'POST',token,body}),
  uploadImages: async (token,id,body) => {
    const response=await fetch(API_BASE_URL+'/properties/'+encodeURIComponent(id)+'/images',{method:'POST',headers:{Authorization:'Bearer '+token},body});
    const result=await response.json().catch(()=>null);
    if(!response.ok)throw new ApiError(Array.isArray(result?.message)?result.message.join(' • '):(result?.message||'Rasm yuklash xatosi'),response.status);
    return result;
  },

};
