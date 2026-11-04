/* ============================== character rigs ============================== */
const NP=34;
const PK={y:[0],pel:[1,2,3],spi:[4,5,6],head:[7,8,33],shL:[9,10,11],elL:[12],shR:[13,14,15],elR:[16],wrR:[17,18,19],hipL:[20,21,22],knL:[23],hipR:[24,25,26],knR:[27],ftL:[28],ftR:[29],wrL:[30,31,32]};
// authored poses use 'positive pitch = bend forward' for spine/head (and small pelvis tilts); the rig's +X pitch tilts backward, so flip here
function pose(o,base){const p=new Float32Array(NP);if(base)p.set(base);
  for(const k in o){const idx=PK[k],v=o[k];if(k==='y'){p[0]=v;continue;}if(Array.isArray(v)){for(let i=0;i<v.length;i++){let a=v[i];if(i===0&&(k==='spi'||k==='head'||(k==='pel'&&Math.abs(a)<30)))a=-a;p[idx[i]]=a*DEG;}}else p[idx[0]]=v*DEG;}return p;}
function track(base,keys){return keys.map(k=>({t:k[0],p:k[1] instanceof Float32Array?k[1]:pose(k[1],base),e:k[2]||eIO}));}
function evalTrack(tr,t,out){if(t<=tr[0].t){out.set(tr[0].p);return;}
  for(let i=1;i<tr.length;i++){if(t<=tr[i].t){const a=tr[i-1],b=tr[i];const k=b.e((t-a.t)/Math.max(1e-4,b.t-a.t));for(let j=0;j<NP;j++)out[j]=a.p[j]+(b.p[j]-a.p[j])*k;return;}}
  out.set(tr[tr.length-1].p);}
function mixPose(out,a,b,k){for(let j=0;j<NP;j++)out[j]=a[j]+(b[j]-a[j])*k;}
/* ---------- procedural locomotion: stride-synced phase + 2-bone leg IK, so planted feet never slide ----------
   o: output pose, base: pose to walk from, st: per-character gait state, d: rig dims, sc: rig scale,
   vf/vs: actual local forward / rightward speed (m/s), opt.arm: arm-swing multiplier, opt.armR: sword-arm multiplier,
   opt.lean: extra forward lean (rad). Returns a bitmask of heel strikes this frame (1 = left, 2 = right). */
function gaitIK(o,base,st,d,sc,vf,vs,dt,opt){
  o.set(base);const T=U.time.value;o[4]+=Math.sin(T*1.7+st.seed)*1.3*DEG;o[0]+=Math.sin(T*1.7+st.seed)*.004;
  const A=d.thigh,B=d.shin,LEG=A+B,v=Math.hypot(vf,vs)/sc;          // rig units
  const vn=v*(.9/LEG),run=sstep(1.9,3.9,vn),sprint=sstep(5.6,7.6,vn);
  const Ls=Math.min(1.9,.72*Math.sqrt(vn/1.4))*(LEG/.9);            // step length (power law fits walk→sprint)
  const duty=lerp(.62,.37,run),E=2*duty*Ls;                           // stance excursion = distance covered while planted
  const prev=st.ph;if(Ls>1e-4)st.ph=(st.ph+v*dt/(2*Ls))%1;
  let ev=0;if(((prev)%1)>((st.ph)%1))ev|=1;if(((prev+.5)%1)>((st.ph+.5)%1))ev|=2;
  const w=sstep(.04,.45,vn);st.w=w;if(w<.001)return 0;
  const f=v>1e-4?(vf/sc)/v:1,sdir=v>1e-4?(vs/sc)/v:0,amp=Math.min(1,Ls/(.42*LEG));
  const phL=st.ph,cL=Math.cos(TAU*phL);
  // pelvis: inverted-pendulum walk (high at mid-stance) → spring run (low at mid-stance), twist with the legs
  const bob=lerp(.02,-.036,run)*(LEG/.9)*amp*Math.cos(4*PI*(phL-duty/2))-(.02*run+.02*sprint)*(LEG/.9);
  o[0]+=bob*w;o[1]=lerp(o[1],o[1]*.3-(3*run+5*sprint)*DEG,w);
  o[2]=lerp(o[2],-lerp(5,9,run)*DEG*amp*cL*f,w);o[3]=lerp(o[3],0,w);
  o[5]=lerp(o[5],o[5]*.3+lerp(5,9,run)*DEG*.8*amp*cL*f,w);o[6]=lerp(o[6],0,w*.7);
  const lean=(5*run+11*sprint)*DEG*Math.max(0,f)-4*DEG*Math.max(0,-f)+(opt&&opt.lean||0);
  o[4]-=lean*w;o[7]+=lean*.65*w;
  const hipH=LEG+o[0];const pel=o[1];
  for(let i=0;i<2;i++){const ph=(st.ph+i*.5)%1;let x,lift=0,toe=0;
    if(ph<duty){const u=ph/duty;x=E*(.5-u);if(u<.14)toe=(1-u/.14)*(10+8*run)*DEG*amp;}
    else{const u=(ph-duty)/(1-duty);x=E*(-.5+(1-Math.cos(PI*u))/2);lift=(.045+.13*run+.05*sprint)*(LEG/.9)*amp*Math.sin(PI*u);toe=(u<.35?-(1-u/.35)*(20+18*run):Math.sin(PI*(u-.35)/.65)*8)*DEG*amp;}
    // target relative to the hip joint as the pelvis twist actually moves it, then into the pelvis frame
    const side=i?1:-1,cy=Math.cos(o[2]),sy=Math.sin(o[2]),rf=x*f-side*d.hipW*sy,rs=x*sdir+side*.012*(1-run)-side*d.hipW*(cy-1),xf=rf*cy-rs*sy,xs=rs*cy+rf*sy,V=Math.max(.2*LEG,hipH-lift);
    let D=Math.sqrt(xf*xf+xs*xs+V*V);D=clamp(D,Math.abs(A-B)+.02,LEG*.997);
    const kap=PI-Math.acos(clamp((A*A+B*B-D*D)/(2*A*B),-1,1));
    const gam=Math.atan2(B*Math.sin(kap),A+B*Math.cos(kap));
    const thz=Math.asin(clamp(xs/(D*Math.cos(gam)),-.9,.9));
    const thx=Math.atan2(xf,V)+Math.atan2(D*Math.sin(gam),D*Math.cos(gam)*Math.cos(thz))-pel;
    const hi=i?24:20,ki=i?27:23,fi=i?29:28;
    o[hi]=lerp(o[hi],thx,w);o[hi+1]=lerp(o[hi+1],0,w);o[hi+2]=lerp(o[hi+2],thz+(i?1:-1)*1.5*DEG,w);
    o[ki]=lerp(o[ki],-kap,w);o[fi]=lerp(o[fi],kap-thx-pel+toe,w);}
  // arms swing against the legs; elbows fold as speed grows
  const arm=(opt&&opt.arm!==undefined?opt.arm:1)*lerp(16,40,run)*DEG*amp*f,armR=opt&&opt.armR!==undefined?opt.armR:1;
  o[9]+=-arm*cL*w;o[13]+=arm*cL*w*armR;o[12]+=lerp(6,62,run)*DEG*w*(opt&&opt.elbow!==undefined?opt.elbow:1);o[16]+=lerp(6,50,run)*DEG*w*armR;
  o[11]-=lerp(2,8,run)*DEG*w;o[15]+=lerp(2,8,run)*DEG*w*armR;
  return ev;}
