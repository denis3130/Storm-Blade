cd "$(dirname "$0")"
FILES="a0_cfg.js a_core.js b_tex.js c_geo.js d_world.js e_chars.js f_fx.js g_props.js h_audio.js i_player.js j_enemies.js l_meshy.js m_story.js r_orient.js k_game.js"
# game_w.html = test build (keeps window.__SB); index.html = playable build published with GitHub Pages
python3 build.py game_w.html 1 $FILES >/dev/null
python3 build.py index.html 0 $FILES
python3 - <<PY
p="index.html";s=open(p).read();i=s.find("window.__SB={");j=s.find("\nboot();",i)
assert i>0 and j>i
s=s[:i]+s[j+1:];open(p,"w").write(s);print("stripped",len(s))
PY
python3 -c "
import re;s=open('game_w.html').read();open('g.js','w').write(re.findall(r'<script>\n(.*?)\n</script>',s,re.S)[0])" && node --check g.js && echo SYNTAX_OK
