#!/usr/bin/env python3
"""Read the single animation of a binary glTF clip into JSON.

usage: python3 tools/anim/clip2json.py IN.glb OUT.json

Output: {"name", "fps", "times": [...], "bones": {"<bone>": {"r": [[x,y,z,w], ...], "t": [[x,y,z], ...]}}}
Only rotation and translation channels are read (scale is ignored); the key times are the file's own
(Meshy clips have one key every 1/30 s). Standard library only.
"""
import json, struct, sys

COMP = {5120: ('b', 1), 5121: ('B', 1), 5122: ('h', 2), 5123: ('H', 2), 5125: ('I', 4), 5126: ('f', 4)}
SIZE = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def read_glb(path):
    """(glTF JSON, binary chunk) of a .glb file."""
    b = open(path, 'rb').read()
    magic, _, length = struct.unpack('<III', b[:12])
    if magic != 0x46546C67:
        raise ValueError(path + ' is not a binary glTF')
    o, g, binc = 12, None, b''
    while o < length:
        cl, ct = struct.unpack('<II', b[o:o + 8])
        if ct == 0x4E4F534A:
            g = json.loads(b[o + 8:o + 8 + cl])
        elif ct == 0x004E4942:
            binc = b[o + 8:o + 8 + cl]
        o += 8 + cl
    return g, binc


def accessor(g, binc, i):
    """Values of accessor i: numbers for SCALAR, lists for vectors (handles byteStride)."""
    a = g['accessors'][i]
    v = g['bufferViews'][a['bufferView']]
    fmt, size = COMP[a['componentType']]
    n = SIZE[a['type']]
    stride = v.get('byteStride') or n * size
    start = v.get('byteOffset', 0) + a.get('byteOffset', 0)
    out = []
    for e in range(a['count']):
        vals = struct.unpack_from('<' + fmt * n, binc, start + e * stride)
        out.append(list(vals) if n > 1 else vals[0])
    return out


def read_clip(path):
    g, binc = read_glb(path)
    an = g['animations'][0]
    times, bones = None, {}
    for ch in an['channels']:
        kind = ch['target']['path']
        if kind not in ('rotation', 'translation'):
            continue
        s = an['samplers'][ch['sampler']]
        t = accessor(g, binc, s['input'])
        if times is None:
            times = t
        elif len(t) != len(times):
            raise ValueError('channels with different key counts in ' + path)
        name = g['nodes'][ch['target']['node']]['name']
        bones.setdefault(name, {})['r' if kind == 'rotation' else 't'] = accessor(g, binc, s['output'])
    fps = round((len(times) - 1) / (times[-1] - times[0])) if len(times) > 1 else 30
    return {'name': an.get('name', ''), 'fps': fps, 'times': times, 'bones': bones}


if __name__ == '__main__':
    clip = read_clip(sys.argv[1])
    json.dump(clip, open(sys.argv[2], 'w'), separators=(',', ':'))
    print(sys.argv[2], len(clip['bones']), 'bones', len(clip['times']), 'frames', clip['fps'], 'fps')