function skinBuild(holder,P,L,mats){holder.updateMatrixWorld(true);const bones=Object.values(P),bi=new Map(bones.map((b,i)=>[b,i]));
  const inv=new THREE.Matrix4().copy(holder.matrixWorld).invert(),byMat={};
  for(const k in L){const e=L[k],bone=P[e.bone],bm=new THREE.Matrix4().multiplyMatrices(inv,bone.matrixWorld),ix=bi.get(bone);
    for(const part of e.parts){(byMat[e.mat]=byMat[e.mat]||[]).push(Object.assign({},part,{m:new THREE.Matrix4().multiplyMatrices(bm,part.m||IDM),bi:ix}));}}
  const meshes=[],skel=new THREE.Skeleton(bones);
  for(const mk in byMat){const parts=byMat[mk],g=mergeParts(parts),n=g.attributes.position.count,si=new Uint16Array(n*4),sw=new Float32Array(n*4);let o=0;
    for(const p of parts){const c=p.g.attributes.position.count;for(let i=0;i<c;i++){si[(o+i)*4]=p.bi;sw[(o+i)*4]=1;}o+=c;}
    g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(sw,4));g.computeBoundingSphere();g.boundingSphere.radius*=1.7;
    const mat=mats[mk];mat.skinning=true;const mesh=new THREE.SkinnedMesh(g,mat);mesh.castShadow=mk!=='eye';mesh.receiveShadow=true;mesh.userData.mk=mk;holder.add(mesh);mesh.bind(skel);meshes.push(mesh);}
  return meshes;}
function detailMat(o){return new THREE.MeshStandardMaterial(Object.assign({vertexColors:true,map:TEX.detail,roughness:.82,metalness:0},o||{}));}
function eyeMat(r,g,b){return new THREE.MeshBasicMaterial({color:new THREE.Color(r,g,b)});}
function buildHuman(cfg){
  const root=new THREE.Group(),inner=new THREE.Group();root.add(inner);inner.scale.setScalar(cfg.s||1);
  const P={},d=cfg.d;
  const J=(n,par,x,y,z)=>{const g=new THREE.Group();g.position.set(x,y,z);g.rotation.order='YXZ';par.add(g);P[n]=g;return g;};
  J('pel',inner,0,d.hip,0);J('spi',P.pel,0,d.spine,0);J('head',P.spi,0,d.torso+d.neck,d.headZ||0);
  J('shL',P.spi,-d.shW,d.torso-d.shDrop,d.shZ||0);J('shR',P.spi,d.shW,d.torso-d.shDrop,d.shZ||0);
  J('elL',P.shL,0,-d.upper,0);J('elR',P.shR,0,-d.upper,0);J('wrL',P.elL,0,-d.fore,0);J('wrR',P.elR,0,-d.fore,0);
  J('hipL',P.pel,-d.hipW,0,0);J('hipR',P.pel,d.hipW,0,0);J('knL',P.hipL,0,-d.thigh,0);J('knR',P.hipR,0,-d.thigh,0);J('ftL',P.knL,0,-d.shin,0);J('ftR',P.knR,0,-d.shin,0);
  const L={};const add=(bone,mat,g,m,c,o)=>{const k=bone+'|'+mat;(L[k]=L[k]||{bone,mat,parts:[]}).parts.push(Object.assign({g,m,c:c&&c.isColor?c:col(c||0xffffff)},o||{}));};
  cfg.build(add,d);
  const meshes=skinBuild(inner,P,L,cfg.mats);
  const rig={root,inner,P,meshes,d,cur:new Float32Array(NP),mats:cfg.mats,
    apply(p){const Pp=this.P;Pp.pel.position.y=d.hip+p[0];Pp.pel.rotation.set(p[1],p[2],p[3]);Pp.spi.rotation.set(p[4],p[5],p[6]);Pp.head.rotation.set(p[7],p[8],p[33]);
      Pp.shL.rotation.set(p[9],p[10],p[11]);Pp.elL.rotation.x=p[12];Pp.shR.rotation.set(p[13],p[14],p[15]);Pp.elR.rotation.x=p[16];Pp.wrR.rotation.set(p[17],p[18],p[19]);
      Pp.hipL.rotation.set(p[20],p[21],p[22]);Pp.knL.rotation.x=p[23];Pp.hipR.rotation.set(p[24],p[25],p[26]);Pp.knR.rotation.x=p[27];Pp.ftL.rotation.x=p[28];Pp.ftR.rotation.x=p[29];
      Pp.wrL.rotation.set(p[30],p[31],p[32]);}};
  return rig;}
