# Stormblade · Tappa 1 "Basi" · Piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** dare a Stormblade le basi del capitolo 1 (orizzontale su telefono, salvataggio v4, braci in stile Dark Souls, scelta eroe/eroina, dialoghi, missioni e diario) nel mondo attuale, pubblicando una versione giocabile.

**Architecture:** moduli JavaScript vanilla in `sb/src/` uniti da `sb/mk.sh` in un unico HTML; nuovi moduli `m_story.js` (testi, dialoghi, missioni, diario) e `r_orient.js` (orientamento), il resto modifica i sistemi esistenti. I test girano nella pagina vera tramite Playwright con un piccolo runner che stampa PASS/FAIL.

**Tech Stack:** Three.js r128 (cdnjs in produzione, copia locale `sb/three.min.js` nei test), JavaScript ES2019 senza build obbligatoria, Python 3 + Playwright per i test, Chrome headless con SwiftShader.

**Spec:** `sb/docs/superpowers/specs/2026-11-03-stormblade-aaa-design.md` (sezioni 4.5, 6.1, 7, 8, 11 riga "1. Basi").

## Global Constraints

- Tutti i testi dell'interfaccia in italiano.
- "su un telefono di fascia media (un Android recente da circa 300 €), in orizzontale, il gioco tiene 60 FPS nel villaggio e nei combattimenti".
- "ogni tappa pubblicata è giocabile … senza errori nella console".
- "gli effetti nuovi non allungano le lotte (stessa misura di durata usata per la v5)": 1 goblin 2,51 s, 3 goblin 4,91 s (20 prove).
- "Su telefono solo orizzontale"; "HUD e menu progettati per l'orizzontale a partire da 360 px di altezza".
- "tutte le nuove funzioni (dialoghi, scelte, mappa, diario, saltare, interagire con le scorciatoie) hanno un comando su tutti e tre" (PC, touch, controller).
- "Chiave nuova con versione dati 4"; "al primo avvio il titolo propone solo 'Nuova partita'; le impostazioni restano".
- "Testi con varianti maschile e femminile, scritte nel dato come `{m|f}`"; "Il giocatore non ha nome proprio: 'erede', 'straniero' o 'straniera'".
- Ogni numero di bilanciamento sta in `CFG` (`sb/src/a0_cfg.js`).
- "nessuna luce in più oltre al pool attuale".
- Pubblicazione sempre sullo stesso file `scratchpad/stormblade.html` (stesso link).

## Review Focus

1. Girare il telefono durante la partita (verticale ↔ orizzontale): canvas, HUD e joystick devono seguire senza ricaricare. Test in Task 5 `orientation change mid-game`.
2. Chi gioca solo col controller deve poter usare ogni schermata nuova (scelta personaggio, menu del santuario, scelte dei dialoghi, diario). Test in Task 2 `gamepad navigates shrine menu` e Task 7 `gamepad A advances dialogue`.
3. Il testo che scorre nei dialoghi non deve mai mostrare le parentesi `{o|a}`. Test in Task 7 `typed text never shows raw braces`.
4. Molte braci (5 cifre) devono stare nell'HUD su uno schermo orizzontale alto 360 px. Test in Task 2 `HUD counter fits 5 digits`.
5. L'eroina scelta resta tale dopo morte, rinascita e "Continua". Test in Task 6 `respawn keeps the heroine` e `continue restores saved hero`.

## Mappa dei file

