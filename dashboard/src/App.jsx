import { useState } from 'react';
import Sessions from './Sessions.jsx';
import Heatmap from './Heatmap.jsx';

export default function App() {
  const [tab, setTab] = useState('sessions');

  return (
    <div className="app">
      <header className="topbar">
        <h1>User Analytics</h1>
        <nav>
          <button className={tab === 'sessions' ? 'active' : ''} onClick={() => setTab('sessions')}>
            Sessions
          </button>
          <button className={tab === 'heatmap' ? 'active' : ''} onClick={() => setTab('heatmap')}>
            Heatmap
          </button>
        </nav>
      </header>
      <main>{tab === 'sessions' ? <Sessions /> : <Heatmap />}</main>
    </div>
  );
}
