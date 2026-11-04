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
- **Pagina pubblicata**: la Tappa 1 con le correzioni della revisione.
- **Meshy**: l'eroe usa un modello Meshy (`assets/meshy/hero/`), caricato da `src/l_meshy.js` solo via http; in locale e nei test resta il personaggio procedurale. L'eroina non ha ancora un modello Meshy.
- **Registro dell'esecuzione**: `docs/superpowers/plans/2026-11-03-stormblade-tappa1-basi.ledger.md`. Contiene ogni decisione presa con il suo costo e i punti minori della revisione rimandati.

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

## Tutti i test
```
bash mk.sh
for f in smoke regression braci drop save charsel dialogue quest meshy; do python3 tests/run.py tests/$f.test.js || break; done
python3 tests/run.py tests/orient.test.js --viewport 360x640 --touch --mobile
python3 tests/run.py tests/orient_desktop.test.js --viewport 1280x720
```

## Idee tenute per dopo (non costruirle finché Denis non lo chiede)
- Parte 2 della storia (capitoli 2 e 3, poteri dei frammenti, boss finale, due finali).
- Viaggio rapido tra i santuari.
