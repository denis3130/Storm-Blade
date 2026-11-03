# Eroe (Meshy)

| File | Contenuto |
|---|---|
| `hero.glb` | Personaggio riggato, 20.729 triangoli, 24 ossa, texture PBR 1K JPEG, altezza 1,80 m |
| `hero_walk.glb` | Clip camminata (solo scheletro, 1,07 s) |
| `hero_run.glb` | Clip corsa (solo scheletro, 0,67 s) |

Verificato in Three.js r128 con GLTFLoader: SkinnedMesh, clip applicate con AnimationMixer.

## Task Meshy (3/11/2026) — 40 crediti
- preview text-to-3d (a-pose): `01a1a215-1dbe-772a-be18-1f30213370bd` — 20
- refine PBR 2K: `01a1a216-0e5d-767f-b8e7-aa0008606387` — 10
- remesh triangoli 20k: `01a1a217-ff80-72e4-8bfe-405a72e952bc` — 5
- rigging 1,80 m: `01a1a219-c2bc-7050-b350-c876b7cc4b85` — 5

Post-processing locale: `gltf-transform resize 1024` + `gltf-transform jpeg --quality 85 --formats png`.

## Animazioni Meshy (3/11/2026) — 24 crediti (8 × 3; anche le due segnate "free" nel catalogo sono state addebitate)
Sul rig `01a1a219-…`. File FBX/GLB in `anims/` (non nel repository: pesanti, si riscaricano gratis dagli ID).
| file | azione | task |
|---|---|---|
| left_slash | 97 Left Slash | 01a1a2c5-3398-775b-97a1-c0f5f520460f |
| right_slash | 219 Right-hand Sword Slash | 01a1a2c5-38f6-77da-b68f-b15570d6ddae |
| heavy_judgment | 102 Sword Judgment | 01a1a2c5-3ea8-73c7-81c9-b9793d43e971 |
| sword_parry | 147 Sword Parry | 01a1a2c5-44ca-74a6-965c-1c3850014713 |
| roll_dodge | 158 Roll Dodge | 01a1a2c5-49d4-71de-b5ac-e112a1c171c1 |
| pickup | 276 Male Bend Over Pick Up | 01a1a2c5-4fa9-749f-93b5-b31931eff98f |
| attack_free | 4 Attack | 01a1a2c5-54a4-7496-be30-25b90a1e3e96 |
| triple_combo_free | 105 Triple Combo Attack | 01a1a2c5-59db-71e1-a87f-c34834778e52 |
