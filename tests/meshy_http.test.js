// tests/meshy_http.test.js — the real Meshy hero, loaded over http (run with --http)
const S = __SB;
T.test('Meshy hero loads over http', () => { T.ok(S.MESHY.on, 'Meshy hero not loaded'); T.eq(S.MESHY.skin.skeleton.bones.length, 24);
  T.newGame(); T.clearEnemies(); S.KEYS.KeyW = true; T.sim(60); S.KEYS.KeyW = false; T.ok(S.MESHY.on, 'Meshy hero lost on a new game');
  T.ok(S.lastPose().every(Number.isFinite), 'non-numeric pose'); });
// the sword hand holds the grip across the palm, not through it: the palm's cross-section (the glove between 35% and 60% of
// its length, seen along the hand) is an ellipse, and the grip must lie near its long axis, far from its normal
T.test('the Meshy sword hand holds the grip across the palm', () => { T.ok(S.MESHY.on, 'Meshy hero not loaded'); T.newGame(); T.clearEnemies(); T.sim(30);
  const TH = S.THREE, sk = S.MESHY.skin, g = sk.geometry, B = S.MESHY.B.RightHand, j = sk.skeleton.bones.indexOf(B), M = new TH.Matrix4().multiplyMatrices(sk.skeleton.boneInverses[j], sk.bindMatrix);
  const P = g.attributes.position, SI = g.attributes.skinIndex, SW = g.attributes.skinWeight, q = (A, i, c) => [A.getX(i), A.getY(i), A.getZ(i), A.getW(i)][c], pts = [];
  for (let i = 0; i < P.count; i++) { let w = 0; for (let c = 0; c < 4; c++) if (q(SI, i, c) === j) w += q(SW, i, c); if (w >= .5) pts.push(new TH.Vector3().fromBufferAttribute(P, i).applyMatrix4(M)); }
  const ym = Math.max(...pts.map(p => p.y)), band = pts.filter(p => p.y > ym * .35 && p.y < ym * .6); T.ok(band.length > 40, 'palm vertices: ' + band.length);
  let mx = 0, mz = 0; band.forEach(p => { mx += p.x; mz += p.z; }); mx /= band.length; mz /= band.length; let xx = 0, zz = 0, xz = 0;
  band.forEach(p => { const dx = p.x - mx, dz = p.z - mz; xx += dx * dx; zz += dz * dz; xz += dx * dz; }); const a = .5 * Math.atan2(2 * xz, xx - zz);
  // the grip in the hand bone's frame (the bone's y runs along the hand)
  const sw = S.PL.sw.g; sw.updateMatrixWorld(true); const toB = new TH.Matrix4().copy(B.matrixWorld).invert(),
    gd = new TH.Vector3(0, 0, .11).applyMatrix4(sw.matrixWorld).applyMatrix4(toB).sub(new TH.Vector3(0, 0, -.06).applyMatrix4(sw.matrixWorld).applyMatrix4(toB)).normalize();
  const cn = Math.abs(-gd.x * Math.sin(a) + gd.z * Math.cos(a));
  T.ok(cn < .5, 'the grip runs through the palm: cos to its normal ' + cn.toFixed(2));
  T.ok(S.MESHY.gripOff && S.MESHY.gripOff.length() < .09, 'sword offset in the hand: ' + (S.MESHY.gripOff ? S.MESHY.gripOff.length().toFixed(3) : 'none')); });
