// tests/drop.test.js
T.test('die with braci leaves pile at last safe ground', () => { T.newGame(); T.clearEnemies(); const S = __SB, P = S.P;
  P.braci = 150; T.sim(40); const sx = P.safe.x, sz = P.safe.z; S.playerDie();
  T.eq(P.braci, 0); T.ok(P.drop); T.eq(P.drop.amount, 150); T.near(P.drop.x, sx, .01); T.near(P.drop.z, sz, .01); });
T.test('walking onto pile recovers', () => { const S = __SB, P = S.P, d = P.drop; S.respawn(); T.sim(5); S.tp(d.x, d.z); T.sim(3);
  T.eq(P.braci, 150); T.eq(P.drop, null); });
T.test('second death loses the first pile', () => { const S = __SB, P = S.P; P.braci = 80; S.tp(-48, 20); T.sim(40); S.playerDie(); S.respawn(); T.sim(5);
  P.braci = 0; S.playerDie(); T.eq(P.drop, null); S.respawn(); T.sim(5); });
T.test('death in deep water puts pile on last safe ground', () => { T.newGame(); T.clearEnemies(); const S = __SB, P = S.P, L = S.LAKE;
  S.tp(L.x + L.r * 1.5, L.z); T.sim(40); const sx = P.safe.x, sz = P.safe.z; P.pos.set(L.x, P.pos.y, L.z); P.braci = 40; S.playerDie();
  T.near(P.drop.x, sx, .5); T.near(P.drop.z, sz, .5); T.ok(S.wadeDepth(P.drop.x, P.drop.z) < .3); });
