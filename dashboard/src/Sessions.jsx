import { useEffect, useState } from 'react';
import { fetchSessions, fetchSessionEvents } from './api.js';

const fmt = (d) => new Date(d).toLocaleString();

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessions()
      .then(setSessions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function openSession(id) {
    setSelected(id);
    setEvents([]);
    fetchSessionEvents(id)
      .then(setEvents)
      .catch((e) => setError(e.message));
  }

  if (loading) return <p className="muted">Loading sessions...</p>;
  if (error) return <p className="error">{error}</p>;
  if (sessions.length === 0) {
    return <p className="muted">No sessions yet. Open tracker/demo.html and click around.</p>;
  }

  return (
    <div className="two-col">
      <section>
        <h2>Sessions</h2>
        <table>
          <thead>
            <tr>
              <th>Session</th>
              <th>Events</th>
              <th>Last seen</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr
                key={s.session_id}
                className={selected === s.session_id ? 'selected' : ''}
                onClick={() => openSession(s.session_id)}
              >
                <td className="mono">{s.session_id}</td>
                <td>{s.event_count}</td>
                <td>{fmt(s.last_seen)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>User journey</h2>
        {!selected && <p className="muted">Select a session to see its events.</p>}
        {selected && events.length === 0 && <p className="muted">Loading events...</p>}
        <ol className="journey">
          {events.map((e) => (
            <li key={e._id}>
              <span className={'tag ' + e.type}>{e.type === 'click' ? 'click' : 'page view'}</span>
              <div>
                <div className="mono small">{e.url}</div>
                <div className="muted small">
                  {fmt(e.timestamp)}
                  {e.type === 'click' && ` · x: ${Math.round(e.x)}, y: ${Math.round(e.y)}`}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
