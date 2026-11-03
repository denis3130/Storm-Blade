// tests/regression.test.js
T.test('every enemy attack fires', () => {
  T.newGame(); T.clearEnemies(); const S = __SB, P = S.P; P.hp = P.maxHp = 9999;
  const foes = [S.spawnEnemy('troll', P.pos.x + 5, P.pos.z, {boss: true, tier: 1, name: 'T'}), S.spawnEnemy('archer', P.pos.x - 12, P.pos.z, {}),
    S.spawnEnemy('wolf', P.pos.x, P.pos.z + 6, {}), S.spawnEnemy('spirit', P.pos.x, P.pos.z - 8, {})];
  for (const e of foes) { e.aggro = true; e.alertT = 0; e.state = 'combat'; }
  const seen = new Set(); for (let i = 0; i < 900; i++) { T.sim(1); for (const e of foes) if (e.atk) seen.add(e.type + ':' + e.atk.k); }
  for (const k of ['troll:slam', 'archer:shoot', 'wolf:bite', 'spirit:orb']) T.ok(seen.has(k), 'missing ' + k);
});
T.test('death then respawn', () => {
  T.newGame(); const S = __SB; S.P.maxHp = 100; S.P.hp = 5; S.setStormPhase('storm'); S.ST.k = 1; S.tp(30, -60); T.sim(120);
  T.ok(S.P.dead); S.respawn(); T.sim(10); T.eq(S.G.state, 'play'); T.eq(S.P.hp, S.P.maxHp);
});
T.test('pause and resume', () => { __SB.IN.pauseP = true; T.sim(1); T.eq(__SB.G.state, 'pause'); document.getElementById('pResume').click(); T.sim(1); T.eq(__SB.G.state, 'play'); });
