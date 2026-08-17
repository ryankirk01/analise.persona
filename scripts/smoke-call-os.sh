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
  --virtual-time-budget=14000 \
  --dump-dom "http://127.0.0.1:${PORT}/" > "$DOM"

HTML_TAG="$(grep -o '<html[^>]*>' "$DOM" | head -1 || true)"
echo "RUNTIME HTML: $HTML_TAG"

for marker in \
  'data-call-core-mounted="1"' \
  'data-call-revolution-script-executed="1"' \
  'data-call-theater-script-executed="1"' \
  'data-call-thesis-script-executed="1"'; do
  if ! grep -q "$marker" "$DOM"; then
    echo "SMOKE FAIL: script/runtime marker ausente: $marker"
    exit 1
  fi
done

for marker in \
  'data-call-revolution-mounted="1"' \
  'data-call-theater-mounted="1"' \
  'data-call-thesis-mounted="1"'; do
  if ! grep -q "$marker" "$DOM"; then
    echo "SMOKE FAIL: mounted marker ausente: $marker"
    if grep -q 'data-call-revolution-error=' "$DOM"; then echo "Revolution registrou erro no <html>."; fi
    if grep -q 'data-call-theater-error=' "$DOM"; then echo "Theater registrou erro no <html>."; fi
    if grep -q 'data-call-thesis-error=' "$DOM"; then echo "Thesis registrou erro no <html>."; fi
    exit 1
  fi
done

for selector_marker in \
  'id="callTheaterStage"' \
  'id="thesisCopySection"' \
  'id="thesisBlockLab"' \
  'id="callRadarSection"' \
  'id="callRadarGrid"' \
  'id="callArenaSection"' \
  'id="arenaOptions"' \
  'id="callHumanCodeSection"'; do
  if ! grep -q "$selector_marker" "$DOM"; then
    echo "SMOKE FAIL: elemento montado ausente: $selector_marker"
    exit 1
  fi
done

if ! grep -q 'COPY PRINCIPAL · TESE' "$DOM"; then
  echo "SMOKE FAIL: tese principal não apareceu no DOM."
  exit 1
fi
if ! grep -q 'CALL RADAR' "$DOM"; then
  echo "SMOKE FAIL: Call Radar não apareceu no DOM."
  exit 1
fi
if ! grep -q 'CALL ARENA' "$DOM"; then
  echo "SMOKE FAIL: Call Arena não apareceu no DOM."
  exit 1
fi

echo "SMOKE OK: Core -> Revolution -> Soul -> Thesis OS executaram; Copy Principal, Radar e Arena estão montados no DOM real."
