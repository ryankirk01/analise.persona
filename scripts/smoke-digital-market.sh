#!/usr/bin/env bash
set -euo pipefail
PORT=4174
LOG=/tmp/babel-digital-http.log
DOM=/tmp/babel-digital-dom.html
ROOT=/tmp/babel-digital-smoke-root
rm -rf "$ROOT"
mkdir -p "$ROOT/scripts"
cp digital.html "$ROOT/digital.html"
cp scripts/digital-market-data.js "$ROOT/scripts/digital-market-data.js"
cp scripts/digital-market.js "$ROOT/scripts/digital-market.js"
# Smoke mode preserves all synchronous rendering but stops recurring visual loops after their first frame.
python3 - <<'PY'
from pathlib import Path
p=Path('/tmp/babel-digital-smoke-root/digital.html')
s=p.read_text()
boot="""<script>if(new URLSearchParams(location.search).has('smoke')){window.requestAnimationFrame=()=>0;window.setInterval=(fn)=>{fn();return 0}}</script>"""
s=s.replace('</head>',boot+'\n</head>')
p.write_text(s)
PY
python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$ROOT" >"$LOG" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT
sleep 1
CHROME=""
for candidate in google-chrome-stable google-chrome chromium chromium-browser; do
  if command -v "$candidate" >/dev/null 2>&1; then CHROME="$candidate"; break; fi
done
if [[ -z "$CHROME" ]]; then echo "Chrome/Chromium não encontrado."; exit 1; fi
timeout 30s "$CHROME" --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage --virtual-time-budget=2000 --dump-dom "http://127.0.0.1:${PORT}/digital.html?smoke=1" > "$DOM"

for marker in \
  'BABEL · DIGITAL ECONOMY INTELLIGENCE' \
  '01 · CENTRAL DE DECISÃO' \
  '02 · BABEL LIVE MARKET' \
  '03 · POTENCIAL DE RECEITA' \
  '04 · INTELIGÊNCIA POR SETOR' \
  '05 · ANÁLISE DETALHADA' \
  '06 · PONTOS DE OURO BABEL' \
  '07 · PULSO EMPRESARIAL DIGITAL' \
  '08 · SINAIS DE MERCADO BABEL' \
  '09 · PRÓXIMAS CAMADAS DE INTELIGÊNCIA' \
  '10 · CENÁRIOS DE CAPITAL' \
  '11 · BABEL MUNDO DIGITAL' \
  '12 · FONTES E MÉTODO'; do
  if ! grep -q "$marker" "$DOM"; then echo "DIGITAL SMOKE FAIL: ausente $marker"; exit 1; fi
done

if ! grep -q 'data-digital-world-mounted="1"' "$DOM"; then echo "DIGITAL SMOKE FAIL: engine não montou"; exit 1; fi
if ! grep -q 'data-digital-sector-count="40"' "$DOM"; then echo "DIGITAL SMOKE FAIL: data model não contém 40 setores"; exit 1; fi
if ! grep -q 'data-digital-section-count="12"' "$DOM"; then echo "DIGITAL SMOKE FAIL: esperado 12 capítulos estruturais"; exit 1; fi
ROWS=$(grep -o '<tr data-sector-open=' "$DOM" | wc -l | tr -d ' ')
if [[ "$ROWS" != "40" ]]; then echo "DIGITAL SMOKE FAIL: esperado 40 setores na tabela, encontrado $ROWS"; exit 1; fi
GOLD=$(grep -o '<article><i>0[1-6]</i>' "$DOM" | wc -l | tr -d ' ')
if [[ "$GOLD" -lt "6" ]]; then echo "DIGITAL SMOKE FAIL: Pontos de Ouro não renderizaram"; exit 1; fi
if ! grep -q 'US$ 6,31T' "$DOM"; then echo "DIGITAL SMOKE FAIL: contexto macro global ausente"; exit 1; fi
if ! grep -q 'Agências Full Service &amp; Publicidade' "$DOM"; then echo "DIGITAL SMOKE FAIL: setor de agências ausente"; exit 1; fi
if ! grep -q 'Cybersecurity Platforms &amp; Services' "$DOM"; then echo "DIGITAL SMOKE FAIL: setor de cybersecurity ausente"; exit 1; fi
if ! grep -q 'B2B SaaS' "$DOM"; then echo "DIGITAL SMOKE FAIL: setor SaaS ausente"; exit 1; fi

echo "DIGITAL SMOKE OK: 12 capítulos, 40 setores, análise detalhada, Pontos de Ouro e inteligência global montaram no Chrome."
