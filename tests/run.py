#!/usr/bin/env python3
"""In-page test runner for Stormblade.

usage: python3 tests/run.py tests/<file>.test.js [--viewport WxH] [--touch] [--mobile] [--seed N]
                            [--data FILE.json] [--dump FILE.json]

Loads the test build (game_w.html, made by mk.sh) in headless Chrome, waits for the
title screen, injects tests/lib.js and the test file, runs T.run() and prints one line
per test: "PASS name" or "FAIL name: message". Uncaught page errors print as PAGEERROR
and console errors as CONSOLEERROR (blocked-font "Failed to load resource" lines are
ignored). Exit code 1 if anything failed or errored.
--data FILE.json defines window.TDATA (the parsed file) before the test file runs;
--dump FILE.json sets window.TDUMPMODE before the test and writes window.TDUMP to that file after it
(used to record references).
"""
import argparse, asyncio, json, os, sys
from playwright.async_api import async_playwright

SB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(SB, 'game_w.html')
CHROME_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
               '--ignore-gpu-blocklist', '--enable-webgl', '--no-sandbox']
SETTINGS = {'quality': 'low', 'music': 0, 'sfx': 0, 'sens': 1, 'invertY': False, 'fp': False, 'nums': True}
INIT = ("try{localStorage.setItem('stormblade.settings',%s);"
        "localStorage.removeItem('stormblade.save.v2');localStorage.removeItem('stormblade.save.v4');}catch(_){}"
        % json.dumps(json.dumps(SETTINGS)))


def chrome_path():
    """System Chrome/Chromium if present (or $SB_CHROME); None = Playwright's own Chromium."""
    if os.environ.get('SB_CHROME'):
        return os.environ['SB_CHROME']
    for c in ('/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'):
        if os.path.exists(c):
            return c
    return None


async def main(a):
    w, h = (int(v) for v in a.viewport.lower().split('x'))
    errors = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=chrome_path(), args=CHROME_ARGS)
        ctx = await b.new_context(viewport={'width': w, 'height': h}, has_touch=a.touch,
                                  is_mobile=a.mobile, device_scale_factor=1)
        pg = await ctx.new_page()
        await pg.add_init_script(INIT)

        def on_console(m):
            if m.type == 'error' and 'Failed to load resource' not in m.text:
                errors.append('CONSOLEERROR ' + m.text)
        pg.on('console', on_console)
        pg.on('pageerror', lambda e: errors.append('PAGEERROR ' + str(e)))

        async def route(r):
            u = r.request.url
            if 'three.min.js' in u:
                await r.fulfill(path=os.path.join(SB, 'three.min.js'), content_type='application/javascript')
            elif u.startswith('file://'):
                await r.continue_()
            else:
                await r.abort()
        await pg.route('**/*', route)
        await pg.goto('file://' + PAGE, wait_until='domcontentloaded')
        await pg.wait_for_function("window.__SB && __SB.G && __SB.G.state==='title'", timeout=60000)
        await pg.add_script_tag(content=open(os.path.join(SB, 'tests', 'lib.js')).read())
        if a.dump:
            await pg.add_script_tag(content='window.TDUMPMODE=true;')
        if a.data:
            await pg.add_script_tag(content='window.TDATA=' + json.dumps(json.load(open(a.data))) + ';')
        await pg.add_script_tag(content=open(a.file).read())
        await pg.evaluate('T.SEED=%d' % a.seed)
        res = await pg.evaluate('T.run()')
        dump = await pg.evaluate('window.TDUMP===undefined?null:JSON.stringify(window.TDUMP)') if a.dump else None
        await pg.wait_for_timeout(300)
        await b.close()
    if a.dump:
        if dump is None:
            errors.append('DUMPERROR the test set no window.TDUMP')
        else:
            open(a.dump, 'w').write(dump + '\n')
            print('DUMP %s (%d bytes)' % (a.dump, len(dump)))
    bad = 0
    for r in res:
        if r['ok']:
            print('PASS ' + r['name'])
        else:
            bad += 1
            print('FAIL %s: %s' % (r['name'], r.get('msg', '')))
    for e in errors:
        print(e)
    print('%d passed, %d failed, %d errors (%s, seed %d)' % (len(res) - bad, bad, len(errors), os.path.basename(a.file), a.seed))
    return 1 if bad or errors or not res else 0


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('file')
    ap.add_argument('--viewport', default='640x360')
    ap.add_argument('--touch', action='store_true')
    ap.add_argument('--mobile', action='store_true')
    ap.add_argument('--seed', type=int, default=1, help='seed for Math.random during the tests (replay a failure)')
    ap.add_argument('--data', help='JSON file exposed to the test as window.TDATA')
    ap.add_argument('--dump', help='write window.TDUMP to this JSON file after the tests')
    sys.exit(asyncio.run(main(ap.parse_args())))
