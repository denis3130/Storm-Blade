// tests/quest.test.js
const S = __SB;
T.test('main quest starts with a new game', () => { T.newGame(); T.clearEnemies(); T.sim(2); T.eq(S.questStep('valle'), 0); T.ok(document.getElementById('objText').textContent.includes('0/4')); });
T.test('counted step advances on events', () => { for (let i = 0; i < 3; i++) S.storyEvent('chest', {i}); T.sim(1); T.eq(S.P.quests.valle.n, 3);
  T.ok(document.getElementById('objText').textContent.includes('3/4')); });
T.test('quest completes with toast', () => { S.storyEvent('chest', {i: 3}); T.ok(S.questIsDone('valle'));
  T.ok([...document.querySelectorAll('.toast')].some(t => t.textContent.includes('Missione completata'))); });
T.test('first rest plays Selin and completes her quest', () => { T.newGame(); T.clearEnemies(); S.startAct('rest', {shrine: S.SHRINES[0]}); T.sim(70);
  T.eq(S.G.state, 'dialogue'); for (let i = 0; i < 20 && S.dlgActive(); i++) { if (document.querySelector('#dlgChoices button')) S.dlgChoose(1); else S.dlgNext(); }
  T.ok(S.P.flags.selinMet); T.ok(S.questIsDone('selin')); T.eq(S.G.state, 'shrine'); document.getElementById('smLeave').click(); T.sim(1); });
T.test('Selin is remembered after Continua', () => { T.ok(S.loadSave(), 'no save to continue'); T.ok(S.P.flags.selinMet, 'Selin would introduce herself again'); });
T.test('journal opens with N and lists quests', () => { T.eq(S.G.state, 'play'); T.key('KeyN'); T.sim(1); T.key('KeyN', false);
  T.ok(!document.getElementById('journal').hidden); const items = [...document.querySelectorAll('#journal .jq')].map(e => e.textContent);
  T.ok(items.some(t => t.includes('La Valle di Cenere'))); T.ok(items.some(t => t.includes('La voce del santuario'))); T.key('KeyN'); T.sim(1); T.key('KeyN', false); T.eq(S.G.state, 'play'); });
T.test('journal reachable from pause and touch', () => { T.ok(document.getElementById('pJournal')); T.ok(document.getElementById('tJournal')); });
T.test('toasts do not cover the journal', () => { const vis = () => getComputedStyle(document.getElementById('toasts')).visibility;
  S.openJournal('play'); T.eq(vis(), 'hidden'); document.getElementById('jClose').click(); T.sim(1); T.eq(vis(), 'visible'); });