| File | Responsabilità | Task |
|---|---|---|
| `tests/run.py` (nuovo) | runner: avvia Chrome, attende il titolo, esegue un file di test, stampa PASS/FAIL, esce con 1 se qualcosa fallisce | 1 |
| `tests/lib.js` (nuovo) | API `T` per i test nella pagina | 1 |
| `tests/*.test.js` (nuovi) | un file per area | 1-8 |
| `src/a0_cfg.js` | versione dati 4, braci, tipografia dei dialoghi | 2, 3, 7 |
| `src/k_game.js` | flusso di gioco, HUD, input, salvataggio, menu | 2-9 |
| `src/i_player.js` | stato del giocatore, morte, scelta del corpo | 3, 4, 6 |
| `src/j_enemies.js` | ricompensa in braci dei nemici | 2 |
| `src/e_chars.js` | eroina procedurale provvisoria | 6 |
| `src/m_story.js` (nuovo) | `gtxt`, dialoghi, missioni, diario, contenuti della tappa 1 | 7, 8 |
| `src/r_orient.js` (nuovo) | orientamento, rotazione CSS, rimappatura dei tocchi | 5 |
| `src/a_core.js` | `onResize` usa la dimensione del gioco | 5 |
| `src/head.html` | markup e stile: contatore braci, menu santuario, scelta personaggio, dialoghi, diario, contenitore `#app` | 2, 5, 6, 7, 8 |
| `mk.sh` | ordine dei moduli: `… j_enemies.js m_story.js r_orient.js k_game.js` | 5, 7 |

Esecuzione dei test, valida per tutti i task: `cd sb && bash mk.sh >/dev/null && python3 tests/run.py tests/<file>.test.js [--viewport 640x360] [--touch]`.

---

### Task 1: Runner di test e regressione v5

**Files:**
- Create: `sb/tests/run.py`, `sb/tests/lib.js`, `sb/tests/smoke.test.js`, `sb/tests/regression.test.js`
- Modify: `sb/src/k_game.js` (oggetto `window.__SB`: aggiungere `respawn`, `playerDie`, `save`, `loadSave`, `resetPlayer`, `showTitle`, `showScreen`, `ST` già presente)

**Interfaces:**
- Produces: CLI `python3 tests/run.py <file> [--viewport WxH] [--touch] [--mobile]`; nella pagina `T.test(name, fn)`, `T.eq(a,b,msg)`, `T.ok(v,msg)`, `T.near(a,b,eps,msg)`, `T.newGame({hero='m'}={})` (chiama `__SB.startGame(false, hero)`), `T.clearEnemies()` (toglie tutti i nemici dalla scena e svuota `__SB.TOK`), `T.sim(n)`, `T.key(code, down=true)` (evento `keydown`/`keyup` su `window` con `{code}`).

- [ ] **Step 1: Scrivere i test di fumo e di regressione**

```js
// tests/smoke.test.js
T.test('boots to title', () => T.eq(__SB.G.state, 'title'));
T.test('new game reaches play', () => { T.newGame(); T.sim(5); T.eq(__SB.G.state, 'play'); });
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
```

- [ ] **Step 2: Eseguire e verificare che fallisca** — `python3 tests/run.py tests/smoke.test.js` → errore "No such file" o `T is not defined`.

- [ ] **Step 3: Scrivere `tests/run.py` e `tests/lib.js`**
  - `run.py` riusa da `sb/harness.py` gli argomenti di Chrome, la route di `three.min.js` verso `sb/three.min.js` e l'aborto delle altre richieste; script d'avvio che imposta `stormblade.settings` a `{quality:'low',music:0,sfx:0,sens:1,invertY:false,fp:false,nums:true}` e cancella `stormblade.save.v2` e `stormblade.save.v4`; viewport predefinita 640×360.
  - Attende fino a 60 s `window.__SB && __SB.G.state==='title'`, inietta `lib.js` e il file di test, esegue `await T.run()`, stampa `PASS nome` o `FAIL nome: messaggio` e ogni `PAGEERROR`; ignora i messaggi `Failed to load resource` (font bloccati). Esce con codice 1 se c'è un FAIL o un PAGEERROR.
  - `T.run()` esegue i test in ordine nello stesso stato di pagina (i test di un file possono dipendere dai precedenti) e restituisce `[{name, ok, msg}]`.

