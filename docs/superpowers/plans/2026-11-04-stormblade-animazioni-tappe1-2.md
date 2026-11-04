# Stormblade · Animazioni, tappe 1-2 · Piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** fare la tappa 1 (piedi e scheletro Meshy) e la tappa 2 (camminata, corsa e fermo dalle clip) del design delle animazioni. Ognuna finisce pubblicata sulla pagina Claude, con un video prima/dopo.

**Architecture:**
- Il motore delle pose resta quello di oggi: `pose`, `track` e `gaitIK` in `src/e_chars.js`, `animPlayer` in `src/i_player.js`, il trasferimento sul modello in `src/l_meshy.js`.
- Il vettore di pose passa a 43 valori. Petto, clavicole e punte dei piedi sono giunture virtuali senza mesh, usate solo dal modello Meshy.
- `gaitIK` riceve le misure delle gambe Meshy e posa i piedi sul terreno. Dalla tappa 2 prende busto e braccia dalle clip, convertite offline da `tools/anim/` nel file `src/n_anims.js`.

**Tech Stack:** Three.js r128 (nei test la copia locale `three.min.js`), JavaScript vanilla, Python 3 + Playwright (Chrome senza schermo, SwiftShader), ffmpeg per i video.

**Spec:** `docs/superpowers/specs/2026-11-04-stormblade-animazioni-design.md`: §1, le righe delle tappe 1-2 in §3, poi §4, §5, §6 e le righe 1-2 di §7. I percorsi qui sotto sono relativi alla radice del repository.

## Global Constraints

- "il gioco resta identico": `CFG.moves` non cambia (`dur`, `hit`, `cancel`, `dodge`, `lunge`, `iframe`).
- Lama: arco e portata nella finestra di colpo restano entro il 10% di `tests/anim_ref.json`.
- "1 goblin ≤ 2,64 s, 3 goblin ≤ 5,16 s (20 prove)": sonda `tests/probes/fight20.json`.
- Piedi, nella metà centrale dell'appoggio:
  - la caviglia si muove a meno del 2% della velocità del corpo;
  - la sua altezza dal terreno sotto il piede resta tra −1 cm e +3 cm rispetto a quella da fermo;
  - vale per l'eroe con il modello Meshy e per l'eroina.
- "la logica per frame resta entro +0,1 ms" (sonda `tests/probes/perf.json`, confronto con la misura prima della tappa). `animPlayer` non crea oggetti a ogni frame.
- `src/n_anims.js` resta sotto i 100 KB.
- I valori di regolazione stanno nella nuova sezione `CFG.anim` di `src/a0_cfg.js`.
- Restano invariati i comandi touch, tastiera e mouse e controller. Nessuna luce in più e nessun errore in console.
- Ogni tappa finisce così:
  - suite verde;
  - pagina https://claude.ai/artifact/F1UdPywZreUDQFCw9NxgU4 aggiornata con `index.html` (i file del modello restano quelli già pubblicati);
  - video prima/dopo mandato a Denis.

**Definizioni usate dai test**
- **Metà centrale dell'appoggio.** Per la gamba `i` (0 sinistra, 1 destra) la fase è φ = (`P.gait.ph` + i/2) mod 1. Il piede è in appoggio se φ < `P.gait.duty`, ed è nella metà centrale se 0,25 < φ/`duty` < 0,75.
- **Altezza da fermo.** Altezza della caviglia sul piano della radice (`R.root.position.y`) dopo 1 s fermi.
- **Camminata e corsa nei test.**
  - Camminata: controller con levetta sinistra (0, −0,4), circa 0,85 m/s.
  - Corsa: tasto W, 5,4 m/s.
  - Partenza da `S.tp(0, 30)` con `S.CAM.yaw = 0` e `S.P.yaw = 0`: si va verso −z, in pendenza.

## Review Focus

