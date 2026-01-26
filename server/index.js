const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'logs_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Initialize database schema
const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        level VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        resource_id VARCHAR(255),
        timestamp TIMESTAMP NOT NULL,
        trace_id VARCHAR(255),
        span_id VARCHAR(255),
        commit VARCHAR(255),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
      CREATE INDEX IF NOT EXISTS idx_logs_resource_id ON logs(resource_id);
      CREATE INDEX IF NOT EXISTS idx_logs_trace_id ON logs(trace_id);
      CREATE INDEX IF NOT EXISTS idx_logs_commit ON logs(commit);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Initialize database on startup
initDatabase();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Log ingestion service is running' });
});

// Ingest logs endpoint
app.post('/api/logs', async (req, res) => {
  try {
    const { level, message, resourceId, timestamp, traceId, spanId, commit, metadata } = req.body;

    // Validate required fields
    if (!level || !message || !timestamp) {
      return res.status(400).json({
        error: 'Missing required fields: level, message, and timestamp are required'
      });
    }

    const query = `
      INSERT INTO logs (level, message, resource_id, timestamp, trace_id, span_id, commit, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      level,
      message,
      resourceId || null,
      new Date(timestamp),
      traceId || null,
      spanId || null,
      commit || null,
      metadata ? JSON.stringify(metadata) : null
    ];

    const result = await pool.query(query, values);
    res.status(201).json({
      success: true,
      log: result.rows[0]
    });
  } catch (error) {
    console.error('Error ingesting log:', error);
    res.status(500).json({
      error: 'Failed to ingest log',
      message: error.message
    });
  }
});

// Bulk ingest logs endpoint
app.post('/api/logs/bulk', async (req, res) => {
  try {
    const logs = req.body.logs || req.body; // Support both formats

    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({
        error: 'Expected an array of logs'
      });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertedLogs = [];
      for (const log of logs) {
        const { level, message, resourceId, timestamp, traceId, spanId, commit, metadata } = log;

        if (!level || !message || !timestamp) {
          continue; // Skip invalid logs
        }

        const query = `
          INSERT INTO logs (level, message, resource_id, timestamp, trace_id, span_id, commit, metadata)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `;

        const values = [
          level,
          message,
          resourceId || null,
          new Date(timestamp),
          traceId || null,
          spanId || null,
          commit || null,
          metadata ? JSON.stringify(metadata) : null
        ];

        const result = await client.query(query, values);
        insertedLogs.push(result.rows[0]);
      }

      await client.query('COMMIT');
      res.status(201).json({
        success: true,
        count: insertedLogs.length,
        logs: insertedLogs
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error bulk ingesting logs:', error);
    res.status(500).json({
      error: 'Failed to bulk ingest logs',
      message: error.message
    });
  }
});

// Query logs endpoint
app.get('/api/logs', async (req, res) => {
  try {
    const {
      level,
      resourceId,
      traceId,
      startDate,
      endDate,
      search,
      commit,
      page = 1,
      limit = 100
    } = req.query;

    let query = 'SELECT * FROM logs WHERE 1=1';
    const values = [];
    let paramCount = 1;

    // Build dynamic query based on filters
    if (level) {
      query += ` AND level = $${paramCount}`;
      values.push(level);
      paramCount++;
    }

    if (resourceId) {
      query += ` AND resource_id = $${paramCount}`;
      values.push(resourceId);
      paramCount++;
    }

    if (traceId) {
      query += ` AND trace_id = $${paramCount}`;
      values.push(traceId);
      paramCount++;
    }

    if (commit) {
      query += ` AND commit = $${paramCount}`;
      values.push(commit);
      paramCount++;
    }

    if (startDate) {
      query += ` AND timestamp >= $${paramCount}`;
      values.push(new Date(startDate));
      paramCount++;
    }

    if (endDate) {
      query += ` AND timestamp <= $${paramCount}`;
      values.push(new Date(endDate));
      paramCount++;
    }

    if (search) {
      query += ` AND (message ILIKE $${paramCount} OR resource_id ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` ORDER BY timestamp DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(parseInt(limit), offset);

    const result = await pool.query(query, values);

    res.json({
      success: true,
      logs: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error querying logs:', error);
    res.status(500).json({
      error: 'Failed to query logs',
      message: error.message
    });
  }
});

// Get log statistics (must be before /:id route)
app.get('/api/logs/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT 
        level,
        COUNT(*) as count
      FROM logs
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND timestamp >= $${paramCount}`;
      values.push(new Date(startDate));
      paramCount++;
    }

    if (endDate) {
      query += ` AND timestamp <= $${paramCount}`;
      values.push(new Date(endDate));
      paramCount++;
    }

    query += ' GROUP BY level ORDER BY count DESC';

    const result = await pool.query(query, values);

    res.json({
      success: true,
      stats: result.rows
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

// Get log by ID (must be after /stats route)
app.get('/api/logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM logs WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }

    res.json({
      success: true,
      log: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching log:', error);
    res.status(500).json({
      error: 'Failed to fetch log',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
