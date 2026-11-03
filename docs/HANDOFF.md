# Passaggio di consegne — 3 novembre 2026

Fino a oggi Stormblade è stato sviluppato in una conversazione dell'app Claude. **Da qui in poi si lavora solo in Claude Code**, su questo repository. Denis non torna nella conversazione di prima, quindi tutto quello che serve è qui.

## Dove siamo
- **`main`** contiene:
  - Stormblade v5 (movimento, collisioni, combattimento e IA dei nemici già rifatti);
  - il design approvato del capitolo 1 e il piano della Tappa 1;
  - queste istruzioni e il brief di Meshy;
  - la versione giocabile `index.html` (v5).
- **`tappa1-basi`** contiene la Tappa 1 in corso, secondo il piano `docs/superpowers/plans/2026-11-03-stormblade-tappa1-basi.md`:
  - **Task 1 fatto**: runner di test nella pagina e regressione della v5 (commit `b43f6e3`).
  - **Task 2 fatto**: le braci sostituiscono l'esperienza, si sale di livello al santuario, i menu si usano anche da tastiera e controller (commit `37bf36e`). Test: braci 7/7, fumo 2/2, regressione 3/3.
  - **Prossimo**: il Task 3 (braci a terra alla morte), poi i Task 4-9. Infine una revisione del ramo intero con un contesto nuovo, l'unione su `main` e la pubblicazione.
- **Registro dell'esecuzione** (sul ramo `tappa1-basi`): `docs/superpowers/plans/2026-11-03-stormblade-tappa1-basi.ledger.md`. Se usi la skill `superpowers:executing-plans`, copia questo file in `.superpowers/sdd/2026-11-03-stormblade-tappa1-basi/progress.md` prima di partire: la skill riprende dal Task 3 senza rifare i primi due.
- **Meshy (Tappa 3)** non è ancora collegato. L'ambiente **Default** di Claude Code ha già `meshy.ai` e `*.meshy.ai` tra i domini consentiti, insieme ai gestori di pacchetti. Segui `docs/meshy/BRIEF.md`.
- **Versione giocabile**: d'ora in poi si pubblica con GitHub Pages da `main` (vedi `CLAUDE.md`). La vecchia pagina dell'app Claude resta ferma alla v5.

## Ordine consigliato (lo decide Denis)
1. Meshy: login, saldo e costo stimato, poi solo l'eroe come modello di prova (brief).
2. Tappa 1: Task 3-9 sul ramo `tappa1-basi`, revisione finale, unione su `main`, pubblicazione.
3. Piano della Tappa 2 "Mondo": il design dice di scrivere un piano alla volta, dopo aver consegnato la tappa precedente.

## Decisioni già prese durante la Tappa 1 (da rispettare)
- **Test**:
  - `T.clearEnemies` usa `removeEnemy` (esportato nel `window.__SB` di test) e toglie anche i proiettili dei nemici.
  - `run.py` fallisce anche sugli errori della console, tranne "Failed to load resource" (i font bloccati).
- **Santuario**:
  - Il menu si apre subito, quando l'animazione di riposo arriva a 0,9 s, invece che con un timer.
  - Dopo aver scelto una statistica si torna al menu del santuario. La schermata del livello ha "Indietro" (`#luBack`) e mostra costo e braci.
- **Contatore delle braci**: sta nella riga dell'HUD dove c'era la barra dell'esperienza. Quando le braci bastano per salire di livello, la medaglia pulsa una volta, con un avviso e un suono.
- **Menu**:
  - La navigazione è unica per tutte le schermate in `SCREENS`, con le funzioni `menuMove`, `menuPress`, `menuBack` e `padMenu`. Frecce ed Esc da tastiera; croce o levetta, A e B dal controller.
  - Ogni schermata dichiara il suo pulsante "indietro" con `data-back`. I Task 6 (scelta del personaggio), 7 (scelte dei dialoghi) e 8 (diario) devono solo registrare le loro schermate; per le scelte dei dialoghi va aggiunto il caso in `padMenu`.
- **Schermi bassi**: regole compatte per altezze fino a 460 px, così le carte del livello restano tre in fila e stanno in 360 px.
- **Task 3 → 4**: il Task 3 deve esporre `syncDrop()`, che ricrea o nasconde la mesh del mucchio di braci partendo da `P.drop`. `loadSave` e `resetPlayer` la chiamano.
- **Task 9**: le sonde di misura della v5 sono in `tests/probes/` (ramo `tappa1-basi`), con i risultati di riferimento. Limiti: 1 goblin ≤ 2,64 s, 3 goblin ≤ 5,16 s (20 prove); logica per frame entro +0,1 ms dalla v5.

## Idee tenute per dopo (non costruirle finché Denis non lo chiede)
- Parte 2 della storia (capitoli 2 e 3, poteri dei frammenti, boss finale, due finali).
- Viaggio rapido tra i santuari.
