// tests/smoke.test.js
T.test('boots to title', () => T.eq(__SB.G.state, 'title'));
T.test('new game reaches play', () => { T.newGame(); T.sim(5); T.eq(__SB.G.state, 'play'); });
