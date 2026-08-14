#!/bin/bash
# Verify dashboard renders real data from Postgres (ADR-023 acceptance).
BASE=http://localhost:3000
TOKEN=$(curl -s -X POST $BASE/api/auth/sign-in/email \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@ruvicode.com","password":"ruvicode-test-123"}' \
  -D - -o /dev/null | grep -i 'set-cookie' | sed 's/set-cookie: //I;s/;.*//' | head -1)

if [ -z "$TOKEN" ]; then echo "LOGIN FAILED"; exit 1; fi
echo "login: ok"

curl -s -H "Cookie: $TOKEN" $BASE/dashboard -o .verify-dash.html

empty_charts=$(grep -c 'No usage data yet' .verify-dash.html)
has_charts=$(grep -cE 'recharts-(area|sector)' .verify-dash.html)
balance=$(grep -oE '\$25\.50' .verify-dash.html | head -1)
recent=$(grep -cE '[0-9]+(s|m|h|d) ago' .verify-dash.html)
models=$(grep -oE 'glm-5\.2|deepseek-v4-flash|claude-sonnet-5' .verify-dash.html | sort -u | tr '\n' ' ')
rm -f .verify-dash.html

echo "empty-chart-msgs: $empty_charts"
echo "recharts-elements: $has_charts"
echo "balance-rendered: ${balance:-none}"
echo "recent-activity-rows: $recent"
echo "models-in-breakdown: ${models:-none}"
