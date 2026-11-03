# Passaggio a Unreal Engine — 3 novembre 2026

Denis ha deciso di portare Stormblade su **Unreal Engine 5.8**, con Blender per rifinire le animazioni. La versione web resta **ferma** (pagina Claude "Stormblade", ramo `tappa1-basi`).

## Come si lavora
- Sessione di **Claude Code sul PC di Denis** (Claude Desktop), nella cartella del repository, con il plugin **Unreal Engine Skills** di Epic attivo e l'editor aperto.
- Tutto deve essere **visibile e modificabile nell'editor**: livelli con attori piazzati (Outliner), asset nel Content Browser. Niente oggetti creati solo a runtime.
- Codice in **C++**; i Blueprint si toccano solo tramite il plugin di Epic.
- Messaggi a Denis: italiano, **brevissimi**, e le scelte sempre come **domande con risposte** (AskUserQuestion).

## PC di Denis
Windows 11, RTX 3060 12 GB, 32 GB RAM, Unreal 5.8, Visual Studio 2022. Il progetto Third Person C++ "StormBlade" va in `unreal/StormBlade/` di questo repository (ramo `unreal`; LFS e esclusioni già pronti).

## Obiettivo della prima prova (scelte di Denis)
- Una **piccola area del Borgo Cenere** (villaggio bruciato, case di legno e pietra, braci nell'aria): niente da cercare, serve solo a giudicare l'ambientazione.
- **Eroe Meshy** (`assets/meshy/hero/`, FBX riggato: si riscarica dal task rig `01a1a219-c2bc-7050-b350-c876b7cc4b85`) con movimento e attacchi **perfezionati**.
- Animazioni: **Game Animation Sample di Epic** per il movimento, **Meshy** per gli attacchi (8 già pagate, ID in `assets/meshy/hero/README.md`), **pacchetti gratuiti Fab**; rifinitura in Blender.
- Combattimento **via di mezzo**: peso alla Dark Souls, combo fluide alla Where Winds Meet.
- **Spada lunga arrugginita** Meshy (`assets/meshy/sword/sword_rusty.glb`, scalarla a circa 1 m) **a terra**: luce leggera e scritta «Raccogli» da vicino; l'eroe la raccoglie con l'animazione `pickup` e la impugna.
- Piattaforme: PC ora, poi Android e iPhone.
- Fab: **solo contenuti gratuiti**. Meshy: saldo 3171 crediti; mostrare saldo e stima e chiedere l'ok prima di spendere.
