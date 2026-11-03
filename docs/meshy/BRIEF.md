# Brief per la sessione Meshy — Stormblade, Tappa 3 (personaggi)

**Obiettivo.** Generare con Meshy, usando l'account e i crediti di Denis, i modelli 3D dei personaggi umani del pezzo completo. I modelli devono essere riggati e pronti per il gioco, e vanno salvati in questo repository. Qui **non si tocca il codice del gioco**: il caricamento dei GLB e il trasferimento delle animazioni li fa la conversazione principale dell'app Claude. Il contesto completo è nel design, `docs/superpowers/specs/2026-11-03-stormblade-aaa-design.md`, sezione 5.

## Regole (obbligatorie)
1. Scrivi a Denis in italiano, con messaggi brevi.
2. Se è disponibile la skill `meshy-3d-agent:meshy-3d-generation`, caricala e seguila. Altrimenti usa Meshy CLI **0.4.0** con `npm exec --yes --package=meshy-cli@0.4.0 -- meshy …` (serve Node ≥ 22.12) e passa `--output-schema v1 --format json --no-update-check` ai comandi di lavoro.
3. **Login.** Prima prova `meshy auth status --format json --no-update-check`. Se serve, lancia `meshy auth login --device --format json --no-update-check` in un comando che **resta in attesa in questo stesso turno**. Mostra a Denis il link e il codice esattamente come li stampa la CLI (link cliccabile più codice da digitare) e spiegagli cosa fare: aprire il link, entrare in Meshy, digitare il codice, approvare. Le credenziali non passano mai in chat.
4. **Crediti.** Prima di ogni generazione mostra a Denis il **saldo** (`meshy balance`) e il **costo stimato**:
   - per il modello da testo, il planner `meshy make "…" --dry-run`;
   - per rigging, remesh e animazioni, il listino https://docs.meshy.ai/en/api/pricing, citato con la data.

   Parti **solo con il suo ok**. Il primo modello è **solo l'eroe**: gli altri si fanno dopo che Denis l'ha visto e ha detto sì. Rifacimenti, varianti in più o animazioni extra vanno chiesti prima. Alla fine riporta i crediti realmente consumati (`consumed_credits`; se manca, scrivi "sconosciuto").
5. Un solo `create --async` per fase, poi `wait` sullo stesso ID. Non usare `--no-wait` né `--manual`. Se scade il tempo di attesa non è un errore: si riprende con lo stesso `wait`, senza pagare di nuovo.

## Requisiti tecnici per ogni personaggio
- **Stile**: dark fantasy serio e realistico, colori scuri e desaturati (cuoio, ferro, lana), coerente da tutte le direzioni.
- **Posa**: A-pose, figura intera, braccia staccate dal corpo, **nessuna arma in mano** (spade e archi sono fatti nel gioco). Il mantello, se c'è, è corto e non copre le gambe.
- **Pipeline**: text-to-3d preview (`--pose-mode a-pose`) → refine con texture PBR → rigging con `--height-meters` (altezze sotto). Scarica il GLB riggato e le clip incluse nel rigging (camminata e corsa).
- **Budget**: circa **20.000 triangoli** e texture **1K**, possibilmente un solo materiale, file GLB intorno a 2-3 MB.
  - Imposta i triangoli in generazione se `text-to-3d create --help` lo permette, altrimenti un remesh: è una fase a pagamento in più, quindi va nella stima.
  - Se Meshy non dà texture a 1K, ridimensiona in locale, per esempio con `npx @gltf-transform/cli resize in.glb out.glb --width 1024 --height 1024`.
  - Controlla triangoli e dimensioni con `npx @gltf-transform/cli inspect`.
- **Anteprima**: scarica la miniatura (`--asset thumbnail.primary`), guardala e mostrala a Denis.

## Personaggi (in quest'ordine)
| id | Personaggio | Altezza | Prompt per Meshy (in inglese) |
|---|---|---|---|
| `hero` | Eroe (**modello di prova**) | 1,80 | Grim dark-fantasy wanderer, adult man, athletic build, dark brown leather armor over a chainmail shirt, leather bracers and gloves, belt with small pouches, worn leather boots, short dark grey wool cloak with the hood down, short dark hair, light stubble, weathered face, no weapon, A-pose, full body, realistic, muted desaturated colors |
| `heroine` | Eroina | 1,70 | Same outfit as the hero for an adult woman: dark brown leather armor over chainmail, leather bracers, belt with pouches, worn boots, short dark grey hooded cloak with the hood down, dark hair tied in a long braid down to mid-back, determined weathered face, no weapon, A-pose, full body, realistic, muted colors |
| `selin` | Selin, spirito guida | 1,75 | Ethereal guardian spirit, tall slender woman in long flowing layered robes with a soft hood down, simple ancient ornaments, long loose hair, serene face, A-pose, full body, pale stone-grey and soft blue tones (the glow is added in game) |
| `maren` | Maren, l'anziana | 1,60 | Elderly village woman, wise elder, layered wool shawl over a long dark dress, grey hair in a bun, wrinkled kind face, slightly hunched, A-pose, full body, realistic, muted earthy colors |
| `ulrik` | Ulrik, il fabbro | 1,85 | Burly middle-aged blacksmith, thick dark beard, leather apron over a linen shirt with rolled sleeves, heavy boots, soot on arms and face, A-pose, full body, realistic, muted colors |
| `livia` | Livia, la mercante | 1,68 | Merchant woman in her thirties, practical wool dress with an apron and belt pouches, headscarf, warm earthy colors, friendly face, A-pose, full body, realistic |
| `tobi` | Tobi, bambino del villaggio | 1,25 | Village boy about ten years old, simple linen tunic, trousers and small boots, messy brown hair, curious face, A-pose, full body, realistic, muted colors |
| `guard` | Guardia (una base, colori variati nel gioco) | 1,82 | Town guard, adult man, padded gambeson, iron kettle helmet, plain dark red tabard, leather belt and boots, no weapon, A-pose, full body, realistic, muted colors |
| `goblin` | Goblin (anche l'arciere, con arco fatto nel gioco) | 1,25 | Goblin warrior, small wiry humanoid with grey-green skin, long pointed ears, sharp teeth, ragged leather and fur armor, bone trinkets, no weapon, A-pose, full body, realistic dark fantasy |

Per gli abitanti (Selin, Maren, Ulrik, Livia, Tobi, guardia) proponi anche, a parte e con il prezzo, le clip "fermo" e "parlare" del catalogo (`meshy animation-catalog list --search idle` / `talk`).

## Dove salvare e come consegnare
- Una cartella per personaggio: `assets/meshy/<id>/` con `<id>.glb` (riggato e ottimizzato), `walking.glb`, `running.glb`, `preview.png` e `meta.json`:
  ```json
  {"id":"hero","prompt":"…","task_ids":{"preview":"…","refine":"…","rigging":"…"},"triangles":0,"texture":"1024","bytes":0,"credits":0,"date":"…"}
  ```
- Fai il commit e il push sul ramo della sessione e scrivi a Denis il nome del ramo.
- Messaggio finale a Denis: anteprima, triangoli, peso del file e crediti usati. Poi digli di tornare nella conversazione principale dell'app Claude e scrivere **"modelli pronti sul ramo <nome>"**.
