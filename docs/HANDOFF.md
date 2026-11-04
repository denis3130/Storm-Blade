# Passaggio di consegne — aggiornato il 4 novembre 2026

## Due giochi separati (scelta di Denis, 4/11/2026)
- **Stormblade web** (questo codice, Three.js): si sviluppa **nella conversazione dell'app Claude**, come dall'inizio, con Meshy e Blender quando servono. La versione giocabile è la pagina Claude "Stormblade" (vedi `CLAUDE.md`, "Pubblicare una versione giocabile").
- **Stormblade Unreal**: è un gioco a parte, che Denis sviluppa con Claude Code sul suo PC, sul ramo `unreal`. Usa solo contenuti gratuiti di Fab. Non va tenuto allineato con la versione web.

## Dove siamo
- **`main`** contiene la Tappa 1 "Basi", **finita** (Task 1-9 del piano `docs/superpowers/plans/2026-11-03-stormblade-tappa1-basi.md`), revisionata da un revisore nuovo e corretta. Il ramo `tappa1-basi` è stato unito su `main` il 4 novembre 2026, con l'ok di Denis. Novità rispetto alla v5:
  - le braci sostituiscono l'esperienza: si sale di livello al santuario e, alla morte, restano a terra finché non le riprendi;
  - salvataggio v4 (chiave nuova: le partite delle versioni vecchie non vengono lette né cancellate);
  - telefono solo in orizzontale (se lo tieni in verticale il gioco ruota); menu da tastiera e controller;
  - scelta tra eroe ed eroina; dialoghi con il testo al maschile o al femminile; missioni e diario; Selin al primo santuario.
- **`main`** contiene anche le animazioni (ramo `animazioni` unito il 4 novembre 2026, dopo la revisione finale e le correzioni): tappe 1 e 2 del piano `docs/superpowers/plans/2026-11-04-stormblade-animazioni-tappe1-2.md` finite; registro con tutte le decisioni in `docs/superpowers/plans/2026-11-04-stormblade-animazioni-tappe1-2.ledger.md`. Misure della tappa 2: 1 goblin 2,55 s, 3 goblin 5,04 s (20 prove), logica per frame 1,38 ms contro 1,31 della tappa 1 (rumore entro +0,1 ms), 76 test verdi.
- **Pagina pubblicata**: versione 11, con le animazioni della tappa 2 e le correzioni della revisione finale (fusione delle mosse senza scatti delle spalle, bacino più fluido nella corsa).
- **Meshy**: l'eroe usa un modello Meshy (`assets/meshy/hero/`), caricato da `src/l_meshy.js` solo via http; in locale e nei test resta il personaggio procedurale. L'eroina non ha ancora un modello Meshy.
- **Registro dell'esecuzione**: `docs/superpowers/plans/2026-11-03-stormblade-tappa1-basi.ledger.md`. Contiene ogni decisione presa con il suo costo e i punti minori della revisione rimandati.

## Demo "La Valle delle Lanterne" (ramo `demo`)
- Prima demo del gioco, con la mappa costruita sulla foto di Denis (la foto NON è nel repository, che è pubblico).
  Spec e piano: `docs/superpowers/specs/2026-11-04-stormblade-demo-design.md`, `docs/superpowers/plans/2026-11-04-stormblade-demo.md`
  (lì anche le decisioni prese e le idee per dopo).
- `bash mk.sh` produce anche `demo_w.html` (test) e `demo.html` (da pubblicare). La mappa è in `src/w_demo.js`, le costruzioni
  in `src/x_demo.js`; nel gioco `src/w_main.js` mette `DEMO=null` e tutto resta com'era.
- Test: `python3 tests/run.py tests/demo.test.js --page demo_w.html` (6 test: partenza dal falò, percorso fino al palazzo,
  nemici fuori dalle case, scalinata, ponte, forzieri).
- Pagina pubblicata a parte (non è la pagina "Stormblade"): https://claude.ai/artifact/ECT2HeYfzVfyXPUE1JuTY6 ("Stormblade Demo", versione 3). Si pubblica `demo.html` con gli stessi file
  del modello Meshy della pagina del gioco.