1. Una fusione rimasta appesa dopo la rinascita o un teletrasporto mostrerebbe per un attimo la posa del colpo di prima. Test in Task 6: `blend does not survive respawn`.
2. Bordi delle piattaforme (`FLOORS`) e pendenze ripide: il bacino non scende oltre 15 cm e la posa non contiene valori non numerici. Test in Task 3: `floor edge keeps the pelvis sane`.
3. Passi di lato e all'indietro quando sei agganciato a un nemico: la clip è una camminata in avanti, quindi pesa solo sulla parte in avanti del movimento. Test in Task 11: `backpedal keeps today's arm swing`.
4. Cambio di personaggio a metà partita (eroe → eroina → eroe): le misure delle gambe Meshy si ricalcolano. Test in Task 2: `hero switch keeps Meshy leg measures`.
5. Prima persona: la testa resta nascosta anche durante una fusione. Test in Task 6: `first person keeps the head hidden`.

## Mappa dei file

| File | Responsabilità | Task |
|---|---|---|
| `src/e_chars.js` | `NP`, `PK`, `pose`, giunture virtuali in `buildHuman`; `gaitIK` (misure, fase, terreno, punte, clip, respiro); `Cape` senza allocazioni | 1-4, 8, 10-12 |
| `src/l_meshy.js` | righe per petto, clavicole e punte; `MESHY.legD` | 1, 2 |
| `src/i_player.js` | `animPlayer`: misure, terreno, clavicole calcolate, fusione | 2-4, 6 |
| `src/f_fx.js` | `Trail` senza allocazioni | 8 |
| `src/a0_cfg.js` | `CFG.anim` | 3, 4, 6, 11, 12 |
| `src/k_game.js` | esportazioni di test in `__SB`; `resetBlend` in `respawn`, `placeAtShrine`, `tp` | 3, 6 |
| `src/n_anims.js` (generato) | cicli di camminata e corsa convertiti | 10 |
| `mk.sh` | `n_anims.js` subito dopo `a0_cfg.js` | 10 |
| `tests/run.py` | opzioni `--data`, `--dump`, `--http` | 1, 7 |
| `tests/anim.test.js` (nuovo) | trasferimento, piedi, clavicole e punte, fusione, allocazioni, cicli, respiro | 1-4, 6, 8, 10-12 |
| `tests/anim_zero.json`, `tests/anim_ref.json` (generati) | riferimenti: trasferimento con i valori nuovi a zero; lama | 1, 5 |
| `tests/blade.test.js` (nuovo) | arco e portata della lama | 5, 6 |
| `tests/vendor/mini_gltf.js` (nuovo) | caricatore minimo di `hero.json` per test e video | 7 |
| `tests/meshy_http.test.js` (nuovo) | modello Meshy vero, caricato via http | 7 |
| `tools/anim/video.py` (nuovo) | video prima/dopo | 7 |
| `tools/anim/` (nuovi: `clip2json.py`, `test_clip2json.py`, `bake.js`, `bake.py`, `bake.sh`, `moves.json`) | convertitore | 9, 10 |
| `docs/HANDOFF.md` | elenco dei test e degli strumenti | 8, 13 |

**Esecuzione dei test**: `bash mk.sh >/dev/null && python3 tests/run.py tests/<file>.test.js [opzioni]`. `anim.test.js` gira sempre con `--data tests/anim_zero.json`, `blade.test.js` con `--data tests/anim_ref.json`. La suite completa è quella di `docs/HANDOFF.md` ("Tutti i test") più `anim`, `blade` e `meshy_http --http`.

---

## Tappa 1 — Piedi e scheletro Meshy

### Task 1: Vettore di pose a 43 valori e giunture virtuali

**Files:**
- Modify: `src/e_chars.js` (`NP`, `PK`, `pose`, `buildHuman`), `src/l_meshy.js` (`MESHY_MAP`, `setupMeshyHero`), `tests/run.py`
- Create: `tests/anim.test.js`, `tests/anim_zero.json` (generato)

**Interfaces:**
- Produces:
  - `NP=43`. `PK` aggiunge `chest:[34,35,36]`, `clL:[37,38]`, `clR:[39,40]`, `toeL:[41]`, `toeR:[42]`.
  - Valori nelle pose scritte a mano (in gradi):
    - `chest` come `spi`: il pitch positivo piega in avanti, e `pose()` lo inverte come per `spi`;
    - `clL`/`clR` = `[alza, avanti]`: positivo = spalla in su e spalla in avanti, su entrambi i lati;
    - `toeL`/`toeR`: positivo = punte piegate in su.
  - `rig.V={chest,clL,clR,toeL,toeR}`: `THREE.Object3D` senza mesh e fuori da `rig.P`, quindi non sono ossa dello scheletro. `chest`, `clL` e `clR` sono figli di `P.spi`; `toeL` e `toeR` di `P.ftL` e `P.ftR`. `rig.apply(p)` imposta le loro rotazioni da `p[34..42]`, con segni scelti in modo che i test di questo task passino.
  - `MESHY_MAP`:
    - `Spine` e `neck` usano `p:'chest'`;
    - `LeftShoulder` e `RightShoulder` usano `p:'clL'` e `p:'clR'` (sempre `fixed:1`);
    - in fondo, righe nuove `{m:'LeftToeBase',p:'toeL',cOf:'LeftFoot'}` e `{m:'RightToeBase',p:'toeR',cOf:'RightFoot'}`. Una riga con `cOf` copia `C` dalla riga indicata e ricalcola `CQm0`. Con le punte a zero l'osso resta dove lo porta il piede, come oggi.
  - `setupMeshyHero` cerca le giunture con `R.P[n]||R.V[n]`.
  - `run.py --data FILE.json` definisce `window.TDATA` prima del test. `run.py --dump FILE.json` scrive `window.TDUMP` nel file dopo il test.
- Aiuti in `tests/anim.test.js`, usati dai task seguenti:
  - `SKEL`: i 26 nodi di `hero.json`, generati al passo 1;
  - `realMeshy()`: ossa da `SKEL` più un box con skinning sotto il nodo 25, come `fakeMeshy` in `tests/meshy.test.js`;
  - `meshyOn(hero='m')`: `T.newGame({hero}); T.clearEnemies();`, poi il rig si ricostruisce da zero (`S.MESHY.gltf=null`, `S.setHero` sull'altro corpo e ritorno). Per l'eroe: `g=realMeshy()`, `S.MESHY.gltf=g`, `S.MESHY.bind` come in `loadMeshyHero` (osso, quaternione e posizione di ogni osso, presi prima di posarlo), poi `S.setupMeshyHero(g)`. Così in scena c'è sempre un solo modello;
  - `bonesQ()`: rotazioni nel mondo di tutte le ossa in `S.MESHY.B`, come array di quaternioni.

- [ ] **Step 1: Riferimento, prima di toccare il codice**
  - Generare `SKEL` con questo comando e incollarlo in testa a `tests/anim.test.js`:
    ```bash
    python3 -I -c "import json;g=json.load(open('assets/meshy/hero/hero.json'));N=g['nodes'];P={c:i for i,n in enumerate(N) for c in n.get('children',[])};J=set(g['skins'][0]['joints']);print('const SKEL='+json.dumps([{'i':i,'n':n['name'],'p':P.get(i),'t':n.get('translation',[0,0,0]),'r':n.get('rotation',[0,0,0,1]),'s':n.get('scale',[1,1,1]),'bone':i in J} for i,n in enumerate(N) if 'mesh' not in n],separators=(',',':'))+';')"
    ```
  - Test `extras at zero change nothing`. Per 4 pose fisse (`S.HP.idle`, `S.HP.guard`, `evalTrack(S.HT.light1,.2)`, `evalTrack(S.HT.heavy,.37)`) chiama `R.apply(p)`, `R.root.updateMatrixWorld(true)`, `S.meshySync()` e raccoglie `bonesQ()`.
    - Senza `TDATA` scrive tutto in `TDUMP` e passa.
    - Con `TDATA` confronta: |Δ| < 1e-5 per componente.
    - Per `evalTrack` esportare `evalTrack` in `__SB`.
  - Registrare con il codice di oggi: `python3 tests/run.py tests/anim.test.js --dump tests/anim_zero.json`.
- [ ] **Step 2: Test nuovi**
  ```js
  // con S.PL.rig.apply(pose(...)) + updateMatrixWorld + meshySync dopo meshyOn()
  T.test('clavicle raise lifts the Meshy shoulder', …)   // {clL:[20,0]} su HP.idle: LeftArm sale ≥ 0,01 m; {clR:[20,0]}: RightArm sale ≥ 0,01 m;
                                                         // {clL:[0,20]}: LeftArm si sposta ≥ 0,01 m nella direzione in cui guarda l'eroe
  T.test('toe bend turns the Meshy toes', …)             // {toeL:30}: rotazione di LeftToeBase diversa di 30 ± 2° rispetto a toeL 0, e il suo asse +Y locale sale
  T.test('chest turns only the upper back', …)          // {chest:[0,20,0]}: Spine ruota di 20 ± 2°; Spine01, Spine02, Head, LeftArm, RightArm cambiano < 0,1°
  ```
- [ ] **Step 3: Eseguire** `anim.test.js --data tests/anim_zero.json` → FAIL: `pose()` non conosce `clL` (TypeError).
- [ ] **Step 4: Implementare** come in Interfaces.
- [ ] **Step 5: Verificare**: `anim --data tests/anim_zero.json`, `meshy`, `smoke`, `regression`, `charsel` → PASS.
- [ ] **Step 6: Commit**: `git commit -am "feat: pose vector with chest, clavicles and toes for the Meshy hero"` (con i file nuovi aggiunti).

### Task 2: Le gambe Meshy nel passo

**Files:**
- Modify: `src/l_meshy.js` (`MESHY.legD`), `src/e_chars.js` (`gaitIK` scrive `st.duty`), `src/i_player.js` (`animPlayer`)
- Test: `tests/anim.test.js`

**Interfaces:**
- Consumes: `realMeshy`, `meshyOn` (Task 1).
- Produces:
  - `MESHY.legD={thigh,shin,hipW}`, in metri, misurati in `setupMeshyHero` sulla posa di riposo calibrata: |LeftUpLeg − LeftLeg|, |LeftLeg − LeftFoot|, |LeftUpLeg − RightUpLeg| / 2. Per `hero.json` sono circa 0,391, 0,379 e 0,111.
  - `animPlayer` chiama `gaitIK(_L,_A,P.gait,MESHY.on?MESHY.legD:PL.rig.d,1,…)`.
  - `P.gait.duty`: quota di appoggio, scritta da `gaitIK` a ogni frame.
- Aiuti nei test:
  - `move(mode)`: `'walk'` imposta il controller finto con levetta (0, −0,4); `'jog'` imposta `S.KEYS.KeyW = true`; `'stop'` toglie entrambi.
  - `stance(mode, frames, fn)`: parte da (0,30), lascia andare 60 frame a regime, poi a ogni frame chiama `fn(i, mid)` per ciascuna gamba, con `mid` vero nella metà centrale dell'appoggio.
  - `slidePct(boneOf, mode)`: velocità orizzontale media della caviglia (`boneOf(i)`) nei frame `mid`, divisa per la velocità del corpo, in %.

- [ ] **Step 1: Test**
  ```js
  T.test('Meshy feet planted when walking', () => { meshyOn(); T.ok(slidePct(i => S.MESHY.B[i ? 'RightFoot' : 'LeftFoot'], 'walk') < 2); });
  T.test('hero switch keeps Meshy leg measures', () => { meshyOn(); S.setHero('f'); S.setHero('m');   // meshyAttach rimonta MESHY.gltf T.ok(S.MESHY.on); T.near(S.MESHY.legD.thigh, .391, .005);
    T.ok(slidePct(i => S.MESHY.B[i ? 'RightFoot' : 'LeftFoot'], 'walk') < 2); });
  ```
- [ ] **Step 2: Eseguire** → FAIL (scivolamento circa 10%, `legD` non definito).
- [ ] **Step 3: Implementare** come in Interfaces.
- [ ] **Step 4: Verificare**: `anim`, `meshy`, `charsel` (piedi dell'eroina), `regression` → PASS.
- [ ] **Step 5: Commit**: `git commit -am "fix: Meshy hero feet stay planted (gait uses the model's leg lengths)"`

### Task 3: Piedi sul terreno e bacino che si abbassa

**Files:**
- Modify: `src/e_chars.js` (`gaitIK`), `src/i_player.js` (`_gnd`), `src/a0_cfg.js`, `src/k_game.js` (esportare `FLOORS` e `lastPose`)
- Test: `tests/anim.test.js`

**Interfaces:**
- Produces:
  - `CFG.anim={reach:.985, footMaxDrop:.15, footMaxRise:.25, dropRate:14}`. I task seguenti aggiungono altre chiavi.
  - Opzione `opt.gnd(i,xf,xs)→number` di `gaitIK`:
    - restituisce l'altezza del terreno (m) sotto il punto del piede della gamba `i`, rispetto al piano della radice;
    - `xf` e `xs` sono gli spostamenti in avanti e a destra di quel punto dall'anca, come già calcolati in `gaitIK`;
    - il valore si limita a [−`footMaxDrop`, `footMaxRise`] e si toglie dall'altezza `V` che la gamba deve raggiungere.
  - Bacino che si abbassa:
    - prima di risolvere le gambe, `gaitIK` calcola per ogni gamba in appoggio di quanto va abbassato il bacino perché la distanza dal piede scenda a `LEG·reach`;
    - abbassa `o[0]` del valore più grande, smussato con `st.drop=damp(st.drop,drop,dropRate,dt)` e limitato a `footMaxDrop`.
  - `_gnd(i,xf,xs)` in `i_player.js`, passato da `animPlayer`:
    - con F = `fwdV(ry)`, destra = (−F.z, 0, F.x) e lato = `i?1:-1`;
    - x = radice.x + F.x·xf + destra.x·(lato·d.hipW + xs), e lo stesso per z, con `d` le misure delle gambe in uso;
    - restituisce `gY(x,z)` meno l'altezza della radice di questo frame;
    - radice e direzione di questo frame (`P.pos`, lo scostamento `P.fo`, `ry`) si calcolano in `animPlayer` prima di `gaitIK`, non dopo come oggi;
    - nessun oggetto creato: solo variabili del modulo.
  - `__SB.lastPose()` restituisce `_F`, la posa finale del giocatore, come riferimento vivo.
- Aiuto nei test: `heights(ankleOf, mode)`. Nei frame `mid`, calcola (y della caviglia − `S.gY` sotto la caviglia) − altezza da fermo e restituisce `{min, max}`.

- [ ] **Step 1: Test**
  ```js
  T.test('feet follow the slope', () => { for (const hero of ['m', 'f']) for (const mode of ['walk', 'jog']) {
    meshyOn(hero); const h = heights(hero === 'm' ? i => S.MESHY.B[i ? 'RightFoot' : 'LeftFoot'] : i => S.PL.rig.P[i ? 'ftR' : 'ftL'], mode);
    T.ok(h.min >= -.01 && h.max <= .03, hero + ' ' + mode + ' ' + JSON.stringify(h)); } });
  T.test('Meshy feet planted when jogging', () => { meshyOn(); T.ok(slidePct(i => S.MESHY.B[i ? 'RightFoot' : 'LeftFoot'], 'jog') < 2); });
  T.test('heroine feet planted', () => { for (const m of ['walk', 'jog']) { meshyOn('f'); T.ok(slidePct(i => S.PL.rig.P[i ? 'ftR' : 'ftL'], m) < 2, m); } });
  T.test('floor edge keeps the pelvis sane', () => { meshyOn(); const f = S.FLOORS[0], r = Math.sqrt(f.r2);
    // partenza a r + 0,5 m dal centro, girati verso il centro, corsa per 120 frame
    // a ogni frame: S.P.gait.drop ≤ CFG.anim.footMaxDrop + 1e-6 e ogni valore di S.lastPose() è finito
  });
  ```
- [ ] **Step 2: Eseguire** → FAIL: altezze di ±5 cm in pendenza, scivolamento del 2,4% in corsa.
- [ ] **Step 3: Implementare** come in Interfaces.
- [ ] **Step 4: Verificare**: `anim`, `charsel`, `regression`, `smoke` → PASS.
- [ ] **Step 5: Commit**: `git commit -am "feat: feet follow the terrain, pelvis drops when a planted foot cannot reach"`

### Task 4: Clavicole e punte calcolate

**Files:**
- Modify: `src/i_player.js` (`extrasLayer`), `src/e_chars.js` (`gaitIK`, punte), `src/a0_cfg.js`
- Test: `tests/anim.test.js`

**Interfaces:**
- Produces:
  - `CFG.anim` aggiunge `clavFrom:60, clavGain:.3, clavMax:22, toeGain:.9, toeMax:35` (gradi).
  - `extrasLayer(p:Float32Array):void`, chiamata da `animPlayer` sulla posa finale prima di `R.apply`:
    - per ogni lato calcola elev = angolo in gradi tra il braccio e la verticale verso il basso, dagli angoli della spalla (`p[9..11]` sinistra, `p[13..15]` destra; ordine YXZ; braccio a riposo = (0, −1, 0));
    - aggiunge clamp((elev − `clavFrom`)·`clavGain`, 0, `clavMax`) gradi all'alzata (`p[37]` sinistra, `p[39]` destra, in radianti);
    - nessun oggetto creato.
  - Punte in `gaitIK`: nel primo 35% del volo, quando il piede punta in giù, `o[41+i]` = clamp(−toe·`toeGain`, 0, `toeMax`·DEG)·w; altrimenti 0.

- [ ] **Step 1: Test**
  ```js
  T.test('raised arm lifts the clavicle', () => { meshyOn(); T.sim(30); T.ok(Math.abs(S.lastPose()[39]) < .5 * D2R, 'idle');
    S.startAct('light4'); while (S.P.act.t < .19) T.sim(1); T.ok(S.lastPose()[39] >= 15 * D2R, 'overhead ' + S.lastPose()[39] / D2R); });
  T.test('toes bend at push-off', () => { meshyOn(); /* corsa 2 s: in ogni passo il massimo di p[41] ≥ 15°; nei frame mid |p[41]| ≤ 3° */ });
  ```
- [ ] **Step 2: Eseguire** → FAIL (i valori nuovi sono sempre zero).
- [ ] **Step 3: Implementare** come in Interfaces.
- [ ] **Step 4: Verificare**: `anim`, `regression`, `smoke`, `charsel` → PASS.
- [ ] **Step 5: Commit**: `git commit -am "feat: computed clavicles and toes for the Meshy hero"`

### Task 5: Riferimento della lama

**Files:**
- Create: `tests/blade.test.js`, `tests/anim_ref.json` (generato)

**Interfaces:**
- `blade(k, from)` gira in una partita nuova senza nemici. Per `riposte` mette un goblin a 1,5 m davanti, con `stun = 1.2`, passato come `{tgt}`. Se `from` è indicato, avvia prima quell'attacco e poi `startAct(k)` al suo tempo `cancel`.
- Registra ogni frame la punta della spada (`S.PL.sw.tip` nel mondo) mentre `P.act.t` è dentro `hit`. Restituisce `{arc, range}`:
  - `arc`: ampiezza in gradi dell'angolo della punta attorno al giocatore (atan2 di punta − `P.pos`, srotolato);
  - `range`: distanza orizzontale massima tra punta e `P.pos`.
- Casi:
  - da soli: `light1`, `light2`, `light3`, `light4`, `heavy`, `runatk`, `spin`, `riposte`;
  - in catena: `light2` dopo `light1`, `light3` dopo `light2`, `light4` dopo `light3`.
- Senza `TDATA` il test scrive tutti i casi in `TDUMP`. Con `TDATA` ogni caso deve restare entro il 10% del riferimento, sia per l'arco sia per la portata.

- [ ] **Step 1: Scrivere** `tests/blade.test.js` (test `blade arc and range match the reference`).
- [ ] **Step 2: Registrare** con il codice di oggi: `python3 tests/run.py tests/blade.test.js --dump tests/anim_ref.json`.
- [ ] **Step 3: Verificare**: `blade --data tests/anim_ref.json` → PASS. È un riferimento: protegge il Task 6 e le tappe 3-5.
- [ ] **Step 4: Commit**: `git commit -am "test: blade arc and range reference for every attack"` (con i file nuovi aggiunti).

### Task 6: Fusione tra le mosse

**Files:**
- Modify: `src/i_player.js` (`animPlayer`, `resetBlend`, `setHero`), `src/k_game.js` (`respawn`, `placeAtShrine` e `tp` di `__SB` chiamano `resetBlend`; esportare `resetBlend`), `src/a0_cfg.js` (`CFG.anim.blend=.08`)
- Test: `tests/anim.test.js`, `tests/blade.test.js`

**Interfaces:**
- Produces:
  - `_B=new Float32Array(NP)`, `P.blendT`, `PL.lastAct`.
  - All'inizio di `animPlayer`, se `P.act!==PL.lastAct`: `_B.set(_F)` (la posa del frame prima), `P.blendT=CFG.anim.blend`, `PL.lastAct=P.act`.
  - Dopo `mixPose(_F,_L,_A,P.aw)` e il colpo leggero subito (`flinch`), finché `P.blendT>0`: `mixPose(_F,_B,_F,eOut(1-P.blendT/CFG.anim.blend))`, poi `P.blendT-=dt`.
  - `resetBlend():void` imposta `P.blendT=0` e `PL.lastAct=P.act`. La chiama anche `setHero`.

- [ ] **Step 1: Test**
  ```js
  T.test('combo chain has no pose jump', () => { meshyOn(); T.sim(20); S.startAct('light1'); const d = []; let prev = [...S.lastPose()];
    // frame per frame fino a P.act.t ≥ CFG.moves.light1.cancel, poi S.startAct('light2') e altri 10 frame;
    // d[f] = max sulle giunture di |posa − posa del frame prima|
    // al frame della catena: d ≤ il massimo di d nei 5 frame prima
  });
  T.test('blend does not survive respawn', () => { meshyOn(); S.startAct('heavy'); T.sim(10); S.playerDie(); S.respawn(); T.sim(1);
    const a = [...S.lastPose()]; T.sim(10); /* fermi: max |a − S.lastPose()| < 1° */ });
  T.test('first person keeps the head hidden', () => { meshyOn(); S.setView(true); S.startAct('light1');
    /* catena light1 → light2 come sopra: a ogni frame S.PL.rig.P.head.scale.x ≤ .001 e S.MESHY.B.Head.scale.x ≤ .001 */ S.setView(false); });
  ```
- [ ] **Step 2: Eseguire** → FAIL: salto al frame della catena.
- [ ] **Step 3: Implementare** come in Interfaces.
- [ ] **Step 4: Verificare**: `anim`, `blade --data tests/anim_ref.json` (entro il 10%), `regression`, `smoke` → PASS.
- [ ] **Step 5: Commit**: `git commit -am "feat: short blend between moves"`

### Task 7: Caricatore minimo e video prima/dopo

**Files:**
- Create: `tests/vendor/mini_gltf.js`, `tests/meshy_http.test.js`, `tools/anim/video.py`
- Modify: `tests/run.py` (`--http`)

**Interfaces:**
- `mini_gltf.js` definisce `THREE.GLTFLoader` solo se manca. `load(url, onLoad, onProgress, onError)`:
  - legge il JSON e decodifica l'unico buffer in `data:`;
  - crea le ossa dai nodi (TRS e gerarchia) e una `SkinnedMesh` per primitiva, con `POSITION`, `NORMAL`, `TEXCOORD_0`, `JOINTS_0`, `WEIGHTS_0` e gli indici (tipi 5126, 5123, 5125, 5121);
  - usa un `MeshStandardMaterial` con `map` (colore di base), `normalMap`, `roughnessMap` e `metalnessMap` (texture metallo-ruvidità), con `flipY=false`;
  - lega lo scheletro con le matrici inverse di legame;
  - chiama `onLoad({scene, scenes:[scene], animations:[]})`.
- `run.py --http`:
  - serve la radice del repository su 127.0.0.1, su una porta libera, e apre `http://127.0.0.1:PORT/game_w.html`;
  - la richiesta del GLTFLoader al CDN riceve `tests/vendor/mini_gltf.js`; `three.min.js` resta la copia locale.
