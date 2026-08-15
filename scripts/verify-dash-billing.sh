#!/bin/bash
# Prove the dashboard playground bills the user's key through the gateway,
# even when the requested model is the one freedom serves for free.
BASE=https://ruvicode.com

TOKEN=$(curl -s -X POST "$BASE/api/auth/sign-in/email" \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@ruvicode.com","password":"ruvicode-test-123"}' \
  -D - -o /dev/null | grep -i 'set-cookie' | sed 's/set-cookie: //I;s/;.*//' | head -1)

echo "login: ok"
echo "--- sending glm-5.2 via DASHBOARD playground..."
curl -s -N --max-time 90 -X POST "$BASE/api/dashboard/playground/chat" \
  -H "Cookie: $TOKEN" -H 'Content-Type: application/json' \
  -d '{"model":"glm-5.2","messages":[{"role":"user","content":"Say OK"}],"max_tokens":100}' \
  -o .dash-pg.txt
echo "stream lines: $(wc -l < .dash-pg.txt)"
grep -o '"model":"[^"]*"' .dash-pg.txt | head -1
rm -f .dash-pg.txt
