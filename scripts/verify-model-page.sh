#!/bin/bash
# Verify redesigned model page renders correctly (Shiki + new layout).
BASE=http://localhost:3000/models/e2ee-gpt-oss-20b-p
curl -s "$BASE" -o .v.html

echo "shiki colored spans: $(grep -o 'style=\"color:' .v.html | wc -l)"
echo "literal asterisk leak: $(grep -c 'apiKey: \*\*\*\|Bearer \*\*\*' .v.html)"
echo "valid key placeholder: $(grep -c 'rvcd_\.\.\.' .v.html)"
echo "savings pill: $(grep -c '% vs OpenRouter</span>' .v.html)"
echo "price strip cards: $(grep -o '/1M tokens' .v.html | wc -l)"
echo "get started cta: $(grep -c 'Get Started' .v.html)"
echo "all models link: $(grep -c 'All models' .v.html)"
echo "nested pre issue: $(grep -c '<pre[^>]*><pre' .v.html)"
echo "capabilities empty: $(grep -c 'flex flex-wrap gap-2\"></div>' .v.html)"

rm -f .v.html