const G_=(k,f)=>geo(k,f);
const gSph=(r,ws=14,hs=10)=>new THREE.SphereGeometry(r,ws,hs);
const gBox=(w,h,dd,sx=1,sy=1,sz=1)=>new THREE.BoxGeometry(w,h,dd,sx,sy,sz);
const gCone=(r,h,s=8)=>new THREE.ConeGeometry(r,h,s);
const gCylO=(r1,r2,h,s=10)=>new THREE.CylinderGeometry(r1,r2,h,s,1,true);
const gTor=(r,t,s=8,ts=16)=>new THREE.TorusGeometry(r,t,s,ts);

/* ---------- hero ---------- */
const HERO_D={hip:.96,spine:.1,torso:.5,neck:.07,shW:.215,shDrop:.075,upper:.29,fore:.26,hipW:.105,thigh:.44,shin:.43};
// provisional heroine (until her Meshy model): same outfit and palette, narrower shoulders and waist, hood down, hair braided to mid-back
const HEROINE_D={hip:.93,spine:.1,torso:.47,neck:.07,shW:.19,shDrop:.07,upper:.28,fore:.25,hipW:.11,thigh:.43,shin:.42};
function heroBuild(add,d,o){
  const F=!!(o&&o.f),ty=F?d.torso/HERO_D.torso:1,sx=F?d.shW/HERO_D.shW:1,aR=F?.9:1,lR=F?.94:1;
  const tr=(r,y)=>F?r*(y<=.2?.88:y<.54?.93:1):r;           // torso radius: thinner waist, slightly narrower chest
  const prof=pts=>pts.map(([r,y])=>[tr(r,y),y*ty]);
  const tun=0x34452f,tun2=0x283424,lea=0x3e2c20,lea2=0x251c15,skin=0x7a5a48,trou=0x2c2823,boot=0x2c2119,metal=0x9a9ea4,hood=0x2c3829,hair=0x2b1d14,hair2=0x1f150e;
  add('pel','b',gLathe([[0,-.13],[.14,-.12],[.18,-.05],[.178,.05],[.16,.12],[0,.13]],14),M4(0,0,0,0,0,0,1,1,.78),trou);
  add('pel','b',gTor(.176,.034,6,22),M4(0,.035,0,PI/2,0,0,1,.78,1),lea);
  add('pel','m',gBox(.06,.05,.02),M4(0,.035,-.125),metal);
  add('pel','b',gBox(.07,.08,.05),M4(.13,-.01,-.05,0,-.4,0),lea2);add('pel','b',gBox(.08,.09,.05),M4(-.06,-.01,.12,0,.2,0),lea2);
  add('pel','b',gBox(.25,.26,.025,1,3,1),M4(0,-.13,-.115,.08,0,0),tun2,{cf:(x,y,z,c)=>{if(y<-.1)c.multiplyScalar(.8);}});
  add('pel','b',gBox(.27,.28,.025,1,3,1),M4(0,-.13,.11,-.1,0,0),tun2);
  add('spi','b',gLathe(prof([[0,-.02],[.165,0],[.17,.1],[.168,.2],[.19,.32],[.208,.42],[.198,.49],[.13,.545],[.055,.575],[0,.58]]),18),M4(0,0,0,0,0,0,1,1,.7),tun);
  add('spi','b',gLathe(prof([[.176,.12],[.19,.24],[.21,.36],[.214,.44],[.2,.5]]),18),M4(0,0,0,0,0,0,1,1,.74),lea);
  for(const s of[-1,1])add('spi','b',new THREE.SphereGeometry(.15,14,10,0,TAU,0,PI*.5),M4(s*.13*sx,.47*ty,.02,0,0,s*.35,1.15*sx,.6,1.25),hood);
  add('spi','b',gLathe(prof([[.22,.3],[.2,.4],[.15,.5],[.08,.56]]),18),M4(0,0,.03,0,0,0,1,1,.8),hood);
  add('spi','b',gBox(.05,.6*ty,.03),M4(0,.27*ty,F?-.121:-.13,0,0,.72),lea2);
  add('spi','m',gSph(.022,8,6),M4(.06,.33*ty,F?-.132:-.142),metal);
  add('spi','b',gTor(.085,.035,6,16),M4(0,.53*ty,0,PI/2,0,0,1,.85,1),hood);
  add('spi','b',gCaps(.045,.05,.07,8,2),M4(0,.6*ty,0),skin);
  if(F){// the hood lies folded on the nape; the braid hangs over the cape, bead by bead, down to mid-back
    add('spi','b',gSph(.11,12,8),M4(0,.53*ty,.1,-.3,0,0,1.25,.55,.75),hood);
    // the cape stands ~.21-.25 off the spine axis below the shoulders (measured), so the braid rides on top of it
    [[.5,.2,.03,.008,-.75],[.42,.262,.029,-.008,-.1],[.34,.274,.027,.008,.04],[.27,.277,.025,-.006,.04]].forEach(([y,z,r,x,rx],i)=>
      add('spi','b',gSph(r,8,6),M4(x,y*ty,z,rx,0,i%2?.25:-.25,1,1.6,.85),i%2?hair2:hair));
    add('spi','b',gTor(.016,.007,5,10),M4(0,.235*ty,.278,PI/2,0,0),lea2);add('spi','b',gCone(.02,.06,6),M4(0,.2*ty,.279,PI,0,0),hair);}
  // head + hood + scarf
  add('head','b',gSph(.104,16,12),M4(0,.1,0,0,0,0,.92,1.06,1),skin);
  if(!F){add('head','b',new THREE.SphereGeometry(.133,18,12,PI*1.5+.62,TAU-1.24,0,PI*.78),M4(0,.112,.012,0,0,0,1,1.06,1.05),hood);
    add('head','b',gCone(.1,.2,10),M4(0,.13,.12,-1.15,0,0,1,1,.6),hood);}
  else{// hair pulled back (open at the face), gathered into the braid's first bead at the back of the head
    add('head','b',new THREE.SphereGeometry(.112,18,12,PI*1.5+.95,TAU-1.9,0,PI*.64),M4(0,.118,.006,0,0,0,.96,1.04,1.05),hair);
    add('head','b',gSph(.034,8,6),M4(0,.03,.098,.3,0,0,1,1.5,.9),hair2);}
  add('head','b',gSph(.109,14,8),M4(0,.05,-.008,0,0,0,1,.55,1),0x1f2420);
  add('head','b',gSph(.012,6,4),M4(.034,.116,-.094),0x0c0a08);add('head','b',gSph(.012,6,4),M4(-.034,.116,-.094),0x0c0a08);
  for(const s of[-1,1]){const sh=s<0?'shL':'shR',el=s<0?'elL':'elR',wr=s<0?'wrL':'wrR';
    add(sh,'b',gSph(.078*aR,10,8),M4(0,0,0),tun);add(sh,'b',gCaps(.058*aR,.066*aR,d.upper,10,3),M4(0,0,0),tun);
    add(sh,'b',new THREE.SphereGeometry(.105,12,8,0,TAU,0,PI*.55),M4(0,.016,0,0,0,s*.25,1,.82,1),s>0?lea:tun2);if(s>0)add(sh,'m',new THREE.SphereGeometry(.112,12,8,0,TAU,0,PI*.32),M4(0,.03,0,0,0,.25,1,.8,1),metal);
    add(el,'b',gCaps(.046*aR,.055*aR,d.fore,10,3),M4(0,0,0),tun);add(el,'b',gCylO(.059*aR,.052*aR,.17,10),M4(0,-.15,0),lea);
    add(wr,'b',gSph(.046,10,8),M4(0,-.045,-.005,0,0,0,.9,1.2,.7),lea2);add(wr,'b',gCaps(.016,.018,.05,6,2),M4(s*-.03,-.02,-.025,.6,0,s*.3),lea2);}
  for(const s of[-1,1]){const hp=s<0?'hipL':'hipR',kn=s<0?'knL':'knR',ft=s<0?'ftL':'ftR';
    add(hp,'b',gCaps(.078*lR,.1*lR,d.thigh,10,3),M4(0,0,0),trou);
    add(kn,'b',gCaps(.056*lR,.074*lR,d.shin,10,3),M4(0,0,0),trou);add(kn,'b',gCaps(.064,.079,.28,10,3),M4(0,-.15,0),boot);add(kn,'b',gTor(.079,.018,6,14),M4(0,-.15,0,PI/2,0,0),lea2);
    add(kn,'b',gSph(.062,8,6),M4(0,.0,-.03,0,0,0,1,1,.8),lea);
    add(ft,'b',gSph(.075,10,8),M4(0,-.035,-.06,0,0,0,1,.7,2.05),boot);add(ft,'b',gBox(.12,.022,.28),M4(0,-.075,-.06),lea2);}
}
/* ---------- goblin ---------- */
const GOB_D={hip:.6,spine:.08,torso:.34,neck:.05,headZ:-.06,shW:.15,shDrop:.04,upper:.25,fore:.25,hipW:.08,thigh:.29,shin:.29};
function goblinBuild(archer){return(add,d)=>{
  const skin=0x7c8374,skin2=0x5a6151,rag=0x3c3024,rag2=0x52402c,bone=0xcfc5aa,dark=0x14100c,hood=0x33382a;
  add('pel','b',gLathe([[0,-.09],[.1,-.08],[.12,0],[.11,.08],[0,.09]],10),M4(0,0,0,0,0,0,1,1,.8),skin2);
  add('pel','b',gBox(.17,.22,.02,1,2,1),M4(0,-.12,-.09,.12,0,0),rag);add('pel','b',gBox(.2,.2,.02,1,2,1),M4(0,-.12,.08,-.12,0,0),rag);
  add('pel','b',gTor(.12,.018,5,14),M4(0,.02,0,PI/2,0,0,1,.8,1),rag2);
  add('spi','b',gLathe([[0,-.02],[.1,0],[.105,.1],[.13,.22],[.135,.3],[.09,.35],[0,.37]],12),M4(0,0,0,0,0,0,1,1,.75),skin);
  add('spi','b',gBox(.04,.44,.02),M4(0,.18,-.1,0,0,.75),rag2);
  if(archer){add('spi','b',gCylO(.05,.04,.4,8),M4(-.05,.25,.13,.5,0,.3),rag2);for(let i=0;i<4;i++)add('spi','b',gCylO(.006,.006,.5,4),M4(-.06+i*.012,.42,.2,.5,0,.3),bone);}
  add('head','b',gSph(.14,14,10),M4(0,.08,0,0,0,0,1,.92,1.05),skin);
  add('head','b',gCone(.04,.16,8),M4(0,.06,-.18,-PI/2+.3,0,0),skin2);
  add('head','b',gBox(.15,.035,.05),M4(0,-.01,-.12),dark);
  add('head','b',gBox(.02,.03,.012),M4(-.04,-.005,-.14),bone);add('head','b',gBox(.02,.03,.012),M4(.045,-.005,-.14),bone);
  for(const s of[-1,1]){add('head','b',gCone(.07,.38,6),M4(s*.2,.12,.03,0,0,s*(PI/2+.18),1,1,.4),skin);
    add('head','eye',gSph(.019,8,6),M4(s*.052,.1,-.122),0xffffff);add('head','b',gBox(.07,.025,.04),M4(s*.055,.13,-.11,0,0,s*-.3),skin2);}
  add('head','b',gSph(.06,8,6),M4(0,.13,-.07,0,0,0,1.6,.5,1.3),skin2);
  if(archer)add('head','b',new THREE.SphereGeometry(.16,14,10,PI*1.5+.7,TAU-1.4,0,PI*.66),M4(0,.1,.01),hood);
  for(const s of[-1,1]){const sh=s<0?'shL':'shR',el=s<0?'elL':'elR',wr=s<0?'wrL':'wrR';
    add(sh,'b',gCaps(.034,.045,.25,8,3),M4(),skin);add(el,'b',gCaps(.028,.035,.25,8,3),M4(),skin);add(el,'b',gCylO(.042,.038,.1,8),M4(0,-.14,0),rag);
    add(wr,'b',gSph(.042,8,6),M4(0,-.04,0,0,0,0,1,1.3,.7),skin2);
    for(let f=0;f<3;f++)add(wr,'b',gCone(.008,.05,4),M4(-.02+f*.02,-.1,-.01,0,0,PI),bone);}
  for(const s of[-1,1]){const hp=s<0?'hipL':'hipR',kn=s<0?'knL':'knR',ft=s<0?'ftL':'ftR';
    add(hp,'b',gCaps(.04,.055,.29,8,3),M4(),skin);add(kn,'b',gCaps(.032,.042,.29,8,3),M4(),skin);
    add(ft,'b',gSph(.05,8,6),M4(0,-.02,-.05,0,0,0,1,.6,2.2),skin2);}
};}
/* ---------- troll ---------- */
const TROLL_D={hip:1.42,spine:.18,torso:1.1,neck:.08,headZ:-.38,shW:.62,shDrop:.16,upper:.8,fore:.76,hipW:.3,thigh:.74,shin:.68};
function trollBuild(king){return(add,d)=>{
  const sk=king?0x5e554d:0x5a5a4d,sk2=king?0x433c35:0x45443b,moss=0x3e4a2a,hide=0x4a3626,bone=0xd6ccb2,dark=0x0f0c0a;
  const rocky=(x,y,z,c)=>{const n=vnoise(x*7+y*5,z*7-y*3);if(n>.62)c.lerp(col(moss),.55);else c.multiplyScalar(.85+n*.3);};
  add('pel','b',gLathe([[0,-.3],[.42,-.26],[.5,-.05],[.46,.15],[0,.2]],14),M4(0,0,0,0,0,0,1,1,.85),sk2,{cf:rocky});
  add('pel','b',gBox(.56,.7,.04,1,3,1),M4(0,-.42,-.34,.12,0,0),hide);add('pel','b',gBox(.62,.66,.04,1,3,1),M4(0,-.4,.34,-.12,0,0),hide);
  add('pel','b',gTor(.48,.05,6,18),M4(0,.06,0,PI/2,0,0,1,.85,1),0x2b2017);
  add('spi','b',gLathe([[0,-.05],[.46,0],[.5,.25],[.62,.55],[.7,.82],[.62,1.02],[.36,1.14],[0,1.18]],18),M4(0,0,0,0,0,0,1,1,.78),sk,{cf:rocky});
  add('spi','b',gSph(.5,14,10),M4(0,.82,.18,0,0,0,1.25,.8,.9),sk2,{cf:rocky});
  for(let i=0;i<9;i++){const a=-1.1+i*.275;add('spi','b',gCaps(.03,.045,.14,6,2),M4(Math.sin(a)*.52,.98-Math.cos(a)*.18,-Math.cos(a)*.42,.3,a,0),bone);}
  add('head','b',gSph(.43,16,12),M4(0,.08,0,0,0,0,1,.85,1.05),sk,{cf:rocky});add('head','b',gBox(.62,.12,.2),M4(0,.2,-.3,.25,0,0),sk2);
  add('head','b',gBox(.46,.16,.32),M4(0,-.12,-.16),sk2);
  add('head','b',gSph(.11,8,6),M4(0,.06,-.33,0,0,0,1,.8,1),sk2);
  add('head','b',gBox(.3,.05,.06),M4(0,-.06,-.32),dark);
  for(const s of[-1,1]){add('head','b',gCone(.045,.24,6),M4(s*.13,-.02,-.33,-.25,0,s*-.25),bone);add('head','eye',gSph(.035,8,6),M4(s*.12,.12,-.3),0xffffff);
    add('head','b',gSph(.1,8,6),M4(s*.15,.2,-.24,0,0,0,1.2,.45,.8),sk2);}
  if(king){for(let i=0;i<7;i++){const a=i/7*TAU;add('head','b',gCone(.05,.24,5),M4(Math.cos(a)*.26,.32,Math.sin(a)*.26,0,0,0),bone);}add('head','b',gTor(.27,.04,5,16),M4(0,.27,0,PI/2,0,0),0x7a5a22);}
  for(const s of[-1,1]){const sh=s<0?'shL':'shR',el=s<0?'elL':'elR',wr=s<0?'wrL':'wrR';
    add(sh,'b',gSph(.28,12,10),M4(),sk,{cf:rocky});add(sh,'b',gCaps(.2,.26,.8,12,3),M4(),sk,{cf:rocky});
    add(el,'b',gCaps(.2,.22,.76,12,3),M4(),sk,{cf:rocky});add(wr,'b',gSph(.22,10,8),M4(0,-.12,0,0,0,0,1,1.15,.85),sk2);
    for(let f=0;f<3;f++)add(wr,'b',gCaps(.05,.06,.14,6,2),M4(-.1+f*.1,-.26,-.06,.3,0,0),sk2);}
  for(const s of[-1,1]){const hp=s<0?'hipL':'hipR',kn=s<0?'knL':'knR',ft=s<0?'ftL':'ftR';
    add(hp,'b',gCaps(.23,.3,.74,12,3),M4(),sk,{cf:rocky});add(kn,'b',gCaps(.2,.24,.68,12,3),M4(),sk,{cf:rocky});
    add(ft,'b',gSph(.24,10,8),M4(0,-.06,-.12,0,0,0,1,.5,1.6),sk2);for(let f=0;f<3;f++)add(ft,'b',gCone(.05,.12,5),M4(-.1+f*.1,-.08,-.48,-PI/2,0,0),bone);}
};}
/* ---------- materials per character ---------- */
function heroMats(){return{b:detailMat({roughness:.84}),m:new THREE.MeshStandardMaterial({vertexColors:true,color:0xffffff,roughness:.35,metalness:.9})};}
function enemyMats(eyeCol){eyeCol=eyeCol.map(v=>v*.62);return{b:detailMat({roughness:.78}),m:new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5,metalness:.7}),eye:eyeMat(eyeCol[0],eyeCol[1],eyeCol[2])};}
function cloneMats(m){const o={};for(const k in m)o[k]=m[k].clone();return o;}
const MATS_GOB=[],MATS_TROLL={};
/* ---------- swords ---------- */
const SWORDS=[
  {name:'Spada arrugginita',dmg:16,len:.84,blade:0x7d695a,rough:.66,metal:.45,guard:0x4a3b2e,grip:0x3a2a1c},
  {name:'Spada di ferro',dmg:24,len:.9,blade:0x9ea4aa,rough:.38,metal:.88,guard:0x55524c,grip:0x3a2a1c},
  {name:"Spada d'acciaio",dmg:34,len:.98,blade:0xd5dae0,rough:.24,metal:.96,guard:0x8c7240,grip:0x2a1e15},
  {name:'Lama runica',dmg:46,len:1.04,blade:0xa8c0e8,rough:.2,metal:.9,guard:0x3a4a6a,grip:0x1c2230,glow:[.25,.7,2.2]},
  {name:'Stormblade',dmg:62,len:1.14,blade:0xcfc4ff,rough:.16,metal:.9,guard:0x40306a,grip:0x1d1530,glow:[1.3,.75,3.4]}];
