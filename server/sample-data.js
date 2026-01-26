/**
 * Sample script to populate the database with test data
 * Run with: node sample-data.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'logs_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

const sampleLogs = [
  {
    level: 'info',
    message: 'Application started successfully',
    resourceId: 'server-1',
    timestamp: new Date('2024-01-01T10:00:00Z'),
    traceId: 'trace-abc123',
    spanId: 'span-001',
    commit: 'abc123def456',
    metadata: { environment: 'production', version: '1.0.0' }
  },
  {
    level: 'error',
    message: 'Failed to connect to database',
    resourceId: 'server-1',
    timestamp: new Date('2024-01-01T10:05:00Z'),
    traceId: 'trace-abc123',
    spanId: 'span-002',
    commit: 'abc123def456',
    metadata: { errorCode: 'DB_CONN_ERR', retryCount: 3 }
  },
  {
    level: 'warn',
    message: 'High memory usage detected',
    resourceId: 'server-2',
    timestamp: new Date('2024-01-01T10:10:00Z'),
    traceId: 'trace-xyz789',
    spanId: 'span-003',
    commit: 'def456ghi789',
    metadata: { memoryUsage: '85%', threshold: '80%' }
  },
  {
    level: 'info',
    message: 'User authentication successful',
    resourceId: 'auth-service',
    timestamp: new Date('2024-01-01T10:15:00Z'),
    traceId: 'trace-usr001',
    spanId: 'span-004',
    commit: 'abc123def456',
    metadata: { userId: 'user-123', method: 'oauth' }
  },
  {
    level: 'debug',
    message: 'Processing request',
    resourceId: 'api-gateway',
    timestamp: new Date('2024-01-01T10:20:00Z'),
    traceId: 'trace-req001',
    spanId: 'span-005',
    commit: 'def456ghi789',
    metadata: { endpoint: '/api/users', method: 'GET' }
  }
];

async function insertSampleData() {
  try {
    console.log('Inserting sample logs...');
    
    for (const log of sampleLogs) {
      const query = `
        INSERT INTO logs (level, message, resource_id, timestamp, trace_id, span_id, commit, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;
      
      const values = [
        log.level,
        log.message,
        log.resourceId,
        log.timestamp,
        log.traceId,
        log.spanId,
        log.commit,
        JSON.stringify(log.metadata)
      ];
      
      const result = await pool.query(query, values);
      console.log(`Inserted log with ID: ${result.rows[0].id}`);
    }
    
    console.log('Sample data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error inserting sample data:', error);
    process.exit(1);
  }
}

insertSampleData();
