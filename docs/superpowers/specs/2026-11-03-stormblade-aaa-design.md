# Stormblade — salto a tripla A (capitolo 1)

Data: 3 novembre 2026 · Stato: in revisione da parte di Denis · Versione dati di gioco: 4

## 1. Obiettivo e criteri di successo

Trasformare Stormblade (v5: movimento, collisioni, combattimento e IA già rifatti) in un capitolo 1 che sembri un gioco tripla A: storia, mondo progettato come Dark Souls, presentazione da film, personaggi realistici.

Il lavoro è riuscito quando:
- il capitolo 1 dura circa **45 minuti** per un giocatore normale, dal filmato d'apertura alla schermata di fine capitolo;
- il **pezzo completo** (prima consegna, circa 15 minuti) è rifinito al livello finale, non provvisorio;
- su un telefono di fascia media (un Android recente da circa 300 €), in orizzontale, il gioco tiene **60 FPS** nel villaggio e nei combattimenti (misurati col contatore interno);
- ogni tappa pubblicata è giocabile dall'inizio alla fine della parte che contiene, senza errori nella console;
- gli effetti nuovi non allungano le lotte (stessa misura di durata usata per la v5).

## 2. Decisioni prese da Denis

| Tema | Decisione |
|---|---|
| Parti del salto | Storia Parte 1, presentazione da film, grafica e animazioni (tutte e tre) |
| Protagonista | Scelta a inizio partita tra eroe ed eroina, stessa storia, testi declinati |
| Durata capitolo 1 | Circa 45 minuti |
| Mappa | Mondo interconnesso come Dark Souls, **con** una mappa che si completa esplorando |
| Zone | 5 zone più rifinite (non 7) |
| Modelli 3D | Meshy, abilitando l'accesso di rete a meshy.ai (crediti del suo account) |
| Strada | Prima un pezzo completo di circa 15 minuti, poi il resto del capitolo |
| Orientamento | Su telefono solo orizzontale |
| Braci | Come le anime di Dark Souls: si perdono alla morte e si recuperano dove si è caduti |
| Strumenti | Usare le skill aggiunte (brainstorming, piani, Meshy) |

Ipotesi mie ancora da confermare: nessuna aperta; ogni sezione qui sotto è stata approvata in chat.

## 3. Mondo e mappa

### 3.1 Le 5 zone

| Zona | Posizione | Ruolo | Contenuto chiave |
|---|---|---|---|
| Cresta della Statua | nord, la più alta | prologo e tutorial | statua del primo Custode, discesa sulla scogliera, primo santuario |
| Borgo Cenere | centro, in basso | rifugio e centro del mondo | piazza con santuario principale, case, fucina, bottega, campanile, cancello |
| Bosco dei Lupi | est | esplorazione, branchi | burrone, albero da abbattere (scorciatoia), tana di Zannagrigia, sporgenza di Tobi, lago al confine come paesaggio |
| Rovine dei Custodi | ovest | arcieri sulle mura, segreti | terrazze di pietra, tre tavolette, montacarichi (scorciatoia), passaggio sotto la fortezza |
| Fortezza del Fango | sud, su una collina | fine del capitolo | più livelli, portone che si apre da dentro (scorciatoia finale), trono di Grakk |

### 3.2 Regole del mondo
- Il terreno resta una mappa d'altezza; i dislivelli si ottengono con **altipiani, terrazze e scogliere**. Una scogliera è un pendio oltre il limite di salita già presente nel controller: non si scala.
- I passaggi tra livelli sono rampe, sentieri scavati, scale di pietra e ponti.
- Ogni zona ha almeno una **scorciatoia a senso unico** che si apre solo dal lato lontano e riporta a Borgo Cenere o a un santuario:
  - **Albero caduto** (Bosco): lo abbatti dal lato del bosco e diventa un ponte sul burrone verso il villaggio.
  - **Montacarichi** (Rovine): si attiva dall'alto e collega le terrazze alla strada alta del villaggio.
  - **Portone della fortezza**: si sblocca dall'interno e riporta alla strada che scende verso il villaggio.
- I **santuari sono i falò**: riposo, salvataggio, ricarica delle fiaschette, ritorno dei nemici, livelli con le braci.
- Punti di riferimento visibili da lontano: la statua spezzata, il campanile di Borgo Cenere, la torre della fortezza.
- Il confine esterno resta fatto di montagne; dentro, scogliere e mura delimitano i percorsi.

