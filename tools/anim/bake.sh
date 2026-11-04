#!/usr/bin/env bash
# Regenerates src/n_anims.js from the Meshy clips listed in tools/anim/moves.json:
# each clip is read into JSON (clip2json.py), then converted in the game page (bake.py + bake.js).
set -euo pipefail
cd "$(dirname "$0")/../.."
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
# the build includes src/n_anims.js: on the first bake there is none yet
[ -f src/n_anims.js ] || echo 'const ANIM=null;' > src/n_anims.js
bash mk.sh >/dev/null
python3 - "$tmp" <<'PY'
import json, subprocess, sys
for name, m in json.load(open('tools/anim/moves.json')).items():
    subprocess.run([sys.executable, 'tools/anim/clip2json.py', m['clip'], '%s/%s.json' % (sys.argv[1], name)], check=True)
PY
python3 tools/anim/bake.py "$tmp"
bash mk.sh >/dev/null
