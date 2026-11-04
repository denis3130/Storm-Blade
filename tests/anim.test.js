// tests/anim.test.js — player animation: Meshy transfer, feet, clavicles and toes, blend (run with --data tests/anim_zero.json)
const S = __SB, TH = S.THREE, D2R = Math.PI / 180;   // SKEL, realMeshy, meshyOn: tests/fixtures.js
const bonesQ = () => Object.values(S.MESHY.B).map(b => b.getWorldQuaternion(new TH.Quaternion()).toArray());
const trackAt = (tr, t) => { const p = new Float32Array(S.HP.idle.length); S.evalTrack(tr, t, p); return p; };
// pose a rig directly (no animPlayer layers) and transfer it to the Meshy skeleton
function posed(p) { const R = S.PL.rig; R.apply(p); R.root.updateMatrixWorld(true); S.meshySync(); }

T.test('extras at zero change nothing', () => { meshyOn(); const out = [];
  for (const p of [S.HP.idle, S.HP.guard, trackAt(S.HT.light1, .2), trackAt(S.HT.heavy, .37)]) { posed(p); out.push(bonesQ()); }
  if (window.TDUMPMODE) { window.TDUMP = out; return; }
  T.ok(window.TDATA, 'run with --data tests/anim_zero.json'); let worst = 0;
  out.forEach((q, i) => q.forEach((v, j) => v.forEach((c, k) => { worst = Math.max(worst, Math.abs(c - TDATA[i][j][k])); })));
  T.ok(worst < 1e-5, 'Meshy bones moved by ' + worst); });
const wpos = o => o.getWorldPosition(new TH.Vector3()), wq = o => o.getWorldQuaternion(new TH.Quaternion());
T.test('clavicle raise lifts the Meshy shoulder', () => { meshyOn(); const B = S.MESHY.B;
  posed(S.HP.idle); const l0 = wpos(B.LeftArm), r0 = wpos(B.RightArm);
  posed(S.pose({clL: [20, 0]}, S.HP.idle)); const l1 = wpos(B.LeftArm);
  posed(S.pose({clR: [20, 0]}, S.HP.idle)); const r1 = wpos(B.RightArm);
  posed(S.pose({clL: [0, 20]}, S.HP.idle)); const l2 = wpos(B.LeftArm);
  const ry = S.PL.rig.root.rotation.y, F = new TH.Vector3(-Math.sin(ry), 0, -Math.cos(ry)), fw = l2.clone().sub(l0).dot(F);
  T.ok(l1.y - l0.y >= .01, 'left shoulder up ' + (l1.y - l0.y)); T.ok(r1.y - r0.y >= .01, 'right shoulder up ' + (r1.y - r0.y));
  T.ok(fw >= .01, 'left shoulder forward ' + fw); });
T.test('toe bend turns the Meshy toes', () => { meshyOn(); const tb = S.MESHY.B.LeftToeBase, up = q => new TH.Vector3(0, 1, 0).applyQuaternion(q).y;
  posed(S.HP.idle); const q0 = wq(tb); posed(S.pose({toeL: 30}, S.HP.idle)); const q1 = wq(tb);
  T.near(q0.angleTo(q1) / D2R, 30, 2, 'toe angle'); T.ok(up(q1) > up(q0), 'toes up: ' + up(q0) + ' -> ' + up(q1)); });
T.test('chest turns only the upper back', () => { meshyOn(); const B = S.MESHY.B, names = ['Spine', 'Spine01', 'Spine02', 'Head', 'LeftArm', 'RightArm'];
  posed(S.HP.idle); const q0 = names.map(n => wq(B[n])); posed(S.pose({chest: [0, 20, 0]}, S.HP.idle)); const q1 = names.map(n => wq(B[n]));
  const ang = names.map((n, i) => q0[i].angleTo(q1[i]) / D2R); T.near(ang[0], 20, 2, 'Spine');
  for (let i = 1; i < names.length; i++) T.ok(ang[i] < .1, names[i] + ' moved ' + ang[i].toFixed(3) + '°'); });
