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
  // the model's own leg measures (bone lengths, metres): the gait solves its leg IK for these, so the Meshy feet stay planted
  const legD=B.LeftUpLeg&&B.LeftLeg&&B.LeftFoot&&B.RightUpLeg?(()=>{const a=wp(B.LeftUpLeg,new THREE.Vector3()),k=wp(B.LeftLeg,new THREE.Vector3()),f=wp(B.LeftFoot,new THREE.Vector3()),r=wp(B.RightUpLeg,new THREE.Vector3());
    return{thigh:a.distanceTo(k),shin:k.distanceTo(f),hipW:a.distanceTo(r)/2};})():null;
  // attachment proxies: children of the meshy hands whose world rotation equals the procedural wrist's
  const proxy=(row)=>{const g=new THREE.Group();g.quaternion.copy(row.CQm0).invert().multiply(row.Qp0i.clone().invert());
    const s=new THREE.Vector3();row.bone.getWorldScale(s);g.scale.setScalar(1/s.x);row.bone.add(g);return g;};
  const rowOf=n=>rows.find(r=>r.bone.name===n);
  R.root.position.copy(sp);R.root.rotation.set(0,sr,0);R.inner.rotation.copy(si);R.root.updateMatrixWorld(true);
  for(const m of R.meshes)m.visible=false;
  const rowR=rowOf('RightHand'),proxR=proxy(rowR);let grip=null;try{grip=meshyGrip(skin,B.RightHand,proxR);}catch(e){console.warn('meshy grip',e);}
  if(grip){proxR.quaternion.premultiply(grip.twI);rowR.tw=grip.tw;}
  Object.assign(MESHY,{on:true,holder,arm,armQ:new THREE.Quaternion(),B,rows,hipOff,legD,skin,proxR,proxL:proxy(rowOf('LeftHand')),gripOff:grip?grip.off:null});
  meshySync();return true;}
// eigenvalues and eigenvectors of a symmetric 3x3 (row-major array), smallest first (Jacobi rotations)
function eig3(A){const a=A.slice(),V=[1,0,0,0,1,0,0,0,1];
  for(let it=0;it<32;it++){let p=0,q=1,m=Math.abs(a[1]);if(Math.abs(a[2])>m){p=0;q=2;m=Math.abs(a[2]);}if(Math.abs(a[5])>m){p=1;q=2;m=Math.abs(a[5]);}if(m<1e-12)break;
    const th=.5*Math.atan2(2*a[p*3+q],a[q*3+q]-a[p*3+p]),c=Math.cos(th),s=Math.sin(th);
    for(let k=0;k<3;k++){const x=a[k*3+p],y=a[k*3+q];a[k*3+p]=c*x-s*y;a[k*3+q]=s*x+c*y;}
    for(let k=0;k<3;k++){const x=a[p*3+k],y=a[q*3+k];a[p*3+k]=c*x-s*y;a[q*3+k]=s*x+c*y;}
    for(let k=0;k<3;k++){const x=V[k*3+p],y=V[k*3+q];V[k*3+p]=c*x-s*y;V[k*3+q]=s*x+c*y;}}
  return[0,1,2].map(i=>[a[i*4],new THREE.Vector3(V[i],V[3+i],V[6+i])]).sort((x,y)=>x[0]-y[0]);}
