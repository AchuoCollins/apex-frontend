import { apiFetch } from './api';

export const trainingService = {
  generate: (payload) => apiFetch('/training/generate', { method: 'POST', body: JSON.stringify(payload) }),
  list:     ()        => apiFetch('/training'),
  get:      ()        => apiFetch('/training'),
  getById:  (id)      => apiFetch(`/training/${id}`),
  create:   (data)    => apiFetch('/training', { method: 'POST', body: JSON.stringify(data) }),
  update:   (id, d)   => apiFetch(`/training/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  remove:   (id)      => apiFetch(`/training/${id}`, { method: 'DELETE' }),
  pdfUrl:   (id)      => `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'}/training/${id}/pdf`,
};
