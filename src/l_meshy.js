/* ============================== Meshy hero (preview) ==============================
   Loads assets/meshy/hero/hero.json (the GLB converted by assets/meshy/glb2json.py) and drives its skeleton from the procedural hero rig every frame,
   so every existing animation (gait, attacks, block, dodge, rest) plays on the Meshy model.
   Retarget: per bone, world rotation = (proc joint world rot · proc rest⁻¹) · C · meshy bind rot,
   where C turns the meshy bind bone direction (A-pose) onto the procedural rest direction.
   If the file cannot be loaded (tests on file://, offline) the procedural hero stays. */
const MESHY={on:false,url:'assets/meshy/hero/hero.json'};
// meshy bone, procedural joint for the rotation delta (b = optional second joint, w = blend), procedural direction pair, meshy child for direction;
// joints are looked up in rig.P, then in rig.V (chest, clavicles, toes: virtual joints without meshes)
const MESHY_MAP=[
  {m:'Hips',p:'pel',pd:['pel','spi'],mc:'Spine02'},
  {m:'Spine02',p:'pel',b:'spi',w:.34,pd:['spi','head'],mc:'Spine01'},
  {m:'Spine01',p:'pel',b:'spi',w:.67,pd:['spi','head'],mc:'Spine'},
  {m:'Spine',p:'chest',pd:['spi','head'],mc:'neck'},
  {m:'neck',p:'chest',b:'head',w:.5,pd:['spi','head'],mc:'Head'},
  {m:'Head',p:'head',pd:['spi','head'],mc:'head_end'},
  {m:'LeftShoulder',p:'clL',fixed:1},{m:'RightShoulder',p:'clR',fixed:1},
  {m:'LeftArm',p:'shL',pd:['shL','elL'],mc:'LeftForeArm'},
  {m:'LeftForeArm',p:'elL',pd:['elL','wrL'],mc:'LeftHand'},
  {m:'LeftHand',p:'wrL',pd:['elL','wrL'],mc:'LeftHand',mp:'LeftForeArm'},
  {m:'RightArm',p:'shR',pd:['shR','elR'],mc:'RightForeArm'},
  {m:'RightForeArm',p:'elR',pd:['elR','wrR'],mc:'RightHand'},
  {m:'RightHand',p:'wrR',pd:['elR','wrR'],mc:'RightHand',mp:'RightForeArm'},
  {m:'LeftUpLeg',p:'hipL',pd:['hipL','knL'],mc:'LeftLeg'},
  {m:'LeftLeg',p:'knL',pd:['knL','ftL'],mc:'LeftFoot'},
  {m:'LeftFoot',p:'ftL',pd:['knL','ftL'],mc:'LeftFoot',mp:'LeftLeg'},
  {m:'RightUpLeg',p:'hipR',pd:['hipR','knR'],mc:'RightLeg'},
  {m:'RightLeg',p:'knR',pd:['knR','ftR'],mc:'RightFoot'},
  {m:'RightFoot',p:'ftR',pd:['knR','ftR'],mc:'RightFoot',mp:'RightLeg'},
  // toes: same correction C as their foot, so with the toe value at zero they stay where the foot puts them
  {m:'LeftToeBase',p:'toeL',cOf:'LeftFoot'},{m:'RightToeBase',p:'toeR',cOf:'RightFoot'}];
const _mq1=new THREE.Quaternion(),_mq2=new THREE.Quaternion(),_mq3=new THREE.Quaternion(),_mm=new THREE.Matrix4(),_mv=new THREE.Vector3(),_mv2=new THREE.Vector3();
const worldQ=(o,q)=>q.setFromRotationMatrix(_mm.extractRotation(o.matrixWorld));
function loadMeshyHero(){
  if(!THREE.GLTFLoader||location.protocol==='file:')return Promise.resolve(false);
  return new Promise(res=>{let done=false;const fin=v=>{if(!done){done=true;res(v);}};setTimeout(()=>fin(false),20000);
    new THREE.GLTFLoader().load(MESHY.url,g=>{try{
        // keep the bind pose: the model can be re-attached to a rebuilt rig (character select) after meshySync has posed its bones
        MESHY.gltf=g;MESHY.bind=[];g.scene.traverse(o=>{if(o.isBone)MESHY.bind.push([o,o.quaternion.clone(),o.position.clone()]);});
        fin(setupMeshyHero(g));}catch(e){console.warn('meshy hero',e);fin(false);}},null,()=>fin(false));});}
// re-dress the current (rebuilt) hero rig with the loaded model; false when none is loaded (tests, offline)
function meshyAttach(){if(!MESHY.gltf)return false;for(const[b,q,p]of MESHY.bind){b.quaternion.copy(q);b.position.copy(p);}
  for(const k of['proxR','proxL'])if(MESHY[k]&&MESHY[k].parent)MESHY[k].parent.remove(MESHY[k]);
  try{return setupMeshyHero(MESHY.gltf);}catch(e){console.warn('meshy hero',e);MESHY.on=false;return false;}}