SWORDS.forEach((s,i)=>{s.dmg=CFG.swordDmg[i];});
function bladeGeo(L,w,t){const g=new THREE.BoxGeometry(w,t,L,2,1,10);const pa=g.attributes.position;
  for(let i=0;i<pa.count;i++){const x0=pa.getX(i),z=pa.getZ(i);const u=clamp((L/2-z)/L,0,1);const tip=clamp((1-u)/.2,0,1);const edge=Math.abs(Math.abs(x0)-w/2)<1e-5;
    pa.setXYZ(i,x0*lerp(.04,1,Math.pow(tip,.75))*(1-u*.12),pa.getY(i)*(edge?.14:1)*lerp(.4,1,tip),z);}
  g.translate(0,0,-L/2);g.computeVertexNormals();return g;}
function buildSword(t){const s=SWORDS[t],g=new THREE.Group();
  const bm=new THREE.MeshStandardMaterial({color:col(s.blade),roughness:s.rough,metalness:s.metal,emissive:s.glow?new THREE.Color(s.glow[0],s.glow[1],s.glow[2]).multiplyScalar(.35):new THREE.Color(0,0,0)});
  const gm=new THREE.MeshStandardMaterial({color:col(s.guard),roughness:.4,metalness:.85,vertexColors:true}),wm=new THREE.MeshStandardMaterial({color:col(s.grip),roughness:.9,map:TEX.detail,vertexColors:true});
  const blade=new THREE.Mesh(bladeGeo(s.len,.052,.012),bm);blade.position.z=-.07;g.add(blade);
  const fuller=new THREE.Mesh(new THREE.BoxGeometry(.012,.014,s.len*.62),new THREE.MeshStandardMaterial({color:col(s.blade).multiplyScalar(.6),roughness:.3,metalness:.9,emissive:bm.emissive}));fuller.position.z=-.07-s.len*.34;g.add(fuller);
  const gp=[{g:new THREE.BoxGeometry(t>=2?.24:.19,.028,.036),m:M4(0,0,-.06)},{g:new THREE.SphereGeometry(.026,10,8),m:M4(0,0,.11)}];
  if(t>=2)for(const sx of[-1,1])gp.push({g:new THREE.SphereGeometry(.018,8,6),m:M4(sx*.12,0,-.06)});
  g.add(new THREE.Mesh(mergeParts(gp),gm));g.add(new THREE.Mesh(mergeParts([{g:new THREE.CylinderGeometry(.016,.018,.16,8),m:M4(0,0,.02,PI/2,0,0)}]),wm));
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;}});
  const base=new THREE.Object3D();base.position.z=-.1;g.add(base);const tip=new THREE.Object3D();tip.position.z=-.07-s.len;g.add(tip);
  return{g,base,tip,bm,s};}
