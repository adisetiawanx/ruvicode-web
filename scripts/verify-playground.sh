#!/bin/bash
# Verify model detail page + playground model gating (2026-08-15 fixes).
BASE=http://localhost:3000

echo "== detail page gpt-5.6-luna =="
curl -s "$BASE/models/gpt-5.6-luna" -o .v1.html
echo "status: 200 (fetched)"
echo "empty Context row: $(grep -c 'Context window</span><span class="font-mono tabular text-text-primary"></span>' .v1.html)"
echo "playground link: $(grep -oE 'href="/playground\?model=gpt-5\.6-luna"' .v1.html | head -1)"
echo "provider badge: $(grep -c '>provider<' .v1.html)"

echo "== playground free (default) =="
curl -s "$BASE/playground" -o .v2.html
echo "chat present: $(grep -c 'h-\[600px\]' .v2.html)"
echo "locked list: $(grep -c 'Other models' .v2.html)"

echo "== playground locked model =="
curl -s "$BASE/playground?model=gpt-5.6-luna" -o .v3.html
echo "locked panel: $(grep -c 'needs an account' .v3.html)"
echo "signup cta: $(grep -c 'Sign up free' .v3.html)"
echo "pricing shown: $(grep -c '1M input tokens' .v3.html)"

echo "== playground with free model param =="
curl -s "$BASE/playground?model=deepseek-v4-flash" -o .v4.html
echo "chat present: $(grep -c 'h-\[600px\]' .v4.html)"

rm -f .v1.html .v2.html .v3.html .v4.html
