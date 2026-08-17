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
"$CHROME" --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage --virtual-time-budget=8000 --dump-dom "http://127.0.0.1:${PORT}/digital.html" > "$DOM"
sed '/<script>/,$d' "$DOM" > "$VISIBLE"
for marker in 'MERCADO' 'DIGITAL' '02 · INTELIGÊNCIA POR SETOR' '03 · MAPA DE OPORTUNIDADE DIGITAL' '04 · 40 EMPRESAS' 'id="sectorGrid"' 'id="matrix"' 'id="companyList"'; do
  if ! grep -q "$marker" "$VISIBLE"; then echo "DIGITAL SMOKE FAIL: ausente $marker"; exit 1; fi
done
SECTORS=$(grep -o 'data-sector-card' "$VISIBLE" | wc -l | tr -d ' ')
if [[ "$SECTORS" != "12" ]]; then echo "DIGITAL SMOKE FAIL: esperado 12 setores renderizados, encontrado $SECTORS"; exit 1; fi
DOTS=$(grep -o 'class="sector-dot"' "$VISIBLE" | wc -l | tr -d ' ')
if [[ "$DOTS" != "12" ]]; then echo "DIGITAL SMOKE FAIL: esperado 12 setores na matriz, encontrado $DOTS"; exit 1; fi
COMPANIES=$(grep -o 'data-company-card' "$VISIBLE" | wc -l | tr -d ' ')
if [[ "$COMPANIES" != "40" ]]; then echo "DIGITAL SMOKE FAIL: esperado 40 empresas renderizadas, encontrado $COMPANIES"; exit 1; fi
if ! grep -q 'R$42,7B' "$VISIBLE"; then echo "DIGITAL SMOKE FAIL: métrica macro não renderizou"; exit 1; fi
if ! grep -q 'Agências de Performance &amp; Tráfego' "$VISIBLE"; then echo "DIGITAL SMOKE FAIL: setor Performance ausente"; exit 1; fi
if ! grep -q 'SaaS, Software &amp; Cloud' "$VISIBLE"; then echo "DIGITAL SMOKE FAIL: setor SaaS ausente"; exit 1; fi
echo "DIGITAL SMOKE OK: 12 setores, matriz setorial e 40 empresas renderizaram no Chrome."