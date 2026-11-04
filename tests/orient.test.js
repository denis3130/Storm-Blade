// tests/orient.test.js  (--viewport 360x640 --touch --mobile)
T.test('portrait touch rotates the game', () => { T.eq(innerWidth, 360); T.ok(document.getElementById('app').classList.contains('rot90')); });
T.test('renderer is landscape sized', () => { const c = __SB.renderer.domElement; T.ok(c.clientWidth > c.clientHeight, 'canvas not landscape'); T.eq(__SB.viewW(), 640); T.eq(__SB.viewH(), 360); });
T.test('touch mapping', () => { const p = __SB.touchXY({clientX: 10, clientY: 20}); T.eq(p.x, 20); T.eq(p.y, 350); });
T.test('joystick forward follows what the player sees', () => { T.newGame(); const z = document.getElementById('touchZone');
  const fire = (t, x, y) => z.dispatchEvent(new PointerEvent(t, {pointerId: 7, clientX: x, clientY: y, bubbles: true}));
  fire('pointerdown', 60, 60); fire('pointermove', 100, 60); T.sim(1); T.ok(__SB.IN.mz > .5, 'forward expected, got ' + __SB.IN.mz); fire('pointerup', 100, 60); });
// iOS Safari: with its toolbar showing, the visible height (innerHeight) is shorter than 100vh
T.test('rotated game fits the visible height (iOS toolbar)', () => { const app = document.getElementById('app');
  Object.defineProperty(window, 'innerHeight', {value: 560, configurable: true}); window.dispatchEvent(new Event('resize'));
  T.ok(app.classList.contains('rot90'), 'not rotated'); T.eq(app.offsetWidth, __SB.viewW(), 'game width'); T.eq(app.offsetHeight, __SB.viewH(), 'game height');
  const r = document.getElementById('tAtk').getBoundingClientRect(); T.ok(r.width > 0, 'attack button not shown');
  T.ok(r.bottom <= innerHeight, 'attack button under the toolbar: bottom ' + r.bottom + ' > ' + innerHeight); });
// upright phone: the home bar (physical bottom) is the game's right edge, the notch (physical top) its left edge
T.test('safe areas follow the rotation', () => { const app = document.getElementById('app'), box = id => document.getElementById(id).getBoundingClientRect();
  const atk = box('tAtk').bottom, st = box('status').top; app.style.setProperty('--sa-b', '34px'); app.style.setProperty('--sa-t', '40px');
  const atk2 = box('tAtk').bottom, st2 = box('status').top; app.style.removeProperty('--sa-b'); app.style.removeProperty('--sa-t');
  T.near(atk - atk2, 34, 1, 'attack button clears the home bar'); T.near(st2 - st, 40, 1, 'health bars clear the notch'); });
T.test('orientation change mid-game', () => { Object.defineProperty(window, 'innerWidth', {value: 640, configurable: true});
  Object.defineProperty(window, 'innerHeight', {value: 360, configurable: true}); window.dispatchEvent(new Event('resize'));
  T.ok(!document.getElementById('app').classList.contains('rot90')); T.eq(__SB.viewW(), 640); T.eq(__SB.viewH(), 360); });
