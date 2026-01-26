#!/bin/bash

echo "=== Testing Log Ingestion and Querying System ==="
echo ""

BASE_URL="http://localhost:5000"

echo "1. Testing Health Endpoint..."
curl -s "$BASE_URL/health" | jq '.' || curl -s "$BASE_URL/health"
echo -e "\n"

echo "2. Ingesting a test log..."
curl -s -X POST "$BASE_URL/api/logs" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "info",
    "message": "Test log from script",
    "resourceId": "test-server",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "traceId": "trace-test-123",
    "commit": "test-commit-abc"
  }' | jq '.' || curl -s -X POST "$BASE_URL/api/logs" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "info",
    "message": "Test log from script",
    "resourceId": "test-server",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }'
echo -e "\n"

echo "3. Querying all logs..."
curl -s "$BASE_URL/api/logs?limit=5" | jq '.' || curl -s "$BASE_URL/api/logs?limit=5"
echo -e "\n"

echo "4. Getting statistics..."
curl -s "$BASE_URL/api/logs/stats" | jq '.' || curl -s "$BASE_URL/api/logs/stats"
echo -e "\n"

echo "=== Testing Complete ==="