/* ---------- cape (verlet cloth) ---------- */
class Cape{constructor(rig){this.rig=rig;this.W=6;this.H=9;const W=this.W,H=this.H,n=W*H;this.p=new Float32Array(n*3);this.o=new Float32Array(n*3);this.init=false;
    const P=new Float32Array(n*3),UV=[],I=[];for(let j=0;j<H;j++)for(let i=0;i<W;i++){UV.push(i/(W-1),1-j/(H-1));}
    for(let j=0;j<H-1;j++)for(let i=0;i<W-1;i++){const a=j*W+i;I.push(a,a+W,a+1,a+1,a+W,a+W+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.setIndex(I);g.computeVertexNormals();
    const c=new Float32Array(n*3);for(let j=0;j<H;j++)for(let i=0;i<W;i++){const k=(j*W+i)*3,v=lerp(.75,1,j/(H-1))*(1-((hash2(i,j)*.1)));c[k]=v;c[k+1]=v;c[k+2]=v;}
    g.setAttribute('color',new THREE.BufferAttribute(c,3));
    this.mat=new THREE.MeshStandardMaterial({color:col(0x2a3128),map:TEX.detail,vertexColors:true,roughness:.95,side:THREE.DoubleSide});
    this.mesh=new THREE.Mesh(g,this.mat);this.mesh.castShadow=true;this.mesh.receiveShadow=true;this.mesh.frustumCulled=false;scene.add(this.mesh);
    this.anc=[];for(let i=0;i<W;i++){const t=i/(W-1);this.anc.push(V3(lerp(-.16,.16,t),.47,.085+Math.abs(t-.5)*.02));}
    this.restH=[];for(let j=0;j<H;j++){this.restH.push(lerp(.32,.54,j/(H-1))/(W-1));}this.restV=.122;this.inv=new THREE.Matrix4();this.acc=0;}
  reset(){this.init=false;}
  update(dt,wind,windDir){const W=this.W,H=this.H,p=this.p,o=this.o,sp=this.rig.P.spi;sp.updateWorldMatrix(true,false);const mw=sp.matrixWorld;this.inv.copy(mw).invert();
    if(!this.init){for(let j=0;j<H;j++)for(let i=0;i<W;i++){_v1.copy(this.anc[i]);_v1.y-=j*this.restV;_v1.z+=j*.02;_v1.applyMatrix4(mw);const k=(j*W+i)*3;p[k]=o[k]=_v1.x;p[k+1]=o[k+1]=_v1.y;p[k+2]=o[k+2]=_v1.z;}this.init=true;}
    this.acc+=Math.min(dt,.05);const step=1/90;let steps=0;
    const sc=[[V3(0,.3,.03),.21],[V3(0,.08,.02),.2],[V3(0,-.12,0),.2]],scw=sc.map(s=>s[0].clone().applyMatrix4(mw));
    while(this.acc>=step&&steps<4){this.acc-=step;steps++;const t=step*step;
      for(let j=1;j<H;j++)for(let i=0;i<W;i++){const k=(j*W+i)*3;for(let a=0;a<3;a++){const v=(p[k+a]-o[k+a])*.985;o[k+a]=p[k+a];p[k+a]+=v;}
        p[k+1]-=9.8*t;const fl=Math.sin(U.time.value*3+i*.9+j*.7)*.5+.6;p[k]+=windDir.x*wind*fl*t*3;p[k+2]+=windDir.z*wind*fl*t*3;}
      for(let i=0;i<W;i++){_v1.copy(this.anc[i]).applyMatrix4(mw);p[i*3]=_v1.x;p[i*3+1]=_v1.y;p[i*3+2]=_v1.z;}
      for(let it=0;it<3;it++){
        for(let j=0;j<H;j++)for(let i=0;i<W;i++){const a=j*W+i;if(i<W-1)this.cn(a,a+1,this.restH[j],j===0);if(j<H-1)this.cn(a,a+W,this.restV,j===0);}
        for(let j=1;j<H;j++)for(let i=0;i<W;i++){const k=(j*W+i)*3;_v1.set(p[k],p[k+1],p[k+2]);
          for(let s=0;s<3;s++){const c=scw[s],r=sc[s][1]+.02;_v2.subVectors(_v1,c);const d=_v2.length();if(d<r){_v1.copy(c).addScaledVector(_v2,r/(d||1));}}
          _v2.copy(_v1).applyMatrix4(this.inv);if(_v2.z<.06+j*.004){_v2.z=.06+j*.004;_v1.copy(_v2).applyMatrix4(mw);}
          p[k]=_v1.x;p[k+1]=_v1.y;p[k+2]=_v1.z;}}}
    const pa=this.mesh.geometry.attributes.position;pa.array.set(p);pa.needsUpdate=true;this.mesh.geometry.computeVertexNormals();}
  cn(a,b,r,pinA){const p=this.p,ka=a*3,kb=b*3;const dx=p[kb]-p[ka],dy=p[kb+1]-p[ka+1],dz=p[kb+2]-p[ka+2],d=Math.sqrt(dx*dx+dy*dy+dz*dz)||1e-5,f=(d-r)/d;
    if(pinA){p[kb]-=dx*f;p[kb+1]-=dy*f;p[kb+2]-=dz*f;return;}const h=f*.5;p[ka]+=dx*h;p[ka+1]+=dy*h;p[ka+2]+=dz*h;p[kb]-=dx*h;p[kb+1]-=dy*h;p[kb+2]-=dz*h;}
}
/* ---------- wolf ---------- */
function buildWolf(mats){const root=new THREE.Group(),P={};const J=(n,par,x,y,z)=>{const g=new THREE.Group();g.position.set(x,y,z);g.rotation.order='YXZ';par.add(g);P[n]=g;return g;};
  J('body',root,0,.72,0);J('neck',P.body,0,.1,-.46);J('head',P.neck,0,.16,-.16);J('jaw',P.head,0,-.05,-.06);J('tail',P.body,0,.1,.5);J('tail2',P.tail,0,-.08,.25);
  const legs=[['fl',-.12,-.04,-.33],['fr',.12,-.04,-.33],['bl',-.12,-.02,.36],['br',.12,-.02,.36]];
  for(const[n,x,y,z]of legs){J(n,P.body,x,y,z);J(n+'2',P[n],0,-.3,0);}
  const L={};const add=(bone,mat,g,m,c,o)=>{const k=bone+'|'+mat;(L[k]=L[k]||{bone,mat,parts:[]}).parts.push(Object.assign({g,m,c:col(c)},o||{}));};
  const fur=0x3d3e40,fur2=0x2a2a2c,belly=0x77736c;const lighter=(x,y,z,c)=>{if(y<-.05)c.lerp(col(belly),clamp(-y*3,0,.7));};
  add('body','b',gCaps(.17,.21,.78,12,4),M4(0,0,.39,PI/2,0,0),fur,{cf:(x,y,z,c)=>{if(z>.0)c.lerp(col(belly),clamp(z*2.5,0,.55));}});
  add('body','b',gSph(.25,14,10),M4(0,.02,-.32,0,0,0,.9,1.05,1.1),fur,{cf:lighter});
  add('body','b',gSph(.2,10,8),M4(0,.12,-.12,0,0,0,1,.6,1.6),fur2);
  add('neck','b',gCaps(.12,.15,.26,10,3),M4(0,0,0,2.36,0,0),fur,{cf:lighter});
  add('head','b',gSph(.13,12,10),M4(0,.02,0,0,0,0,1,.9,1.15),fur);
  add('head','b',gCaps(.05,.075,.2,10,3),M4(0,-.01,-.06,PI/2-.12,0,0),fur2);
  add('head','b',gSph(.03,8,6),M4(0,.01,-.3),0x0a0a0a);
  for(const s of[-1,1]){add('head','b',gCone(.045,.13,5),M4(s*.07,.13,.03,-.15,0,s*-.25),fur2);add('head','eye',gSph(.02,8,6),M4(s*.06,.05,-.1),0xffffff);}
  add('jaw','b',gBox(.07,.03,.2),M4(0,-.005,-.1),fur2);for(const s of[-1,1])add('jaw','b',gCone(.008,.03,4),M4(s*.025,.02,-.18,PI,0,0),0xe8e0d0);
  add('tail','b',gCaps(.05,.06,.26,8,3),M4(0,0,0,-1.27,0,0),fur);add('tail2','b',gCaps(.03,.06,.26,8,3),M4(0,0,0,-1.05,0,0),fur2);
  for(const[n]of legs){const front=n[0]==='f';add(n,'b',gCaps(.055,.085,.3,8,3),M4(),fur,{cf:lighter});add(n+'2','b',gCaps(.035,.045,.32,8,3),M4(),fur2);
    add(n+'2','b',gSph(.05,8,6),M4(0,-.33,-.03,0,0,0,1,.6,1.4),fur2);}
  const meshes=skinBuild(root,P,L,mats);
  return{root,P,meshes,mats};}
/* ---------- storm spirit ---------- */
function buildSpirit(){const root=new THREE.Group(),b=new THREE.Group();b.position.y=1.35;root.add(b);
  const robeM=new THREE.MeshStandardMaterial({color:col(0x2b1d4a),emissive:new THREE.Color(.24,.12,.6),roughness:.6,transparent:true,opacity:.92,side:THREE.DoubleSide,map:TEX.detail});
  const pr=[];for(let i=0;i<=8;i++){const t=i/8;pr.push([lerp(.1,.42,Math.pow(t,1.2)),-t*1.35]);}
  const rg=gLathe(pr,16);const pa=rg.attributes.position;for(let i=0;i<pa.count;i++){const y=pa.getY(i);if(y<-1.1){const a=Math.atan2(pa.getZ(i),pa.getX(i));pa.setY(i,y+Math.abs(Math.sin(a*4))*.35);}}rg.computeVertexNormals();
  const robe=new THREE.Mesh(rg,robeM);b.add(robe);
  const hood=new THREE.Mesh(new THREE.SphereGeometry(.2,14,10,PI*1.5+.6,TAU-1.2,0,PI*.8),robeM);hood.position.y=.12;b.add(hood);
  const face=new THREE.Mesh(gSph(.15,10,8),new THREE.MeshBasicMaterial({color:0x050308}));face.position.set(0,.1,.01);b.add(face);
  const eyeM=new THREE.MeshBasicMaterial({color:new THREE.Color(2.6,1.9,4.2)});for(const s of[-1,1]){const e=new THREE.Mesh(gSph(.022,8,6),eyeM);e.position.set(s*.05,.12,-.13);b.add(e);}
  const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.11,1),new THREE.MeshBasicMaterial({color:new THREE.Color(1.6,1.0,3.6)}));core.position.set(0,-.25,-.05);b.add(core);
  const arms=[];for(const s of[-1,1]){const a=new THREE.Group();a.position.set(s*.2,-.05,0);b.add(a);const m=new THREE.Mesh(gCaps(.025,.05,.55,8,3),robeM);a.add(m);
    const cl=new THREE.Mesh(gCone(.03,.14,5),eyeM);cl.position.y=-.6;cl.rotation.x=PI;a.add(cl);arms.push(a);}
  root.traverse(o=>{if(o.isMesh)o.castShadow=false;});
  return{root,b,arms,core,robeM,eyeM};}
