// tests/charsel.test.js
T.test('new game opens character select', () => { document.getElementById('mNew').click(); T.ok(!document.getElementById('charsel').hidden); });
T.test('choosing Eroina builds the heroine', () => { document.getElementById('csF').click(); T.sim(5); const S = __SB;
  T.eq(S.P.hero, 'f'); T.eq(S.PL.rig.d, S.HEROINE_D); T.eq(S.G.state, 'play'); });
T.test('heroine keeps planted feet', () => { const S = __SB, P = S.P, K = S.KEYS, R = S.PL.rig; T.clearEnemies(); S.tp(-48, 24); S.CAM.yaw = 0; P.yaw = 0; T.sim(30);
  const a = new S.THREE.Vector3(), b = new S.THREE.Vector3(); let pa = null, pb = null; const sk = []; K.KeyW = true;
  for (let i = 0; i < 200; i++) { T.sim(1); R.P.ftL.getWorldPosition(a); R.P.ftR.getWorldPosition(b);
    if (pa && i > 50) { const low = a.y < b.y ? [a, pa] : [b, pb]; if (low[0].y - P.pos.y < .105) sk.push(Math.hypot(low[0].x - low[1].x, low[0].z - low[1].z) * 60); }
    pa = a.clone(); pb = b.clone(); }
  K.KeyW = false; sk.sort((x, y) => x - y); T.ok(sk[Math.floor(sk.length / 2)] < .15, 'median foot slide ' + sk[Math.floor(sk.length / 2)]); });
T.test('respawn keeps the heroine', () => { __SB.playerDie(); __SB.respawn(); T.sim(3); T.eq(__SB.PL.rig.d, __SB.HEROINE_D); });
T.test('continue restores saved hero', () => { const S = __SB; S.save(); S.setHero('m'); S.startGame(true); T.sim(3); T.eq(S.P.hero, 'f'); T.eq(S.PL.rig.d, S.HEROINE_D); });
