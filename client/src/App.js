import React, { useState, useEffect } from 'react';
import './App.css';
import LogIngestion from './components/LogIngestion';
import LogQuery from './components/LogQuery';
import LogStats from './components/LogStats';

function App() {
  const [activeTab, setActiveTab] = useState('query');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Log Ingestion & Querying System</h1>
        <nav className="nav-tabs">
          <button
            className={activeTab === 'query' ? 'active' : ''}
            onClick={() => setActiveTab('query')}
          >
            Query Logs
          </button>
          <button
            className={activeTab === 'ingest' ? 'active' : ''}
            onClick={() => setActiveTab('ingest')}
          >
            Ingest Logs
          </button>
          <button
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
        </nav>
      </header>

      <main className="App-main">
        {activeTab === 'query' && <LogQuery />}
        {activeTab === 'ingest' && <LogIngestion />}
        {activeTab === 'stats' && <LogStats />}
      </main>
    </div>
  );
}

export default App;
