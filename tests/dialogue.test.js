// tests/dialogue.test.js
const S = __SB, finish = () => { for (let i = 0; i < 30 && S.dlgActive(); i++) { if (document.querySelector('#dlgChoices button')) S.dlgChoose(0); else S.dlgNext(); } };
T.test('gtxt resolves masculine and feminine', () => { const s = 'Sei tornat{o|a}, stranier{o|a}.';
  T.eq(S.gtxt(s, 'm'), 'Sei tornato, straniero.'); T.eq(S.gtxt(s, 'f'), 'Sei tornata, straniera.'); });
T.test('gtxt leaves unmatched braces', () => T.eq(S.gtxt('{solo} e {a|b', 'm'), '{solo} e {a|b'));
T.test('dialogue walks nodes and applies actions', () => { T.newGame(); T.clearEnemies();
  S.defineDialogue('t1', {start: {who: 'Selin', text: 'Ciao, erede.', next: 'b'}, b: {who: 'Selin', text: 'Prendi.', act: 'braci:25'}});
  const b0 = S.P.braci; T.ok(S.dlgStart('t1')); T.eq(S.G.state, 'dialogue'); finish(); T.eq(S.P.braci, b0 + 25); T.eq(S.G.state, 'play'); });
T.test('choice branches and sets flag', () => { S.defineDialogue('t2', {start: {who: 'Maren', text: 'Mi aiuterai?', choices: [{t: 'Sì', next: 'y', act: 'flag:helps'}, {t: 'No', next: 'n'}]},
  y: {who: 'Maren', text: 'Grazie.'}, n: {who: 'Maren', text: 'Peccato.'}}); S.dlgStart('t2'); S.dlgNext(); S.dlgChoose(0);
  T.eq(S.P.flags.helps, true); T.eq(document.getElementById('dlgWho').textContent, 'Maren'); finish(); });
T.test('refuses with aggro enemies near', () => { const g = S.spawnEnemy('goblin', S.P.pos.x + 5, S.P.pos.z, {}); g.aggro = true; T.eq(S.dlgStart('t1'), false); T.clearEnemies(); });
T.test('world frozen during dialogue', () => { const w = S.spawnEnemy('wolf', S.P.pos.x + 12, S.P.pos.z, {}); S.dlgStart('t1'); const x = w.pos.x; T.sim(30); T.eq(w.pos.x, x); finish(); T.clearEnemies(); });
T.test('typed text never shows raw braces', () => { S.P.hero = 'f'; S.defineDialogue('t3', {start: {who: 'Livia', text: 'Benvenut{o|a} a Borgo Cenere!'}}); S.dlgStart('t3');
  for (let i = 0; i < 40; i++) { T.sim(1); T.ok(!/[{}|]/.test(document.getElementById('dlgText').textContent)); } finish(); });
T.test('keyboard E advances, Escape does not break', () => { S.dlgStart('t1'); T.key('Escape'); T.sim(1); T.key('Escape', false); T.eq(S.G.state, 'dialogue');
  for (let i = 0; i < 6 && S.dlgActive(); i++) { T.key('KeyE'); T.sim(1); T.key('KeyE', false); T.sim(1); } T.ok(!S.dlgActive()); });
T.test('gamepad A advances dialogue', () => { S.dlgStart('t1'); let on = false; navigator.getGamepads = () => [{connected: true, axes: [0, 0, 0, 0], buttons: Array.from({length: 17}, (_, i) => ({pressed: i === 0 && on}))}];
  for (let i = 0; i < 6 && S.dlgActive(); i++) { on = true; T.sim(1); on = false; T.sim(1); } navigator.getGamepads = () => []; T.ok(!S.dlgActive()); });