- [ ] **Step 4: Aggiungere le esportazioni a `window.__SB`** (elenco sopra) e verificare: `bash mk.sh && python3 tests/run.py tests/smoke.test.js && python3 tests/run.py tests/regression.test.js` → tutti PASS, codice 0.

- [ ] **Step 5: Commit** — `git add tests src/k_game.js && git commit -m "test: in-page test runner and v5 regression suite"`

### Task 2: Braci al posto dell'esperienza, livelli al santuario

**Files:**
- Modify: `sb/src/a0_cfg.js`, `sb/src/j_enemies.js`, `sb/src/k_game.js`, `sb/src/i_player.js`, `sb/src/head.html`
- Test: `sb/tests/braci.test.js`

**Interfaces:**
- Consumes: `T` (Task 1).
- Produces: `CFG.ver = 4`; `CFG.braci = {lvlBase:60, lvlLin:30, lvlQuad:4, pickR:1.3}`; in `CFG.enemy.*` il campo `xp` diventa `braci` (stessi numeri: goblin 22, archer 26, wolf 18, troll 260, spirit 30); `CFG.prog.chestXp` diventa `CFG.prog.chestBraci` (90); spariscono `prog.xp0`, `prog.xpL`.
- Produces: `levelCost(lvl:number):number` = `round(lvlBase + lvlLin*(lvl-1) + lvlQuad*(lvl-1)^2)`; `addBraci(n:number):void`; `spendBraci(n:number):boolean`; `levelUp(stat:'vig'|'end'|'str'):boolean`; `openShrineMenu(shrine):void` (imposta `G.state='shrine'`); `P.braci:number` (sostituisce `P.xp`; `P.pending` sparisce); `e.braci` sui nemici; elemento HUD `#braciN`; `padMenu()` chiamata da `pollPad` quando è aperta una schermata (frecce/croce spostano il focus tra i pulsanti visibili, A clicca, B torna indietro).
- Rinominare `xpOrbs(e,amount)` in `emberOrbs(e,amount)`: le braci arrivano al contatore quando atterrano. La posizione d'arrivo si calcola dagli offset dell'elemento dentro il contenitore del gioco, non da `getBoundingClientRect` (serve a Task 5).
- Il riposo al santuario (`restAtShrine`) apre `#shrineMenu`: pulsante `#smLevel` "Sali di livello · costo <span id="smCost">" (disabilitato se le braci non bastano, apre le carte di `#levelup` che mostrano costo e braci), pulsante `#smLeave` "Riprendi il cammino". Spariscono il livello automatico fuori dal combattimento (`levelCheck`, `luTimer`) e `xpNeed`.
- La medaglia del livello pulsa una volta quando le braci superano `levelCost(P.lvl)`.
- `#shrineMenu` entra nell'elenco `SCREENS`; negli stati `shrine`, `levelup`, `pause` e `title` il mondo è fermo e `padMenu` è attivo.

- [ ] **Step 1: Scrivere i test**

```js
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
```

- [ ] **Step 2: Eseguire** — `python3 tests/run.py tests/braci.test.js` → FAIL (`__SB.levelCost is not a function`).
- [ ] **Step 3: Implementare** le funzioni e i cambi elencati in Interfaces; esportare in `__SB` `levelCost`, `addBraci`, `spendBraci`, `levelUp`, `openShrineMenu`. Il focus iniziale del menu del santuario va su `#smLeave` quando le braci non bastano, altrimenti su `#smLevel`.
- [ ] **Step 4: Verificare** — `braci.test.js`, `smoke.test.js` e `regression.test.js` tutti PASS.
- [ ] **Step 5: Commit** — `git commit -am "feat: braci currency, shrine level-up menu, gamepad menu navigation"`

### Task 3: Braci a terra alla morte

**Files:**
- Modify: `sb/src/i_player.js`, `sb/src/k_game.js`
- Test: `sb/tests/drop.test.js`

