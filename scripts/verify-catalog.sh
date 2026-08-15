#!/bin/bash
# Verify curated catalog: 30 models only, brands, type filter.
BASE=http://localhost:8081
H='Host: localhost'

echo "== /models (catalog) =="
curl -s -H "$H" "$BASE/models" -o .m.html
echo "model count shown: $(grep -oE '[0-9]+ models available' .m.html | head -1)"
echo "non-curated leak (e2ee/llama/qwen3): $(grep -cE 'e2ee-|llama-|qwen3' .m.html)"
echo "brand filter options: $(grep -oE 'Anthropic|OpenAI|Google|DeepSeek|Z\.ai|xAI|Moonshot|MiniMax' .m.html | sort -u | tr '\n' ' ')"
echo "masked-provider-as-brand leak: $(grep -cE 'provider-(label|filter)|>[Pp]rovider<' .m.html)"
echo "type pills: $(grep -oE '>(text|reasoning|vision|tools|code)<' .m.html | sort -u | tr '\n' ' ')"
echo "curated present (claude-opus-5, glm-5.1): $(grep -oE 'Claude Opus 5|GLM-5\.1' .m.html | sort -u | tr '\n' ' ')"

echo
echo "== type filter = reasoning =="
curl -s -H "$H" "$BASE/models?type=reasoning" -o .t.html
echo "count: $(grep -oE '[0-9]+ models available' .t.html | head -1)"

echo
echo "== detail page brand =="
curl -s -H "$H" "$BASE/models/glm-5.2" -o .d.html
echo "title brand: $(grep -oE 'GLM-5.2 API' .d.html | head -1)"
echo "shows Z.ai anywhere: $(grep -c 'Z\.ai' .d.html)"

rm -f .m.html .t.html .d.html
