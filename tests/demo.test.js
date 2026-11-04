// tests/demo.test.js — the demo map (run with --page demo_w.html): start at the bonfire, a walkable way to the palace
const S = __SB, D = S.DEMO;
T.test('demo starts at the bonfire', () => { T.ok(D, 'not the demo build (run with --page demo_w.html)'); T.newGame({hero: 'm'});
  const P = S.P, f = S.SHRINES[0]; T.ok(Math.hypot(P.pos.x - f.x, P.pos.z - f.z) < 6, 'start ' + P.pos.x.toFixed(1) + ',' + P.pos.z.toFixed(1));
  T.near(P.pos.y, S.gY(P.pos.x, P.pos.z), .3, 'on the ground'); T.ok(P.pos.y > 18, 'on the terrace: ' + P.pos.y.toFixed(1));
  T.eq(S.CAMPS.length, 2, 'two camps'); T.eq(S.P.cleared.length, 2, 'camp state for each camp'); });
// the way from the bonfire to the palace: ground height every 0.4 m along the route; no step a body could not take,
// nothing below the edge of the gorge, and the end on the palace plateau
const ROUTE = [[2.2, 4.2], [0, -6], [0, -34], [-2, -46], [14, -52], ...(D ? D.zigRoute : []), [55, -90], [57, -121], [58, -126]];
T.test('the way to the palace is walkable', () => { let worst = 0, at = '', low = 99;
  for (let i = 0; i < ROUTE.length - 1; i++) { const [ax, az] = ROUTE[i], [bx, bz] = ROUTE[i + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / .4));
    let py = S.gY(ax, az); for (let k = 1; k <= n; k++) { const x = ax + (bx - ax) * k / n, z = az + (bz - az) * k / n, y = S.gY(x, z), st = Math.abs(y - py);
      if (st > worst) { worst = st; at = x.toFixed(1) + ',' + z.toFixed(1) + ' (' + py.toFixed(2) + ' -> ' + y.toFixed(2) + ')'; } low = Math.min(low, y); py = y; } }
  T.ok(worst < .45, 'a step of ' + worst.toFixed(2) + ' m at ' + at); T.ok(low > 5, 'the way dips to ' + low.toFixed(1) + ' m');
  T.near(S.gY(58, -126), 52, .6, 'palace plateau'); });
T.test('enemies wait in the village and at the palace', () => { T.newGame({hero: 'm'}); const E = S.E.filter(e => !e.dead);
  T.eq(E.length, D.enemies.length, 'enemies'); const boss = E.filter(e => e.boss); T.eq(boss.length, 2, 'two guardians');
  T.ok(boss.every(b => S.CAMPS[b.camp]), 'each guardian belongs to a camp');
  for (const e of E) T.ok(Math.abs(e.pos.y - S.gY(e.pos.x, e.pos.z)) < 1.5 || e.static, e.type + ' off the ground at ' + e.pos.x.toFixed(0) + ',' + e.pos.z.toFixed(0)); });
T.test('walking down from the bonfire reaches the village', () => { T.newGame({hero: 'm'}); T.clearEnemies(); const P = S.P; S.CAM.yaw = 0; P.yaw = 0;
  S.KEYS.KeyW = true; let low = 99; try { for (let f = 0; f < 60 * 9; f++) { T.sim(1); low = Math.min(low, P.pos.y - S.gY(P.pos.x, P.pos.z)); if (P.pos.z < -40) break; } }
  finally { S.KEYS.KeyW = false; }
  T.ok(P.pos.z < -36, 'stopped at z ' + P.pos.z.toFixed(1) + ' (x ' + P.pos.x.toFixed(1) + ')'); T.near(P.pos.y, 8, 1.5, 'village height'); T.ok(low > -.3, 'sank ' + low.toFixed(2) + ' m into the ground'); });
T.test('crossing the bridge keeps the player on the deck', () => { T.newGame({hero: 'm'}); T.clearEnemies(); const P = S.P; S.tp(14, -52); P.yaw = S.CAM.yaw = -Math.PI / 2; T.sim(5);
  S.KEYS.KeyW = true; let minY = 99; try { for (let f = 0; f < 60 * 8; f++) { T.sim(1); minY = Math.min(minY, P.pos.y); if (P.pos.x > 46) break; } } finally { S.KEYS.KeyW = false; }
  T.ok(P.pos.x > 44, 'stopped at x ' + P.pos.x.toFixed(1) + ' z ' + P.pos.z.toFixed(1)); T.ok(minY > 7.5, 'dropped to ' + minY.toFixed(1) + ' m'); });
