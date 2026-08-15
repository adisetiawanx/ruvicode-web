#!/bin/bash
# E2E: dashboard playground through the Docker stack (Caddy -> web -> gateway).
BASE=http://localhost:8081

TOKEN=$(curl -s -X POST -H 'Host: localhost' "$BASE/api/auth/sign-in/email" \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@ruvicode.com","password":"ruvicode-test-123"}' \
  -D - -o /dev/null | grep -i 'set-cookie' | sed 's/set-cookie: //I;s/;.*//' | head -1)

if [ -z "$TOKEN" ]; then echo "LOGIN FAILED"; exit 1; fi
echo "login: ok"

echo "--- dashboard playground chat (stream):"
curl -s -N --max-time 60 -H 'Host: localhost' -H "Cookie: $TOKEN" \
  -H 'Content-Type: application/json' \
  -X POST "$BASE/api/dashboard/playground/chat" \
  -d '{"model":"deepseek-v4-flash","messages":[{"role":"user","content":"Say OK"}],"max_tokens":2000}' \
  -o .pg-stream.txt
echo "stream lines: $(wc -l < .pg-stream.txt)"
echo "error in stream: $(grep -c 'Something went wrong' .pg-stream.txt || true)"
echo "content ok: $(grep -c 'OK' .pg-stream.txt || true)"
echo "leak check: $(grep -icE 'surplus|openrouter|cost_details' .pg-stream.txt || echo 0)"
rm -f .pg-stream.txt