**Interfaces:**
- Consumes: `P.braci`, `addBraci`, `CFG.braci.pickR` (Task 2); `wadeDepth(x,z)` (esistente, `d_world.js`).
- Produces: `P.safe:{x:number,z:number}` (aggiornato ogni 0,5 s in `updPlayer` se `wadeDepth(P.pos.x,P.pos.z) < 0.3` e il giocatore non è morto); `P.drop:{x:number,z:number,amount:number}|null`; `dropBraci():void` chiamata dentro `playerDie` (se `P.braci>0` crea il mucchio in `P.safe`, altrimenti `P.drop=null`: il mucchio precedente si perde sempre); `recoverBraci():void`; `updDrop(dt):void` nel ciclo di gioco (raccolta entro `pickR`, `sfx('level')`, toast "Braci recuperate: N").
- Aspetto del mucchio: mesh piccola scura con emissivo arancione (geometria in cache `geo('pile', …)`) più braci di particelle `FXA` che salgono; nessuna luce.

- [ ] **Step 1: Scrivere i test**

```js
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
```

- [ ] **Step 2: Eseguire** → FAIL (`P.safe` undefined).
- [ ] **Step 3: Implementare** come in Interfaces; `respawn()` non tocca `P.drop`.
- [ ] **Step 4: Verificare** — `drop.test.js`, `braci.test.js`, `regression.test.js` PASS.
- [ ] **Step 5: Commit** — `git commit -am "feat: braci dropped on death, recover by touching the pile"`

### Task 4: Salvataggio v4

**Files:**
- Modify: `sb/src/k_game.js` (`SAVE_K`, `save`, `loadSave`, `resetPlayer`, `showTitle`), `sb/src/i_player.js` (campi di `P`)
- Test: `sb/tests/save.test.js`

**Interfaces:**
- Produces: `SAVE_K = 'stormblade.save.v4'`; oggetto salvato `{v:4, hero, stats, braci, drop, sword, flasks, flaskMax, shrine, kills, time, quests, flags, cleared, chests, tips}`; nuovi campi di `P` con valori iniziali `hero:'m'`, `quests:{}`, `flags:{}`; `loadSave():boolean` restituisce `false` se la chiave manca, il JSON non si legge o `v !== 4`; la chiave `stormblade.save.v2` non viene mai letta né cancellata; `stormblade.settings` non viene toccata.

- [ ] **Step 1: Scrivere i test**

```js
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
```

- [ ] **Step 2: Eseguire** → FAIL (il round trip perde `braci`/`hero`).
- [ ] **Step 3: Implementare** come in Interfaces.
- [ ] **Step 4: Verificare** — `save.test.js` e tutti i file precedenti PASS.
- [ ] **Step 5: Commit** — `git commit -am "feat: save data v4 with hero, braci, drop, quests and flags"`

### Task 5: Solo orizzontale su telefono

**Files:**
- Create: `sb/src/r_orient.js`
- Modify: `sb/src/head.html` (tutto il DOM del gioco dentro `<div id="app">`; CSS `#app.rot90{position:fixed;left:0;top:0;width:100vh;height:100vw;transform:translateX(100vw) rotate(90deg);transform-origin:top left}`; via il suggerimento "Ruota il telefono…"), `sb/src/a_core.js` (`onResize` usa `viewW()`/`viewH()`), `sb/src/k_game.js` (codice touch, `toScreen`, `updOrbs`, avvio), `sb/mk.sh`
- Test: `sb/tests/orient.test.js` (`--viewport 360x640 --touch --mobile`), `sb/tests/orient_desktop.test.js` (viewport 1280×720)

