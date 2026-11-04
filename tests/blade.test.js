// tests/blade.test.js — where the sword goes in every attack's hit window (run with --data tests/anim_ref.json;
// record a new reference with --dump tests/anim_ref.json). Measured on the Meshy hero (the published game) and on the heroine.
const S = __SB, TH = S.THREE;
// arc: spread (degrees) of the tip's angle around the player, unwrapped, counting only the samples at least 0.6 m out (closer to the
// body's axis the angle jumps and nothing can be hit there anyway); range: largest horizontal distance tip - player
function blade(hero, k, from) { meshyOn(hero); const P = S.P, M = S.CFG.moves; S.tp(-48, 24); S.CAM.yaw = 0; P.yaw = 0; T.sim(30);
  let o = {};
  if (k === 'riposte') { const e = S.spawnEnemy('goblin', P.pos.x, P.pos.z - 1.5, {}); e.aggro = false; e.stun = 1.2; o = {tgt: e}; }
  if (from) { S.startAct(from); while (P.act && P.act.t < M[from].cancel) T.sim(1); }
  S.startAct(k, o); const D = M[k], v = new TH.Vector3(); let prev = null, ang = 0, lo = 1e9, hi = -1e9, range = 0;
  for (let f = 0; f < 240 && P.act && P.act.k === k && P.act.t <= D.hit[1]; f++) { T.sim(1); const a = P.act;
    if (!a || a.k !== k || a.t < D.hit[0] || a.t > D.hit[1]) continue;
    S.PL.sw.tip.getWorldPosition(v); const dx = v.x - P.pos.x, dz = v.z - P.pos.z, raw = Math.atan2(dx, dz) * 180 / Math.PI, r = Math.hypot(dx, dz);
    range = Math.max(range, r); if (r < .6) continue;
    if (prev === null) ang = raw; else { let d = raw - prev; while (d > 180) d -= 360; while (d < -180) d += 360; ang += d; }
    prev = raw; lo = Math.min(lo, ang); hi = Math.max(hi, ang); }
  return {arc: +(hi - lo).toFixed(2), range: +range.toFixed(3)}; }
const CASES = [['light1'], ['light2'], ['light3'], ['light4'], ['heavy'], ['runatk'], ['spin'], ['riposte'],
  ['light2', 'light1'], ['light3', 'light2'], ['light4', 'light3']];
T.test('blade arc and range match the reference', () => { const out = {};
  for (const hero of ['m', 'f']) for (const [k, from] of CASES) out[hero + ' ' + (from ? from + '>' + k : k)] = blade(hero, k, from);
  if (window.TDUMPMODE) { window.TDUMP = out; return; }
  T.ok(window.TDATA, 'run with --data tests/anim_ref.json'); const bad = [];
  // 10% of the reference; small arcs (straight thrusts) get at least 3° of slack
  for (const id in TDATA) { const r = TDATA[id], m = out[id];
    if (!m || Math.abs(m.arc - r.arc) > Math.max(.1 * r.arc, 3) || Math.abs(m.range - r.range) > .1 * r.range) bad.push(id + ' ' + JSON.stringify(m) + ' vs ' + JSON.stringify(r)); }
  T.ok(!bad.length, bad.join('; ')); });
