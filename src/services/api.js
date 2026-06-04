const BASE = import.meta.env.VITE_API_URL;

function getToken() {
  try {
    const u = JSON.parse(localStorage.getItem('pa_user') ?? '{}');
    return u.token ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = err.detail;
    const msg = Array.isArray(detail)
      ? detail.map(d => d.msg || JSON.stringify(d)).join(', ')
      : (typeof detail === 'string' ? detail : (detail?.msg ?? res.statusText));

    throw new Error(msg || 'Request failed');
  }

  if (res.status === 204) return null;
  return res.json();
}