// the heroine has no Meshy model yet: take it off and let the procedural body (and its cape) show
function meshyDetach(){if(MESHY.holder&&MESHY.holder.parent)MESHY.holder.parent.remove(MESHY.holder);MESHY.on=false;}
function setupMeshyHero(gltf){
  const R=PL.rig,P_=R.P,J=n=>P_[n]||R.V[n],B={};let skin=null;
  gltf.scene.traverse(o=>{if(o.isBone)B[o.name]=o;if(o.isSkinnedMesh){skin=o;o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;
    const m=o.material;for(const k of['map','emissiveMap'])if(m[k])m[k].encoding=THREE.LinearEncoding;m.envMapIntensity=.6;}});
  if(!skin||!B.Hips)return false;
  const holder=new THREE.Group();holder.rotation.y=PI;holder.add(gltf.scene);R.root.add(holder);
  const arm=B.Hips.parent;
  // calibrate in rest: procedural zero pose, root at origin
  const sp=R.root.position.clone(),sr=R.root.rotation.y,si=R.inner.rotation.clone();
  R.root.position.set(0,0,0);R.root.rotation.set(0,0,0);R.inner.rotation.set(0,0,0);R.apply(new Float32Array(NP));R.root.updateMatrixWorld(true);
  const wp=(o,v)=>o.getWorldPosition(v);
  const rows=MESHY_MAP.map(r=>{const bone=B[r.m];if(!bone)return null;
    const row={bone,p:J(r.p),b:r.b?J(r.b):null,w:r.w||0,cOf:r.cOf,Qp0i:worldQ(J(r.p),new THREE.Quaternion()).invert(),Qb0i:r.b?worldQ(J(r.b),new THREE.Quaternion()).invert():null,
      Qm0:worldQ(bone,new THREE.Quaternion()),C:new THREE.Quaternion(),parentQ:new THREE.Quaternion()};
    if(!r.fixed&&!r.cOf){const md=wp(B[r.mc],_mv).sub(wp(B[r.mp||r.m],_mv2)).normalize().clone();const pd=wp(J(r.pd[1]),_mv).sub(wp(J(r.pd[0]),_mv2)).normalize();row.C.setFromUnitVectors(md,pd);}
    row.CQm0=row.C.clone().multiply(row.Qm0);return row;}).filter(Boolean);
  // per-frame scratch, made once: wq = this frame's target world rotation; pr = the row of the parent bone when it is synced
  // earlier in the same frame (its wq is then fresh), pq = the parent's current world rotation otherwise
  for(const r of rows)if(r.cOf){const src=rows.find(o=>o.bone.name===r.cOf);if(src){r.C.copy(src.C);r.CQm0.copy(r.C).multiply(r.Qm0);}}
  rows.forEach((r,i)=>{r.wq=new THREE.Quaternion();r.pq=new THREE.Quaternion();r.pr=rows.slice(0,i).find(o=>o.bone===r.bone.parent)||null;});
  const hipOff=P_.pel.worldToLocal(wp(B.Hips,new THREE.Vector3()));
  // attachment proxies: children of the meshy hands whose world rotation equals the procedural wrist's
  const proxy=(row)=>{const g=new THREE.Group();g.quaternion.copy(row.CQm0).invert().multiply(row.Qp0i.clone().invert());
    const s=new THREE.Vector3();row.bone.getWorldScale(s);g.scale.setScalar(1/s.x);row.bone.add(g);return g;};
  const rowOf=n=>rows.find(r=>r.bone.name===n);
  R.root.position.copy(sp);R.root.rotation.set(0,sr,0);R.inner.rotation.copy(si);R.root.updateMatrixWorld(true);
  for(const m of R.meshes)m.visible=false;
  Object.assign(MESHY,{on:true,holder,arm,armQ:new THREE.Quaternion(),B,rows,hipOff,skin,proxR:proxy(rowOf('RightHand')),proxL:proxy(rowOf('LeftHand'))});
  meshySync();return true;}
// after animPlayer: copy the procedural pose onto the meshy skeleton, move attachments, keep the cape hidden
// runs every frame, so it makes no objects: the per-row quaternions were made in setupMeshyHero
function meshySync(){if(!MESHY.on)return;const R=PL.rig;
  MESHY.holder.updateMatrixWorld(true);
  const hw=R.P.pel.localToWorld(_mv.copy(MESHY.hipOff));MESHY.arm.worldToLocal(hw);MESHY.B.Hips.position.copy(hw);
  const armQ=worldQ(MESHY.arm,MESHY.armQ);
  for(const r of MESHY.rows){
    worldQ(r.p,_mq1).multiply(r.Qp0i);
    if(r.b){worldQ(r.b,_mq2).multiply(r.Qb0i);_mq1.slerp(_mq2,r.w);}
    _mq1.multiply(r.CQm0);                               // target world rotation
    const par=r.bone.parent,pq=r.pr?r.pr.wq:par===MESHY.arm?armQ:worldQ(par,r.pq);
    r.bone.quaternion.copy(_mq3.copy(pq).invert().multiply(_mq1));
    r.wq.copy(_mq1);}
  MESHY.holder.updateMatrixWorld(true);
  if(PL.sw&&PL.sw.g.parent!==MESHY.proxR){MESHY.proxR.add(PL.sw.g);}
  if(PL.flask.parent!==MESHY.proxL)MESHY.proxL.add(PL.flask);
  MESHY.B.Head.scale.setScalar(G.fp?.001:1);
  PL.cape.mesh.visible=false;}
