import { useEffect, useState } from 'react';
import { fetchPages, fetchHeatmap } from './api.js';

export default function Heatmap() {
  const [pages, setPages] = useState([]);
  const [url, setUrl] = useState('');
  const [clicks, setClicks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPages()
      .then((list) => {
        setPages(list);
        if (list.length) setUrl(list[0]);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!url) return;
    fetchHeatmap(url)
      .then(setClicks)
      .catch((e) => setError(e.message));
  }, [url]);

  if (error) return <p className="error">{error}</p>;
  if (pages.length === 0) return <p className="muted">No pages tracked yet.</p>;

  // Each dot is placed as a percentage of the page size it was recorded on,
  // so clicks from different screen sizes line up on the same canvas.
  const maxW = Math.max(1000, ...clicks.map((c) => c.page_width || 0));
  const maxH = Math.max(600, ...clicks.map((c) => c.page_height || 0));
  const ratio = Math.min(Math.max(maxH / maxW, 0.4), 3);

  return (
    <div>
      <div className="toolbar">
        <label>
          Page{' '}
          <select value={url} onChange={(e) => setUrl(e.target.value)}>
            {pages.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
        <span className="muted">{clicks.length} clicks</span>
      </div>

      <div className="heatmap" style={{ aspectRatio: `1 / ${ratio}` }}>
        {clicks.map((c, i) => (
          <span
            key={i}
            className="dot"
            style={{
              left: `${(c.x / (c.page_width || maxW)) * 100}%`,
              top: `${(c.y / (c.page_height || maxH)) * 100}%`,
            }}
          />
        ))}
        {clicks.length === 0 && <p className="muted empty">No clicks recorded for this page.</p>}
      </div>
    </div>
  );
}
