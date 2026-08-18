#!/usr/bin/env bash
# verify-seo.sh — ADR-029 §7 verification harness (self-owned).
#
# Layer A: curl-based page-level checks (title, description, canonical,
#          OG, twitter, JSON-LD validity + expected types, noindex).
# Layer B: official Google Lighthouse score gate (seo=1, perf>=0.95).
#
# Usage:
#   BASE_URL=http://localhost:18080 bash scripts/verify-seo.sh        # page checks (local)
#   BASE_URL=https://ruvicode.com bash scripts/verify-seo.sh          # page checks (public)
#   bash scripts/verify-seo.sh --lighthouse                           # + Lighthouse score gate
#
# Exits non-zero on any failure. No third-party SEO dependency; the
# assertions are owned here so they can be read and extended.
set -u

BASE_URL="${BASE_URL:-http://localhost:18080}"
RUN_LH=0
[ "${1:-}" = "--lighthouse" ] && RUN_LH=1
PY=python3
if ! "$PY" -c "pass" >/dev/null 2>&1; then PY=python; fi
FAIL=0

# path|expected_jsonld_types|expect_og|expect_noindex
PAGES=(
  "/|Organization,WebSite,FAQPage|1|0"
  "/models|BreadcrumbList,ItemList|1|0"
  "/models/glm-5.2|Product,BreadcrumbList|1|0"
  "/playground|BreadcrumbList|1|0"
  "/calculator|BreadcrumbList|1|0"
  "/blog|BreadcrumbList|1|0"
  "/blog/ruvicode-vs-openrouter|BlogPosting,BreadcrumbList|1|0"
  "/blog/tag/pricing|BreadcrumbList|1|0"
  "/docs/quickstart|BreadcrumbList|1|0"
  "/integrations|BreadcrumbList|1|0"
  "/status|BreadcrumbList|0|1"
  "/legal/privacy||1|0"
  "/legal/terms||1|0"
  "/legal/refund||1|0"
  "/login||0|1"
)

check_page() {
  local path="$1" want="$2" og="$3" nidx="$4"
  local html
  html="$(curl -s --max-time 25 "$BASE_URL$path")"
  if [ -z "$html" ]; then echo "FAIL $path: empty response"; FAIL=1; return; fi

  grep -q "<title" <<<"$html" || { echo "FAIL $path: no <title>"; FAIL=1; }
  grep -q 'name="description"' <<<"$html" || { echo "FAIL $path: no meta description"; FAIL=1; }
  # Canonical is required on indexable pages; noindex pages (auth, status) may omit it.
  if [ "$nidx" = "0" ]; then
    grep -q 'rel="canonical"' <<<"$html" || { echo "FAIL $path: no canonical"; FAIL=1; }
  fi

  if [ "$og" = "1" ]; then
    for t in og:title og:description og:url og:image; do
      grep -q "property=\"$t\"" <<<"$html" || { echo "FAIL $path: missing $t"; FAIL=1; }
    done
    grep -q 'name="twitter:card"' <<<"$html" || { echo "FAIL $path: missing twitter:card"; FAIL=1; }
  fi
  if [ "$nidx" = "1" ]; then
    grep -q 'content="noindex' <<<"$html" || { echo "FAIL $path: missing noindex"; FAIL=1; }
  fi

  if [ -n "$want" ]; then
    local out
    out="$(printf '%s' "$html" | "$PY" -c "
import sys, re, json
html = sys.stdin.read()
want = set(sys.argv[1].split(','))
blocks = re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', html, re.S)
found = set()
for b in blocks:
    try:
        d = json.loads(b)
    except Exception as e:
        print('INVALID:' + str(e)); sys.exit(0)
    t = d.get('@type')
    if isinstance(t, list): found.update(t)
    elif t: found.add(t)
missing = want - found
print('OK' if not missing else 'MISSING:' + ','.join(sorted(missing)))
" "$want")"
    if [ "$out" != "OK" ]; then echo "FAIL $path: JSON-LD $out"; FAIL=1; fi
  fi
}

for row in "${PAGES[@]}"; do
  IFS='|' read -r path want og nidx <<<"$row"
  check_page "$path" "$want" "$og" "$nidx"
done

# robots.txt: must exist, reference a sitemap, and not disallow AI crawlers.
ROBOTS="$(curl -s --max-time 25 "$BASE_URL/robots.txt")"
grep -qi "sitemap:" <<<"$ROBOTS" || { echo "FAIL robots.txt: no sitemap reference"; FAIL=1; }
for bot in "Google-Extended" "GPTBot" "OAI-SearchBot" "ChatGPT-User" "ClaudeBot" "PerplexityBot"; do
  if grep -qi "Disallow:.*$bot" <<<"$ROBOTS"; then echo "FAIL robots.txt: disallows $bot"; FAIL=1; fi
done

# sitemap.xml: parseable and contains the core public routes (absolute URLs).
SITEMAP="$(curl -s --max-time 25 "$BASE_URL/sitemap.xml")"
for u in "https://ruvicode.com</loc>" "https://ruvicode.com/models</loc>" "https://ruvicode.com/blog</loc>" "https://ruvicode.com/docs</loc>"; do
  grep -qF "$u" <<<"$SITEMAP" || { echo "FAIL sitemap.xml: missing $u"; FAIL=1; }
done

# Layer B: official Google Lighthouse score gate.
if [ "$RUN_LH" = "1" ]; then
  echo "Running Lighthouse score gate (seo=1, perf>=0.95)..."
  for u in "/" "/models" "/blog/ruvicode-vs-openrouter" "/docs/quickstart"; do
    # chrome-launcher's temp-dir cleanup throws EPERM on Windows after the
    # report is written; the JSON is what we assert on, so tolerate that.
    npx lighthouse "$BASE_URL$u" \
      --only-categories=seo,performance \
      --chrome-flags="--headless --no-sandbox" \
      --output=json --output-path=/tmp/lh.json >/dev/null 2>&1 || true
    "$PY" -c "
import json
d = json.load(open('/tmp/lh.json'))
seo = d['categories']['seo']['score']
perf = d['categories']['performance']['score']
print(f'$u: seo={seo} perf={perf}')
if seo < 1: raise SystemExit('SEO score below 1')
if perf < 0.95: raise SystemExit('performance below 0.95')
" || FAIL=1
  done
fi

if [ "$FAIL" = "1" ]; then echo "SEO VERIFY: FAILED ($BASE_URL)"; exit 1; fi
echo "SEO VERIFY: PASS ($BASE_URL)"
