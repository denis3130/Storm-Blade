// tests/orient_desktop.test.js  (viewport 1280x720, no touch)
T.test('desktop never rotates', () => { T.ok(!document.getElementById('app').classList.contains('rot90')); T.eq(__SB.viewW(), 1280); });
T.test('safe areas map straight when not rotated', () => { T.newGame(); const app = document.getElementById('app'), left = () => document.getElementById('status').getBoundingClientRect().left;
  const x = left(); app.style.setProperty('--sa-l', '30px'); const x2 = left(); app.style.removeProperty('--sa-l'); T.near(x2 - x, 30, 1, 'left inset'); });
