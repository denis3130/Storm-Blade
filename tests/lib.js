// tests/lib.js — tiny in-page test API. Tests in one file run in order and share page state.
window.T = (() => {
  const tests = [];
  class Fail extends Error {}
  const fmt = v => { try { const s = JSON.stringify(v); return s === undefined ? String(v) : s; } catch (_) { return String(v); } };
  const pre = msg => (msg ? msg + ': ' : '');
  return {
    test(name, fn) { tests.push({name, fn}); },
    eq(a, b, msg) { if (a !== b) throw new Fail(pre(msg) + 'expected ' + fmt(b) + ', got ' + fmt(a)); },
    ok(v, msg) { if (!v) throw new Fail(msg || 'expected truthy, got ' + fmt(v)); },
    near(a, b, eps, msg) { if (!(Math.abs(a - b) <= eps)) throw new Fail(pre(msg) + 'expected ' + b + ' ±' + eps + ', got ' + a); },
    newGame({hero = 'm'} = {}) { __SB.startGame(false, hero); },
    // removes every enemy (and enemy projectile) from the scene and frees the attack tokens
    clearEnemies() { const S = __SB; for (const e of [...S.E]) S.removeEnemy(e);
      for (const p of S.PROJ) S.scene.remove(p.mesh); S.PROJ.length = 0; S.TOK.clear(); },
    sim(n) { __SB.sim(n); },
    key(code, down = true) { window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', {code, bubbles: true})); },
    // deterministic Math.random (mulberry32): a failing run can be replayed with the same seed (run.py --seed N)
    seed(s) { let a = s >>> 0; Math.random = () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; },
    SEED: 1,
    // synchronous on purpose: no await between tests, so the real-time frame loop never runs in between
    async run() {
      this.seed(this.SEED);
      const out = [];
      for (const t of tests) {
        try { t.fn(); out.push({name: t.name, ok: true}); }
        catch (e) { out.push({name: t.name, ok: false, msg: e instanceof Fail ? e.message : String(e && e.stack || e)}); }
      }
      return out;
    },
  };
})();