- `video.py --before DIR --after DIR --scene stage1|stage2 --out FILE.mp4`:
  - `DIR` è una copia del repository con `game_w.html` già costruito; le due pagine si aprono via http come sopra;
  - dopo il titolo ferma il ciclo in tempo reale (`requestAnimationFrame=()=>0`) e avanza con `__SB.sim(2)` più `__SB.Post.render(0)` per ogni fotogramma (30 al secondo);
  - camera di lato: posizione = giocatore + destra·4 + su·1,3, guarda il giocatore + su·1,0;
  - scene:
    - `stage1`: camminata 3 s da (0,30), corsa 3 s, fermo 1 s, combo `light1`→`light4` ai tempi `cancel`, colpo pesante;
    - `stage2`: camminata 3 s, corsa 3 s, scatto 2 s, frenata e fermo 1 s, giro sul posto 2 s, fermo 4 s;
  - 640×360 per lato, scritte "prima" e "dopo" (drawtext), `ffmpeg … hstack … -c:v libx264 -preset veryfast -crf 23 -pix_fmt yuv420p`;
  - esce con errore se `MESHY.on` è falso in una delle due pagine.

- [ ] **Step 1: Test** `Meshy hero loads over http` (`tests/meshy_http.test.js`, da lanciare con `--http`): `T.ok(S.MESHY.on); T.eq(S.MESHY.skin.skeleton.bones.length, 24);` poi 60 frame di camminata senza errori.
- [ ] **Step 2: Eseguire** con `--http` → FAIL: `MESHY.on` è falso perché manca il caricatore.
- [ ] **Step 3: Implementare** `mini_gltf.js` e `--http` → PASS.
- [ ] **Step 4: Implementare** `video.py` e verificarlo:
  - `git worktree add ../anim-before main && bash ../anim-before/mk.sh >/dev/null`;
  - `python3 tools/anim/video.py --before ../anim-before --after . --scene stage1 --out <scratchpad>/stage1.mp4`;
  - `ffprobe` → 1280×360, durata della scena ±0,5 s;
  - guardare tre fotogrammi (inizio, metà, fine) con Read.
