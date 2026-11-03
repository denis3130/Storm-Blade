# Stormblade — istruzioni per Claude

Rispondi sempre a Denis **in italiano**, con messaggi brevi e chiari (spesso usa il telefono).

## Il progetto
- Gioco d'azione 3D dark fantasy in **Three.js r128**, JavaScript vanilla, personaggi e mondo costruiti in codice. Gira su PC, telefono (**solo in orizzontale**) e controller.
- Design approvato (capitolo 1, "tripla A"): `docs/superpowers/specs/2026-11-03-stormblade-aaa-design.md`.
- Piano in corso (Tappa 1 "Basi"): `docs/superpowers/plans/2026-11-03-stormblade-tappa1-basi.md`, sul ramo `tappa1-basi`.

## Chi fa cosa
- Il gioco, i test e la versione giocabile pubblicata vivono nella **conversazione principale dell'app Claude** (quella con il link della pagina del gioco).
- Le sessioni di **Claude Code** su questo repository servono a **Meshy**: generano i modelli 3D con l'account di Denis e li salvano in `assets/meshy/`. Segui `docs/meshy/BRIEF.md`. Da una sessione Meshy **non modificare `src/`**.

## Struttura e comandi
- `src/` contiene i moduli, uniti da `mk.sh` (ordine dei file in `FILES`) tramite `build.py` in `game_w.html` (versione di test, con `window.__SB`) e in `../stormblade.html` (versione pubblicata).
- Tutti i numeri di bilanciamento stanno in `src/a0_cfg.js` (oggetto `CFG`). Il salvataggio usa localStorage con try/catch e numero di versione dei dati.
- Build: `bash mk.sh`.
- Test (ramo `tappa1-basi`): `python3 tests/run.py tests/<file>.test.js [--viewport WxH] [--touch] [--mobile]`. Servono Playwright con Chrome e `three.min.js` (r128) nella cartella principale.

## Regole di lavoro di Denis
- Giochi completi e curati: niente emoji al posto della grafica, niente combattimenti fatti solo di numeri.
- Tappe piccole e verificabili: dopo ogni tappa c'è una versione giocabile.
- Ogni funzione va su touch, mouse e tastiera, e controller.
- Game feel: hitstop, lampo, leggero tremolio dello schermo, nemici che si schiacciano, premi che volano al contatore, contatori che rimbalzano, pulsanti che si schiacciano, badge che pulsano una volta sola.
- Gli effetti non devono allungare le lotte: misura prima e dopo. Misura anche gli FPS prima e dopo; l'obiettivo sono 60 FPS su un telefono di fascia media.
- Contenuti originali: ispirati ai giochi di riferimento, ma senza copiarne nomi o grafica.
- Consegna: 2-3 righe su cosa è cambiato, gli FPS e come provarlo; le idee "per dopo" vanno annotate senza costruirle; chiudi con un solo passo successivo concreto.
