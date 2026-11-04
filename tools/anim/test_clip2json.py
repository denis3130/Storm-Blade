"""Tests for tools/anim/clip2json.py: python3 -m unittest tools/anim/test_clip2json.py"""
import json, os, subprocess, sys, tempfile, unittest
HERE = os.path.dirname(os.path.abspath(__file__))
HERO = os.path.join(HERE, '..', '..', 'assets', 'meshy', 'hero')
sys.path.insert(0, HERE)


class ClipTest(unittest.TestCase):
    def clip(self, name):
        import clip2json
        return clip2json.read_clip(os.path.join(HERO, name))

    def test_walk_clip(self):
        c = self.clip('hero_walk.glb')
        self.assertEqual(len(c['bones']), 22)
        self.assertEqual(len(c['times']), 32)
        self.assertAlmostEqual(c['times'][-1], 1.0667, delta=.001)
        self.assertEqual(c['fps'], 30)
        for b in c['bones'].values():
            self.assertEqual(len(b['r']), 32)
            for q in b['r']:
                self.assertAlmostEqual(sum(x * x for x in q) ** .5, 1, delta=1e-4)

    def test_run_clip(self):
        c = self.clip('hero_run.glb')
        self.assertEqual(len(c['times']), 20)
        self.assertAlmostEqual(c['times'][-1], .6667, delta=.001)

    def test_command_writes_json(self):
        with tempfile.TemporaryDirectory() as d:
            out = os.path.join(d, 'walk.json')
            subprocess.run([sys.executable, os.path.join(HERE, 'clip2json.py'), os.path.join(HERO, 'hero_walk.glb'), out], check=True, capture_output=True)
            j = json.load(open(out))
            self.assertIn('Hips', j['bones'])
            self.assertEqual(len(j['bones']['Hips']['t']), 32)


if __name__ == '__main__':
    unittest.main()
