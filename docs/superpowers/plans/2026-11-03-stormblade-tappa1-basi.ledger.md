# SDD ledger — plan: docs/superpowers/plans/2026-11-03-stormblade-tappa1-basi.md
Spec: docs/superpowers/specs/2026-11-03-stormblade-aaa-design.md (read). Executor: executing-plans (inline). Branch: tappa1-basi from master 423d558.
Setup: Ruling: feature branch in place instead of a separate worktree — private scratch repo only this session uses; build writes ../stormblade.html and reads gitignored three.min.js relative to sb/, which a worktree path would break — cost if wrong: none, master stays at 423d558.

## Pre-flight (interfaces between tasks)
- T1 -> T2..T8: T API (test/eq/ok/near/newGame/clearEnemies/sim/key) matches every consumer. __SB members used by tests already exported (sim,tp,P,PL,G,ST,IN,CAM,KEYS,THREE,renderer,LAKE,wadeDepth,spawnEnemy,startAct,setStormPhase,SHRINES,startGame) or added by T1 (respawn,playerDie,save,loadSave,resetPlayer,showTitle,showScreen). Found: .gitignore is a whitelist without tests/, so T1's `git add tests` would add nothing. Ruling: T1 adds `!/tests/` to .gitignore — cost if wrong: none.
- T2 -> T3: P.braci, addBraci, CFG.braci.pickR — consistent.
- T2 -> T6/T7/T8: padMenu. T2 names states shrine/levelup/pause/title; T6 (charsel), T7 (dialogue choices), T8 (journal, pause->Diario) also need it. Ruling: padMenu acts on whichever SCREENS element is visible (plus #dlgChoices when it has buttons), not a fixed state list, so later tasks only register their screens — cost if wrong: one condition to adjust.
- T2 -> T5: emberOrbs target from offsets inside the game container (T2 says so for T5) — consistent.
- T2 -> T8: T2's shrine test sets flags.selinMet first; T8 opens Selin only when !selinMet — consistent.
- T3 -> T4: P.drop is saved by T4 but the pile mesh is T3's. Ruling: T3 exposes syncDrop() (rebuilds/hides the pile mesh from P.drop); loadSave and resetPlayer call it — cost if wrong: invisible pile after Continue.
- T4 -> T6: P.hero in save; startGame(true) restores hero — consistent.
- T5/T7 -> mk.sh: r_orient.js before k_game.js (T5), m_story.js before r_orient.js (T7) — consistent.
- T7 -> T8: storyAct gains quest:<id>; talk event at dialogue start — consistent.
- T2 -> T9: v5 probes (probe_fight20.js, probe_perf.js) may read P.xp/e.xp; checked when T9 runs.

## Tasks
Task 1: Ruling: T.clearEnemies uses the game's removeEnemy (now exported in debug-only __SB) and also clears enemy projectiles — an arrow in flight would otherwise still hit after "clear" — cost if wrong: none, production build strips __SB.
Task 1: Ruling: run.py also fails on console errors except "Failed to load resource" — spec 1 asks for "nessun errore nella console" — cost if wrong: a harmless third-party console.error could fail a run; one filter line.
Task 1: verified runner exits 1 on an async PAGEERROR (throwaway probe pageerror.probe.js left in this git-ignored workspace).
Task 1: complete (commits 423d558..b43f6e3, tests: bash -c 'bash mk.sh >/dev/null && python3 tests/run.py tests/smoke.test.js && python3 tests/run.py tests/regression.test.js' → 3 passed, 0 failed, 0 errors (regression.test.js))
Task 2: Ruling: shrine menu opens synchronously in restAtShrine (at the rest action's .9 s mark) instead of the old 900 ms setTimeout — the plan's test checks state after 70 sim frames, and a timer would not fire inside a synchronous test; the kneeling pose stays frozen behind the menu like in pause — cost if wrong: menu appears 0.9 s earlier than the old level-up screen.
Task 2: Ruling: after picking a stat the game returns to the shrine menu (new cost shown, can level again or leave); #levelup gets an "Indietro" button (#luBack) and the cost line — plan only said the cards show cost and braci — cost if wrong: one extra tap to leave.
Task 2: Ruling: "Sali di livello · costo N" rendered as label + small "Costo N braci" line, and the counter sits in the HUD row where the XP bar was (spec 7.1: the level bar becomes the braci counter) — cost if wrong: layout tweak only.
Task 2: Ruling: generic menu navigation (menuMove/menuPress/menuBack, screens declare data-back) shared by keyboard arrows/Esc and pad d-pad/stick/A/B, applied to every SCREENS element — plan named only shrine/levelup/pause/title — cost if wrong: Esc now also backs out of settings/controls (was a no-op).
Task 2: Ruling: added compact landscape rules (max-height 460px) so the level-up cards stay 3-across and fit 360 px height — spec 8.1 "menu progettati per l'orizzontale a partire da 360 px" — cost if wrong: card descriptions hidden on short screens.
Task 2: note: kept the "enough braci to level" toast + sfx alongside the one-time medal pulse (same feedback the old XP level-up gave).
Pivot 12:30: Meshy network cannot open in this Claude-app session (allowlist only GitHub; Cowork-type settings apply to new sessions). Denis moves the Meshy step (tappa 3) to a Claude Code session on repo denis3130/storm-blade; this session keeps the game and the artifact. Stage 1 execution paused at Denis's request until the hand-off is done.
Task 2: complete (commits b43f6e3..37bf36e, tests: bash -c 'bash mk.sh >/dev/null && python3 tests/run.py tests/braci.test.js && python3 tests/run.py tests/smoke.test.js && python3 tests/run.py tests/regression.test.js' → 3 passed, 0 failed, 0 errors (regression.test.js))
Hand-off 12:40: Denis moves ALL remaining work (stage 1 tasks 3-9, Meshy, later stages) to Claude Code on github.com/denis3130/Storm-Blade; playable builds now go to GitHub Pages from main (index.html). See docs/HANDOFF.md. Next: Task 3. Final whole-branch review still to do after Task 9.
