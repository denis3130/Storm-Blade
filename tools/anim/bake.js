// tools/anim/bake.js — runs inside game_w.html, started by tools/anim/bake.py (after tests/lib.js).
// Converts each Meshy clip into the game's pose vector with the inverse of the Meshy transfer (src/l_meshy.js),
// checks the round trip and resamples each cycle to N phase points.
// Input: window.TDATA = {skel: hero.json nodes, clips: {move: clip2json output}, moves: tools/anim/moves.json}.
// Output: window.TDUMP = {anim: the ANIM constant of src/n_anims.js, report: per move, for bake.py to print}.
(() => {
  const S = __SB, TH = S.THREE, NP = S.HP.idle.length, N = 32, R2D = 180 / Math.PI;

  // 1. the real hero skeleton (built like realMeshy in tests/fixtures.js), set up on a fresh hero rig as the game does
  T.newGame({hero: 'm'}); T.clearEnemies();
  const scene = new TH.Group(), node = {}, skel = {};
  for (const k of TDATA.skel) {
    const b = k.bone ? new TH.Bone() : new TH.Object3D();
    b.name = k.n; b.position.fromArray(k.t); b.quaternion.fromArray(k.r); b.scale.fromArray(k.s); node[k.i] = b; skel[k.n] = k;
  }
  for (const k of TDATA.skel) (k.p == null ? scene : node[k.p]).add(node[k.i]);
  const geo = new TH.BoxGeometry(.1, .1, .1), nv = geo.attributes.position.count;
  geo.setAttribute('skinIndex', new TH.Uint16BufferAttribute(new Uint16Array(nv * 4), 4));
  geo.setAttribute('skinWeight', new TH.Float32BufferAttribute(new Float32Array(nv * 4).map((_, i) => i % 4 ? 0 : 1), 4));
  const skin = new TH.SkinnedMesh(geo, new TH.MeshStandardMaterial());
  node[TDATA.skel.find(k => k.p == null).i].add(skin); scene.updateMatrixWorld(true);
  skin.bind(new TH.Skeleton(TDATA.skel.filter(k => k.bone).map(k => node[k.i])));
  S.MESHY.gltf = null;
  if (!S.setupMeshyHero({scene})) throw new Error('setupMeshyHero failed');
  const R = S.PL.rig, B = S.MESHY.B, row = {};
  for (const r of S.MESHY.rows) row[r.bone.name] = r;
  // the bake frame is the calibration's: rig root at the origin, facing -z
  R.root.position.set(0, 0, 0); R.root.rotation.set(0, 0, 0); R.inner.rotation.set(0, 0, 0); R.root.updateMatrixWorld(true);
  const FWD = new TH.Vector3(0, 0, -1), scale = R.inner.scale.y;
  const wQ = o => o.getWorldQuaternion(new TH.Quaternion()), wP = o => o.getWorldPosition(new TH.Vector3());
  const inv = q => q.clone().invert();
  B.Hips.position.fromArray(skel.Hips.t); R.root.updateMatrixWorld(true);
  const hipsBindY = wP(B.Hips).y;
  const legLen = wP(B.LeftLeg).distanceTo(wP(B.LeftUpLeg)) + wP(B.LeftFoot).distanceTo(wP(B.LeftLeg));

  // 2. one clip frame on the Meshy skeleton: every bone's rotation, and the height of Hips (its horizontal motion is the game's)
  function poseClip(c, f) {
    for (const name in c.bones) if (B[name] && c.bones[name].r) B[name].quaternion.fromArray(c.bones[name].r[f]);
    const h = skel.Hips.t; B.Hips.position.set(h[0], c.bones.Hips.t[f][1], h[2]); R.root.updateMatrixWorld(true);
  }
  // bone directions for the round trip: towards each child bone, or along the bone's own axis (+Y) for a bone without children
  const pairs = [];
  for (const b of Object.values(B)) { const kids = b.children.filter(c => c.isBone); if (kids.length) for (const c of kids) pairs.push([b, c]); else pairs.push([b, null]); }
  const dirs = () => pairs.map(([b, c]) => c ? wP(c).sub(wP(b)).normalize() : new TH.Vector3(0, 1, 0).applyQuaternion(wQ(b)));

  // 3. inverse transfer: joint world = bone world · (C · bind)⁻¹ · joint rest. delta(m) = joint world · joint rest⁻¹ of bone m's row
  const delta = m => wQ(B[m]).multiply(inv(row[m].CQm0));
  const world = m => delta(m).multiply(inv(row[m].Qp0i));
  const fromEuler = (x, y, z) => new TH.Quaternion().setFromEuler(new TH.Euler(x, y, z, 'YXZ'));
  const eul = new TH.Euler();
  // 4. local rotation against the parent's world rotation as the rig will rebuild it; each returns that rebuilt world rotation
  const put = (p, idx, W, par) => {   // three-axis joint, YXZ angles
    eul.setFromQuaternion(inv(par).multiply(W), 'YXZ'); p[idx[0]] = eul.x; p[idx[1]] = eul.y; p[idx[2]] = eul.z;
    return par.clone().multiply(fromEuler(eul.x, eul.y, eul.z));
  };
  const hinge = (p, i, W, par) => {   // one-axis joint: the twist about X of the swing-twist decomposition
    const L = inv(par).multiply(W); if (L.w < 0) L.set(-L.x, -L.y, -L.z, -L.w);
    p[i] = 2 * Math.atan2(L.x, L.w); return par.clone().multiply(fromEuler(p[i], 0, 0));
  };
  const childDir = m => { const c = B[m].children.find(o => o.isBone); return c.position.clone().normalize(); };
  // limb: upper joint (three axes) and hinge (X) solved together, so both bones point as in the clip. Both bones run along -Y
  // in their joints' rest frames; the upper bone's twist is free, and is chosen so the lower bone lies in the hinge's plane
  const limb = (p, idxU, iH, mu, mh, par) => {
    const Wu = world(mu), Wh = world(mh), b = new TH.Vector3(0, -1, 0).applyQuaternion(Wh).applyQuaternion(inv(Wu)), st = Math.hypot(b.x, b.z);
    if (st < 1e-3) { const U = put(p, idxU, Wu, par); return [U, hinge(p, iH, Wh, U)]; }   // straight: keep the clip's twist
    // Ry(tw)·Rx(th)·(0,-1,0) = b; of the two solutions, the one closer to the clip's own twist
    const t1 = Math.atan2(-b.x, -b.z), t2 = Math.atan2(b.x, b.z), pos = Math.abs(t1) <= Math.abs(t2), th = (pos ? 1 : -1) * Math.atan2(st, -b.y);
    const U = put(p, idxU, Wu.clone().multiply(fromEuler(0, pos ? t1 : t2, 0)), par);
    p[iH] = th; return [U, U.clone().multiply(fromEuler(th, 0, 0))];
  };
  for (const m of ['LeftArm', 'LeftForeArm', 'RightArm', 'RightForeArm', 'LeftUpLeg', 'LeftLeg', 'RightUpLeg', 'RightLeg']) {
    const v = childDir(m).applyQuaternion(row[m].CQm0).applyQuaternion(row[m].Qp0i);
    if (v.distanceTo(new TH.Vector3(0, -1, 0)) > 1e-3) throw new Error(m + ' does not run along -Y in its joint frame: ' + v.toArray());
  }
  // q^t on the short arc (slerp from identity, also for t > 1)
  const qpow = (q, t) => {
    const a = q.w < 0 ? q.clone().set(-q.x, -q.y, -q.z, -q.w) : q.clone(), h = Math.acos(Math.min(1, a.w)), sh = Math.sin(h);
    if (sh < 1e-9) return new TH.Quaternion();
    const k = Math.sin(t * h) / sh; return new TH.Quaternion(a.x * k, a.y * k, a.z * k, Math.cos(t * h));
  };
  // clavicle: two angles (Y forward, Z raise; X stays 0), solved so the bone points where the clip's bone points
  const clav = (m, par) => {
    const r = row[m], v = childDir(m).applyQuaternion(r.CQm0).applyQuaternion(r.Qp0i);   // bone direction in the joint's rest frame
    const u = childDir(m).applyQuaternion(wQ(B[m])).applyQuaternion(inv(par));           // the clip's direction in the parent's frame
    const rr = Math.hypot(v.x, v.y), phi = Math.atan2(v.y, v.x), s = Math.asin(Math.max(-1, Math.min(1, u.y / rr)));
    const ang = x => Math.atan2(Math.sin(x), Math.cos(x));
    const za = ang(s - phi), zb = ang(Math.PI - s - phi), z = Math.abs(za) <= Math.abs(zb) ? za : zb;
    const wx = rr * Math.cos(z + phi), y = ang(Math.atan2(u.x, u.z) - Math.atan2(wx, v.z));
    return [y, z];
  };

  // 5. the pose vector of clip frame f (the clip must be posed with poseClip first)
  function convert() {
    const p = new Float32Array(NP), I = wQ(R.inner);
    const pel = put(p, [1, 2, 3], world('Hips'), I);
    // Spine01 = slerp(pelvis delta, spine delta, w)  →  spine delta = pelvis delta · (pelvis delta⁻¹ · Spine01 delta)^(1/w)
    const r01 = row.Spine01, dPel = pel.clone().multiply(r01.Qp0i);
    const dSpi = dPel.clone().multiply(qpow(inv(dPel).multiply(delta('Spine01')), 1 / r01.w));
    const spi = put(p, [4, 5, 6], dSpi.multiply(inv(r01.Qb0i)), pel);
    put(p, [34, 35, 36], world('Spine'), spi);
    put(p, [7, 8, 33], world('Head'), spi);
    const [yl, zl] = clav('LeftShoulder', spi), [yr, zr] = clav('RightShoulder', spi);
    p[37] = -zl; p[38] = -yl; p[39] = zr; p[40] = yr;   // V.clL.rotation = (0, -p38, -p37), V.clR.rotation = (0, p40, p39)
    const [, elL] = limb(p, [9, 10, 11], 12, 'LeftArm', 'LeftForeArm', spi); put(p, [30, 31, 32], world('LeftHand'), elL);
    const [, elR] = limb(p, [13, 14, 15], 16, 'RightArm', 'RightForeArm', spi); put(p, [17, 18, 19], world('RightHand'), elR);
    const [, knL] = limb(p, [20, 21, 22], 23, 'LeftUpLeg', 'LeftLeg', pel); hinge(p, 28, world('LeftFoot'), knL);
    const [, knR] = limb(p, [24, 25, 26], 27, 'RightUpLeg', 'RightLeg', pel); hinge(p, 29, world('RightFoot'), knR);
    // toes against the clip's own foot: in the game the foot comes from the leg IK, the clip gives only the toe bend
    hinge(p, 41, world('LeftToeBase'), world('LeftFoot')); hinge(p, 42, world('RightToeBase'), world('RightFoot'));
    p[0] = (wP(B.Hips).y - hipsBindY) / scale;
    return p;
  }

  // bones the transfer cannot follow exactly, so the 2° check leaves them out (reported apart): Spine02 and neck are blends of
  // their neighbours (src/l_meshy.js), the foot turns about one axis only (in the game the feet come from the leg IK) and the
  // toes hang below it. The toe bend the game takes from the clip is checked apart, against the clip's foot: the game bends the
  // toes about the body's X axis, a few degrees off the Meshy toe's own axis, so bake.py allows it 5°.
  const DERIVED = new Set(['Spine02', 'neck', 'LeftFoot', 'RightFoot', 'LeftToeBase', 'RightToeBase']);
  const TOES = [['LeftToeBase', 41], ['RightToeBase', 42]], Y = new TH.Vector3(0, 1, 0);
  const anim = {err: {}}, report = {};
  for (const name in TDATA.moves) {
    const c = TDATA.clips[name], keys = c.times.length;
    // a loop whose last key repeats the first: the cycle is keys - 1 frames long
    const same = Object.values(c.bones).every(b => !b.r || Math.abs(new TH.Quaternion().fromArray(b.r[0]).dot(new TH.Quaternion().fromArray(b.r[keys - 1]))) > Math.cos(.1 / R2D / 2));
    const F = same ? keys - 1 : keys, frames = [], ankleY = [], ahead = [], worst = pairs.map(() => 0), toe = TOES.map(() => 0);
    for (let f = 0; f < F; f++) {
      poseClip(c, f);
      const d0 = dirs(), ankle = wP(B.LeftFoot);
      ankleY.push(ankle.y); ahead.push(ankle.clone().sub(wP(B.Hips)).dot(FWD));
      const p = convert(); frames.push(p);
      TOES.forEach(([m, i], k) => { const r = row[m], g = world(r.cOf).multiply(fromEuler(p[i], 0, 0)).multiply(r.Qp0i).multiply(r.CQm0);
        toe[k] = Math.max(toe[k], Y.clone().applyQuaternion(g).angleTo(Y.clone().applyQuaternion(wQ(B[m]))) * R2D); });
      // 5b. round trip: the rig with this pose, transferred back to the Meshy skeleton, must point the bones as the clip does
      R.apply(p); R.root.updateMatrixWorld(true); S.meshySync();
      dirs().forEach((d, i) => { worst[i] = Math.max(worst[i], d.angleTo(d0[i]) * R2D); });
    }
    const label = i => pairs[i][0].name + (pairs[i][1] ? '>' + pairs[i][1].name : ''), all = worst.map((v, i) => [label(i), v, DERIVED.has(pairs[i][0].name)]);
    const strict = all.filter(a => !a[2]).map(a => [a[0], a[1]]).sort((a, b) => b[1] - a[1]);
    const derived = all.filter(a => a[2]).map(a => [a[0], a[1]]).sort((a, b) => b[1] - a[1]);
    // 6. phase 0 = the frame where the left ankle is furthest ahead of the hips; N samples per cycle, linear between frames
    let f0 = 0; ahead.forEach((v, f) => { if (v > ahead[f0]) f0 = f; });
    const ang = x => Math.atan2(Math.sin(x), Math.cos(x)), at = (k, j) => {
      const x = f0 + k * F / N, i = Math.floor(x) % F, i2 = (i + 1) % F, t = x - Math.floor(x), a = frames[i][j], b = frames[i2][j];
      return j ? a + ang(b - a) * t : a + (b - a) * t;
    };
    const d = [], lift = [], low = Math.min(...ankleY);
    for (let k = 0; k < N; k++) {
      for (let j = 0; j < NP; j++) d.push(Math.round(j ? at(k, j) * R2D * 10 : at(k, j) * 1000));
      const x = f0 + k * F / N, i = Math.floor(x) % F, t = x - Math.floor(x);
      lift.push(Math.round((ankleY[i] + (ankleY[(i + 1) % F] - ankleY[i]) * t - low) * 1000));
    }
    // samples next to each other (also the last and the first) must be close, or the game's linear interpolation would spin a joint
    for (let k = 0; k < N; k++) for (let j = 1; j < NP; j++) {
      const a = d[k * NP + j], b = d[((k + 1) % N) * NP + j];
      if (Math.abs(b - a) > 900) throw new Error(name + ': value ' + j + ' jumps ' + (b - a) / 10 + '° between samples ' + k + ' and ' + (k + 1) % N);
    }
    anim[name] = {n: N, d, lift, leg: Math.round(legLen * 1000)};
    anim.err[name] = Math.round(strict[0][1] * 100) / 100;
    report[name] = {frames: F, f0, worst: strict[0][0], err: strict[0][1], bones: strict.slice(0, 3), toes: TOES.map(([m], k) => [m, toe[k]]), derived};
  }
  window.TDUMP = {anim, report};
})();
