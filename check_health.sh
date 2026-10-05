#!/usr/bin/env bash
# Health + error check for the quiz app.
# Usage:  bash scripts/check_health.sh https://your-app.onrender.com
# Exit code 0 = healthy, 1 = problem (so a pipeline can turn red and send an email).
set -u
URL="${1:-}"
URL="${URL%/}"
[ -n "$URL" ] || { echo "Usage: $0 BASE_URL"; exit 2; }

out=$(curl -sS --max-time 90 -w '\n%{http_code} %{time_total}' "$URL/healthz") \
  || { echo "FAIL: cannot reach $URL"; exit 1; }
body=$(echo "$out" | head -n1)
meta=$(echo "$out" | tail -n1)
code=${meta% *}
secs=${meta#* }
echo "health check -> HTTP $code in ${secs}s : $body"

[ "$code" = "200" ] || { echo "FAIL: health check returned HTTP $code"; exit 1; }
echo "$body" | grep -q '"status": "ok"' || { echo "FAIL: status is not ok"; exit 1; }

metrics=$(curl -sS --max-time 30 "$URL/metrics") || { echo "FAIL: /metrics not reachable"; exit 1; }
errors=$(echo "$metrics" | awk '/^quiz_errors_total/{print $2}')
reqs=$(echo "$metrics" | awk '/^quiz_requests_total/{print $2}')
echo "requests so far = ${reqs:-?}, server errors so far = ${errors:-?}"

if [ "${errors:-0}" -ge "${MAX_ERRORS:-5}" ]; then
  echo "FAIL: too many server errors (${errors} >= ${MAX_ERRORS:-5})"
  exit 1
fi
echo "OK: app is healthy"