**Interfaces:**
- Produces: `wantRot():boolean` (`isTouch && innerHeight > innerWidth`); `applyOrient():void` (aggiunge o toglie `rot90` su `#app` e chiama `onResize`); `viewW():number`, `viewH():number` (dimensioni del gioco, scambiate in rotazione); `touchXY(e):{x:number,y:number}` (in rotazione `{x:e.clientY, y:innerWidth-e.clientX}`, altrimenti `{x:e.clientX, y:e.clientY}`); `lockLandscape():Promise<void>` (schermo intero più `screen.orientation.lock('landscape')`, errori ignorati, poi `applyOrient`), chiamata al tocco di "Nuova partita" e "Continua" solo se `isTouch`; ascoltatori `resize` e `orientationchange` che chiamano `applyOrient`.
- Il codice touch (joystick, visuale, divisione al 42%) usa `touchXY` e `viewW()`; `toScreen` usa `viewW()`/`viewH()`.

- [ ] **Step 1: Scrivere i test**

```js
// tests/orient.test.js  (--viewport 360x640 --touch --mobile)
T.test('portrait touch rotates the game', () => { T.eq(innerWidth, 360); T.ok(document.getElementById('app').classList.contains('rot90')); });
T.test('renderer is landscape sized', () => { const c = __SB.renderer.domElement; T.ok(c.clientWidth > c.clientHeight, 'canvas not landscape'); T.eq(__SB.viewW(), 640); T.eq(__SB.viewH(), 360); });
T.test('touch mapping', () => { const p = __SB.touchXY({clientX: 10, clientY: 20}); T.eq(p.x, 20); T.eq(p.y, 350); });
T.test('joystick forward follows what the player sees', () => { T.newGame(); const z = document.getElementById('touchZone');
  const fire = (t, x, y) => z.dispatchEvent(new PointerEvent(t, {pointerId: 7, clientX: x, clientY: y, bubbles: true}));
  fire('pointerdown', 60, 60); fire('pointermove', 100, 60); T.sim(1); T.ok(__SB.IN.mz > .5, 'forward expected, got ' + __SB.IN.mz); fire('pointerup', 100, 60); });
T.test('orientation change mid-game', () => { Object.defineProperty(window, 'innerWidth', {value: 640, configurable: true});
  Object.defineProperty(window, 'innerHeight', {value: 360, configurable: true}); window.dispatchEvent(new Event('resize'));
  T.ok(!document.getElementById('app').classList.contains('rot90')); T.eq(__SB.viewW(), 640); T.eq(__SB.viewH(), 360); });
// tests/orient_desktop.test.js  (viewport 1280x720, no touch)
T.test('desktop never rotates', () => { T.ok(!document.getElementById('app').classList.contains('rot90')); T.eq(__SB.viewW(), 1280); });
```

- [ ] **Step 2: Eseguire** → FAIL (`#app` non esiste).
- [ ] **Step 3: Implementare** come in Interfaces; `mk.sh`: `FILES="… j_enemies.js r_orient.js k_game.js"` (Task 7 inserirà `m_story.js` prima di `r_orient.js`); esportare `viewW`, `viewH`, `touchXY`, `applyOrient` in `__SB`.
- [ ] **Step 4: Verificare** — entrambi i file di orientamento e tutti i precedenti PASS; screenshot a 360×640 touch dopo "Nuova partita" con HUD e pulsanti al loro posto (controllo a vista).
- [ ] **Step 5: Commit** — `git commit -am "feat: landscape-only on phones with CSS rotation fallback and remapped touch"`

### Task 6: Scelta del personaggio ed eroina provvisoria

**Files:**
- Modify: `sb/src/e_chars.js`, `sb/src/i_player.js`, `sb/src/head.html`, `sb/src/k_game.js`
- Test: `sb/tests/charsel.test.js`

