// tests/orient.test.js  (--viewport 360x640 --touch --mobile)
T.test('portrait touch rotates the game', () => { T.eq(innerWidth, 360); T.ok(document.getElementById('app').classList.contains('rot90')); });
T.test('renderer is landscape sized', () => { const c = __SB.renderer.domElement; T.ok(c.clientWidth > c.clientHeight, 'canvas not landscape'); T.eq(__SB.viewW(), 640); T.eq(__SB.viewH(), 360); });
T.test('touch mapping', () => { const p = __SB.touchXY({clientX: 10, clientY: 20}); T.eq(p.x, 20); T.eq(p.y, 350); });
T.test('joystick forward follows what the player sees', () => { T.newGame(); const z = document.getElementById('touchZone');
  const fire = (t, x, y) => z.dispatchEvent(new PointerEvent(t, {pointerId: 7, clientX: x, clientY: y, bubbles: true}));
  fire('pointerdown', 60, 60); fire('pointermove', 100, 60); T.sim(1); T.ok(__SB.IN.mz > .5, 'forward expected, got ' + __SB.IN.mz); fire('pointerup', 100, 60); });
T.test('orientation change mid-game', () => { Object.defineProperty(window, 'innerWidth', {value: 640, configurable: true});
  Object.defineProperty(window, 'innerHeight', {value: 360, configurable: true}); window.dispatchEvent(new Event('resize'));
  T.ok(!document.getElementById('app').classList.contains('rot90')); T.eq(__SB.viewW(), 640); T.eq(__SB.viewH(), 360); });
