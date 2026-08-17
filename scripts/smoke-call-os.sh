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
  --virtual-time-budget=8000 \
  --dump-dom "http://127.0.0.1:${PORT}/" > "$DOM"

for marker in \
  "CALL THEATER" \
  "Venda forte sem perder humanidade" \
  "AUTOENTENDIMENTO" \
  "SIMULAR COM ÁUDIO" \
  "babelCallSoulModule"; do
  if ! grep -q "$marker" "$DOM"; then
    echo "SMOKE FAIL: marcador ausente: $marker"
    echo "--- trechos Babel/Call disponíveis ---"
    grep -o -E '.{0,80}(CALL|Call|BABEL|AUTOENTENDIMENTO).{0,120}' "$DOM" | head -40 || true
    exit 1
  fi
done

echo "SMOKE OK: Call Theater + Código Humano + Autoentendimento montados no DOM real."
