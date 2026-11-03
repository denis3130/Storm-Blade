// tests/braci.test.js  (viewport 640x360)
T.test('levelCost curve', () => { const c = __SB.levelCost; T.eq(c(1), 60); T.eq(c(2), 94); T.eq(c(5), 244); T.eq(c(10), 654); });
T.test('kill awards braci', () => {
  T.newGame(); T.clearEnemies(); const S = __SB, P = S.P, b0 = P.braci;
  const g = S.spawnEnemy('goblin', P.pos.x, P.pos.z - 1.6, {}); g.hp = 1; T.sim(2); S.startAct('light1'); T.sim(90);
  T.eq(P.braci - b0, g.braci);
});
T.test('levelUp spends and raises stat', () => { const P = __SB.P; P.braci = 500; const v = P.stats.vig, c = __SB.levelCost(P.lvl);
  T.ok(__SB.levelUp('vig')); T.eq(P.stats.vig, v + 1); T.eq(P.braci, 500 - c); });
T.test('levelUp refuses when short', () => { const P = __SB.P; P.braci = 0; const s = JSON.stringify(P.stats); T.eq(__SB.levelUp('str'), false); T.eq(JSON.stringify(P.stats), s); });
T.test('HUD counter fits 5 digits', () => { __SB.P.braci = 12345; T.sim(2); const el = document.getElementById('braciN');
  T.eq(el.textContent, '12345'); const r = el.getBoundingClientRect(); T.ok(r.right <= innerWidth && r.bottom <= innerHeight && r.width < 120, 'counter overflow'); });
T.test('resting opens shrine menu with cost', () => { const S = __SB; T.clearEnemies(); S.P.flags = Object.assign(S.P.flags || {}, {selinMet: true}); S.startAct('rest', {shrine: S.SHRINES[0]}); T.sim(70);
  T.eq(S.G.state, 'shrine'); T.ok(document.getElementById('smCost').textContent.includes(String(S.levelCost(S.P.lvl)))); });
T.test('gamepad navigates shrine menu', () => {
  let pressed = 0; const pad = () => ({connected: true, axes: [0, 0, 0, 0], buttons: Array.from({length: 17}, (_, i) => ({pressed: i === 0 && pressed === 1}))});
  navigator.getGamepads = () => [pad()]; pressed = 1; T.sim(1); pressed = 0; T.sim(1);
  T.ok(__SB.G.state !== 'shrine', 'A on the focused button should act'); navigator.getGamepads = () => [];
});
