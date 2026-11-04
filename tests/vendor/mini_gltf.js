/* tests/vendor/mini_gltf.js — a minimal THREE.GLTFLoader for assets/meshy/hero/hero.json, used only by the tests and the
   before/after videos: the real GLTFLoader comes from a CDN that the test machine cannot reach.
   It reads what hero.json uses: one data: buffer, interleaved accessors, skinned primitives, PBR textures
   (base colour, normal, metallic-roughness). Animations are not read (the game drives the bones itself). */
(function () {
  if (!window.THREE || THREE.GLTFLoader) return;
  const T = THREE, SIZE = {SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16};
  const TYPE = {5120: [Int8Array, 'getInt8'], 5121: [Uint8Array, 'getUint8'], 5122: [Int16Array, 'getInt16'], 5123: [Uint16Array, 'getUint16'],
    5125: [Uint32Array, 'getUint32'], 5126: [Float32Array, 'getFloat32']};
  // one accessor into a packed typed array (handles byteStride / interleaving)
  function read(g, dv, i) { const a = g.accessors[i], v = g.bufferViews[a.bufferView], [C, get] = TYPE[a.componentType], n = SIZE[a.type], b = C.BYTES_PER_ELEMENT;
    const stride = v.byteStride || n * b, start = (v.byteOffset || 0) + (a.byteOffset || 0), out = new C(a.count * n);
    for (let e = 0; e < a.count; e++) { const o = start + e * stride; for (let c = 0; c < n; c++) out[e * n + c] = dv[get](o + c * b, true); }
    return {array: out, size: n, normalized: !!a.normalized}; }
  const ATTR = {POSITION: 'position', NORMAL: 'normal', TEXCOORD_0: 'uv', JOINTS_0: 'skinIndex', WEIGHTS_0: 'skinWeight'};
  class GLTFLoader {
    constructor(manager) { this.manager = manager; }
    load(url, onLoad, onProgress, onError) { const base = url.slice(0, url.lastIndexOf('/') + 1), fail = e => (onError ? onError(e) : console.error(e));
      fetch(url).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + url); return r.json(); })
        .then(g => fetch(g.buffers[0].uri).then(r => r.arrayBuffer()).then(bin => onLoad(this.build(g, new DataView(bin), base)))).catch(fail); }
    build(g, dv, base) {
      const texs = (g.textures || []).map(t => { const tx = new T.TextureLoader().load(base + g.images[t.source].uri); tx.flipY = false; tx.wrapS = tx.wrapT = T.RepeatWrapping; return tx; });
      const mats = (g.materials || []).map(m => { const p = m.pbrMetallicRoughness || {};
        const o = {side: m.doubleSided ? T.DoubleSide : T.FrontSide, metalness: p.metallicFactor === undefined ? 1 : p.metallicFactor, roughness: p.roughnessFactor === undefined ? 1 : p.roughnessFactor};
        if (p.baseColorTexture) { o.map = texs[p.baseColorTexture.index]; o.map.encoding = T.sRGBEncoding; }
        if (p.metallicRoughnessTexture) o.metalnessMap = o.roughnessMap = texs[p.metallicRoughnessTexture.index];
        if (m.normalTexture) { o.normalMap = texs[m.normalTexture.index]; o.normalScale = new T.Vector2(1, -1); }
        return new T.MeshStandardMaterial(o); });
      const joints = new Set((g.skins || []).flatMap(s => s.joints));
      const objs = g.nodes.map((n, i) => { let o;
        if (n.mesh !== undefined) { const pr = g.meshes[n.mesh].primitives[0], geo = new T.BufferGeometry();
          for (const k in pr.attributes) if (ATTR[k]) { const r = read(g, dv, pr.attributes[k]); geo.setAttribute(ATTR[k], new T.BufferAttribute(r.array, r.size, r.normalized)); }
          if (pr.indices !== undefined) geo.setIndex(new T.BufferAttribute(read(g, dv, pr.indices).array, 1));
          const mat = mats[pr.material] || new T.MeshStandardMaterial();
          if (n.skin !== undefined) { mat.skinning = true; o = new T.SkinnedMesh(geo, mat); } else o = new T.Mesh(geo, mat); }
        else o = joints.has(i) ? new T.Bone() : new T.Group();
        o.name = n.name || ''; if (n.translation) o.position.fromArray(n.translation); if (n.rotation) o.quaternion.fromArray(n.rotation); if (n.scale) o.scale.fromArray(n.scale);
        return o; });
      g.nodes.forEach((n, i) => (n.children || []).forEach(c => objs[i].add(objs[c])));
      const scene = new T.Group(); for (const i of g.scenes[g.scene || 0].nodes) scene.add(objs[i]);
      g.nodes.forEach((n, i) => { if (n.skin === undefined) return; const s = g.skins[n.skin], ibm = read(g, dv, s.inverseBindMatrices).array;
        const bones = s.joints.map(j => objs[j]), inv = bones.map((b, k) => new T.Matrix4().fromArray(ibm, k * 16));
        // like GLTFLoader, bind with the mesh's own transform (it binds before parenting): glTF skinning ignores the
        // mesh's parents, and binding with the world matrix would apply the armature's 0.01 scale twice
        objs[i].updateMatrix(); objs[i].bind(new T.Skeleton(bones, inv), objs[i].matrix.clone()); });
      return {scene, scenes: [scene], animations: [], asset: g.asset}; }
  }
  THREE.GLTFLoader = GLTFLoader;
})();