/* ---------- simple weapons for enemies ---------- */
function gobWeapon(kind){const g=new THREE.Group();const wood=new THREE.MeshStandardMaterial({color:col(0x4a3524),roughness:.9,map:TEX.detail,vertexColors:true});
  const rust=new THREE.MeshStandardMaterial({color:col(0x6b5444),roughness:.62,metalness:.6,vertexColors:true});
  if(kind==='bow'){const bow=new THREE.Mesh(mergeParts([{g:new THREE.TorusGeometry(.48,.018,5,18,PI*.95)}]),wood);bow.rotation.set(0,PI/2,PI/2+.08);g.add(bow);}
  else if(kind==='club'){g.add(new THREE.Mesh(mergeParts([{g:new THREE.CylinderGeometry(.03,.05,.7,6),m:M4(0,0,-.3,PI/2,0,0)}]),wood));
    const sp=[];for(let i=0;i<5;i++)sp.push({g:gCone(.014,.06,4),m:M4(Math.cos(i*1.3)*.045,Math.sin(i*1.3)*.045,-.55-i*.02,Math.sin(i*1.3)*1.4,0,-Math.cos(i*1.3)*1.4)});g.add(new THREE.Mesh(mergeParts(sp),rust));}
  else{g.add(new THREE.Mesh(mergeParts([{g:new THREE.CylinderGeometry(.018,.02,.3,6),m:M4(0,0,-.05,PI/2,0,0)}]),wood));g.add(new THREE.Mesh(mergeParts([{g:new THREE.BoxGeometry(.012,.13,.36),m:M4(0,.04,-.36)}]),rust));}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}
function trollWeapon(king){const g=new THREE.Group();const wood=new THREE.MeshStandardMaterial({color:col(0x3e2c1e),roughness:.95,map:TEX.bark,vertexColors:true});
  if(king){g.add(new THREE.Mesh(mergeParts([{g:new THREE.CylinderGeometry(.07,.08,2.2,8),m:M4(0,0,-.9,PI/2,0,0)}]),wood));
    g.add(new THREE.Mesh(mergeParts([{g:new THREE.BoxGeometry(.6,.5,.7),m:M4(0,0,-2)},{g:new THREE.BoxGeometry(.64,.54,.1),m:M4(0,0,-2),c:new THREE.Color(.5,.4,.3)}]),MAT.stoneDark));}
  else{g.add(new THREE.Mesh(mergeParts([{g:new THREE.CylinderGeometry(.09,.24,1.9,8,4),m:M4(0,0,-1,PI/2,0,0)}]),wood));
    const st=[];for(let i=0;i<7;i++){const a=i*1.7;st.push({g:new THREE.DodecahedronGeometry(.09,0),m:M4(Math.cos(a)*.2,Math.sin(a)*.2,-1.4-i*.08)});}g.add(new THREE.Mesh(mergeParts(st),MAT.stoneDark));}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}
