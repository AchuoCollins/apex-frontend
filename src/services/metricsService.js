import { apiFetch } from './api';

export const metricsService = {
  save:      (data)        => apiFetch('/metrics', { method: 'POST', body: JSON.stringify(data) }),
  list:      ()            => apiFetch('/metrics'),
  get:       ()            => apiFetch('/metrics'),
  latest:    ()            => apiFetch('/metrics/latest'),
  getById:   (id)          => apiFetch(`/metrics/${id}`),
  update:    (id, data)    => apiFetch(`/metrics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove:    (id)          => apiFetch(`/metrics/${id}`, { method: 'DELETE' }),
};
