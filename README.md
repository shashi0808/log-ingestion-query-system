# Log Ingestion and Querying System

A full-stack application for ingesting, storing, and querying logs with a modern web interface.

## Features

- **Log Ingestion**: Single and bulk log ingestion via REST API
- **Advanced Querying**: Filter logs by level, resource ID, trace ID, commit, date range, and text search
- **Real-time Statistics**: View log statistics by level with date filtering
- **Modern UI**: Responsive React frontend with intuitive interface
- **Scalable Backend**: Node.js/Express API with PostgreSQL database
- **Docker Support**: Easy deployment with Docker Compose

## Tech Stack

### Backend
- Node.js with Express.js
- PostgreSQL database
- RESTful API design

### Frontend
- React 18
- Axios for API calls
- React DatePicker for date selection
- Modern CSS with responsive design

### Infrastructure
- Docker & Docker Compose
- PostgreSQL 15

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+ (or use Docker)
- Docker and Docker Compose (optional, for containerized deployment)

## Installation

### Option 1: Local Development

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**:
   ```bash
   npm run install-all
   ```

3. **Set up PostgreSQL database**:
   - Create a database named `logs_db`
   - Update `server/.env` with your database credentials (or use the defaults)

4. **Configure environment variables**:
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Start the backend server**:
   ```bash
   cd server
   npm run dev
   ```

6. **Start the frontend** (in a new terminal):
   ```bash
   cd client
   npm start
   ```

7. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Option 2: Docker Deployment

1. **Build and start all services**:
   ```bash
   docker-compose up -d
   ```

2. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

3. **View logs**:
   ```bash
   docker-compose logs -f
   ```

4. **Stop services**:
   ```bash
   docker-compose down
   ```

## API Endpoints

### Health Check
- `GET /health` - Check server status

### Log Ingestion
- `POST /api/logs` - Ingest a single log
  ```json
  {
    "level": "info",
    "message": "Log message",
    "resourceId": "resource-123",
    "timestamp": "2024-01-01T00:00:00Z",
    "traceId": "trace-123",
    "spanId": "span-123",
    "commit": "abc123",
    "metadata": {"key": "value"}
  }
  ```

- `POST /api/logs/bulk` - Bulk ingest logs
  ```json
  {
    "logs": [
      {
        "level": "info",
        "message": "Log 1",
        "timestamp": "2024-01-01T00:00:00Z"
      },
      {
        "level": "error",
        "message": "Log 2",
        "timestamp": "2024-01-01T00:00:01Z"
      }
    ]
  }
  ```

### Log Querying
- `GET /api/logs` - Query logs with filters
  - Query parameters:
    - `level` - Filter by log level (error, warn, info, debug)
    - `resourceId` - Filter by resource ID
    - `traceId` - Filter by trace ID
    - `commit` - Filter by commit hash
    - `startDate` - Start date (ISO format)
    - `endDate` - End date (ISO format)
    - `search` - Search in message and resource ID
    - `page` - Page number (default: 1)
    - `limit` - Results per page (default: 100)

- `GET /api/logs/:id` - Get a specific log by ID

- `GET /api/logs/stats` - Get log statistics
  - Query parameters:
    - `startDate` - Start date (ISO format)
    - `endDate` - End date (ISO format)

## Database Schema

```sql
CREATE TABLE logs (
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
);
```

## Sample Data

To populate the database with sample logs for testing:

```bash
cd server
node sample-data.js
```

This will insert 5 sample logs with various levels and metadata.

## Usage Examples

### Ingest a Log via API

```bash
curl -X POST http://localhost:5000/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "level": "info",
    "message": "User logged in",
    "resourceId": "server-1",
    "timestamp": "2024-01-01T12:00:00Z",
    "traceId": "trace-abc123",
    "commit": "abc123def"
  }'
```

### Query Logs

```bash
curl "http://localhost:5000/api/logs?level=error&startDate=2024-01-01T00:00:00Z&page=1&limit=10"
```

### Get Statistics

```bash
curl "http://localhost:5000/api/logs/stats?startDate=2024-01-01T00:00:00Z"
```

## Project Structure

```
assign_project/
├── server/                 # Backend API
│   ├── index.js           # Main server file
│   ├── package.json       # Backend dependencies
│   └── Dockerfile         # Docker configuration
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── package.json       # Frontend dependencies
│   └── Dockerfile         # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
├── package.json           # Root package.json
└── README.md             # This file
```

## Development

### Running in Development Mode

```bash
# From root directory
npm run dev
```

This will start both the backend and frontend concurrently.

### Backend Development

```bash
cd server
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development

```bash
cd client
npm start  # Starts React development server
```

## Production Deployment

1. Build the frontend:
   ```bash
   cd client
   npm run build
   ```

2. Set production environment variables in `server/.env`

3. Start the backend:
   ```bash
   cd server
   npm start
   ```

Or use Docker Compose for production deployment.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
# log-ingestion-query-system
.
