// tests/demo.test.js — the demo map (run with --page demo_w.html): start at the bonfire, a walkable way to the palace
const S = __SB, D = S.DEMO;
T.test('demo starts at the bonfire', () => { T.ok(D, 'not the demo build (run with --page demo_w.html)'); T.newGame({hero: 'm'});
  const P = S.P, f = S.SHRINES[0]; T.ok(Math.hypot(P.pos.x - f.x, P.pos.z - f.z) < 6, 'start ' + P.pos.x.toFixed(1) + ',' + P.pos.z.toFixed(1));
  T.near(P.pos.y, S.gY(P.pos.x, P.pos.z), .3, 'on the ground'); T.ok(P.pos.y > 18, 'on the terrace: ' + P.pos.y.toFixed(1));
  T.eq(S.CAMPS.length, 2, 'two camps'); T.eq(S.P.cleared.length, 2, 'camp state for each camp'); });
// the way from the bonfire to the palace: ground height every 0.4 m along the route; no step a body could not take,
// nothing below the edge of the gorge, and the end on the palace plateau
const B = D && D.bridge, R1 = D && D.RAMP[1], PC = D && D.camps[1];
const ROUTE = D ? [[D.start.x, D.start.z], [0, -6], [0, -34], [-2, -46], [B.ax, B.az], [B.bx, B.bz], ...D.zigRoute, [R1[0], R1[1]], [R1[3], R1[4]], [PC.x, PC.z]] : [];
T.test('the way to the palace is walkable', () => { let worst = 0, at = '', low = 99;
  for (let i = 0; i < ROUTE.length - 1; i++) { const [ax, az] = ROUTE[i], [bx, bz] = ROUTE[i + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / .4));
    let py = S.gY(ax, az); for (let k = 1; k <= n; k++) { const x = ax + (bx - ax) * k / n, z = az + (bz - az) * k / n, y = S.gY(x, z), st = Math.abs(y - py);
      if (st > worst) { worst = st; at = x.toFixed(1) + ',' + z.toFixed(1) + ' (' + py.toFixed(2) + ' -> ' + y.toFixed(2) + ')'; } low = Math.min(low, y); py = y; } }
  T.ok(worst < .45, 'a step of ' + worst.toFixed(2) + ' m at ' + at); T.ok(low > 5, 'the way dips to ' + low.toFixed(1) + ' m');
  T.near(S.gY(PC.x, PC.z), D.palace.y, .6, 'palace plateau'); });
T.test('enemies wait in the village and at the palace', () => { T.newGame({hero: 'm'}); const E = S.E.filter(e => !e.dead);
  T.eq(E.length, D.enemies.length, 'enemies'); const boss = E.filter(e => e.boss); T.eq(boss.length, 2, 'two guardians');
  T.ok(boss.every(b => S.CAMPS[b.camp]), 'each guardian belongs to a camp');
  for (const e of E) T.ok(Math.abs(e.pos.y - S.gY(e.pos.x, e.pos.z)) < 1.5 || e.static, e.type + ' off the ground at ' + e.pos.x.toFixed(0) + ',' + e.pos.z.toFixed(0));
  // nobody stands inside a building: enemies, camp centres and chests are outside every footprint
  const inside = (x, z) => D.boxes.find(b => { const c = Math.cos(b.yaw), s = Math.sin(b.yaw), dx = x - b.x, dz = z - b.z;
    return Math.abs(dx * c - dz * s) < b.w / 2 + .4 && Math.abs(dx * s + dz * c) < b.d / 2 + .4; });
  T.ok(D.boxes.length > 20, 'building footprints recorded: ' + D.boxes.length);
  const spots = [...E.map(e => [e.type + (e.boss ? ' (boss)' : ''), e.pos.x, e.pos.z]), ...S.CAMPS.map(c => ['camp ' + c.name, c.x, c.z]), ...S.CAMPS.map((c, i) => ['chest ' + i, c.chest.x, c.chest.z])];
  for (const [n, x, z] of spots) { const b = inside(x, z); T.ok(!b, n + ' inside a building at ' + x.toFixed(1) + ',' + z.toFixed(1) + (b ? ' (box at ' + b.x.toFixed(1) + ',' + b.z.toFixed(1) + ')' : '')); } });
