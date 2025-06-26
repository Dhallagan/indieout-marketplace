#!/bin/bash

echo "Starting API container..."
docker run -d --name indieout-health-test \
  -p 8080:8080 \
  -e RAILS_ENV=production \
  -e RACK_ENV=production \
  -e PORT=8080 \
  -e RAILS_MASTER_KEY=$(cat api/config/master.key 2>/dev/null || echo "dummy_key") \
  -e DB_HOST=localhost \
  -e DB_NAME=test \
  -e DB_USERNAME=test \
  -e DB_PASSWORD=test \
  -e GCS_BUCKET=test-bucket \
  -e GCP_PROJECT_ID=indieout \
  indieout-api-test

echo "Waiting for API to start..."
sleep 10

echo "Testing health endpoints..."
echo ""

echo "1. Simple health check (/health):"
curl -s -w "\nHTTP Status: %{http_code}\n" http://localhost:8080/health

echo ""
echo "2. API health check (/api/v1/health):"
curl -s -w "\nHTTP Status: %{http_code}\n" http://localhost:8080/api/v1/health | jq . 2>/dev/null || cat

echo ""
echo "3. Rails health check (/up):"
curl -s -w "\nHTTP Status: %{http_code}\n" http://localhost:8080/up

echo ""
echo "Container logs:"
docker logs --tail 20 indieout-health-test

echo ""
echo "Stopping container..."
docker stop indieout-health-test > /dev/null
docker rm indieout-health-test > /dev/null

echo "Done!"