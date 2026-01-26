import React, { useState } from 'react';
import axios from 'axios';

const LogIngestion = () => {
  const [formData, setFormData] = useState({
    level: 'info',
    message: '',
    resourceId: '',
    timestamp: new Date().toISOString(),
    traceId: '',
    spanId: '',
    commit: '',
    metadata: '',
  });
  const [bulkData, setBulkData] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        level: formData.level,
        message: formData.message,
        resourceId: formData.resourceId || undefined,
        timestamp: formData.timestamp,
        traceId: formData.traceId || undefined,
        spanId: formData.spanId || undefined,
        commit: formData.commit || undefined,
        metadata: formData.metadata
          ? JSON.parse(formData.metadata)
          : undefined,
      };

      await axios.post('/api/logs', payload);
      setMessage({ type: 'success', text: 'Log ingested successfully!' });
      setFormData({
        level: 'info',
        message: '',
        resourceId: '',
        timestamp: new Date().toISOString(),
        traceId: '',
        spanId: '',
        commit: '',
        metadata: '',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to ingest log',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let logs;
      try {
        logs = JSON.parse(bulkData);
      } catch (e) {
        throw new Error('Invalid JSON format');
      }

      if (!Array.isArray(logs)) {
        throw new Error('Bulk data must be an array of logs');
      }

      const response = await axios.post('/api/logs/bulk', { logs });
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: `Successfully ingested ${response.data.count || logs.length} logs!`,
        });
        setBulkData('');
      } else {
        throw new Error('Bulk ingest failed');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || error.message || 'Failed to bulk ingest logs',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Ingest Logs</h2>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Level *</label>
            <select name="level" value={formData.level} onChange={handleChange} required>
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>

          <div className="form-group">
            <label>Timestamp *</label>
            <input
              type="datetime-local"
              name="timestamp"
              value={formData.timestamp.slice(0, 16)}
              onChange={(e) =>
                setFormData({ ...formData, timestamp: new Date(e.target.value).toISOString() })
              }
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Message *</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Enter log message"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Resource ID</label>
            <input
              type="text"
              name="resourceId"
              value={formData.resourceId}
              onChange={handleChange}
              placeholder="Optional resource ID"
            />
          </div>

          <div className="form-group">
            <label>Trace ID</label>
            <input
              type="text"
              name="traceId"
              value={formData.traceId}
              onChange={handleChange}
              placeholder="Optional trace ID"
            />
          </div>

          <div className="form-group">
            <label>Span ID</label>
            <input
              type="text"
              name="spanId"
              value={formData.spanId}
              onChange={handleChange}
              placeholder="Optional span ID"
            />
          </div>

          <div className="form-group">
            <label>Commit</label>
            <input
              type="text"
              name="commit"
              value={formData.commit}
              onChange={handleChange}
              placeholder="Optional commit hash"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Metadata (JSON)</label>
          <textarea
            name="metadata"
            value={formData.metadata}
            onChange={handleChange}
            placeholder='{"key": "value"}'
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Ingesting...' : 'Ingest Log'}
        </button>
      </form>

      <div style={{ marginTop: '3rem', borderTop: '2px solid #e0e0e0', paddingTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Bulk Ingest</h3>
        <div className="form-group">
          <label>Logs (JSON Array)</label>
          <textarea
            value={bulkData}
            onChange={(e) => setBulkData(e.target.value)}
            placeholder='[{"level": "info", "message": "Log message", "timestamp": "2024-01-01T00:00:00Z"}, ...]'
            style={{ minHeight: '200px', fontFamily: 'monospace' }}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={handleBulkSubmit}
          disabled={loading || !bulkData}
        >
          {loading ? 'Ingesting...' : 'Bulk Ingest'}
        </button>
      </div>
    </div>
  );
};

export default LogIngestion;
