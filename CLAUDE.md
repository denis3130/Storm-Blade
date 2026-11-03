# Stormblade — istruzioni per Claude

Rispondi sempre a Denis **in italiano**, con messaggi brevi e chiari (spesso usa il telefono).

**Leggi per primo `docs/HANDOFF.md`**: lì ci sono lo stato del lavoro, le decisioni già prese e il prossimo passo.

## Il progetto
- Gioco d'azione 3D dark fantasy in **Three.js r128**, JavaScript vanilla, personaggi e mondo costruiti in codice. Gira su PC, telefono (**solo in orizzontale**) e controller.
- Design approvato (capitolo 1, "tripla A"): `docs/superpowers/specs/2026-11-03-stormblade-aaa-design.md`.
- Piano della Tappa 1 "Basi": `docs/superpowers/plans/2026-11-03-stormblade-tappa1-basi.md`. Il lavoro è sul ramo `tappa1-basi`.
- Modelli Meshy dei personaggi (Tappa 3): `docs/meshy/BRIEF.md`.

## Struttura e comandi
- `src/` contiene i moduli, uniti da `mk.sh` (ordine dei file in `FILES`) tramite `build.py` in `game_w.html` (versione di test, con `window.__SB`) e in `index.html` (versione giocabile pubblicata).
- Tutti i numeri di bilanciamento stanno in `src/a0_cfg.js` (oggetto `CFG`). Il salvataggio usa localStorage con try/catch e numero di versione dei dati.
- Build: `bash mk.sh`.
- Test (ramo `tappa1-basi`): `python3 tests/run.py tests/<file>.test.js [--viewport WxH] [--touch] [--mobile]`.
  - Servono `pip install playwright` e un browser Chromium. Il runner usa Chrome o Chromium di sistema se c'è, altrimenti quello di Playwright (`python3 -m playwright install chromium`).
  - Se quel download è bloccato, chiedi a Denis di aggiungere `cdn.playwright.dev` e `playwright.download.prss.microsoft.com` ai domini consentiti dell'ambiente Default.
  - `three.min.js` (r128, licenza MIT) è nel repository: i test lo usano al posto del CDN.

## Pubblicare una versione giocabile
- **La versione giocabile è la pagina Claude "Stormblade"**: https://claude.ai/artifact/F1UdPywZreUDQFCw9NxgU4 (scelta di Denis, 3/11/2026). Si continua a pubblicare lì.
  - Lancia `bash mk.sh`, poi pubblica `index.html` con lo strumento Artifact su quell'URL, insieme ai file del modello: `assets/meshy/hero/hero.json` e `hero_tex0.jpg`, `hero_tex1.jpg`, `hero_tex2.jpg`.
  - Le pagine Claude non servono i `.glb`: il gioco carica `hero.json`, generato con `python3 assets/meshy/glb2json.py <in.glb> <out.json>`.
  - GLTFLoader (r128) arriva da jsdelivr con una versione esatta, vedi `build.py`.
- Prima di pubblicare: tutti i test verdi e nessun errore nella console.
- GitHub Pages da `main` (https://denis3130.github.io/Storm-Blade/) resta disponibile come copia; il lavoro di una tappa si unisce a `main` solo a tappa finita e revisionata.

## Regole di lavoro di Denis
- Giochi completi e curati: niente emoji al posto della grafica, niente combattimenti fatti solo di numeri.
- Tappe piccole e verificabili: dopo ogni tappa c'è una versione giocabile.
- Ogni funzione va su touch, mouse e tastiera, e controller.
- Game feel: hitstop, lampo, leggero tremolio dello schermo, nemici che si schiacciano, premi che volano al contatore, contatori che rimbalzano, pulsanti che si schiacciano, badge che pulsano una volta sola.
- Gli effetti non devono allungare le lotte: misura prima e dopo. Misura anche gli FPS prima e dopo; l'obiettivo sono 60 FPS su un telefono di fascia media.
- Contenuti originali: ispirati ai giochi di riferimento, ma senza copiarne nomi o grafica.
- Meshy: prima di spendere crediti mostra a Denis il saldo e il costo stimato, e procedi solo con il suo ok.
- Consegna: 2-3 righe su cosa è cambiato, gli FPS e come provarlo; le idee "per dopo" vanno annotate senza costruirle; chiudi con un solo passo successivo concreto.
