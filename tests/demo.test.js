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