T.test('walking down the stairs from the terrace reaches the village', () => { T.newGame({hero: 'm'}); T.clearEnemies(); const P = S.P; S.tp(0, -6); S.CAM.yaw = 0; P.yaw = 0;
  S.KEYS.KeyW = true; let low = 99; try { for (let f = 0; f < 60 * 12; f++) { T.sim(1); low = Math.min(low, P.pos.y - S.gY(P.pos.x, P.pos.z)); if (P.pos.z < -47) break; } }
  finally { S.KEYS.KeyW = false; }
  T.ok(P.pos.z < -46, 'stopped at z ' + P.pos.z.toFixed(1) + ' (x ' + P.pos.x.toFixed(1) + ')'); T.near(P.pos.y, 8.5, 1.5, 'village height'); T.ok(low > -.3, 'sank ' + low.toFixed(2) + ' m into the ground'); });
// walking straight along the bridge from the village end: the player gets through the gate without falling into the gorge
T.test('crossing the bridge keeps the player on the deck', () => { T.newGame({hero: 'm'}); T.clearEnemies(); const P = S.P;
  const L = Math.hypot(B.bx - B.ax, B.bz - B.az), ux = (B.bx - B.ax) / L, uz = (B.bz - B.az) / L; S.tp(B.ax - ux, B.az - uz);
  P.yaw = S.CAM.yaw = Math.atan2(-ux, -uz); T.sim(5);
  S.KEYS.KeyW = true; let minY = 99, s = 0; try { for (let f = 0; f < 60 * 9; f++) { T.sim(1); minY = Math.min(minY, P.pos.y); s = (P.pos.x - B.ax) * ux + (P.pos.z - B.az) * uz; if (s > L + 2) break; } }
  finally { S.KEYS.KeyW = false; }
  T.ok(s > L + 1, 'stopped ' + (L - s).toFixed(1) + ' m before the gate, at ' + P.pos.x.toFixed(1) + ',' + P.pos.z.toFixed(1)); T.ok(minY > 7.5, 'dropped to ' + minY.toFixed(1) + ' m'); });
// each guardian guards a chest: locked until its camp is cleared, then E next to it opens it; both open ends the demo.
// The player walks to it from the camp's centre, so a chest walled in by a building fails
T.test('the chests open once their camps are cleared', () => { T.newGame({hero: 'm'}); T.clearEnemies(); const P = S.P;
  S.CAMPS.forEach((c, i) => { const ch = c.chest; T.near(ch.g.position.y, S.gY(ch.x, ch.z), .3, 'chest ' + i + ' on the ground');
    S.tp(c.x, c.z); T.sim(2); let d = 99;
    S.KEYS.KeyW = true; try { for (let f = 0; f < 60 * 6; f++) { P.yaw = S.CAM.yaw = Math.atan2(-(ch.x - P.pos.x), -(ch.z - P.pos.z)); T.sim(1);
      d = Math.hypot(ch.x - P.pos.x, ch.z - P.pos.z); if (d < 1.5) break; } } finally { S.KEYS.KeyW = false; }
    T.ok(d < 2.2, 'could not walk to chest ' + i + ': stopped ' + d.toFixed(1) + ' m away at ' + P.pos.x.toFixed(1) + ',' + P.pos.z.toFixed(1)); T.sim(20);
    T.key('KeyE'); T.sim(2); T.key('KeyE', false); T.ok(!P.chests[i], 'chest ' + i + ' opened while its camp stands');
    P.cleared[i] = true; T.key('KeyE'); T.sim(2); T.key('KeyE', false); T.sim(2); T.ok(P.chests[i], 'chest ' + i + ' did not open'); });
  T.ok(P.chests.every(Boolean), 'both chests open'); });
