const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function get(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error('Request failed: ' + res.status);
  return res.json();
}

export const fetchSessions = () => get('/api/sessions');
export const fetchSessionEvents = (id) => get(`/api/sessions/${encodeURIComponent(id)}/events`);
export const fetchPages = () => get('/api/pages');
export const fetchHeatmap = (url) => get(`/api/heatmap?url=${encodeURIComponent(url)}`);
