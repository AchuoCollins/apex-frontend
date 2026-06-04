import { apiFetch } from './api';

export const authService = {
  register: (data) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login:    (data) => apiFetch('/auth/login',    { method: 'POST', body: JSON.stringify(data) }),
  refresh:  (refresh_token) => apiFetch('/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token }) }),
  logout:   (refresh_token) => apiFetch('/auth/logout',  { method: 'POST', body: JSON.stringify({ refresh_token }) }),
  me:       ()     => apiFetch('/users/me'),
  updateMe: (data) => apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
};
