# Sonde di misura della v5 (per il Task 9)

Sono script di passi per `harness.py`. Ognuno apre la pagina, preme "Nuova partita" ed esegue nella pagina la misura che contiene:

```bash
bash mk.sh >/dev/null
python3 harness.py "$PWD/game_w.html" tests/probes/fight20.json       # durata delle lotte, 20 prove (1 e 3 goblin), con effetti
python3 harness.py "$PWD/game_w.html" tests/probes/fight20_nofx.json  # la stessa misura senza effetti
python3 harness.py "$PWD/game_w.html" tests/probes/perf.json          # logica per frame nel primo accampamento
```

**Valori di riferimento della v5**
- Durata delle lotte: 1 goblin 2,51 s, 3 goblin 4,91 s.
- Gli effetti aggiungono 0,18 s con 1 goblin e 0,53 s con 3 goblin.
- Logica per frame nell'accampamento: 0,62-0,86 ms.

**Limiti della Tappa 1**: 1 goblin ≤ 2,64 s e 3 goblin ≤ 5,16 s; logica per frame entro +0,1 ms dalla v5.

Dopo il Task 6, "Nuova partita" apre la scelta del personaggio. Nelle sonde, aggiungi quindi un passo `["click", "#csM"]` dopo `["click", "#mNew"]`.