**Interfaces:**
- Consumes: `P.hero` e salvataggio (Task 4), `padMenu` (Task 2).
- Produces: `HEROINE_D = {hip:.93, spine:.1, torso:.47, neck:.07, shW:.19, shDrop:.07, upper:.28, fore:.25, hipW:.11, thigh:.43, shin:.42}`; `heroineBuild(add,d)`: stessa palette e pezzi dell'eroe, spalle più strette, vita più sottile, cappuccio abbassato, capelli raccolti in una treccia di 4 segmenti fino a metà schiena; `createPlayer(hero:'m'|'f')`; `setHero(hero:'m'|'f'):void` (ricostruisce rig, mantello, scia, fiaschetta e spada se il corpo cambia); `animPlayer` passa `PL.rig.d` a `gaitIK` (non più `HERO_D`).
- Schermata `#charsel`: titolo "Scegli l'erede", pulsanti `#csM` "Eroe" e `#csF` "Eroina"; tastiera ←/→ e Invio; touch e clic; controller con `padMenu`. "Nuova partita" apre `#charsel`; la scelta chiama `startGame(false, hero)`; `startGame(true)` usa `P.hero` del salvataggio.
- `#charsel` entra nell'elenco `SCREENS`. La presentazione 3D dei due personaggi sulla Cresta arriva nella tappa 5; qui basta la schermata.
- Esportare `HEROINE_D`, `setHero` in `__SB`.

- [ ] **Step 1: Scrivere i test**

```js
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
```

- [ ] **Step 2: Eseguire** → FAIL (`#charsel` non esiste).
- [ ] **Step 3: Implementare** come in Interfaces.
- [ ] **Step 4: Verificare** — `charsel.test.js` e tutti i precedenti PASS; screenshot laterale e frontale di eroe ed eroina affiancati al santuario iniziale (controllo a vista: proporzioni, treccia, nessun pezzo staccato).
- [ ] **Step 5: Commit** — `git commit -am "feat: character select with provisional procedural heroine"`

### Task 7: Testi declinati e sistema di dialogo

**Files:**
- Create: `sb/src/m_story.js`
- Modify: `sb/src/a0_cfg.js` (`CFG.ui = {typeSpeed:48}`, caratteri al secondo), `sb/src/head.html` (`#dialog` con `#dlgWho`, `#dlgText`, `#dlgChoices`, `#dlgMore`; riquadro in basso, leggibile a 360 px di altezza), `sb/src/k_game.js` (stato `dialogue` nel ciclo e negli input), `sb/mk.sh` (`m_story.js` prima di `r_orient.js`)
- Test: `sb/tests/dialogue.test.js`

