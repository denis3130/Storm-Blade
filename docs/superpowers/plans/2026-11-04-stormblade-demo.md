# Stormblade demo "La Valle delle Lanterne" — piano

**Spec:** `docs/superpowers/specs/2026-11-04-stormblade-demo-design.md`. Ramo `demo`, partito da `animazioni`.
Eseguito da me in questa conversazione, una tappa alla volta, ognuna con test e schermata dal falò confrontata con la foto
(fuori dal repository, che è pubblico: l'immagine è di Denis).

## Architettura
- `src/w_main.js` (`const DEMO=null;`) nel gioco, `src/w_demo.js` (`const DEMO={…}`: disposizione, altezza del terreno, nemici,
  cielo) nella demo, prima di `a_core.js`. `src/x_demo.js` (solo demo, prima di `k_game.js`): costruzioni, natura, effetti.
- `mk.sh` produce anche `demo_w.html` (test, con `__SB`) e `demo.html` (pubblicata).
- `d_world.js`, `a_core.js`, `k_game.js`, `g_props.js`, `m_story.js` leggono `DEMO` dove la demo cambia qualcosa;
  con `DEMO` nullo il gioco resta identico (la suite lo verifica).
- Pavimenti in salita (`addRamp`): scale e ponte camminabili sopra la gola.
- `tests/run.py --page demo_w.html` per i test della demo (`tests/demo.test.js`).

## Tappe
1. **Base**: file e build della demo, interruttori in `d_world`/`k_game`, terreno della demo (terrazza, scalinata, villaggio,
   gola, rupe, altopiano del palazzo), cielo e sole in controluce, nebbia. Test: si avvia, il giocatore parte dal falò,
   il percorso falò → palazzo è sopra il terreno e senza cadute.
2. **Pietra**: arco gotico, falò con spada, lastricato, scalinata, balaustre, ponte ad arco, porta nella rupe, grotta,
   scale a zig-zag, rovine della cattedrale.
3. **Villaggio e palazzo**: case con tetti curvi, bancarelle, recinti, lanterne, stendardi; palazzo (navata gotica, rosone,
   guglie, tetti a pagoda, statue, scalinata), padiglione.
4. **Natura ed effetti**: aceri rossi, pini a ombrello, erba della pampa, edera; cascata, spruzzi e nebbia; montagne
   carsiche e mare di nubi; raggi di sole; foglie che cadono; luci (falò, lanterne, grotta) con la riserva di 4 luci.
5. **Gioco e consegna**: nemici (villaggio, ponte, porta, guardiano del palazzo), obiettivi e vittoria; FPS prima/dopo;
   prova a 360 px su telefono; suite del gioco verde; pubblicazione della pagina; schermate per Denis.

## Stato (4 novembre 2026)
Tappe 1-5 fatte sul ramo `demo`; la pagina è pubblicata a parte (vedi `docs/HANDOFF.md`).

**Decisioni prese da me** (Denis ha chiesto di non fargli domande), con il loro costo se sbagliate:
- La composizione segue la foto: la camera del titolo e i punti chiave (arco, falò, ponte, porta, cascata, grotta, palazzo,
  rovine) sono stati messi dove li ha la foto, risolvendo la proiezione all'indietro dalla camera (`dbg/inv.py`, fuori dal repo).
  Costo: alcuni elementi sono più vicini tra loro di come sarebbero in una mappa "di gioco".
- Il palazzo sta a 33 m (prima 52), quasi all'altezza degli occhi dal falò, come nella foto: la salita è più corta
  (scale a zig-zag fino alla terrazza del padiglione a 28 m, poi una scalinata). Costo: meno "verticalità".
- Nel titolo l'eroe è nascosto (la foto non ha personaggi); compare all'avvio della partita.
- Scalinata principale: i gradini sono blocchi sopra il terreno, si cammina su un pavimento in salita (`addRamp`): i piedi
  possono stare fino a 12 cm sopra o dentro un gradino.
- Nella demo niente missioni del gioco, niente tempesta (cielo coperto fisso) e niente Selin.
- Il ponte è diagonale (dal villaggio alla porta) come nella foto; il ponte e le scale sulla rupe usano la pendenza del
  pavimento, non quella della roccia sotto (`slopeAt` nella demo).

**Misure** (640×360, qualità media, Chromium software): nella lotta al villaggio la demo disegna 154 chiamate e 588k triangoli
contro 413 e 1,67M del gioco al primo accampamento; logica per frame 0,37-0,84 ms contro 0,47-0,99 ms (`tests/probes/demo_perf.json`).

**Idee per dopo** (non costruite): ramo di pino ed edera sopra l'arco; interno della grotta; scale a zig-zag sotto la grotta;
più torri e portici nel palazzo; cascata a più salti; una scena d'ingresso per il guardiano del palazzo.
