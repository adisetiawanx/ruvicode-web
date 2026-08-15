#!/bin/bash
# Verify feedback batch: live showcase, 15/page, playground split + unlimited.
BASE=http://localhost:8081
H='Host: localhost'

echo "== landing showcase (live vs mock) =="
curl -s -H "$H" "$BASE/" -o .h.html
echo "showcase cards: $(grep -c 'View details' .h.html)"
echo "curated names present: $(grep -oE 'DeepSeek V4 Flash 0731|MiniMax M2\.[57]|Kimi K2\.[56]' .h.html | sort -u | tr '\n' ' ')"

echo "== /models 15 per page =="
curl -s -H "$H" "$BASE/models" -o .m.html
echo "cards on page: $(grep -c 'View details' .m.html)"

echo "== playground =="
curl -s -H "$H" "$BASE/playground" -o .p.html
echo "hint copy: $(grep -oE 'Free, no account needed[^<]*' .p.html | head -1)"
echo "free model locked: $(grep -c 'deepseek-v4-flash-0731' .p.html)"

echo "== last request card static =="
echo "zero-state present: $(grep -c 'Last request' .p.html)"

echo "== how pricing works =="
curl -s -H "$H" "$BASE/models" -o .m2.html
echo "new heading: $(grep -oE 'Honest pricing, no catch' .m2.html | head -1)"
echo "old split bar gone: $(grep -c 'Where every dollar' .m2.html)"

rm -f .h.html .m.html .p.html .m2.html
