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
  --virtual-time-budget=10000 \
  --dump-dom "http://127.0.0.1:${PORT}/" > "$DOM"

# Estes atributos só surgem depois que o JavaScript executa e monta os módulos.
for marker in \
  'data-call-revolution-mounted="1"' \
  'data-call-theater-mounted="1"'; do
  if ! grep -q "$marker" "$DOM"; then
    echo "SMOKE FAIL: runtime marker ausente: $marker"
    grep -o '<html[^>]*>' "$DOM" | head -1 || true
    exit 1
  fi
done

# Prova adicional de que os elementos montados existem no DOM final.
for selector_marker in \
  'id="callTheaterStage"' \
  'id="callHumanCodeSection"' \
  'class="call-soul-guide"'; do
  if ! grep -q "$selector_marker" "$DOM"; then
    echo "SMOKE FAIL: elemento montado ausente: $selector_marker"
    exit 1
  fi
done

echo "SMOKE OK: Revolution + Call Theater + Código Humano + Autoentendimento executaram e montaram no DOM real."