### 3.3 Mappa e bussola
- **Mappa a pergamena** disegnata dal terreno vero: rilievo, curve di livello, boschi, acqua, sentieri, edifici.
- Si scopre solo dove si è passati (nebbia di guerra su una griglia, raggio di circa 25 m intorno al giocatore), salvata nel salvataggio.
- Segna i santuari scoperti, le scorciatoie aperte, la posizione e la direzione del giocatore. **Nessun obiettivo segnato.**
- La bussola in alto mostra solo i punti cardinali e i santuari scoperti; scompaiono la freccia e la distanza dall'obiettivo.
- Apertura: tasto **M**, pulsante "mappa" sul telefono, **Select** sul controller. La mappa mette il gioco in pausa.

### 3.4 Pezzo completo
Cresta della Statua, Borgo Cenere e Bosco dei Lupi rifiniti; Rovine e Fortezza presenti come terreno e paesaggio (visibili da lontano) ma chiuse da ostacoli giustificati (frana, cancello) fino alle tappe successive.

## 4. Storia e missioni

### 4.1 Prologo (Cresta della Statua)
1. Filmato d'apertura (sezione 6.2), poi il personaggio si ripara dalla tempesta ai piedi della statua.
2. Un fulmine spacca la statua; il giocatore tocca l'elsa e si risveglia **Selin**: *"Nelle tue vene scorre il sangue dei Custodi."*
3. Il giocatore prende la spada arrugginita dalla base. Selin insegna, una cosa alla volta e solo quando serve: muoversi, attaccare, deviare al bagliore, schivare, il colpo pesante.
4. Discesa lungo la scogliera con i primi goblin e un lupo; accensione del primo santuario (riposo e salvataggio spiegati da Selin).
5. Titolo: "Capitolo I · La Valle di Cenere".

