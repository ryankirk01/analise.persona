#!/usr/bin/env bash
set -euo pipefail
PORT=4174
LOG=/tmp/babel-digital-http.log
DOM=/tmp/babel-digital-dom.html
VISIBLE=/tmp/babel-digital-visible.html
python3 -m http.server "$PORT" --bind 127.0.0.1 >"$LOG" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT
sleep 1
CHROME=""
for candidate in google-chrome-stable google-chrome chromium chromium-browser; do
  if command -v "$candidate" >/dev/null 2>&1; then CHROME="$candidate"; break; fi
done
if [[ -z "$CHROME" ]]; then echo "Chrome/Chromium não encontrado."; exit 1; fi
"$CHROME" --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage --virtual-time-budget=7000 --dump-dom "http://127.0.0.1:${PORT}/digital.html" > "$DOM"
# digital.html has its executable script at the end. Everything before it is the visible DOM,
# including nodes inserted by that script; cutting there prevents counting template literals.
sed '/<script>/,$d' "$DOM" > "$VISIBLE"
for marker in 'MERCADO' 'DIGITAL' '02 · 40 EMPRESAS' '03 · MAPA DE OPORTUNIDADE' '04 · ARQUÉTIPOS DO DIGITAL' 'id="matrix"' 'id="companyList"'; do
  if ! grep -q "$marker" "$VISIBLE"; then echo "DIGITAL SMOKE FAIL: ausente $marker"; exit 1; fi
done
COUNT=$(grep -o 'class="company"' "$VISIBLE" | wc -l | tr -d ' ')
if [[ "$COUNT" != "40" ]]; then echo "DIGITAL SMOKE FAIL: esperado 40 empresas renderizadas, encontrado $COUNT"; exit 1; fi
DOTS=$(grep -o 'class="dot"' "$VISIBLE" | wc -l | tr -d ' ')
if [[ "$DOTS" != "40" ]]; then echo "DIGITAL SMOKE FAIL: esperado 40 pontos renderizados na matriz, encontrado $DOTS"; exit 1; fi
if ! grep -q 'R$42,7B' "$VISIBLE"; then echo "DIGITAL SMOKE FAIL: métrica macro não renderizou"; exit 1; fi
echo "DIGITAL SMOKE OK: 40 empresas, 40 pontos e inteligência de mercado renderizaram no Chrome."
