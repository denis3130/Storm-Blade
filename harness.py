import asyncio, sys, json, os
from playwright.async_api import async_playwright
SB=os.path.dirname(os.path.abspath(__file__))
# usage: harness.py page.html script.json
async def main():
    page_file=sys.argv[1]; steps=json.load(open(sys.argv[2]))
    async with async_playwright() as p:
        exe=os.environ.get('SB_CHROME') or next((c for c in ('/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser') if os.path.exists(c)),None)
        b=await p.chromium.launch(executable_path=exe,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl','--no-sandbox'])
        vp=steps.get('viewport',{'width':1280,'height':720})
        ctx=await b.new_context(viewport=vp,has_touch=steps.get('touch',False),is_mobile=steps.get('mobile',False),device_scale_factor=1)
        pg=await ctx.new_page()
        init=steps.get('init','')
        if init: await pg.add_init_script(init)
        logs=[]
        pg.on('console',lambda m: logs.append(m.type+': '+m.text))
        pg.on('pageerror',lambda e: logs.append('PAGEERROR '+str(e)))
        async def route(r):
            u=r.request.url
            if 'three.min.js' in u:
                await r.fulfill(path=SB+'/three.min.js',content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.abort()
        await pg.route('**/*',route)
        await pg.goto('file://'+page_file, wait_until='domcontentloaded')
        for s in steps['steps']:
            k=s[0]
            if k=='wait': await pg.wait_for_timeout(s[1])
            elif k=='shot': await pg.screenshot(path=SB+'/'+s[1])
            elif k=='click': await pg.click(s[1])
            elif k=='eval':
                try:
                    r=await pg.evaluate(s[1]); 
                    if r is not None: logs.append('EVAL '+str(r)[:1500])
                except Exception as e: logs.append('EVALERR '+str(e)[:500])
            elif k=='down': await pg.keyboard.down(s[1])
            elif k=='up': await pg.keyboard.up(s[1])
            elif k=='press': await pg.keyboard.press(s[1])
            elif k=='mouse': await pg.mouse.move(s[1],s[2])
            elif k=='mdown': await pg.mouse.down(button=s[1] if len(s)>1 else 'left')
            elif k=='mup': await pg.mouse.up(button=s[1] if len(s)>1 else 'left')
        seen=set()
        for l in logs:
            if l in seen: continue
            seen.add(l); print(l[:600])
        await b.close()
asyncio.run(main())
