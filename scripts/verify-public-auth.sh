#!/bin/bash
# Verify public-domain login + session + dashboard through the tunnel.
BASE=https://ruvicode.com

TOKEN=$(curl -s -X POST "$BASE/api/auth/sign-in/email" \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@ruvicode.com","password":"ruvicode-test-123"}' \
  -D - -o /dev/null | grep -i 'set-cookie' | sed 's/set-cookie: //I;s/;.*//' | head -1)

if [ -z "$TOKEN" ]; then echo "LOGIN FAILED"; exit 1; fi
echo "login via https://ruvicode.com: ok (session cookie issued)"

printf 'dashboard with session: '
curl -s -o /dev/null -w '%{http_code}\n' -H "Cookie: $TOKEN" "$BASE/dashboard"

printf 'dashboard playground chat (SSE): '
curl -s -N --max-time 60 -H "Cookie: $TOKEN" \
  -H 'Content-Type: application/json' \
  -X POST "$BASE/api/dashboard/playground/chat" \
  -d '{"model":"deepseek-v4-flash","messages":[{"role":"user","content":"Say OK"}],"max_tokens":2000}' \
  -o .tunnel-pg.txt
echo "lines=$(wc -l < .tunnel-pg.txt), errors=$(grep -c 'Something went wrong' .tunnel-pg.txt || true)"
rm -f .tunnel-pg.txt
