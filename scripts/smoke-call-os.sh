#!/usr/bin/env bash
set -euo pipefail

PORT=4173
LOG=/tmp/babel-call-http.log
DOM=/tmp/babel-call-dom.html

python3 -m http.server "$PORT" --bind 127.0.0.1 >"$LOG" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT
sleep 1

CHROME=""
for candidate in google-chrome-stable google-chrome chromium chromium-browser; do
  if command -v "$candidate" >/dev/null 2>&1; then CHROME="$candidate"; break; fi
done
if [[ -z "$CHROME" ]]; then
  echo "Chrome/Chromium não encontrado no runner."
  exit 1
fi

"$CHROME" \
  --headless=new \
  --no-sandbox \
  --disable-gpu \
  --disable-dev-shm-usage \
  --virtual-time-budget=19000 \
  --dump-dom "http://127.0.0.1:${PORT}/" > "$DOM"

HTML_TAG="$(grep -o '<html[^>]*>' "$DOM" | head -1 || true)"
echo "RUNTIME HTML: $HTML_TAG"

for marker in \
  'data-call-core-mounted="1"' \
  'data-call-revolution-script-executed="1"' \
  'data-call-theater-script-executed="1"' \
  'data-call-thesis-script-executed="1"' \
  'data-call-focus-script-executed="1"' \
  'data-call-ego-script-executed="1"' \
  'data-call-radar-deep-script-executed="1"'; do
  if ! grep -q "$marker" "$DOM"; then
    echo "SMOKE FAIL: script/runtime marker ausente: $marker"
    exit 1
  fi
done

for marker in \
  'data-call-revolution-mounted="1"' \
  'data-call-theater-mounted="1"' \
  'data-call-thesis-mounted="1"' \
  'data-call-focus-mounted="1"' \
  'data-call-ego-mounted="1"' \
  'data-call-radar-deep-mounted="1"' \
  'data-call-radar-deep-cards="5"' \
  'data-call-focus-sections="4"'; do
  if ! grep -q "$marker" "$DOM"; then
    echo "SMOKE FAIL: mounted marker ausente: $marker"
    exit 1
  fi
done

for selector_marker in \
  'id="callFocusRoot"' \
  'id="callEgoRevolution"' \
  'id="egoStage"' \
  'id="egoQuestion"' \
  'id="thesisCopySection"' \
  'id="callRadarSection"' \
  'id="radarDeepList"' \
  'id="callArenaSection"'; do
  if ! grep -q "$selector_marker" "$DOM"; then
    echo "SMOKE FAIL: elemento essencial ausente: $selector_marker"
    exit 1
  fi
done

if ! grep -q '01 · A REVOLUÇÃO DO EGO' "$DOM"; then echo "SMOKE FAIL: headline Ego Revolution ausente."; exit 1; fi
if ! grep -q 'As 5 melhores oportunidades do digital e do físico.' "$DOM"; then echo "SMOKE FAIL: headline Deep Radar ausente."; exit 1; fi
if ! grep -q 'H2O Empreendimentos e Soluções Imobiliárias' "$DOM"; then echo "SMOKE FAIL: ranking digital não renderizou."; exit 1; fi
if ! grep -q 'Uma ligação. <em>Uma tese.</em> Quatro movimentos.' "$DOM"; then echo "SMOKE FAIL: headline Focus OS ausente."; exit 1; fi

echo "SMOKE OK: quatro seções preservadas; Ego Revolution e Deep Call Radar montaram no DOM real."