// walking and jogging on the slope south of the start: 'walk' = controller stick (0,-0.4), 'jog' = W key (5.4 m/s)
const pad = mz => [{connected: true, axes: [0, -mz, 0, 0], buttons: Array.from({length: 17}, () => ({pressed: false}))}];
function move(mode) { S.KEYS.KeyW = mode === 'jog'; navigator.getGamepads = mode === 'walk' ? () => pad(.4) : () => []; }
// fn(i, mid) for each leg every frame; mid = the middle half of that leg's stance (phase share 0.25..0.75 of P.gait.duty)
function stance(mode, frames, fn) { S.tp(0, 30); S.CAM.yaw = 0; S.P.yaw = 0; move(mode); T.sim(60);
  try { for (let f = 0; f < frames; f++) { T.sim(1); const g = S.P.gait;
    for (let i = 0; i < 2; i++) { const ph = (g.ph + i / 2) % 1, u = ph / g.duty; fn(i, ph < g.duty && u > .25 && u < .75); } } }
  finally { move('stop'); } }
// mean horizontal ankle speed in mid-stance as a share of the body speed (%)
function slidePct(boneOf, mode) { const prev = [null, null]; let sum = 0, n = 0, body = 0;
  stance(mode, 180, (i, mid) => { const p = wpos(boneOf(i));
    if (mid && prev[i]) { sum += Math.hypot(p.x - prev[i].x, p.z - prev[i].z) * 60; body += Math.hypot(S.P.av.x, S.P.av.z); n++; } prev[i] = p; });
  T.ok(n > 10, 'too few planted frames: ' + n); return 100 * sum / body; }
const meshyFoot = i => S.MESHY.B[i ? 'RightFoot' : 'LeftFoot'];
T.test('Meshy feet planted when walking', () => { meshyOn(); const s = slidePct(meshyFoot, 'walk'); T.ok(s < 2, 'slide ' + s.toFixed(2) + '% of body speed'); });
T.test('hero switch keeps Meshy leg measures', () => { meshyOn(); S.setHero('f'); S.setHero('m');   // meshyAttach sets the stored model up again
  T.ok(S.MESHY.on, 'Meshy hero back on'); T.ok(S.MESHY.legD, 'no leg measures'); T.near(S.MESHY.legD.thigh, .391, .005, 'thigh');
  const s = slidePct(meshyFoot, 'walk'); T.ok(s < 2, 'slide ' + s.toFixed(2) + '% after the switch'); });
const heroFoot = i => S.PL.rig.P[i ? 'ftR' : 'ftL'];
// ankle height above the ground under it, minus its height above the root plane after 1 s standing still: {min, max} over mid-stance
function heights(ankleOf, mode) { S.tp(0, 30); S.CAM.yaw = 0; S.P.yaw = 0; move('stop'); T.sim(60);
  const rest = [0, 1].map(i => wpos(ankleOf(i)).y - S.PL.rig.root.position.y); let min = 9, max = -9;
  stance(mode, 180, (i, mid) => { if (!mid) return; const p = wpos(ankleOf(i)), h = p.y - S.gY(p.x, p.z) - rest[i]; min = Math.min(min, h); max = Math.max(max, h); });
  return {min: +min.toFixed(3), max: +max.toFixed(3)}; }
T.test('feet follow the slope', () => { for (const hero of ['m', 'f']) for (const mode of ['walk', 'jog']) {
  meshyOn(hero); const h = heights(hero === 'm' ? meshyFoot : heroFoot, mode);
  T.ok(h.min >= -.01 && h.max <= .03, hero + ' ' + mode + ' ' + JSON.stringify(h)); } });
T.test('Meshy feet planted when jogging', () => { meshyOn(); const s = slidePct(meshyFoot, 'jog'); T.ok(s < 2, 'slide ' + s.toFixed(2) + '%'); });
T.test('heroine feet planted', () => { for (const m of ['walk', 'jog']) { meshyOn('f'); const s = slidePct(heroFoot, m); T.ok(s < 2, m + ' slide ' + s.toFixed(2) + '%'); } });
T.test('floor edge keeps the pelvis sane', () => { meshyOn(); const f = S.FLOORS[0], r = Math.sqrt(f.r2);
  S.tp(f.x + r + .5, f.z); S.P.yaw = S.CAM.yaw = Math.PI / 2; T.sim(30); move('jog'); let worst = 0;
  try { for (let k = 0; k < 120; k++) { T.sim(1); worst = Math.max(worst, S.P.gait.drop);
    T.ok(S.lastPose().every(Number.isFinite), 'non-numeric pose value at frame ' + k); } } finally { move('stop'); }
  T.ok(worst <= S.CFG.anim.footMaxDrop + 1e-6, 'pelvis dropped ' + worst); });
