// tests/save.test.js
T.test('round trip', () => { T.newGame(); const S = __SB, P = S.P;
  Object.assign(P, {hero: 'f', braci: 321, sword: 2, flaskMax: 5, shrine: 3, kills: 7}); P.stats.end = 4; P.drop = {x: 1, z: 2, amount: 9};
  P.quests = {q: {step: 1, n: 2, done: false}}; P.flags = {met: true}; S.save(); S.resetPlayer(); T.eq(P.braci, 0);
  T.ok(S.loadSave()); T.eq(P.hero, 'f'); T.eq(P.braci, 321); T.eq(P.sword, 2); T.eq(P.stats.end, 4); T.eq(P.drop.amount, 9); T.eq(P.quests.q.n, 2); T.eq(P.flags.met, true); });
T.test('old v2 save is ignored and Continue hidden', () => { localStorage.removeItem('stormblade.save.v4');
  localStorage.setItem('stormblade.save.v2', JSON.stringify({stats: {vig: 9}})); T.eq(__SB.loadSave(), false); __SB.showTitle();
  T.ok(document.getElementById('mContinue').hidden); T.ok(localStorage.getItem('stormblade.save.v2')); });
T.test('corrupted save is ignored without error', () => { localStorage.setItem('stormblade.save.v4', '{not json'); T.eq(__SB.loadSave(), false);
  localStorage.setItem('stormblade.save.v4', JSON.stringify({v: 3})); T.eq(__SB.loadSave(), false); });
T.test('settings survive a new game', () => { const s = localStorage.getItem('stormblade.settings'); T.newGame(); T.eq(localStorage.getItem('stormblade.settings'), s); });
