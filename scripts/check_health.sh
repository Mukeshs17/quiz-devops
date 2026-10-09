#!/bin/bash
set -e

TARGET_URL="${1:-$RENDER_APP_URL}"

if [ -z "$TARGET_URL" ]; then
  echo "Error: Target URL not provided."
  exit 1
fi

echo "Running health check against: $TARGET_URL"

# 1. Check /healthz endpoint
HEALTH_OUTPUT=$(curl -s -w "\n%{http_code}" "$TARGET_URL/healthz" || true)
HTTP_STATUS=$(echo "$HEALTH_OUTPUT" | tail -n1)
BODY=$(echo "$HEALTH_OUTPUT" | sed '$d')

echo "Response code: $HTTP_STATUS"
echo "Payload: $BODY"

if [ "$HTTP_STATUS" -ne 200 ]; then
  echo "ALERT: /healthz returned status $HTTP_STATUS (expected 200)"
  exit 1
fi

# 2. Check /metrics endpoint
METRICS_DATA=$(curl -s "$TARGET_URL/metrics" || echo "{}")
echo "Metrics output: $METRICS_DATA"

ERROR_COUNT=$(echo "$METRICS_DATA" | grep -o '"errors":[14-22]*' | cut -d: -f2 || echo 0)

if [ -n "$ERROR_COUNT" ] && [ "$ERROR_COUNT" -ge 5 ]; then
  echo "ALERT: Server errors reached threshold of $ERROR_COUNT (>= 5)"
  exit 1
fi

echo "Service is healthy and meeting SRE SLOs."
exit 0