T.test('raised arm lifts the clavicle', () => { meshyOn(); T.sim(30); T.ok(Math.abs(S.lastPose()[39]) < .5 * D2R, 'idle clavicle ' + S.lastPose()[39] / D2R);
  S.startAct('light4'); while (S.P.act.t < .19) T.sim(1); T.ok(S.lastPose()[39] >= 15 * D2R, 'overhead clavicle ' + (S.lastPose()[39] / D2R).toFixed(1) + '°'); });
T.test('toes bend at push-off', () => { meshyOn(); const peaks = []; let last = 1, cur = 0, midMax = 0;
  stance('jog', 120, (i, mid) => { if (i) return; const ph = S.P.gait.ph % 1, t = S.lastPose()[41] / D2R;
    if (ph < last) { if (cur || peaks.length) peaks.push(cur); cur = 0; } last = ph; cur = Math.max(cur, t); if (mid) midMax = Math.max(midMax, Math.abs(t)); });
  const full = peaks.slice(1); T.ok(full.length >= 2, 'strides ' + full.length); T.ok(full.every(p => p >= 15), 'toe peaks ' + full.map(p => p.toFixed(1)));
  T.ok(midMax <= 3, 'toes in mid-stance ' + midMax.toFixed(1) + '°'); });
const poseDiff = (a, b) => { let m = 0; for (let j = 0; j < a.length; j++) m = Math.max(m, Math.abs(a[j] - b[j])); return m; };
// runs light1 until its `at` time (cancel or dodge), then starts `next` and runs 10 more frames; returns per-frame pose changes and the chain frame
function chainSteps(each, next = 'light2', at = 'cancel', o) { const P = S.P, M = S.CFG.moves, d = []; let prev = [...S.lastPose()];
  const step = () => { T.sim(1); const p = S.lastPose(); d.push(poseDiff(p, prev)); prev = [...p]; if (each) each(); };
  S.startAct('light1'); while (P.act && P.act.k === 'light1' && P.act.t < M.light1[at]) step();
  S.startAct(next, o); const chain = d.length; for (let f = 0; f < 10; f++) step(); return {d, chain}; }
// light1 -> light2 is authored to continue; heavy and the dodge start from the guard pose, so they jump today
T.test('combo chain has no pose jump', () => { for (const [next, at, o] of [['light2', 'cancel'], ['heavy', 'cancel'], ['dodge', 'dodge', {dx: 0, dz: 1}]]) {
  meshyOn(); T.sim(20); const {d, chain} = chainSteps(null, next, at, o), before = Math.max(...d.slice(chain - 5, chain));
  T.ok(d[chain] <= before, 'light1 > ' + next + ': jump ' + (d[chain] / D2R).toFixed(1) + '° at the chain vs ' + (before / D2R).toFixed(1) + '° just before'); } });
T.test('blend does not survive respawn', () => { meshyOn(); S.startAct('heavy'); T.sim(10); S.playerDie(); S.respawn(); T.sim(1);
  const a = [...S.lastPose()]; T.sim(10); const m = poseDiff(a, S.lastPose()); T.ok(m < D2R, 'pose still moving after respawn: ' + (m / D2R).toFixed(1) + '°'); });
T.test('first person keeps the head hidden', () => { meshyOn(); T.sim(5); S.setView(true); let worst = 0;
  chainSteps(() => { worst = Math.max(worst, S.PL.rig.P.head.scale.x, S.MESHY.on ? S.MESHY.B.Head.scale.x : 0); }); S.setView(false);
  T.ok(worst <= .001 + 1e-9, 'head scale ' + worst); });
