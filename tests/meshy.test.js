// tests/meshy.test.js — the Meshy hero path on a small synthetic skeleton (the real model only loads over http, tests run on file://)
const S = __SB, TH = S.THREE;
// the bone names setupMeshyHero looks for (MESHY_MAP), in a plausible standing layout, plus a skinned mesh
function fakeMeshy() {
  const scene = new TH.Group(), arm = new TH.Object3D(), bones = {};
  arm.name = 'Armature'; scene.add(arm);
  const mk = (n, par, x, y, z) => { const b = new TH.Bone(); b.name = n; b.position.set(x, y, z); (par ? bones[par] : arm).add(b); bones[n] = b; };
  mk('Hips', null, 0, .95, 0); mk('Spine02', 'Hips', 0, .1, 0); mk('Spine01', 'Spine02', 0, .12, 0); mk('Spine', 'Spine01', 0, .12, 0);
  mk('neck', 'Spine', 0, .16, 0); mk('Head', 'neck', 0, .08, 0); mk('head_end', 'Head', 0, .2, 0);
  for (const [s, k] of [['Left', 1], ['Right', -1]]) {
    mk(s + 'Shoulder', 'Spine', k * .05, .12, 0); mk(s + 'Arm', s + 'Shoulder', k * .12, 0, 0); mk(s + 'ForeArm', s + 'Arm', k * .26, -.1, 0); mk(s + 'Hand', s + 'ForeArm', k * .24, -.08, 0);
    mk(s + 'UpLeg', 'Hips', k * .1, -.06, 0); mk(s + 'Leg', s + 'UpLeg', 0, -.43, 0); mk(s + 'Foot', s + 'Leg', 0, -.42, .03);
  }
  const geo = new TH.BoxGeometry(.1, .1, .1), n = geo.attributes.position.count;
  geo.setAttribute('skinIndex', new TH.Uint16BufferAttribute(new Uint16Array(n * 4), 4));
  geo.setAttribute('skinWeight', new TH.Float32BufferAttribute(new Float32Array(n * 4).map((_, i) => i % 4 ? 0 : 1), 4));
  const skin = new TH.SkinnedMesh(geo, new TH.MeshStandardMaterial()); scene.add(skin);
  scene.updateMatrixWorld(true); skin.bind(new TH.Skeleton(Object.values(bones)));
  return {scene};
}
T.test('Meshy hero follows the rig without allocating every frame', () => {
  T.newGame(); T.clearEnemies(); T.ok(S.setupMeshyHero(fakeMeshy()), 'synthetic Meshy hero not set up'); T.ok(S.MESHY.on, 'Meshy hero not on');
  S.IN.mz = 1; T.sim(30); S.IN.mz = 0;   // walk a little so the bones are posed away from rest
  const Q = TH.Quaternion, clone = Q.prototype.clone, M = window.Map; let made = 0;
  // every mapped bone ends on its target (checked first: it holds for the code before and after the allocation fix): procedural joint rotation since rest, times the bind correction
  const m = new TH.Matrix4(), wq = (o, q) => q.setFromRotationMatrix(m.extractRotation(o.matrixWorld)), q = new Q(), t = new Q(), t2 = new Q();
  let worst = 0;
  for (const r of S.MESHY.rows) { wq(r.p, t).multiply(r.Qp0i); if (r.b) { wq(r.b, t2).multiply(r.Qb0i); t.slerp(t2, r.w); } t.multiply(r.CQm0);
    worst = Math.max(worst, 1 - Math.abs(wq(r.bone, q).dot(t))); }
  T.ok(worst < 1e-6, 'a bone is off its target by ' + worst);
  // count every Quaternion and Map made while the skeleton is synced for 10 frames
  TH.Quaternion = new Proxy(Q, {construct(t, a, nt) { made++; return Reflect.construct(t, a, nt); }});
  Q.prototype.clone = function () { made++; return clone.call(this); };
  window.Map = class extends M { constructor(...a) { super(...a); made++; } };
  try { for (let i = 0; i < 10; i++) S.meshySync(); } finally { TH.Quaternion = Q; Q.prototype.clone = clone; window.Map = M; }
  T.eq(made, 0, 'objects made in 10 frames');
  T.ok(S.PL.sw.g.parent === S.MESHY.proxR, 'sword not in the Meshy hand');
  // back to the procedural hero, as the character select does
  S.setHero('f'); S.setHero('m'); T.ok(!S.MESHY.on, 'Meshy hero still on'); T.ok(S.PL.sw.g.parent === S.PL.rig.P.wrR, 'sword not back on the wrist');
});