### 4.2 Borgo Cenere
- Arrivo durante un assalto dei goblin al cancello; si combatte accanto a due guardie. Ogni guardia è in **duello** con un goblin (si colpiscono solo tra loro, scena preparata); gli altri goblin attaccano il giocatore. Nessuna IA alleata generale.
- **Maren** (l'anziana): racconta di **Grakk**, signore della guerra nella Fortezza del Fango, che custodisce il primo frammento; le tempeste peggiorano da quando i goblin l'hanno preso.
- **Ulrik** (fabbro): potenzia e forgia le spade con braci e ferro dei goblin.
- **Livia** (mercante): vende fiaschette, **Resina ardente** (fuoco sulla lama per 60 s, più danno) e **Osso del ritorno** (riporta all'ultimo santuario dove hai riposato); è la madre di Tobi.
- **Guardie**: due al cancello, una in piazza.

### 4.3 Missioni

| Missione | Tipo | Dove | Come si completa | Ricompensa |
|---|---|---|---|---|
| Il frammento nel fango | principale | Bosco o Rovine, poi Fortezza | raggiungere la fortezza per una delle due vie, sconfiggere Grakk | primo frammento, fine capitolo |
| Tobi è sparito | secondaria | Bosco dei Lupi | trovare Tobi su una sporgenza, abbattere l'albero per riportarlo a casa | braci, sconto del 20% da Livia |
| Zannagrigia | secondaria (mini-boss) | tana nel Bosco | sconfiggere il lupo capobranco | braci, 2 Ossa del ritorno |
| La memoria dei Custodi | secondaria | Rovine | trovare tre tavolette | Selin: +1 fiaschetta massima |
| Il ferro di Ulrik | secondaria | ovunque | portare ferro dei goblin scelti a Ulrik | spada migliore forgiata |

Le due vie verso la fortezza:
- **Est**: dal Bosco dei Lupi al muro posteriore della fortezza.
- **Ovest**: dalle Rovine, per un passaggio dei Custodi che sbuca sotto la fortezza.

### 4.4 Finale del capitolo
Grakk in cima alla fortezza (boss con due fasi). Alla vittoria il frammento si unisce alla spada, che si illumina; Selin: *"Ne restano tre."* Schermata di fine capitolo con statistiche (tempo, nemici sconfitti, morti, segreti trovati) e anticipazione del capitolo 2.

### 4.5 Dialoghi e diario
- Riquadro in basso con nome di chi parla, ritratto e testo che scorre; tocco o tasto per accelerare e andare avanti.
- In alcuni punti 2-3 scelte; cambiano dettagli e ricompense, non la trama.
- Testi con varianti maschile e femminile, scritte nel dato come `{m|f}`, risolte in base al personaggio scelto.
- Il giocatore non ha nome proprio: "erede", "straniero" o "straniera".
- **Diario**: missioni attive e completate, ognuna con un'indicazione a parole ("A est, oltre il ponte di legno marcio").

### 4.6 Pezzo completo
Prologo, assalto al cancello, presentazione di Maren, Ulrik e Livia, inizio della missione principale, "Tobi è sparito" e "Zannagrigia".

## 5. Personaggi e grafica

### 5.1 Modelli Meshy
| Modello | Tappa | Note |
|---|---|---|
| Eroe, eroina | pezzo completo | stessa armatura scura di cuoio e maglia, mantello con cappuccio |
| Selin | pezzo completo | figura femminile; shader di spirito traslucido e luminoso fatto da me |
| Maren, Ulrik, Livia, Tobi | pezzo completo | abitanti |
| Guardia | pezzo completo | una base con varianti di colore |
| Goblin | pezzo completo | anche l'arciere, con l'arco |
| Troll, Grakk | dopo il pezzo completo | boss |
| Statua del primo Custode | dopo il pezzo completo | oggetto principale, senza scheletro |

- I **lupi** (anche Zannagrigia) restano costruiti in codice con pelliccia e dettagli migliori: lo scheletro automatico di Meshy funziona solo per figure umane.
- Prima di spendere crediti: saldo e costo stimato per modello mostrati a Denis; generazioni in più o rifacimenti solo con il suo ok.

### 5.2 Animazioni
- Il sistema attuale (pose, combo, deviazione, schivata, camminata con piedi piantati) resta il **motore delle animazioni**.
- **Trasferimento per direzioni**: lo scheletro attuale gira invisibile come "manichino"; ogni frame, ogni osso Meshy viene ruotato perché il suo segmento punti come il segmento corrispondente del manichino, conservando la torsione. Funziona con qualsiasi posa di riposo (T, A) e con proporzioni diverse.
- Le lunghezze di coscia e stinco del modello Meshy vengono lette dallo scheletro e passate alla camminata, così i piedi restano piantati.
- Gli abitanti usano anche clip Meshy (fermo, parlare) mescolate al sistema.

### 5.3 Peso e qualità
- Circa 20 mila triangoli per personaggio, texture 1K (2K solo su PC con qualità alta), circa 2-3 MB per file.
- Peso totale del pezzo completo: al massimo circa 25 MB, con schermata di caricamento e barra di avanzamento.

### 5.4 Villaggio e mondo
- Case di legno e pietra, fucina con brace accesa, taverna, campanile, palizzata e cancello: costruiti in codice a **pezzi modulari** con i materiali procedurali attuali (texture generate), raggruppati per contenere le draw call.
- **Ciclo giorno-notte** con alba e tramonto; le tempeste restano. Di notte lanterne accese nel villaggio (luci dal pool esistente, poche e vicine).
- Nebbia più densa nel Bosco dei Lupi.

### 5.5 Ritratti e immagini
- Ritratti dei dialoghi renderizzati dai modelli 3D (inquadratura del volto in una texture).
- Mappa a pergamena disegnata dal codice.
- Blueprint Studio non è collegato: nessuna immagine generata esternamente.

### 5.6 Piano B
Se un modello Meshy non convince, o Meshy non è raggiungibile, resta il personaggio procedurale attuale e il resto del lavoro procede.

## 6. Presentazione e audio

### 6.1 Scelta del personaggio
Dopo "Nuova partita": eroe ed eroina sulla Cresta, camera che gira lenta; si sceglie e parte il filmato.

### 6.2 Filmato d'apertura (circa 60 s, saltabile)
Volo sopra la valle in tempesta; Selin racconta nei sottotitoli la leggenda dei Custodi e di come il Re della Tempesta spezzò la Stormblade in quattro frammenti; ultima inquadratura sulla Cresta con il personaggio scelto; il gioco parte senza caricamenti.

### 6.3 Momenti con stacco di camera
- Il fulmine che spacca la statua.
- Ogni scorciatoia aperta: la camera mostra dove porta.
- Ingresso dei boss con bande nere, nome e musica: Zannagrigia che ulula su una roccia, Grakk sul trono.
- Il frammento che si unisce alla spada.

### 6.4 Dialoghi
Inquadratura sopra la spalla che alterna giocatore e abitante, bande nere, sfondo sfocato solo con qualità alta.

### 6.5 Musica e suoni (tutto generato dal codice, nessun file)
- Temi: prologo (tempesta e coro), Borgo Cenere (malinconico, corde pizzicate), esplorazione, combattimento (tamburi), boss (cori e percussioni).
- Voci degli abitanti: mormorii in lingua inventata mentre scorre il testo, con timbro diverso per personaggio.
- Ambiente del villaggio: martello della fucina, campana, vento.

### 6.6 Saltare
Tenere premuto "Salta" per un secondo, su PC (tasto e clic) e su telefono (pulsante).

## 7. Sistemi

### 7.1 Braci
- Lasciate dai nemici e trovate nel mondo.
- Si spendono: ai santuari per salire di livello (vita, vigore, forza, con costo crescente), da Livia per fiaschette e oggetti, da Ulrik per forgiare spade insieme al ferro dei goblin.
- Alla morte restano a terra in un mucchio luminoso dove si è caduti (se si muore in acqua profonda o fuori dai percorsi, nell'ultimo punto di terreno sicuro calpestato); toccandolo si recuperano; morendo di nuovo prima di arrivarci si perdono.
- Sostituiscono l'esperienza attuale (la barra dei livelli diventa il contatore delle braci).

### 7.2 Spade
Le 5 spade attuali restano; quelle oltre la prima si forgiano da Ulrik o si trovano (forziere di Grakk).

### 7.3 Salvataggio
- Chiave nuova con versione dati 4.
- Contenuto: personaggio scelto, posizione al santuario, braci e mucchio a terra, livelli, spada, fiaschette, missioni e loro stato, scelte nei dialoghi, scorciatoie aperte, nebbia della mappa, segreti presi.
- Le partite della v5 non sono compatibili col nuovo mondo: al primo avvio il titolo propone solo "Nuova partita"; le impostazioni restano.

## 8. Piattaforma

### 8.1 Telefono solo orizzontale
- Al tocco su "Nuova partita": schermo intero e blocco dell'orientamento orizzontale dove il browser lo permette (Android).
- Se il telefono resta in verticale (iPhone, blocco rotazione): il contenitore del gioco ruota di 90° via CSS; i tocchi vengono rimappati di conseguenza (joystick, visuale, pulsanti).
- HUD e menu progettati per l'orizzontale a partire da 360 px di altezza.

### 8.2 Input
PC tastiera e mouse, controller, touch; tutte le nuove funzioni (dialoghi, scelte, mappa, diario, saltare, interagire con le scorciatoie) hanno un comando su tutti e tre.

### 8.3 Prestazioni
- 60 FPS su un telefono medio; misura con il contatore interno su un dispositivo reale.
- Personaggi Meshy con un solo materiale ciascuno dove possibile; ombre solo dal sole; nessuna luce in più oltre al pool attuale.
- Zone caricate quando servono; i modelli dei boss solo quando ci si avvicina alla loro zona.

## 9. Architettura tecnica

Stessa struttura attuale: moduli in `sb/src/` uniti da `mk.sh`/`build.py` in un unico file pubblicato, più i file 3D pubblicati accanto alla pagina.

| Unità (file) | Cosa fa | Da cosa dipende |
|---|---|---|
| `a0_cfg.js` | tutti i numeri di bilanciamento, ora anche braci, costi di livello, prezzi | niente |
| `d_world.js` | terreno a strati (altipiani, terrazze, scogliere, burrone), zone, collisori; collisori disattivabili per le scorciatoie | cfg |
| `g_props.js` + nuovo `p_village.js` | santuari, rovine, fortezza; pezzi modulari del villaggio | world, geo |
| nuovo `l_assets.js` | caricamento GLB (GLTFLoader di three r128 incluso nel bundle), barra di caricamento, materiali, trasferimento delle animazioni sugli scheletri Meshy | core, chars |
| nuovo `m_story.js` | dati di dialoghi e missioni, stato delle missioni, eventi (entrare in un'area, uccidere, parlare, aprire), diario, testi `{m|f}` | game state |
| nuovo `n_cine.js` | filmati: percorsi di camera, bande nere, sottotitoli, eventi, "tieni premuto per saltare" | camera, audio |
| nuovo `o_map.js` | disegno della pergamena dal terreno, nebbia, pannello mappa | world |
| `i_player.js`, `j_enemies.js` | invariati nel comportamento; il giocatore e i nemici umani ricevono il corpo Meshy tramite `l_assets.js` | |
| `h_audio.js` | nuovi temi musicali, voci degli abitanti, ambiente del villaggio | |
| `k_game.js` | flusso di gioco: titolo, scelta del personaggio, braci e morte, salvataggio v4, input nuovi, orientamento | tutti |

Scelte tecniche:
- **GLTFLoader**: il file `examples/js/loaders/GLTFLoader.js` di three.js r128, preso dal repository GitHub (raggiungibile) e incluso nel bundle.
- **File 3D**: pubblicati come file dell'artifact accanto alla pagina. Se il tipo `.glb` non venisse accettato, si pubblicano come file di dati codificati.
- **Riduzione dei modelli**: si chiede a Meshy il numero di poligoni giusto in generazione; le texture si ridimensionano con uno script Python (Pillow) che riscrive il GLB, senza bisogno di strumenti npm.
- **Collisori disattivabili**: un flag sui collisori esistenti, letto da collisione e raggi della camera.
- **Dati della storia** in oggetti di configurazione dentro `m_story.js` (dialoghi, missioni, trigger), separati dalla logica.

## 10. Verifiche a ogni tappa
- Regressione attuale: movimento, combattimento, durata delle lotte (prima e dopo), stress con input casuali, errori della console.
- **Giocatore automatico** che attraversa il pezzo completo missione per missione (prologo → santuario → villaggio → Tobi → albero → Zannagrigia) e controlla gli stati delle missioni.
- Salvataggio e caricamento a metà di ogni missione.
- Screenshot di controllo: orizzontale su telefono (anche con rotazione forzata), PC, filmati, dialoghi, mappa.
- Misura della logica per frame e del tempo per frame confrontata con la v5.

## 11. Tappe e consegne (pezzo completo)

| Tappa | Contenuto | Uscita |
|---|---|---|
| 1. Basi | orizzontale, salvataggio v4, braci e mucchio alla morte, scelta del personaggio (eroe attuale ed **eroina procedurale provvisoria** con proporzioni e capelli suoi, finché arriva quella Meshy), sistemi di dialogo, missioni e diario | versione giocabile con il mondo attuale |
| 2. Mondo | 5 zone a strati; Cresta, Borgo Cenere e Bosco rifiniti; scorciatoia dell'albero; mappa a pergamena con nebbia; bussola nuova | versione giocabile nel nuovo mondo |
| 3. Personaggi Meshy | eroe, eroina, Selin, abitanti, guardia, goblin con le animazioni trasferite | parte appena Meshy è raggiungibile; le altre tappe non aspettano |
| 4. Storia | prologo, assalto al cancello, dialoghi di Maren, Ulrik, Livia, "Tobi è sparito", "Zannagrigia" | pezzo completo giocabile dall'inizio |
| 5. Filmati e audio | filmato d'apertura, stacchi di camera, inquadrature dei dialoghi, temi musicali, voci | pezzo completo finito |

Dopo il pezzo completo: Rovine dei Custodi, Fortezza del Fango, troll e Grakk, "La memoria dei Custodi", "Il ferro di Ulrik", finale del capitolo.

Il piano di implementazione si scrive **una tappa alla volta**: prima il piano della tappa 1, poi, dopo la sua consegna, quello della tappa successiva.

## 12. Rischi e contromisure

| Rischio | Contromisura |
|---|---|
| Meshy resta irraggiungibile | tappe 1, 2, 4, 5 procedono con i personaggi attuali; tappa 3 quando la rete è aperta |
| Crediti Meshy limitati | saldo e stima prima di spendere; prima un solo modello di prova (eroe) |
| File 3D troppo pesanti per il telefono | poligoni bassi in generazione, texture 1K, caricamento per zone |
| Trasferimento animazioni imperfetto (mani, torsioni) | prova sull'eroe prima di tutti gli altri modelli; correzioni per osso nel config |
| Rotazione forzata e tocchi su iPhone | prova con viewport verticale e rimappatura; pulsante per uscire dallo schermo intero |
| Terreno a strati che rompe collisioni o IA | stessi test di collisione e navigazione della v5 su ogni zona |

## 13. Fuori da questo documento
Parte 2 della storia (capitoli 2 e 3, poteri dei frammenti, boss finale, due finali) e il viaggio rapido tra santuari: da progettare dopo il capitolo 1.