## Ordine consigliato (lo decide Denis)
1. Meshy: modello dell'eroina. Prima mostra a Denis il saldo e il costo stimato, poi fai un solo modello di prova.
2. Piano della Tappa 2 "Mondo": il design dice di scrivere un piano alla volta, dopo aver consegnato la tappa precedente.

## Decisioni già prese (da rispettare)
- **Test**:
  - `T.clearEnemies` usa `removeEnemy` (esportato nel `window.__SB` di test) e toglie anche i proiettili dei nemici.
  - `run.py` fallisce anche sugli errori della console, tranne "Failed to load resource" (i font bloccati).
  - `Math.random` ha un seme: i test sono deterministici e il seme predefinito è 1. Un fallimento si ripete con `python3 tests/run.py <file> --seed N`.
- **Santuario**:
  - Il menu si apre subito, quando l'animazione di riposo arriva a 0,9 s, invece che con un timer.
  - Dopo aver scelto una statistica si torna al menu del santuario. La schermata del livello ha "Indietro" (`#luBack`) e mostra costo e braci.
- **Contatore delle braci**: sta nella riga dell'HUD dove c'era la barra dell'esperienza. Quando le braci bastano per salire di livello, la medaglia pulsa una volta, con un avviso e un suono.
- **Mucchio di braci**: `syncDrop()` ricrea o nasconde la mesh partendo da `P.drop`; la chiamano `loadSave` e `resetPlayer`.
- **Menu**:
  - La navigazione è unica per tutte le schermate in `SCREENS`, con le funzioni `menuMove`, `menuPress`, `menuBack` e `padMenu`. Frecce ed Esc da tastiera; croce o levetta, A e B dal controller.
  - Ogni schermata dichiara il suo pulsante "indietro" con `data-back`. Una schermata nuova va solo aggiunta a `SCREENS`.
- **Orientamento** (`src/r_orient.js`):
  - Su un telefono in verticale `#app` ruota di 90°. Larghezza, altezza e trasformazione le imposta `applyOrient` in px da `innerWidth`/`innerHeight`: mai `100vh`/`100vw`, perché su iOS `100vh` è più alto della parte visibile quando c'è la barra di Safari.
  - Il layout legge la misura del gioco, non quella della finestra: `--vw`/`--vh` e le classi `w1000`/`w640`/`h460` su `#app` al posto delle unità vw/vh e delle media query.
  - Zone sicure (notch, barra home): usa `--it`/`--ir`/`--ib`/`--il`, cioè i bordi alto, destro, basso e sinistro del gioco. In verticale prendono il lato fisico giusto (`#app.rot90` in `head.html`). Non usare `env(safe-area-inset-*)` direttamente.
