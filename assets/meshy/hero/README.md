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