- [ ] **Step 5: Commit**: `git commit -am "test: minimal glTF loader for hero.json; before/after video tool"` (con i file nuovi aggiunti).

### Task 8: Tappa 1 — niente allocazioni, misure, pubblicazione

**Files:**
- Modify: `src/e_chars.js` (`Cape.update`: le sfere di collisione si creano nel costruttore), `src/f_fx.js` (`Trail`: anello di vettori preparati una volta, posizioni scritte direttamente nell'attributo, nessun array letterale), `docs/HANDOFF.md`
- Test: `tests/anim.test.js`

- [ ] **Step 1: Test** `animPlayer makes no objects per frame`:
  - camminata, poi `light1` → `light2` (con la scia accesa);
  - 20 chiamate di `S.animPlayer(1/60)`, contando costruzioni e `clone()` di `THREE.Vector3`, `Quaternion`, `Euler`, `Matrix4` e `Color` con un proxy, come in `tests/meshy.test.js`;
  - atteso: 0, e in quei frame ogni valore di `S.lastPose()` è finito.
- [ ] **Step 2: Eseguire** → FAIL: oggi il mantello crea 6 `Vector3` a ogni frame.
- [ ] **Step 3: Implementare** → PASS.
- [ ] **Step 4: Suite completa**, con `anim`, `blade` e `meshy_http --http` → tutto PASS, nessun PAGEERROR.
- [ ] **Step 5: Misure**:
  - sonda `perf`, 3 prove sul `main` (prima) e 3 su HEAD → differenza ≤ 0,1 ms;
  - `fight20` e `fight20_nofx` → 1 goblin ≤ 2,64 s, 3 goblin ≤ 5,16 s;
  - una riga nel registro.
- [ ] **Step 6: Pubblicare e consegnare**:
  - `bash mk.sh` e `index.html` pubblicato con lo strumento Artifact sull'URL della pagina;
  - video `stage1` (prima = `main`) mandato a Denis con 2-3 righe (cosa cambia, misure, come provarlo) e il passo successivo;
  - si continua con il Task 9 senza aspettare; le richieste di Denis sul video vanno nel registro e nei task seguenti.
- [ ] **Step 7: Documentazione e commit**:
  - in `docs/HANDOFF.md`, nei test aggiungere `anim`, `blade`, `meshy_http --http` e `tools/anim/video.py`;
  - `git commit -am "chore: stage A1 animations integration, measurements"` e push del ramo.

---

## Tappa 2 — Camminata, corsa e fermo dalle clip

### Task 9: Lettore delle clip

**Files:**
- Create: `tools/anim/clip2json.py`, `tools/anim/test_clip2json.py`

**Interfaces:**
- `python3 tools/anim/clip2json.py IN.glb OUT.json` scrive `{"name","fps":30,"times":[…],"bones":{"<osso>":{"r":[[x,y,z,w],…],"t":[[x,y,z],…]}}}`.
- Legge l'unica animazione del GLB: canali di rotazione e di traslazione; la scala si ignora. I tempi restano quelli del file. Solo `struct` e `json`.

- [ ] **Step 1: Test** (unittest):
  - `hero_walk.glb` → 22 ossa, 32 tempi, ultimo tempo 1,0667 ± 0,001, ogni quaternione di lunghezza 1 ± 1e-4;
  - `hero_run.glb` → 20 tempi, ultimo 0,6667 ± 0,001.
- [ ] **Step 2: Eseguire** `python3 -m unittest tools/anim/test_clip2json.py` → FAIL (modulo mancante).
- [ ] **Step 3: Implementare** → PASS.
- [ ] **Step 4: Commit**: `git add tools/anim && git commit -m "feat: glTF clip reader for the animation converter"`

### Task 10: Convertitore e `src/n_anims.js`

**Files:**
- Create: `tools/anim/bake.js`, `tools/anim/bake.py`, `tools/anim/bake.sh`, `tools/anim/moves.json`, `src/n_anims.js` (generato)
- Modify: `mk.sh` (FILES: `a0_cfg.js n_anims.js a_core.js …`), `src/e_chars.js` (`animCycle`, `sampleCycle`)
- Test: `tests/anim.test.js`

**Interfaces:**
- `moves.json`: `{"walk":{"clip":"assets/meshy/hero/hero_walk.glb","cycle":true},"run":{"clip":"assets/meshy/hero/hero_run.glb","cycle":true}}`.
- `bake.sh` lancia `clip2json` per ogni clip e poi `bake.py`. `bake.py` apre `game_w.html` come `run.py` (file://) con `tests/lib.js` e `bake.js`, passa in `TDATA` le clip e lo scheletro (`{skel, clips}`, con `skel` calcolato da `hero.json` come la costante `SKEL` del Task 1) e scrive `TDUMP` in `src/n_anims.js`.
- `bake.js`, nella pagina:
  1. Costruisce lo scheletro vero da `TDATA.skel`, come `realMeshy()`, e chiama `setupMeshyHero`.
  2. Per ogni fotogramma della clip imposta le rotazioni locali delle ossa Meshy, e la traslazione verticale di `Hips` rispetto al legame; poi aggiorna le matrici.
  3. Inverte il trasferimento riga per riga: giuntura nel mondo = osso nel mondo · `CQm0`⁻¹ · `Qp0`.
     - `Hips` → `pel`; `Spine` → `chest`; `Head` → `head`; braccia, gambe, clavicole e punte dalle loro righe.
     - `Spine01` → `spi`, invertendo la miscela: spi_Δ = pel_Δ·(pel_Δ⁻¹·s01_Δ)^(1/0,67).
  4. Calcola le rotazioni locali (padre nel mondo⁻¹ · nel mondo) in angoli YXZ. Per le giunture a un asse (ginocchio, gomito, piede, punta) usa l'angolo X della scomposizione swing-twist. `p[0]` = spostamento verticale di `Hips` rispetto al legame.
  5. Andata e ritorno: `R.apply(p)` + `meshySync()`. Per ogni osso con un figlio, l'angolo tra la sua direzione (figlio − osso) e quella della clip deve stare sotto 2°; altrimenti il bake si ferma indicando l'osso peggiore.
  6. Cicli: la fase 0 è il fotogramma in cui la caviglia sinistra è più avanti rispetto alle anche, nella direzione di cammino. Ogni ciclo si ricampiona a 32 punti in fase e si salva in interi: angoli in decimi di grado, `y` in millimetri. Per ogni ciclo si salvano anche `lift` (32 punti, mm: altezza della caviglia sinistra sopra il suo punto più basso nel ciclo) e `leg` (lunghezza della gamba della clip, mm).
  7. Scrive `const ANIM={walk:{n:32,d:[…],lift:[…],leg:…},run:{…},err:{walk:…,run:…}}`, dove `err` è l'errore peggiore di andata e ritorno in gradi. `bake.py` esce con errore se il file supera i 100 KB.
- In `e_chars.js`:
  - `animCycle(name)→{n:number,f:Float32Array(n*NP),mean:Float32Array(NP)}|null`, decodificato una volta sola e tenuto in cache;
  - `sampleCycle(out:Float32Array, c, phase:number):void`, interpolazione lineare tra i campioni, ciclica, senza creare oggetti;
  - `cycleLift(c, phase:number)→number`: `lift` alla fase data, in metri, con la stessa interpolazione;
  - `animCycle`, `sampleCycle` e `cycleLift` esportati in `__SB` per i test.

- [ ] **Step 1: Test** `baked cycles are complete`:
  - `animCycle('walk')` e `animCycle('run')` hanno `n` = 32 e ogni valore finito;
  - `ANIM.err.walk < 2` e `ANIM.err.run < 2`;
  - l'ampiezza del giro del bacino (`p[2]`) supera 2°.
- [ ] **Step 2: Eseguire** → FAIL (`ANIM` non definito).
- [ ] **Step 3: Implementare** e lanciare `bash tools/anim/bake.sh` → `src/n_anims.js` scritto, con gli errori riportati.
- [ ] **Step 4: Verificare**: `anim`, `smoke`, `regression` → PASS.
- [ ] **Step 5: Commit**: `git add tools/anim src/n_anims.js mk.sh src/e_chars.js tests/anim.test.js && git commit -m "feat: clip-to-pose converter; walk and run cycles"`

### Task 11: Busto, braccia e bacino dalle clip

**Files:**
- Modify: `src/e_chars.js` (`gaitIK`), `src/a0_cfg.js` (`CFG.anim.clipGain=1`)
- Test: `tests/anim.test.js`

**Interfaces:**
- Consumes: `animCycle`, `sampleCycle` (Task 10).
- In `gaitIK`, quando i due cicli esistono:
  - `fw=clamp(f,0,1)` è la quota del movimento in avanti;
  - delta = (camminata(φ) − media)·(1 − run) + (corsa(φ) − media)·run, con φ = `st.ph`;
  - sugli indici del busto e delle braccia U = [1,2,3,4,5,6,7,8,33,9..19,30..32,34..40] si aggiunge delta·w·fw·`clipGain`. Il braccio della spada (13-19) si moltiplica per `opt.armR`, il sinistro (9-12, 30-32) per `opt.arm`;
  - i termini calcolati di oggi per il busto e le braccia pesano (1 − fw);
  - le punte (41-42) vengono dalla clip per w·fw, e da quelle del Task 4 per (1 − fw);
  - l'altezza del piede in volo è mix(`cycleLift(walk,φᵢ)`, `cycleLift(run,φᵢ)`, run)·(LEG / `leg` della clip) per fw, e la formula di oggi per (1 − fw), con φᵢ la fase della gamba;
  - gambe, inclinazione, rimbalzo e terreno restano come sono;
  - le variabili temporanee si creano una volta sola.

- [ ] **Step 1: Test**
  ```js
  T.test('walk upper body follows the clip', () => { meshyOn();
    /* camminata in avanti a regime per 2 s; per 20 frame: gli indici 34..40 di S.lastPose() valgono
       il delta della camminata alla fase corrente × S.P.gait.w, entro 1° */ });
  T.test('swing foot lifts like the clip', () => { meshyOn();
    /* camminata in avanti a regime: l'altezza massima della caviglia Meshy in volo (sopra il terreno sotto il piede, meno l'altezza da fermo)
       vale il massimo di lift della camminata × (LEG / leg), entro 1 cm */ });
  T.test("backpedal keeps today's arm swing", () => { meshyOn();
    /* aggancio su un goblin fermo a 6 m, tasto S per 2 s: |p[34..36]| < 0,5°, cioè nessuna clip */ });
  ```
- [ ] **Step 2: Eseguire** → FAIL.
- [ ] **Step 3: Implementare** come in Interfaces.
- [ ] **Step 4: Verificare**: `anim` (anche i test dei piedi), `charsel`, `regression`, `smoke` → PASS.
- [ ] **Step 5: Commit**: `git commit -am "feat: upper body, arms and pelvis follow the walk and run clips"`

### Task 12: Respiro da fermo

**Files:**
- Modify: `src/e_chars.js` (`gaitIK`), `src/a0_cfg.js` (`breathHz:.28, breathChest:1.2, breathClav:.8, swayHz:.07, swayRoll:1.2`)
- Test: `tests/anim.test.js`

**Interfaces:**
- Il respiro sostituisce l'oscillazione della schiena di oggi (`o[4]+=sin(T*1.7+seed)*1.3°`):
  - petto in avanti e indietro di ±`breathChest`° e clavicole che si alzano di `breathClav`° (da 0 al massimo), a `breathHz`;
  - bacino che oscilla di lato di ±`swayRoll`° a `swayHz`, con la testa che ne recupera metà;
  - tutto moltiplicato per (1 − w): sparisce quando ci si muove.

- [ ] **Step 1: Test** `idle breathes with the chest`:
  - fermi per 8 s: `p[34]` oscilla con ampiezza tra 0,8° e 2° e periodo tra 2,9 e 5 s;
  - `p[37]` oscilla in fase (correlazione > 0,8).
- [ ] **Step 2: Eseguire** → FAIL (il petto è sempre a zero).
- [ ] **Step 3: Implementare** → PASS.
- [ ] **Step 4: Verificare**: `anim`, `regression`, `smoke` → PASS.
- [ ] **Step 5: Commit**: `git commit -am "feat: breathing and weight shift when standing"`

### Task 13: Tappa 2 — misure, video, pubblicazione

- [ ] **Step 1: Suite completa** → tutto PASS.
- [ ] **Step 2: Misure**: `perf` (prima = commit di fine tappa 1) ≤ +0,1 ms; `fight20` e `fight20_nofx` entro i limiti; una riga nel registro.
- [ ] **Step 3: Pubblicare** `index.html` sull'URL della pagina.
- [ ] **Step 4: Video** `stage2` (prima = commit di fine tappa 1), mandato a Denis con 2-3 righe e il passo successivo. Insieme, come dice il design, la proposta delle clip femminili di camminata e corsa, con il costo. Non si compra niente.
- [ ] **Step 5: Documentazione e commit**: `docs/HANDOFF.md` (convertitore e `n_anims.js`), `git commit -am "chore: stage A2 animations integration, measurements"` e push del ramo.
