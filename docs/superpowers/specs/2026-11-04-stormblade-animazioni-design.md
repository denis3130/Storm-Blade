# Stormblade — animazioni del personaggio (clip Meshy nel motore)

Data: 4 novembre 2026 · Stato: approvato da Denis il 4 novembre 2026 · Estende la sezione 5.2 di `2026-11-03-stormblade-aaa-design.md`

## 1. Obiettivo e criteri di successo

Le animazioni dell'eroe e dell'eroina devono sembrare vere: movimenti presi da clip registrate da persone, senza cambiare il gioco.

Il lavoro è riuscito quando:
- ogni mossa dell'elenco in §3 usa una clip registrata, tranne quelle che Denis decide di lasciare fatte a mano (per esempio per risparmiare crediti);
- il gioco resta identico:
  - per ogni mossa restano uguali i valori di `CFG.moves`: `dur`, `hit`, `cancel`, `dodge`, `lunge`, `iframe`;
  - nella finestra di colpo la lama copre lo stesso arco e la stessa portata di oggi, con una tolleranza del 10%;
- la durata delle lotte resta entro i limiti della Tappa 1: 1 goblin ≤ 2,64 s, 3 goblin ≤ 5,16 s (20 prove);
- i piedi restano piantati. Mentre un piede è a terra, la caviglia del modello Meshy si muove a meno del 2% della velocità del corpo (oggi 10,5% camminando e 10,4% correndo) e non scende più di 1 cm sotto la sua altezza da fermo, misurata dal terreno sotto il piede (oggi circa 5 cm, perché il passo non segue la pendenza). La stessa soglia vale per l'eroina;
- la logica per frame resta entro +0,1 ms da oggi (sonda `perf.json`) e l'animazione non crea oggetti a ogni frame. Resta l'obiettivo dei 60 FPS sul telefono, che può misurare solo Denis;
- Denis approva il video prima/dopo di ogni tappa.

## 2. Decisioni prese da Denis (4 novembre 2026)

| Tema | Decisione |
|---|---|
| Quali animazioni | Tutte: camminata e corsa, attacchi, schivata e difesa, il resto |
| Strada | Clip Meshy convertite nel motore attuale. Scartate: clip usate direttamente sul modello; solo codice |
| Crediti | Si comprano clip in più solo dopo aver mostrato saldo, elenco e costo, e solo con il suo ok |
| Eroina | Stesse clip dell'eroe. Dopo la tappa 2 si propongono, con il costo, le versioni femminili di camminata e corsa |
| Tappe | Cinque (§7). Il piano dettagliato si scrive prima per le tappe 1-2 |

Questo documento cambia la sezione 5.2 del design principale in un solo punto: il motore delle animazioni resta lo stesso, ma le curve delle pose vengono dalle clip invece di essere scritte a mano.

## 3. Mosse e clip

