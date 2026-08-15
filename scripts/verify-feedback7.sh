#!/bin/bash
# Verify feedback batch: badges, capability filter, showcase, copy.
BASE=http://localhost:8081
H='Host: localhost'

echo "== playground badges =="
curl -s -H "$H" "$BASE/playground" -o .p.html
echo "Free badge: $(grep -c '>Free<' .p.html)"
echo "Unlimited badge: $(grep -c '>Unlimited<' .p.html)"
echo "Other models gone: $(grep -c 'Other models' .p.html)"
echo "Sign up cta gone: $(grep -c 'Sign up for unlimited' .p.html)"

echo "== 99% copy =="
curl -s -H "$H" "$BASE/models" -o .m.html
echo "how-pricing 99%: $(grep -c 'Save up to 99% vs list price' .m.html)"
echo "browse link is next Link (no raw <a href): $(grep -c '<a href="/models"' .m.html)"

echo "== vision filter accuracy (DeepSeek/GLM must NOT appear) =="
V=$(curl -s -H "$H" "$BASE/models?type=vision")
echo "deepseek in vision: $(echo "$V" | grep -ci 'DeepSeek V4' || true)"
echo "glm in vision: $(echo "$V" | grep -ci 'GLM-5' || true)"
echo "kimi in vision: $(echo "$V" | grep -c 'Kimi K' || true)"
echo "claude in vision: $(echo "$V" | grep -c 'Claude' || true)"

echo "== landing showcase flagship per brand =="
curl -s -H "$H" "$BASE/" -o .h.html
for m in 'Claude Opus 5' 'GPT-5.6 Sol' 'Grok 4.5' 'GLM-5.2' 'Kimi K3' 'DeepSeek V4 Flash 0731'; do
  printf '  %s: %s\n' "$m" "$(grep -c "$m" .h.html)"
done

rm -f .p.html .m.html .h.html