- **Schermi bassi**: regole compatte per altezze fino a 460 px, così le carte del livello restano tre in fila e stanno in 360 px.
- **Salvataggio**: si salva al riposo, alla morte e quando riprendi le braci, a ogni passo di missione e alla fine di ogni dialogo.
- **Storia** (`src/m_story.js`): i testi hanno varianti `{maschile|femminile}`, risolte da `gtxt` prima di essere scritti. Durante un dialogo il mondo è fermo. La tempesta ha la precedenza sull'obiettivo della missione nel riquadro in alto a destra.
- **Modello Meshy**: `meshySync` gira a ogni frame e non crea oggetti (i quaternioni li prepara `setupMeshyHero`). `tests/meshy.test.js` lo verifica con uno scheletro finto.
- **Misure**: le sonde della v5 sono in `tests/probes/`, con i risultati di riferimento. Limiti: 1 goblin ≤ 2,64 s, 3 goblin ≤ 5,16 s (20 prove); logica per frame entro +0,1 ms dalla v5.
- **Animazioni** (design `docs/superpowers/specs/2026-11-04-stormblade-animazioni-design.md`, ramo `animazioni`):
  - il vettore di pose ha 43 valori: dopo i 34 di prima ci sono petto (34-36), clavicole (37-38 e 39-40: alza, avanti) e punte dei piedi (41, 42). Sono giunture virtuali (`rig.V`), senza mesh, che usa solo il modello Meshy;
  - il passo usa le misure delle gambe del modello Meshy (`MESHY.legD`), posa i piedi sul terreno e abbassa il bacino quando un piede a terra non ci arriva (`CFG.anim`);
  - ogni mossa nuova si fonde con quella che interrompe in `CFG.anim.blend` secondi; `resetBlend()` la azzera a ogni rinascita, teletrasporto o cambio di corpo;
  - `tests/anim_ref.json` è il riferimento della lama (arco e portata di ogni attacco): un cambio di animazione deve restare entro il 10%.
  - **Tappa 2** (clip di camminata e corsa):
    - `bash tools/anim/bake.sh` converte le clip elencate in `tools/anim/moves.json` nel vettore di pose del gioco e riscrive `src/n_anims.js` (generato: non si modifica a mano). Il convertitore (`tools/anim/bake.js`) gira nella pagina di test con lo scheletro vero dell'eroe; si ferma se l'andata e ritorno supera 2° sulle ossa che il trasferimento può seguire, e stampa a parte quelle che non può seguire (Spine02 e neck sono miscele, il piede ha un solo asse);
    - braccia e gambe si convertono come catene di due ossa (la torsione dell'osso alto mette quello basso nel piano della cerniera); le punte si misurano contro il piede della clip;
    - nel gioco (`gaitIK`, solo per il giocatore: `opt.clip`) dalla clip vengono, in proporzione al movimento in avanti, il giro del bacino, schiena, petto, testa, clavicole e braccia (spalle e polsi come rotazioni, perché i loro angoli nella clip sono lontani dalla posa di base). Inclinazione e rollio del bacino restano fuori: le anche Meshy stanno 10 cm sotto il perno e i piedi scivolerebbero;
    - restano calcolati: gambe e piedi (anche l'altezza del piede in volo e la piega delle punte: la curva della caviglia della clip va con il suo piede inclinato e farebbe saltare il piede di 6-9 cm), inclinazione, rimbalzo, terreno; `CFG.anim.clipGain` (0 = il passo di prima);
    - da fermi il giocatore respira (petto e clavicole; sull'eroina, senza petto Meshy, la schiena) e sposta piano il peso di lato (`CFG.anim.breath*`, `sway*`); i nemici tengono l'oscillazione di prima;
    - problema noto della tappa 1: correndo a 5,4 m/s il piede che atterra non arriva a terra per il primo 15% dell'appoggio e scende di 6-9 cm in un frame poco dopo (`reachFrom`). Non è ancora corretto.

## Tutti i test
```
bash mk.sh
for f in smoke regression braci drop save charsel dialogue quest meshy; do python3 tests/run.py tests/$f.test.js || break; done
python3 tests/run.py tests/orient.test.js --viewport 360x640 --touch --mobile
python3 tests/run.py tests/orient_desktop.test.js --viewport 1280x720
python3 tests/run.py tests/anim.test.js --data tests/anim_zero.json
python3 tests/run.py tests/blade.test.js --data tests/anim_ref.json
python3 tests/run.py tests/meshy_http.test.js --http
```
- `tests/fixtures.js` (scheletro vero dell'eroe Meshy, `meshyOn()`) viene caricato da `run.py` prima di ogni test.
- `--http` apre la pagina da un piccolo server locale, così il modello Meshy si carica; il GLTFLoader del CDN è sostituito da `tests/vendor/mini_gltf.js`.
- Video prima/dopo: `python3 tools/anim/video.py --before <copia con game_w.html> --after . --scene stage1|stage2 --out video.mp4` (circa 10 minuti).
- Convertitore delle clip: `python3 -m unittest tools/anim/test_clip2json.py` (lettore GLB), poi `bash tools/anim/bake.sh`.

## Idee tenute per dopo (non costruirle finché Denis non lo chiede)
- Parte 2 della storia (capitoli 2 e 3, poteri dei frammenti, boss finale, due finali).
- Viaggio rapido tra i santuari.
