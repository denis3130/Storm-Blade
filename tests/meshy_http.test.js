// tests/meshy_http.test.js — the real Meshy hero, loaded over http (run with --http)
const S = __SB;
T.test('Meshy hero loads over http', () => { T.ok(S.MESHY.on, 'Meshy hero not loaded'); T.eq(S.MESHY.skin.skeleton.bones.length, 24);
  T.newGame(); T.clearEnemies(); S.KEYS.KeyW = true; T.sim(60); S.KEYS.KeyW = false; T.ok(S.MESHY.on, 'Meshy hero lost on a new game');
  T.ok(S.lastPose().every(Number.isFinite), 'non-numeric pose'); });
