#!/usr/bin/env python3
"""Before/after video of the hero's animation.

usage: python3 tools/anim/video.py --before DIR --after DIR --scene stage1|stage2 --out FILE.mp4

DIR is a checkout of the repository with game_w.html built (bash mk.sh). Each page is served over http from its DIR,
so the Meshy hero loads (tests/vendor/mini_gltf.js stands in for the CDN GLTFLoader). The real-time loop is stopped:
every video frame advances the game by two fixed steps (__SB.sim) and is filmed by a side camera that follows the hero.
Output: 1280x360, 30 fps, H.264; "prima" on the left, "dopo" on the right. Exit code 1 if a page has no Meshy hero.
"""
import argparse, asyncio, os, shutil, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tests'))
from run import CHROME_ARGS, INIT, chrome_path, serve, route_assets  # same browser, storage reset and asset routing as the tests
from playwright.async_api import async_playwright

# The scene runner, evaluated in each page. A scene is a list of segments [frames, enter(), each()]; frame() plays one video frame.
SCENE_JS = r"""
window.SCN = ((name, label) => { const S = __SB, P = S.P, K = S.KEYS, M = S.CFG.moves, segs = [];
  const pad = mz => () => [{connected: true, axes: [0, -mz, 0, 0], buttons: Array.from({length: 17}, () => ({pressed: false}))}];
  const keys = (o) => { for (const k of ['KeyW', 'ShiftLeft']) K[k] = !!(o && o[k]); };
  let camYaw = 0; const seg = (frames, enter, each) => segs.push([frames, enter, each]);
  // the open hillside west of the start, walking south: no trees between the side camera and the hero
  const fresh = () => { S.startGame(false, 'm'); for (const e of [...S.E]) S.removeEnemy(e); S.tp(-48, 24); S.CAM.yaw = 0; P.yaw = 0;
    navigator.getGamepads = () => []; keys(); S.sim(30); camYaw = P.yaw; const hud = document.getElementById('hud'); if (hud) hud.hidden = true; };
  const next = {light1: 'light2', light2: 'light3', light3: 'light4'};
  const combo = () => { if (P.act && next[P.act.k] && P.act.t >= M[P.act.k].cancel) S.startAct(next[P.act.k]); };
  if (name === 'stage1') {
    seg(1, fresh); seg(90, () => { navigator.getGamepads = pad(.4); }); seg(90, () => { navigator.getGamepads = () => []; keys({KeyW: 1}); });
    seg(30, () => keys()); seg(62, () => S.startAct('light1'), combo); seg(15); seg(40, () => S.startAct('heavy'));
  } else if (name === 'stage2') {
    seg(1, fresh); seg(90, () => { navigator.getGamepads = pad(.4); }); seg(90, () => { navigator.getGamepads = () => []; keys({KeyW: 1}); });
    seg(60, () => keys({KeyW: 1, ShiftLeft: 1})); seg(30, () => keys()); seg(60, null, () => { P.yaw += .045; }); seg(120);
  } else throw new Error('unknown scene ' + name);
  const tag = document.createElement('div'); tag.textContent = label;
  tag.style.cssText = 'position:fixed;left:14px;top:10px;z-index:99;font:700 26px sans-serif;color:#fff;text-shadow:0 2px 4px #000;pointer-events:none';
  document.body.appendChild(tag);
  let i = 0, f = 0;
  const cam = () => { const c = S.camera, R = S.PL.rig.root, Fx = -Math.sin(camYaw), Fz = -Math.cos(camYaw), y = R.position.y;
    c.position.set(P.pos.x - Fz * 4, y + 1.3, P.pos.z + Fx * 4); c.lookAt(P.pos.x, y + 1.0, P.pos.z); c.updateMatrixWorld(); };
  return { total: segs.reduce((a, s) => a + s[0], 0),
    frame() { while (i < segs.length && f >= segs[i][0]) { i++; f = 0; } if (i >= segs.length) return false;
      const [, enter, each] = segs[i]; if (f === 0 && enter) enter(); for (let k = 0; k < 2; k++) { if (each) each(); S.sim(1); }
      f++; cam(); S.Post.render(0); return true; } };
})(%s, %s);
"""


async def open_page(b, root, label, scene):
    base = serve(root)
    ctx = await b.new_context(viewport={'width': 640, 'height': 360}, device_scale_factor=1)
    pg = await ctx.new_page()
    await pg.add_init_script(INIT)
    await pg.route('**/*', lambda r: route_assets(r, base))
    await pg.goto(base + 'game_w.html', wait_until='domcontentloaded')
    await pg.wait_for_function("window.__SB && __SB.G && __SB.G.state==='title'", timeout=120000)
    if not await pg.evaluate('__SB.MESHY.on'):
        raise SystemExit('no Meshy hero in ' + root)
    await pg.evaluate('window.requestAnimationFrame=()=>0')   # stop the real-time loop: frames advance only through SCN.frame()
    await pg.wait_for_timeout(100)
    import json
    await pg.evaluate(SCENE_JS % (json.dumps(scene), json.dumps(label)))
    return pg


async def main(a):
    tmp = tempfile.mkdtemp(prefix='animvideo-')
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(executable_path=chrome_path(), args=CHROME_ARGS)
            pages = [await open_page(b, os.path.abspath(a.before), 'prima', a.scene), await open_page(b, os.path.abspath(a.after), 'dopo', a.scene)]
            for side, pg in zip(('a', 'b'), pages):
                os.makedirs(os.path.join(tmp, side))
                n = 0
                while await pg.evaluate('SCN.frame()'):
                    await pg.screenshot(path=os.path.join(tmp, side, '%04d.png' % n))
                    n += 1
                print(side, n, 'frames')
            await b.close()
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', os.path.join(tmp, 'a', '%04d.png'),
                        '-framerate', '30', '-i', os.path.join(tmp, 'b', '%04d.png'), '-filter_complex', 'hstack=inputs=2',
                        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', a.out], check=True)
        print('wrote', a.out)
    finally:
        if a.keep:
            print('frames kept in', tmp)
        else:
            shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--before', required=True)
    ap.add_argument('--after', required=True)
    ap.add_argument('--scene', default='stage1', choices=['stage1', 'stage2'])
    ap.add_argument('--out', required=True)
    ap.add_argument('--keep', action='store_true', help='keep the PNG frames (prints where)')
    asyncio.run(main(ap.parse_args()))