**Interfaces:**
- Consumes: `addBraci` (Task 2), `P.flags`, `P.hero` (Task 4).
- Produces: `gtxt(s:string, hero=P.hero):string` (sostituisce ogni `{a|b}` con `a` per `'m'` e `b` per `'f'`; parentesi non chiuse o senza `|` restano come sono); `defineDialogue(id:string, nodes:Object)` con nodo `{who:string, text:string, next?:string, choices?:Array<{t:string, next?:string, act?:string}>, act?:string}` e nodo iniziale `start`; `dlgStart(id):boolean` (`false` se `G.state!=='play'`, se c'è già un dialogo o se un nemico in allerta è entro 14 m); `dlgNext():void` (completa la scrittura, altrimenti passa al nodo `next` o chiude); `dlgChoose(i:number):void`; `dlgActive():boolean`; `storyAct(a:string):void` con `flag:<nome>` e `braci:<n>` (prefissi sconosciuti: `console.warn`, nessun errore). L'`act` di un nodo si esegue quando il nodo appare, quello di una scelta quando la si sceglie.
- `G.state='dialogue'`: il mondo è fermo come in pausa; scorrono solo testo e HUD. Input: E, Spazio, Invio, clic o tocco sul riquadro, A del controller → `dlgNext`; 1-3, clic, tocco o croce+A → scelte; Esc e Start ignorati durante il dialogo. Il testo viene risolto con `gtxt` prima di iniziare a scorrere.
- Durante il dialogo E non attiva l'interazione col mondo. Nessun ritratto in questa tappa: arriva con i modelli Meshy (tappa 3).
- Esportare tutte le funzioni sopra in `__SB`.

- [ ] **Step 1: Scrivere i test**

```js
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
```

- [ ] **Step 2: Eseguire** → FAIL (`S.gtxt is not a function`).
- [ ] **Step 3: Implementare** come in Interfaces.
- [ ] **Step 4: Verificare** — `dialogue.test.js` e tutti i precedenti PASS; screenshot di un dialogo con scelte a 640×360 e a 360×640 touch (ruotato).
- [ ] **Step 5: Commit** — `git commit -am "feat: gendered text and dialogue system with choices on all inputs"`

### Task 8: Missioni, diario e contenuti della tappa

**Files:**
- Modify: `sb/src/m_story.js`, `sb/src/k_game.js`, `sb/src/head.html` (`#journal` con elementi `.jq`; pulsante `#pJournal` "Diario" nel menu di pausa; pulsante touch `#tJournal` con icona a libro in `#tTop`)
- Test: `sb/tests/quest.test.js`

**Interfaces:**
- Consumes: dialoghi e `storyAct` (Task 7), menu del santuario (Task 2).
- Produces: `defineQuest({id, title, kind:'main'|'side', steps:[{hint:string, on?:{type:string, …}, count?:number}], done?:string})`; `questStart(id):void` (idempotente, toast "Nuova missione: <title>"); `questStep(id):number` (−1 se non iniziata, `steps.length` se finita); `questIsDone(id):boolean`; `questAdvance(id):void`; `storyEvent(type:string, data={}):void` (fa avanzare ogni missione attiva il cui passo ha `on.type===type` e tutte le altre chiavi di `on` uguali in `data`; con `count`, avanza quando `P.quests[id].n` arriva a `count`); `mainHint():string` (suggerimento del passo attuale della missione principale, con `{n}` sostituito dal progresso); toast "Missione completata: <title>" ed esecuzione di `done` con `storyAct`; `storyAct` impara `quest:<id>`; `openJournal():void` (stato `journal`, missioni attive prima, poi quelle completate con classe `done`).
- Eventi da lanciare: `kill {type, camp, boss}` in `killEnemy`, `camp {i}` in `checkCamp`, `chest {i}` in `openChest`, `rest {shrine}` in `restAtShrine`, `talk {who}` all'avvio di un dialogo.
- `objective()` mostra `mainHint()` nel riquadro obiettivo (la bussola resta com'è fino alla tappa 2).
- Diario: tasto N, `#pJournal` nel menu di pausa (anche col controller tramite `padMenu`), `#tJournal` su touch; si chiude con N, Esc, B o il pulsante "Chiudi".
- Contenuti esatti della tappa 1 (`questStart('valle')` e `questStart('selin')` a ogni nuova partita):

```js
defineQuest({id: 'valle', title: 'La Valle di Cenere', kind: 'main',
  steps: [{hint: "Libera la valle: distruggi un accampamento goblin e apri il forziere del suo capo ({n}/4).", on: {type: 'chest'}, count: 4}]});
defineQuest({id: 'selin', title: 'La voce del santuario', kind: 'side',
  steps: [{hint: 'Riposa a un santuario: avvicinati al cristallo blu.', on: {type: 'rest'}}]});
defineDialogue('selin1', {
  start: {who: 'Selin', text: "Un'altra fiamma nella tempesta… Sei stanc{o|a}, erede, ma ancora viv{o|a}.", next: 'b'},
  b: {who: 'Selin', text: 'Le braci dei caduti restano su di te. Qui puoi spenderle per diventare più forte.', next: 'c'},
  c: {who: 'Selin', text: 'Ma se cadi, resteranno dove sei cadut{o|a}. Torna a prenderle prima di cadere ancora.',
    choices: [{t: 'Chi sei?', next: 'who'}, {t: 'Andrò avanti.', next: 'end'}]},
  who: {who: 'Selin', text: 'Sono Selin. Ero la voce dei Custodi, quando i Custodi avevano ancora una voce.', next: 'end'},
  end: {who: 'Selin', text: "Va', stranier{o|a}. Il diario ricorderà quello che dimentichi.", act: 'flag:selinMet'}});
```

- In `restAtShrine`: si legge `const meet = !P.flags.selinMet` **prima** di `storyEvent('rest',…)`; se `meet`, dopo l'animazione parte `selin1` (che imposta il flag nel nodo `end`) e alla fine del dialogo si apre il menu del santuario; altrimenti si apre subito il menu.
- `#journal` entra nell'elenco `SCREENS`.

- [ ] **Step 1: Scrivere i test**

```js
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
T.test('journal opens with N and lists quests', () => { T.eq(S.G.state, 'play'); T.key('KeyN'); T.sim(1); T.key('KeyN', false);
  T.ok(!document.getElementById('journal').hidden); const items = [...document.querySelectorAll('#journal .jq')].map(e => e.textContent);
  T.ok(items.some(t => t.includes('La Valle di Cenere'))); T.ok(items.some(t => t.includes('La voce del santuario'))); T.key('KeyN'); T.sim(1); T.key('KeyN', false); T.eq(S.G.state, 'play'); });
T.test('journal reachable from pause and touch', () => { T.ok(document.getElementById('pJournal')); T.ok(document.getElementById('tJournal')); });
```

- [ ] **Step 2: Eseguire** → FAIL (`S.questStep is not a function`).
- [ ] **Step 3: Implementare** come in Interfaces.
- [ ] **Step 4: Verificare** — `quest.test.js` e tutti i precedenti PASS; screenshot del diario a 640×360.
- [ ] **Step 5: Commit** — `git commit -am "feat: quests, journal and stage-1 content (Selin at the first shrine)"`

### Task 9: Integrazione, misure e pubblicazione

**Files:**
- Modify: `sb/src/k_game.js` (`fillControls`, tutorial, codice morto), `sb/src/head.html` (testi dei comandi)
- Test: tutti i file in `sb/tests/`, più le sonde v5 `probe_fight20.js` e `probe_perf.js`

**Interfaces:**
- Consumes: tutto quanto sopra.

- [ ] **Step 1: Comandi e tutorial**
  - Righe in `fillControls`. PC: `['Diario',['N']]`, `['Dialoghi: avanti',['E','Spazio']]`, `['Dialoghi: scelte',['1','2','3']]`. Touch: `['Diario','Libro in alto']`, `['Dialoghi','Tocca il riquadro o una scelta']`. Controller: `['Dialoghi','A · croce per le scelte']`, `['Diario','Start → Diario']`.
  - Al primo nemico ucciso: `hint('Le <b>braci</b> dei nemici sono tue: spendile ai santuari per salire di livello.',5)`.
  - Rimuovere ogni riferimento rimasto a `P.xp`, `P.pending`, `xpNeed`, `levelCheck`.
- [ ] **Step 2: Suite completa** — `for f in smoke regression braci drop save charsel dialogue quest; do python3 tests/run.py tests/$f.test.js || exit 1; done && python3 tests/run.py tests/orient.test.js --viewport 360x640 --touch --mobile && python3 tests/run.py tests/orient_desktop.test.js --viewport 1280x720` → tutto PASS, nessun PAGEERROR.
- [ ] **Step 3: Misure** — sonda della durata delle lotte (20 prove): 1 goblin ≤ 2,64 s e 3 goblin ≤ 5,16 s (v5 +5%); logica per frame nell'accampamento entro +0,1 ms dalla v5 (0,62-0,86 ms); tempo per frame nel ciclo reale uguale alla v5. Riportare i numeri in una riga.
- [ ] **Step 4: Pubblicare** — `bash mk.sh` e pubblicazione con lo strumento Artifact sullo stesso percorso `scratchpad/stormblade.html`.
- [ ] **Step 5: Commit** — `git commit -am "chore: stage 1 integration, controls text, measurements"`