// the sword hand. The procedural wrist puts the grip through the palm of the Meshy glove (along the palm's normal): the hand
// turns on the wrist so the grip runs across the palm with the thumb towards the blade, the sword slides a few centimetres to
// the base of the fingers, and the fingers close round it (a bend of the glove's mesh, done once; the turn is in meshySync)
function meshyGrip(skin,bone,prox){const g=skin.geometry,sk=skin.skeleton,j=sk&&sk.bones?sk.bones.indexOf(bone):-1;
  if(!g||!g.attributes||!g.attributes.skinIndex||j<0)return null;
  const s=new THREE.Vector3();bone.getWorldScale(s);const k=1/s.x,Qp=prox.quaternion.clone();   // bone units per metre
  const gd=new THREE.Vector3(0,0,1).applyQuaternion(Qp),gc=new THREE.Vector3(0,-.072,.021).applyQuaternion(Qp).multiplyScalar(k);
  if(g.userData.fist){const f=g.userData.fist;return{tw:f.tw,twI:f.tw.clone().invert(),off:f.off.clone()};}
  const M=new THREE.Matrix4().multiplyMatrices(sk.boneInverses[j],skin.bindMatrix),Mi=M.clone().invert(),R3=new THREE.Matrix3().setFromMatrix4(M),R3i=new THREE.Matrix3().setFromMatrix4(Mi);
  const P=g.attributes.position,N=g.attributes.normal,SI=g.attributes.skinIndex,SW=g.attributes.skinWeight,gq=(A,i,c)=>c===0?A.getX(i):c===1?A.getY(i):c===2?A.getZ(i):A.getW(i);
  const idx=[],L=[],v=new THREE.Vector3();
  for(let i=0;i<P.count;i++){let w=0;for(let c=0;c<4;c++)if(gq(SI,i,c)===j)w+=gq(SW,i,c);if(w>=.5){idx.push(i);L.push(new THREE.Vector3().fromBufferAttribute(P,i).applyMatrix4(M));}}
  if(L.length<50)return null;
  // the glove's axes: long (wrist to fingertips), width (across the knuckles, thumb end found by the side that sticks out), thin
  const mean=new THREE.Vector3();for(const p of L)mean.add(p);mean.multiplyScalar(1/L.length);
  const C=[0,0,0,0,0,0,0,0,0];for(const p of L){const d=[p.x-mean.x,p.y-mean.y,p.z-mean.z];for(let a=0;a<3;a++)for(let b=0;b<3;b++)C[a*3+b]+=d[a]*d[b];}
  const E=eig3(C),aL=E[2][1].normalize(),aW=E[1][1].normalize();if(aL.dot(mean)<0)aL.negate();
  let m3=0;for(const p of L){const t=v.copy(p).sub(mean).dot(aW);m3+=t*t*t;}const aT=aW.clone().multiplyScalar(m3>=0?1:-1),nP=new THREE.Vector3().crossVectors(aT,aL).normalize();
  // the turn: the thumb towards the blade, about the long axis
  const bl=gd.clone().negate();bl.addScaledVector(aL,-bl.dot(aL)).normalize();const at=aT.clone().addScaledVector(aL,-aT.dot(aL)).normalize();
  const tw=new THREE.Quaternion().setFromUnitVectors(at,bl);
  // the grip's place: under the knuckle line (56% of the glove's length), half the glove's thickness plus the grip's radius below
  let Lm=0;for(const p of L)Lm=Math.max(Lm,p.dot(aL));const ak=Lm*.56,K=new THREE.Vector3();let nk=0,hm=0;
  for(const p of L)if(Math.abs(p.dot(aL)-ak)<Lm*.06){K.add(p);nk++;}if(!nk)return null;K.multiplyScalar(1/nk);
  for(const p of L)if(Math.abs(p.dot(aL)-ak)<Lm*.06)hm=Math.max(hm,Math.abs(v.copy(p).sub(K).dot(nP)));
  const rho=hm*.8+.017*k,A=K.clone().addScaledVector(nP,-rho);
  const off=A.clone().applyQuaternion(tw).sub(gc).applyQuaternion(Qp.clone().invert()).multiplyScalar(1/k);if(off.length()>.09)return null;
  // the fingers close: beyond the knuckles the glove bends round the grip's axis (in the glove's own frame, before the turn)
  const e3=gd.clone().applyQuaternion(tw.clone().invert()).normalize(),e1=aL.clone().addScaledVector(e3,-aL.dot(e3)).normalize(),e2=new THREE.Vector3().crossVectors(e3,e1);if(e2.dot(nP)<0)e2.negate();
  const np=new THREE.Vector3(),nn=new THREE.Vector3(),TH=3.2;
  for(let n=0;n<idx.length;n++){const i=idx[n],d=v.copy(L[n]).sub(A),a=d.dot(e1);if(a<=0)continue;const b=d.dot(e2),c=d.dot(e3),th=Math.min(a/rho,TH),ex=Math.max(0,a-TH*rho),cs=Math.cos(th),sn=Math.sin(th);
    np.copy(A).addScaledVector(e1,b*sn+ex*cs).addScaledVector(e2,b*cs-ex*sn).addScaledVector(e3,c).applyMatrix4(Mi);P.setXYZ(i,np.x,np.y,np.z);
    if(N){nn.fromBufferAttribute(N,i).applyMatrix3(R3).normalize();const u1=nn.dot(e1),u2=nn.dot(e2),u3=nn.dot(e3);
      nn.set(0,0,0).addScaledVector(e1,u1*cs+u2*sn).addScaledVector(e2,u2*cs-u1*sn).addScaledVector(e3,u3).applyMatrix3(R3i).normalize();N.setXYZ(i,nn.x,nn.y,nn.z);}}
  P.needsUpdate=true;if(N)N.needsUpdate=true;g.userData.fist={tw,off};return{tw,twI:tw.clone().invert(),off:off.clone()};}
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
    r.bone.quaternion.copy(_mq3.copy(pq).invert().multiply(_mq1));if(r.tw)r.bone.quaternion.multiply(r.tw);
    r.wq.copy(_mq1);}
  MESHY.holder.updateMatrixWorld(true);
  if(PL.sw&&PL.sw.g.parent!==MESHY.proxR){MESHY.proxR.add(PL.sw.g);PL.sw.g.position.set(0,-.072,-.004);if(MESHY.gripOff)PL.sw.g.position.add(MESHY.gripOff);}
  if(PL.flask.parent!==MESHY.proxL)MESHY.proxL.add(PL.flask);
  MESHY.B.Head.scale.setScalar(G.fp?.001:1);
  PL.cape.mesh.visible=false;}
