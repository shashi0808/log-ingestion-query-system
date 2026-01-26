import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const LogStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.startDate) {
        params.startDate = filters.startDate.toISOString();
      }
      if (filters.endDate) {
        params.endDate = filters.endDate.toISOString();
      }

      const response = await axios.get('/api/logs/stats', { params });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      alert('Failed to fetch statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalLogs = stats.reduce((sum, stat) => sum + parseInt(stat.count), 0);

  return (
    <div className="card">
      <h2>Log Statistics</h2>

      <div className="form-row" style={{ marginBottom: '2rem' }}>
        <div>
          <label>Start Date</label>
          <DatePicker
            selected={filters.startDate}
            onChange={(date) => setFilters({ ...filters, startDate: date })}
            showTimeSelect
            dateFormat="yyyy-MM-dd HH:mm"
            placeholderText="Select start date"
            className="form-control"
          />
        </div>

        <div>
          <label>End Date</label>
          <DatePicker
            selected={filters.endDate}
            onChange={(date) => setFilters({ ...filters, endDate: date })}
            showTimeSelect
            dateFormat="yyyy-MM-dd HH:mm"
            placeholderText="Select end date"
            className="form-control"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button className="btn btn-primary" onClick={fetchStats}>
            Refresh Stats
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading statistics...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{totalLogs}</h3>
              <p>Total Logs</p>
            </div>
            {stats.map((stat) => (
              <div key={stat.level} className="stat-card">
                <h3>{stat.count}</h3>
                <p>{stat.level.toUpperCase()} Logs</p>
              </div>
            ))}
          </div>

          {stats.length === 0 && (
            <div className="loading">No statistics available</div>
          )}
        </>
      )}
    </div>
  );
};

export default LogStats;
