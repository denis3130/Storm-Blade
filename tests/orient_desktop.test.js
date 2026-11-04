// tests/orient_desktop.test.js  (viewport 1280x720, no touch)
T.test('desktop never rotates', () => { T.ok(!document.getElementById('app').classList.contains('rot90')); T.eq(__SB.viewW(), 1280); });
