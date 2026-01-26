import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const LogQuery = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    level: '',
    resourceId: '',
    traceId: '',
    commit: '',
    search: '',
    startDate: null,
    endDate: null,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 0,
  });

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
        ),
      };

      if (filters.startDate) {
        params.startDate = filters.startDate.toISOString();
      }
      if (filters.endDate) {
        params.endDate = filters.endDate.toISOString();
      }

      const response = await axios.get('/api/logs', { params });
      setLogs(response.data.logs);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching logs:', error);
      alert('Failed to fetch logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    fetchLogs(1);
  };

  const handleReset = () => {
    setFilters({
      level: '',
      resourceId: '',
      traceId: '',
      commit: '',
      search: '',
      startDate: null,
      endDate: null,
    });
    setTimeout(() => fetchLogs(1), 100);
  };

  const getLevelClass = (level) => {
    return level ? level.toLowerCase() : '';
  };

  return (
    <div className="card">
      <h2>Query Logs</h2>

      <div className="form-group">
        <div className="form-row">
          <div>
            <label>Level</label>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>

          <div>
            <label>Resource ID</label>
            <input
              type="text"
              value={filters.resourceId}
              onChange={(e) => handleFilterChange('resourceId', e.target.value)}
              placeholder="Enter resource ID"
            />
          </div>

          <div>
            <label>Trace ID</label>
            <input
              type="text"
              value={filters.traceId}
              onChange={(e) => handleFilterChange('traceId', e.target.value)}
              placeholder="Enter trace ID"
            />
          </div>

          <div>
            <label>Commit</label>
            <input
              type="text"
              value={filters.commit}
              onChange={(e) => handleFilterChange('commit', e.target.value)}
              placeholder="Enter commit hash"
            />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Start Date</label>
            <DatePicker
              selected={filters.startDate}
              onChange={(date) => handleFilterChange('startDate', date)}
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
              onChange={(date) => handleFilterChange('endDate', date)}
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm"
              placeholderText="Select end date"
              className="form-control"
            />
          </div>

          <div>
            <label>Search (Message/Resource ID)</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search in messages..."
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button className="btn btn-primary" onClick={handleSearch}>
            Search
          </button>
          <button className="btn btn-secondary" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading logs...</div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', color: '#666' }}>
            Showing {logs.length} of {pagination.total} logs (Page {pagination.page} of{' '}
            {pagination.totalPages})
          </div>

          {logs.length === 0 ? (
            <div className="loading">No logs found</div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Level</th>
                      <th>Message</th>
                      <th>Resource ID</th>
                      <th>Trace ID</th>
                      <th>Commit</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.id}</td>
                        <td>
                          <span className={`log-level ${getLevelClass(log.level)}`}>
                            {log.level}
                          </span>
                        </td>
                        <td style={{ maxWidth: '400px', wordBreak: 'break-word' }}>
                          {log.message}
                        </td>
                        <td>{log.resource_id || '-'}</td>
                        <td>{log.trace_id || '-'}</td>
                        <td>{log.commit || '-'}</td>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <button
                  onClick={() => fetchLogs(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchLogs(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default LogQuery;
