# Stormblade — prima demo: "La Valle delle Lanterne"

Richiesta di Denis (4 novembre 2026, dopo la tappa 2 delle animazioni): "crea la prima demo del gioco facendo la mappa realistica e più simile alla foto possibile. Non farmi domande, agisci come sai fare meglio". La foto è un'illustrazione: falò con una spada sotto un arco gotico in rovina, scalinata di pietra bagnata, villaggio di case in legno con tetti di tegole curvi, aceri rossi, rovine di una cattedrale gotica, ponte di pietra ad arco su una gola, cascata, grotta illuminata, scale a zig-zag sulla rupe, palazzo che unisce tetti a pagoda e guglie gotiche, montagne carsiche nella nebbia, cielo coperto con raggi di sole. Le decisioni qui sotto le ho prese io, come chiesto.

## 1. Cosa è la demo
- Una seconda pagina giocabile, separata dal gioco: `demo.html` (pubblicata come pagina Claude a parte). Il gioco principale e i suoi test non cambiano.
- Stesso motore: eroe ed eroina, modello Meshy, animazioni nuove, combattimento, nemici, menu, salvataggio (chiave sua), comandi touch, tastiera e controller.
- Una mappa nuova, costruita in codice, che riproduce la foto: chi parte dal falò e guarda avanti vede la stessa scena.
- Un percorso giocabile: falò → scalinata → villaggio → ponte → porta nella rupe → scale a zig-zag → palazzo. Nemici nel villaggio e sul ponte, il guardiano davanti al palazzo. Sconfitto il guardiano, la demo è finita (schermata di vittoria).

## 2. La mappa (il falò guarda a nord, verso −z)
| Luogo | Posizione (m) | Altezza | Note |
|---|---|---|---|
| Terrazza del falò | (0, 0), 16 × 14 | 18 | lastricato bagnato, arco gotico a sinistra, balaustra a destra, erba della pampa, foglie rosse |
| Scalinata | da z −7 a z −30 | 18 → 8 | gradini di pietra, balaustre, lanterne |
| Villaggio | intorno a (−8, −50) | 8 | 9-10 case con tetti curvi, acero rosso grande in piazza, bancarelle, recinti, lanterne |
| Rovine della cattedrale | (−42, −78) | 10 | navata senza tetto, archi a sesto acuto, pini |
| Gola | x da 18 a 40 | fino a −40 | pareti di roccia, nebbia sul fondo |
| Ponte ad arco | da (18, −52) a (42, −52) | 8 | parapetti, stendardi rossi |
| Porta nella rupe | (44, −52) | 8 | grata di legno, stendardi, lanterne |
| Grotta | (58, −38) | 12 | luce calda dentro |
| Scale a zig-zag | parete est | 12 → 48 | ringhiere di legno |
| Cascata | dalla rupe (48, −84) alla gola | 50 → −30 | velo animato, spruzzi, nebbia |
| Palazzo | (62, −104) | 52 | navata gotica con rosone e guglie, tetti a pagoda, statue, scalinata, stendardi; padiglione sul bordo |
| Montagne | anello a 250-600 m a nord | fino a 220 | pinnacoli carsici a strati, mare di nubi |

## 3. Aspetto
- Cielo coperto al tramonto, con uno squarcio luminoso sopra il centro e raggi di sole; il sole sta davanti a chi guarda dal falò (controluce), quindi la nebbia si illumina verso il fondo.
- Colori: grigi e azzurri freddi, accenti caldi (fuoco, lanterne, finestre) e rossi (aceri, stendardi, nastri).
- Materiali procedurali come nel gioco (texture generate), con in più: lastricato, tegole, legno scuro, intonaco, pietra gotica.
- Effetti: fuoco del falò, braci, lanterne con bagliore, stendardi e nastri che si muovono col vento, cascata animata, nebbia a strati, foglie che cadono.
- Niente modelli Meshy nuovi (costerebbero crediti, che si spendono solo con l'ok di Denis): tutto in codice.

## 4. Vincoli
- 60 FPS su un telefono di fascia media: geometrie unite e riusate, instancing per oggetti ripetuti, al massimo 4 luci puntiformi (la riserva che il gioco ha già), ombre solo dal sole. FPS misurati e riportati.
- Valori di regolazione della demo in un blocco di configurazione (`CFG.demo`).
- La tempesta del gioco principale nella demo resta ferma sul cielo coperto.

## 5. Verifiche
- Test della demo: si avvia, si parte dal falò, si arriva al palazzo camminando (nessun muro invisibile sul percorso, nessuna caduta nella gola), il guardiano c'è, la vittoria arriva.
- Confronto con la foto: una schermata dal falò con la stessa inquadratura, affiancata all'immagine.
- La suite del gioco principale resta verde.