| Mossa (chiave nel codice) | Oggi | Fonte nuova | Tappa |
|---|---|---|---|
| Fermo (`HP.idle`) | posa fissa | respiro e piccoli spostamenti del peso calcolati; poi la clip "fermo", da comprare | 2, poi 5 |
| In guardia (`HP.guard`) | posa fissa | prima posa delle clip di attacco, con il respiro | 3 |
| Camminata | `gaitIK` | `hero_walk.glb`, già nel repository | 2 |
| Corsa e scatto | `gaitIK` | `hero_run.glb`, già nel repository; lo scatto è la corsa con più inclinazione | 2 |
| Partenze, frenate, giri sul posto | strati calcolati | restano calcolati, sopra le clip | 2 |
| Passi di lato e all'indietro (aggancio) | `gaitIK` | 3 clip da comprare: sinistra, destra, indietro | 4 |
| `light1`, `light2` | tracce a mano | `right_slash` (219) e `left_slash` (97), già pagate | 3 |
| `light3` (affondo) | traccia a mano | terzo colpo di `triple_combo_free` (105) se è un affondo, altrimenti una clip da comprare | 3 |
| `light4` (colpo dall'alto) | traccia a mano | `heavy_judgment` (102) se adatta, altrimenti una clip da comprare | 3 |
| `heavy` e `charge` | traccia e posa | `attack_free` (4) o `heavy_judgment`; la carica è la posa di caricamento della stessa clip | 3 |
| `runatk` | traccia a mano | da comprare (attacco in corsa) | 3 |
| `spin` | traccia a mano | da comprare (attacco rotante) | 3 |
| `riposte` | traccia a mano | da comprare (affondo di grazia) | 3 |
| `parry` | traccia a mano | `sword_parry` (147), già pagata | 4 |
| `block` (tenuto) | posa | ultima posa della parata, con il respiro | 4 |
| `dodge` (capriola) | calcolata | `roll_dodge` (158), già pagata | 4 |
| `back` (passo indietro) | calcolato | da comprare | 4 |
| `hurt`, `stagger` | tracce a mano | 2 da comprare | 5 |
| `knock` (caduta e rialzata) | traccia a mano | 1 o 2 da comprare | 5 |
| `death` | traccia a mano | da comprare | 5 |
| `drink` | traccia a mano | da comprare | 5 |
| `rest` (in ginocchio al santuario) | traccia a mano | da comprare | 5 |

- Quale clip va a quale mossa si decide guardando le clip scaricate, all'inizio della tappa 3. Ogni clip va a una mossa sola: se due mosse vogliono la stessa, una delle due prende una clip comprata.
- `pickup` (276), già pagata, per ora non si usa: le braci si raccolgono all'istante e devono restare così.
- Clip da comprare: da 14 a 17, cioè da 42 a 51 crediti a 3 crediti l'una. La stima di "circa 12" data in chat era bassa. L'elenco esatto, con i nomi del catalogo e il saldo, si manda a Denis prima della tappa 3, e lui può scegliere di lasciare alcune mosse fatte a mano.

## 4. Architettura

### 4.1 Clip nel repository
- Ogni clip sta in `assets/meshy/anims/<nome>.glb`: solo scheletro, sul rig dell'eroe (task di rigging `01a1a219-c2bc-7050-b350-c876b7cc4b85`), 30 fotogrammi al secondo. Camminata e corsa restano in `assets/meshy/hero/`.
- `assets/meshy/anims/README.md` elenca nome, azione del catalogo, task e crediti.
- Download: dal PC di Denis, attraverso il collegamento, con la skill Meshy; in alternativa Denis le scarica dal sito e le allega. Si scaricano una volta sola e restano nel repository (circa 80-100 KB l'una).

### 4.2 Convertitore (`tools/anim/`, gira qui, non nel gioco)
- `clip2json.py` legge una clip GLB e scrive, per ogni osso, tempi, rotazioni e traslazioni.
- `bake.js` gira in una pagina senza schermo con three r128 locale. Ricostruisce lo scheletro Meshy dai nodi di `hero.json` e usa la stessa calibrazione del gioco (`setupMeshyHero`). Poi posa ogni fotogramma della clip e lo converte nel vettore di pose del gioco con il contrario del trasferimento (§4.4).
- `moves.json` contiene, per ogni mossa:
  - la clip;
  - i segni nella clip: inizio, inizio e fine dell'impatto, fine. Per i cicli di camminata e corsa, il fotogramma in cui il tallone sinistro tocca terra;
  - se serve, lo specchio tra destra e sinistra;
  - piccole correzioni per giuntura.
- Rimessa a tempo: una mappa lineare a tratti porta inizio → 0, inizio impatto → inizio di `hit`, fine impatto → fine di `hit`, fine → `dur`. Per le mosse senza finestra di colpo (parata, capriola, colpi subiti) porta inizio → 0 e fine → `dur`. I tempi di invulnerabilità restano quelli di `CFG`.
- Il risultato è `src/n_anims.js`, generato e committato: per ogni mossa gli angoli in decimi di grado. Si tolgono i fotogrammi che l'interpolazione lineare ritrova entro 0,3°. Obiettivo: meno di 100 KB.
- `bash tools/anim/bake.sh` rigenera tutto con un comando.

### 4.3 Nel gioco
- **Vettore di pose**: passa da 34 a 43 valori. Si aggiungono il petto (3), le clavicole (2 per lato) e le punte dei piedi (1 per lato). Le pose e le tracce di oggi hanno questi valori a zero, quindi restano identiche.
- **Scheletro del gioco** (`buildHuman`): nessuna giuntura nuova con mesh. Petto, clavicole e punte sono giunture virtuali, senza mesh, usate solo dal modello Meshy. Il corpo in codice dell'eroina tiene la schiena in un pezzo solo; braccia e testa conservano comunque la loro direzione nel mondo.
- **Tracce**: `HT[k]` si costruisce dai dati convertiti quando ci sono (fotogrammi fitti, interpolazione lineare), altrimenti resta la traccia a mano. La funzione `evalTrack` è la stessa.
- **Camminata e corsa**:
  - `gaitIK` prende dalla clip, alla fase del passo, le rotazioni di bacino, schiena, petto, testa, braccia e clavicole;
  - camminata e corsa si mescolano con lo stesso fattore di velocità di oggi;
  - le gambe restano calcolate con l'IK, così i piedi restano piantati a ogni velocità e in ogni direzione; l'altezza del piede sollevato e la piega della punta seguono la curva della clip;
  - guardia, guardia in movimento (`MOVE_ACTS`) e inclinazione restano sopra, come oggi.
- **Piedi sul terreno**: in pendenza ogni piede si posa sul terreno sotto di sé, invece che sul piano del corpo. Se un piede a terra non ci arriva, il bacino si abbassa quanto serve, al massimo di 15 cm.
- **Fusione**: quando una mossa inizia o finisce, il gioco fotografa la posa corrente e la fonde con la nuova in `CFG.anim.blend` secondi (0,08). È solo grafica, ma la lama si muove con la posa: per questo c'è la verifica della lama (§5).
- **Spostamento della radice**: lo spostamento orizzontale del bacino nelle clip si ignora, perché il corpo lo muove il gioco (affondi, capriola); l'abbassamento verticale diventa il valore `y` della posa.

### 4.4 Modello Meshy
- **Trasferimento** (esiste già): rotazione nel mondo dell'osso Meshy = (rotazione nel mondo della giuntura del gioco · rotazione a riposo⁻¹) · C · rotazione di legame dell'osso.
- **Conversione** (nuova, il contrario):
  - rotazione nel mondo della giuntura = rotazione nel mondo dell'osso · (C · legame)⁻¹ · riposo;
  - poi la rotazione locale rispetto al padre, in angoli YXZ come le giunture del gioco;
  - per le giunture a un asse (ginocchio, gomito, piede, punta) si prende l'angolo attorno a X, con la scomposizione swing-twist;
  - controllo: convertendo e poi ritrasferendo, le direzioni delle ossa tornano entro 2°.
- **Gambe**: quando il modello è attivo, `gaitIK` usa la coscia e lo stinco letti dallo scheletro Meshy e l'altezza della caviglia del modello da fermo. Così i piedi Meshy restano piantati.
- **Clavicole** (`LeftShoulder`, `RightShoulder`): seguono i valori nuovi invece di restare fisse. Finché non c'è una clip, si alzano con il braccio quando il braccio sale sopra la spalla.
- **Punte dei piedi** (`LeftToeBase`, `RightToeBase`): seguono i valori nuovi. Finché non c'è una clip, si piegano nella spinta del passo.
- **Schiena**: il petto ruota in più `Spine`, la parte alta della schiena; `Spine01` e `Spine02` restano la miscela di oggi tra bacino e schiena. Con il petto a zero tutto resta come oggi.
- Il calcolo per frame continua a non creare oggetti (test `meshy.test.js`).

### 4.5 Cosa resta calcolato dal codice, sopra le clip
- Giri sul posto a piccoli passi.
- Inclinazione in curva, in accelerazione e in frenata.
- Scatto: più inclinazione e passo più lungo.
- Colpi leggeri subiti (`flinch`) e acqua alta.
- Prima persona: la testa resta nascosta.

## 5. Verifiche
- **`tests/anim.test.js`** (nuovo):
  - piedi Meshy: lo scheletro vero si ricostruisce da `hero.json`, come in `meshy.test.js`. Un piede è "a terra" nei fotogrammi in cui la caviglia calcolata dall'IK si muove a meno di 0,05 m/s. Camminando e correndo, in quei fotogrammi la caviglia Meshy si muove a meno del 2% della velocità del corpo e non scende più di 1 cm sotto la sua altezza nella posa di riposo;
  - piedi dell'eroina: stessa soglia;
  - tempi: ogni mossa convertita dura `dur`, e il segno d'impatto cade nella finestra `hit`;
  - lama: nella finestra di colpo si misurano l'arco (l'angolo che la punta della spada spazza attorno all'asse verticale del corpo) e la portata (la distanza orizzontale massima della punta dal centro del corpo). Devono restare entro il 10% del riferimento misurato prima di cambiare le mosse (`tests/anim_ref.json`);
  - `animPlayer` non crea oggetti a ogni frame;
  - nessuna posa contiene valori non numerici (NaN).
- **Conversione**: errore di andata e ritorno sotto i 2° per osso, controllato dal convertitore.
- **Sonde di misura**: `fight20` e `fight20_nofx` entro i limiti, `perf` entro +0,1 ms.
- **Test di oggi**: tutti verdi.

## 6. Video per Denis
- `tools/anim/video.py` registra in una pagina senza schermo l'eroe con il modello Meshy: qualche secondo per ogni mossa cambiata, camera fissa. A sinistra la versione prima della tappa, a destra quella dopo. Il risultato è un MP4 a 720p e 30 fotogrammi al secondo, fatto con ffmpeg e mandato in chat.
- Il modello Meshy qui si carica con un caricatore minimo scritto per `hero.json` (`tests/vendor/mini_gltf.js`), con la stessa interfaccia `THREE.GLTFLoader().load` che usa `l_meshy.js`, solo nei test e nei video. Il GLTFLoader vero non si può scaricare da qui, e scaricarlo dal PC di Denis richiederebbe di collegargli una cartella.
- La pagina si apre da un piccolo server locale, perché le texture devono avere la stessa origine della pagina.

## 7. Tappe

Ogni tappa finisce con la pagina Claude aggiornata, il video prima/dopo e le misure (durata delle lotte, logica per frame, test).

| Tappa | Contenuto | Clip |
|---|---|---|
| 1. Piedi e scheletro Meshy | gambe Meshy nel passo e altezza delle caviglie; piedi che seguono il terreno in pendenza; clavicole e punte calcolate; petto nel vettore di pose; fusione tra le mosse; caricatore del modello per test e video; riferimento della lama | nessuna |
| 2. Camminata, corsa e fermo | convertitore; camminata e corsa dalle clip; respiro da fermo; partenze, frenate e giri sul posto sopra le clip | `hero_walk`, `hero_run` |
| 3. Attacchi | combo da 4 colpi, colpo pesante e carica, attacco in corsa, rotante, colpo di grazia, guardia | 8 già pagate (da scaricare) e quelle comprate |
| 4. Schivata e difesa | capriola, passo indietro, parata, blocco, passi di lato e all'indietro | già pagate e comprate |
| 5. Colpi subiti e il resto | colpi subiti, barcollare, caduta e rialzata, morte, bere, riposo, fermo | comprate |

- Prima della tappa 3: un solo elenco con le clip da comprare per le tappe 3-5, il saldo e il costo totale. Si compra solo con l'ok di Denis, e si scaricano anche le 8 già pagate.
- Il piano dettagliato si scrive adesso per le tappe 1-2. Quello per le tappe 3-5 si scrive quando le clip sono nel repository.

## 8. Rischi e contromisure

| Rischio | Contromisura |
|---|---|
| Una clip convertita sembra strana (polsi girati, spalle) | correzioni per giuntura in `moves.json`; se non basta, la mossa resta fatta a mano |
| La lama non passa più dove passava e i colpi mancano | verifica della lama; ritocco dei segni d'impatto o del polso |
| Una clip compressa in 0,5 s sembra accelerata | i segni comprimono soprattutto preparazione e recupero; Denis giudica dal video |
| Il catalogo Meshy non ha una mossa | resta fatta a mano |
| Da qui Meshy non si raggiunge | download dal PC di Denis o dal sito; le tappe 1-2 non ne hanno bisogno |
| Il file dei dati cresce troppo | meno fotogrammi; obiettivo sotto i 100 KB |
| L'eroina cammina in modo troppo maschile | proposta delle clip femminili dopo la tappa 2 |

## 9. Fuori da questo documento
- Nemici, abitanti e Selin: restano alla Tappa 3 del design principale.
- Mani che seguono l'impugnatura nei colpi a due mani (IK delle braccia).
- Animazioni del viso.
