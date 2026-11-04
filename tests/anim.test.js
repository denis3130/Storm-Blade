// tests/anim.test.js — player animation: Meshy transfer, feet, clavicles and toes, blend (run with --data tests/anim_zero.json)
const S = __SB, TH = S.THREE, D2R = Math.PI / 180;
// the 26 non-mesh nodes of assets/meshy/hero/hero.json (generated with the command in the animation plan, Task 1)
const SKEL=[{"i":0,"n":"head_end","p":2,"t":[-1.234002411365509e-06,20.174404978752136,1.955777406692505e-06],"r":[0,0,0,1],"s":[1,1,1],"bone":true},{"i":1,"n":"headfront","p":2,"t":[1.4184445142745972,2.450028993189335,14.172722399234772],"r":[2.2031686697232544e-08,-0.760895311832428,-0.6443905234336853,0.07615268975496292],"s":[1,1,1],"bone":true},{"i":2,"n":"Head","p":3,"t":[3.7834979593753815e-07,7.218662649393082,2.6702764444053173e-07],"r":[0.11628945916891098,-0.06398896872997284,-0.06582989543676376,0.9889634251594543],"s":[1,1,1],"bone":true},{"i":3,"n":"neck","p":12,"t":[3.6670826375484467e-07,9.599661082029343,6.282789399847388e-07],"r":[0,0,0,1],"s":[1,1,1],"bone":true},{"i":4,"n":"LeftHand","p":5,"t":[-1.635635271668434e-05,23.520052433013916,2.3748725652694702e-06],"r":[-0.02074773609638214,-0.031048087403178215,-0.049487292766571045,0.9980764389038086],"s":[1,1,1],"bone":true},{"i":5,"n":"LeftForeArm","p":6,"t":[2.514570951461792e-06,25.422656536102295,-1.30385160446167e-06],"r":[0.1432124674320221,0.25739502906799316,0.16127793490886688,0.9419275522232056],"s":[1,1,1],"bone":true},{"i":6,"n":"LeftArm","p":7,"t":[1.57160684466362e-07,16.332317888736725,-1.5725845514680259e-06],"r":[-0.5295166969299316,0.3249143064022064,-0.2435176521539688,0.7448099851608276],"s":[1,1,1],"bone":true},{"i":7,"n":"LeftShoulder","p":12,"t":[3.9733994752168655,4.81802299618721,0.05191250238567591],"r":[-0.4844878017902374,-0.4804045557975769,-0.5258582830429077,0.5078938603401184],"s":[1,1,1],"bone":true},{"i":8,"n":"RightHand","p":9,"t":[9.685754776000977e-06,24.714578688144684,1.6763806343078613e-06],"r":[-0.059405215084552765,0.11064799875020981,0.1099291741847992,0.9859734773635864],"s":[1,1,1],"bone":true},{"i":9,"n":"RightForeArm","p":10,"t":[-3.259629011154175e-06,25.687414407730103,-3.259629011154175e-06],"r":[0.14434288442134857,-0.26104995608329773,-0.15820743143558502,0.9412696361541748],"s":[1,1,1],"bone":true},{"i":10,"n":"RightArm","p":11,"t":[1.1641532182693481e-07,16.917115449905396,7.504013410652988e-07],"r":[-0.5316788554191589,-0.31501999497413635,0.2585022747516632,0.7424665689468384],"s":[1,1,1],"bone":true},{"i":11,"n":"RightShoulder","p":12,"t":[-4.316305369138718,5.783475935459137,-0.05639242590405047],"r":[-0.48985257744789124,0.47493335604667664,0.49744799733161926,0.5357502102851868],"s":[1,1,1],"bone":true},{"i":12,"n":"Spine","p":13,"t":[4.766391725752328e-08,13.339737057685852,-8.952754093627391e-07],"r":[-4.550927405944094e-05,0.00616111746057868,0.006596493534743786,0.9999592900276184],"s":[1,1,1],"bone":true},{"i":13,"n":"Spine01","p":14,"t":[-8.440110832452774e-08,12.947413325309753,-8.227289072237909e-07],"r":[0,0,0,1],"s":[1,1,1],"bone":true},{"i":14,"n":"Spine02","p":23,"t":[3.67435859516263e-08,12.947393953800201,-2.2664607968181372e-07],"r":[0,0,0,1],"s":[1,1,1],"bone":true},{"i":15,"n":"LeftToeBase","p":16,"t":[-5.587935447692871e-07,12.29112520813942,5.587935447692871e-07],"r":[0.1677069365978241,0.8217888474464417,-0.3658246099948883,0.4033730626106262],"s":[1,1,1],"bone":true},{"i":16,"n":"LeftFoot","p":17,"t":[4.1909515857696533e-07,37.900176644325256,-2.7939677238464355e-07],"r":[-0.3029648959636688,0.1622357815504074,-0.20126576721668243,0.9172698259353638],"s":[1,1,1],"bone":true},{"i":17,"n":"LeftLeg","p":18,"t":[-3.818422555923462e-06,39.13432061672211,0],"r":[0.08861459046602249,-0.016537150368094444,0.026466364040970802,0.9955769777297974],"s":[1,1,1],"bone":true},{"i":18,"n":"LeftUpLeg","p":23,"t":[11.028800159692764,-9.686622023582458,-0.5527267698198557],"r":[0.9943456649780273,0.0639805868268013,0.07835984230041504,0.03229580074548721],"s":[0.9999843835830688,0.9999995827674866,0.999994158744812],"bone":true},{"i":19,"n":"RightToeBase","p":20,"t":[-1.30385160446167e-06,11.928263306617737,1.3969838619232178e-07],"r":[0.16359910368919373,-0.8194368481636047,0.3935965597629547,0.3831975758075714],"s":[1,1,1],"bone":true},{"i":20,"n":"RightFoot","p":21,"t":[-1.0244548320770264e-06,38.291049003601074,0],"r":[-0.2738071382045746,-0.1311274915933609,0.17022383213043213,0.9374748468399048],"s":[1,1,1],"bone":true},{"i":21,"n":"RightLeg","p":22,"t":[2.2351741790771484e-06,38.83081674575806,9.313225746154785e-07],"r":[0.07660306245088577,0.002301695989444852,-0.012473533861339092,0.9969810247421265],"s":[1,1,1],"bone":true},{"i":22,"n":"RightUpLeg","p":23,"t":[-11.19612529873848,-9.38916876912117,-0.7528761401772499],"r":[0.9942238330841064,-0.07482665032148361,-0.07025326043367386,0.03137722611427307],"s":[1,1,1],"bone":true},{"i":23,"n":"Hips","p":25,"t":[0.3883046330884099,99.55283403396606,0.661504827439785],"r":[-0.034140314906835556,0.004787897691130638,0.004787900485098362,0.9993941187858582],"s":[1,1,1],"bone":true},{"i":25,"n":"Armature","p":null,"t":[0,0,0],"r":[0,0,0,1],"s":[0.01,0.01,0.01],"bone":false}];
// the real hero skeleton (bones and armature) plus one skinned box, like fakeMeshy in tests/meshy.test.js
function realMeshy() { const scene = new TH.Group(), o = {};
  for (const k of SKEL) { const b = k.bone ? new TH.Bone() : new TH.Object3D(); b.name = k.n; b.position.fromArray(k.t); b.quaternion.fromArray(k.r); b.scale.fromArray(k.s); o[k.i] = b; }
  for (const k of SKEL) (k.p == null ? scene : o[k.p]).add(o[k.i]);
  const geo = new TH.BoxGeometry(.1, .1, .1), n = geo.attributes.position.count;
  geo.setAttribute('skinIndex', new TH.Uint16BufferAttribute(new Uint16Array(n * 4), 4));
  geo.setAttribute('skinWeight', new TH.Float32BufferAttribute(new Float32Array(n * 4).map((_, i) => i % 4 ? 0 : 1), 4));
  const skin = new TH.SkinnedMesh(geo, new TH.MeshStandardMaterial()); o[25].add(skin); scene.updateMatrixWorld(true);
  skin.bind(new TH.Skeleton(SKEL.filter(k => k.bone).map(k => o[k.i]))); return {scene}; }
// fresh game with a freshly built rig; for the hero the real Meshy skeleton is set up as loadMeshyHero would (bind pose kept first)
function meshyOn(hero = 'm') { T.newGame({hero}); T.clearEnemies(); S.MESHY.gltf = null; S.setHero(hero === 'f' ? 'm' : 'f'); S.setHero(hero);
  if (hero === 'f') return; const g = realMeshy(); S.MESHY.gltf = g; S.MESHY.bind = [];
  g.scene.traverse(o => { if (o.isBone) S.MESHY.bind.push([o, o.quaternion.clone(), o.position.clone()]); }); T.ok(S.setupMeshyHero(g), 'Meshy setup'); }
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
