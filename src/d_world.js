/* ============================== world layout ============================== */
const WR=DEMO?DEMO.wr:170;
const TSZ=DEMO?DEMO.tsz:480,TSEG=isTouch?192:288,TN=TSEG+1,TSTEP=TSZ/TSEG,THALF=TSZ/2;
const LAKE=DEMO?DEMO.lake:{x:30,z:40,r:18};let WATER_Y=0;
const CAMPS=DEMO?DEMO.camps:[
  {x:62,z:-46,name:'Accampamento del Fango',boss:'Gruk il Fangoso',tier:0},
  {x:-94,z:48,name:'Rupe dei Teschi',boss:'Morva Spaccaossa',tier:1},
  {x:46,z:120,name:'Fossa Nera',boss:"Thrak l'Insonne",tier:2},
  {x:-112,z:-112,name:'Trono del Re Troll',boss:'Re Ogrul',tier:3}];
const SHRINES=(DEMO?DEMO.shrines.map(s=>[s.x,s.z,s.name]):[[0,0,"Santuario dell'Alba"],[34,-20,'Pietra del Guado'],[90,-84,'Altare Spezzato'],[-40,10,'Cerchio dei Corvi'],[-70,-52,'Fonte Cinerea'],
  [-22,-82,'Arco del Vento'],[104,22,'Santuario del Lupo'],[6,74,'Riva Silente'],[-128,8,'Guglia Grigia'],[-118,80,'Tomba del Re'],
  [84,118,'Lanterna Muta'],[-78,-100,'Soglia del Trono'],[-48,-140,'Ultimo Lume'],[140,-30,'Santuario Orientale']]).map((s,i)=>({x:s[0],z:s[1],name:s[2],id:i}));
const RUINS=DEMO?[]:[{t:'tower',x:-34,z:-34,r:8},{t:'arch',x:74,z:8,r:5},{t:'arch',x:-84,z:88,r:5},{t:'circle',x:-4,z:-114,r:11},{t:'statue',x:-56,z:-22,r:5},{t:'wall',x:118,z:60,r:6},{t:'wall',x:-10,z:40,r:5}];
const PATHS=DEMO?DEMO.paths:[[[0,0],[34,-20],[62,-46]],[[0,0],[-40,10],[-94,48]],[[0,0],[4,34],[6,74],[46,120]],[[-40,10],[-70,-52],[-78,-100],[-112,-112]],
  [[34,-20],[104,22],[140,-30]],[[34,-20],[90,-84]],[[-70,-52],[-22,-82],[-48,-140]],[[-40,10],[-128,8],[-118,80]],[[6,74],[84,118]],[[104,22],[118,60]]];
const PSEG=[];
function buildPaths(){for(const p of PATHS){const pts=[];
  for(let i=0;i<p.length-1;i++){const[ax,az]=p[i],[bx,bz]=p[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(2,Math.ceil(L/4)),nx=-(bz-az)/L,nz=(bx-ax)/L;
    for(let k=0;k<n;k++){const t=k/n,w=(vnoise(ax*.13+t*3.7+i*5,az*.13+t)-.5)*5*Math.sin(t*PI);pts.push([lerp(ax,bx,t)+nx*w,lerp(az,bz,t)+nz*w]);}}
  pts.push(p[p.length-1]);for(let i=0;i<pts.length-1;i++)PSEG.push([pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1]]);}}
function pathDist(x,z){let b=1e9;for(const s of PSEG){const dx=s[2]-s[0],dz=s[3]-s[1],l2=dx*dx+dz*dz;let t=((x-s[0])*dx+(z-s[1])*dz)/l2;t=t<0?0:t>1?1:t;
  const ex=s[0]+dx*t-x,ez=s[1]+dz*t-z,d=ex*ex+ez*ez;if(d<b)b=d;}return Math.sqrt(b);}

/* ---------- height ---------- */
function H0(x,z){if(DEMO)return DEMO.h0(x,z);const r=Math.hypot(x,z);
  let h=(fbm(x*.0072+3.1,z*.0072-1.7,4)-.5)*30;
  h+=(fbm(x*.027+50,z*.027-20,3)-.5)*6;
  const rg=1-Math.abs(fbm(x*.011-30,z*.011+70,3)*2-1);h+=rg*rg*7;
  if(r>WR-16){const t=(r-(WR-16))/42;h+=Math.min(Math.pow(t,1.45),2.4)*34+(fbm(x*.021,z*.021,3)-.35)*Math.min(t,2)*24;}
  return h;}
function Hb(x,z){let h=H0(x,z);const ld=Math.hypot(x-LAKE.x,z-LAKE.z),t=ld/LAKE.r;
  if(t<1.9){const prof=t<1?WATER_Y-.4-3.4*(1-t*t):WATER_Y-.4+(t-1)*4.6;h=lerp(h,Math.min(h,prof),sstep(1.9,1.05,t));}
  return h;}
const FLATS=[];
function H(x,z){let h=Hb(x,z);for(const f of FLATS){const dx=x-f.x,dz=z-f.z,d2=dx*dx+dz*dz,R=f.r*1.9;
  if(d2<R*R){const d=Math.sqrt(d2),t=d<f.r?1:1-(d-f.r)/(R-f.r),s=t*t*(3-2*t);h+=(f.h-h)*s;}}return h;}
function setupFlats(){
  let mn=1e9;for(let i=0;i<48;i++){const a=i/48*TAU;for(const k of[1.05,1.25,1.45])mn=Math.min(mn,H0(LAKE.x+Math.cos(a)*LAKE.r*k,LAKE.z+Math.sin(a)*LAKE.r*k));}
  WATER_Y=Math.min(mn-.45,H0(LAKE.x,LAKE.z)-.4);
  if(DEMO)return;
  const add=(x,z,r)=>FLATS.push({x,z,r,h:Hb(x,z)});
  add(0,0,9);CAMPS.forEach(c=>add(c.x,c.z,17));SHRINES.forEach(s=>add(s.x,s.z,6.5));RUINS.forEach(r=>add(r.x,r.z,r.r));}

/* ---------- terrain grids ---------- */
const HG=new Float32Array(TN*TN),NYG=new Float32Array(TN*TN),PDG=new Float32Array(TN*TN),SPG=new Float32Array(TN*TN*4);
const forestD=(x,z)=>fbm(x*.0125+120,z*.0125-40,3);
function gIdx(x,z){let ix=Math.round((x+THALF)/TSTEP),iz=Math.round((z+THALF)/TSTEP);ix=ix<0?0:ix>TSEG?TSEG:ix;iz=iz<0?0:iz>TSEG?TSEG:iz;return iz*TN+ix;}
function gH(x,z){const fx=(x+THALF)/TSTEP,fz=(z+THALF)/TSTEP;let ix=Math.floor(fx),iz=Math.floor(fz);
  if(ix<0)ix=0;else if(ix>TSEG-1)ix=TSEG-1;if(iz<0)iz=0;else if(iz>TSEG-1)iz=TSEG-1;
  const tx=clamp(fx-ix,0,1),tz=clamp(fz-iz,0,1),i=iz*TN+ix;const ha=HG[i],hb=HG[i+1],hc=HG[i+TN],hd=HG[i+TN+1];
  return tx+tz<=1?ha+(hb-ha)*tx+(hc-ha)*tz:hd+(hc-hd)*(1-tx)+(hb-hd)*(1-tz);}
function gNrm(x,z,o){const e=.8;o.set(gH(x-e,z)-gH(x+e,z),2*e,gH(x,z-e)-gH(x,z+e)).normalize();return o;}
function splatCalc(x,z,h,ny,pd){if(DEMO)return demoSplat(x,z,h,ny,pd);
  const fd=forestD(x,z);let m=sstep(.47,.6,fd);const g=1-m;
  let d=sstep(.62,.74,fbm(x*.045+11,z*.045-7,2))*.55;
  d=Math.max(d,1-sstep(1.0,2.5,pd+(vnoise(x*.4,z*.4)-.5)*.9));
  for(const c of CAMPS){const dc=Math.hypot(x-c.x,z-c.z);if(dc<21)d=Math.max(d,(1-sstep(9,21,dc+(vnoise(x*.3,z*.3)-.5)*4))*.97);}
  for(const s of SHRINES){const ds=Math.hypot(x-s.x,z-s.z);if(ds<8)d=Math.max(d,(1-sstep(4.5,8,ds))*.6);}
  for(const r of RUINS){const ds=Math.hypot(x-r.x,z-r.z);if(ds<r.r+3)d=Math.max(d,(1-sstep(r.r*.5,r.r+3,ds))*.45);}
  const ld=Math.hypot(x-LAKE.x,z-LAKE.z);if(ld<LAKE.r*1.6)d=Math.max(d,(1-sstep(WATER_Y+.15,WATER_Y+1.3,h))*.95);
  let r=sstep(.84,.68,ny);r=Math.max(r,sstep(26,38,h));
  const rest=1-r;d=Math.min(d,1)*rest;const gm=(1-d)*rest;return[g*gm,m*gm,d,r];}
let terrain=null;
function terrainMaterial(){
  const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.97,metalness:0});
  m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{tG:{value:TEX.grass},tD:{value:DEMO?TEXD.cobble:TEX.dirt},tR:{value:TEX.rock},tM:{value:TEX.moss},uWet:U.wet});
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 splat;\nvarying vec4 vSplat;\nvarying vec3 vTW;\nvarying vec3 vTN;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvSplat=splat;\nvTW=(modelMatrix*vec4(transformed,1.0)).xyz;\nvTN=normal;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D tG;\nuniform sampler2D tD;\nuniform sampler2D tR;\nuniform sampler2D tM;\nuniform float uWet;\nvarying vec4 vSplat;\nvarying vec3 vTW;\nvarying vec3 vTN;')
      .replace('#include <map_fragment>',`
        vec2 tuv=vTW.xz;
        vec3 cG=mix(texture2D(tG,tuv*0.21).rgb,texture2D(tG,tuv*0.051+0.37).rgb,0.38);${DEMO?'cG=mix(vec3(dot(cG,vec3(0.36,0.42,0.22))),cG,0.42)*vec3(0.8,0.78,0.68);':''}
        vec3 cM=texture2D(tM,tuv*0.19).rgb;
        vec3 cD=mix(texture2D(tD,tuv*0.17).rgb,texture2D(tD,tuv*0.043+0.61).rgb,0.3);
        vec3 an=abs(normalize(vTN));an=pow(an,vec3(3.0));an/=(an.x+an.y+an.z);
        vec3 cR=(texture2D(tR,vTW.zy*0.085).rgb*an.x+texture2D(tR,tuv*0.085).rgb*an.y+texture2D(tR,vTW.xy*0.085).rgb*an.z)*0.86;${DEMO?'cR=mix(vec3(dot(cR,vec3(0.3,0.5,0.2))),cR,0.35)*0.9;':''}
        float macro=texture2D(tM,tuv*0.0105).g;
        vec4 w=vSplat*vec4(0.55+cG.g*2.2,0.55+cM.g*2.4,0.35+cD.r*1.9,0.35+cR.r*1.6);
        w=w*w*w*w;
        vec3 alb=(cG*w.x+cM*w.y+cD*w.z+cR*w.w)/max(w.x+w.y+w.z+w.w,1e-5);
        alb=pow(alb,vec3(2.2))*(0.68+macro*0.62);
        float wsum=max(w.x+w.y+w.z+w.w,1e-5);float wetMask=clamp((w.z+w.w*0.8+w.y*0.4)/wsum+0.25,0.0,1.0);
        diffuseColor.rgb*=alb*(1.0-uWet*0.42*wetMask);`)
      .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.26,uWet*wetMask*0.9);');
  };
  return m;}
function buildTerrain(){
  const n=TN*TN,pos=new Float32Array(n*3),nor=new Float32Array(n*3),spl=new Float32Array(n*4);
  for(let iz=0;iz<TN;iz++)for(let ix=0;ix<TN;ix++){const i=iz*TN+ix,x=-THALF+ix*TSTEP,z=-THALF+iz*TSTEP,h=H(x,z);HG[i]=h;pos[i*3]=x;pos[i*3+1]=h;pos[i*3+2]=z;}
  for(let iz=0;iz<TN;iz++)for(let ix=0;ix<TN;ix++){const i=iz*TN+ix,l=HG[iz*TN+Math.max(0,ix-1)],r=HG[iz*TN+Math.min(TSEG,ix+1)],u=HG[Math.max(0,iz-1)*TN+ix],d=HG[Math.min(TSEG,iz+1)*TN+ix];
    _v1.set(l-r,2*TSTEP,u-d).normalize();nor[i*3]=_v1.x;nor[i*3+1]=_v1.y;nor[i*3+2]=_v1.z;NYG[i]=_v1.y;}
  for(let iz=0;iz<TN;iz++)for(let ix=0;ix<TN;ix++){const i=iz*TN+ix,x=-THALF+ix*TSTEP,z=-THALF+iz*TSTEP;const r=Math.hypot(x,z);
    const pd=r<WR+10?pathDist(x,z):99;PDG[i]=pd;const s=splatCalc(x,z,HG[i],NYG[i],pd);spl.set(s,i*4);SPG.set(s,i*4);}
  const idx=new Uint32Array(TSEG*TSEG*6);let k=0;
  for(let iz=0;iz<TSEG;iz++)for(let ix=0;ix<TSEG;ix++){const a=iz*TN+ix,b=a+1,c=a+TN,d=c+1;idx[k++]=a;idx[k++]=c;idx[k++]=b;idx[k++]=b;idx[k++]=c;idx[k++]=d;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));
  g.setAttribute('splat',new THREE.BufferAttribute(spl,4));g.setIndex(new THREE.BufferAttribute(idx,1));g.computeBoundingSphere();
  terrain=new THREE.Mesh(g,terrainMaterial());terrain.receiveShadow=true;terrain.castShadow=true;scene.add(terrain);
}
function splatAt(x,z){const i=gIdx(x,z)*4;return[SPG[i],SPG[i+1],SPG[i+2],SPG[i+3]];}
function pdAt(x,z){return PDG[gIdx(x,z)];}
function nyAt(x,z){return NYG[gIdx(x,z)];}

/* ---------- distant mountain silhouettes ---------- */
const MTN=[];
function buildMountains(){if(DEMO)return;
  [[305,22,95,1],[400,55,165,2]].forEach(([R,h0,h1,sd],li)=>{const seg=220,P=[],I=[];
    for(let i=0;i<=seg;i++){const a=i/seg*TAU,n=fbm(Math.cos(a)*2.6+sd*10,Math.sin(a)*2.6+sd*7,5),ridge=1-Math.abs(fbm(Math.cos(a)*7+sd,Math.sin(a)*7,3)*2-1);
      const h=lerp(h0,h1,Math.pow(n,1.4))+ridge*12;P.push(Math.cos(a)*R,-40,Math.sin(a)*R,Math.cos(a)*R,h,Math.sin(a)*R);}
    for(let i=0;i<seg;i++){const a=i*2;I.push(a,a+2,a+1,a+1,a+2,a+3);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);
    const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x445,fog:false,side:THREE.DoubleSide}));m.renderOrder=-5;m.frustumCulled=false;scene.add(m);MTN.push({m,k:li?0.3:0.5});});
}
const MTN_DARK=col(0x1d232b);
function updMountains(){for(const o of MTN){o.m.material.color.copy(scene.fog.color).lerp(MTN_DARK,o.k);o.m.position.set(camera.position.x,0,camera.position.z);}}

/* ---------- water ---------- */
let water=null;
function buildWater(){
  const S=LAKE.r*2.5,g=new THREE.PlaneGeometry(S,S,72,72);g.rotateX(-PI/2);
  const pa=g.attributes.position,dep=new Float32Array(pa.count);
  for(let i=0;i<pa.count;i++){const x=pa.getX(i)+LAKE.x,z=pa.getZ(i)+LAKE.z;dep[i]=WATER_Y-H(x,z);}
  g.setAttribute('depth',new THREE.BufferAttribute(dep,1));
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:Object.assign({uTime:U.time,uRain:U.storm,uSunDir:{value:SUN_DIR},uSunCol:skyU.uSunCol,uHor:skyU.uHorizon,uZen:skyU.uZenith,uDeep:{value:col(0x0c1512)},uFlash:skyU.uFlash},FOGU),
    vertexShader:`attribute float depth;varying float vDep;varying vec3 vW;void main(){vDep=depth;vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
    fragmentShader:`uniform float uTime,uRain,uFlash;uniform vec3 uSunDir,uSunCol,uHor,uZen,uDeep;varying float vDep;varying vec3 vW;${FOG_GLSL}
      float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n2(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);return mix(mix(hs(i),hs(i+vec2(1.,0.)),u.x),mix(hs(i+vec2(0.,1.)),hs(i+vec2(1.,1.)),u.x),u.y);}
      void main(){vec2 p=vW.xz;float t=uTime;vec2 g=vec2(cos(p.x*0.9+t*1.1)+cos(p.x*0.6+p.y*0.4+t*0.7),cos(p.y*0.7+t*0.9)+cos(p.y*1.3-p.x*0.5-t*0.8))*0.03;
        float e=0.12,q=n2(p*1.6+t*0.25),qx=n2(p*1.6+vec2(e,0.0)+t*0.25),qy=n2(p*1.6+vec2(0.0,e)+t*0.25);g+=vec2(qx-q,qy-q)/e*0.05;
        float q2=n2(p*4.0-t*0.6),q2x=n2(p*4.0+vec2(e,0.0)-t*0.6),q2y=n2(p*4.0+vec2(0.0,e)-t*0.6);g+=vec2(q2x-q2,q2y-q2)/e*0.02*(1.0+uRain*2.0);
        if(uRain>0.02){vec2 c=floor(p*1.4),f=fract(p*1.4)-0.5;float rn=hs(c);float tt=fract(t*1.1+rn);vec2 o=(vec2(hs(c+1.3),hs(c+7.1))-0.5)*0.5;float r=length(f-o);
          g+=normalize(f-o+1e-4)*sin((r-tt*0.55)*42.0)*exp(-r*7.0)*(1.0-tt)*0.45*uRain;}
        vec3 N=normalize(vec3(-g.x,1.0,-g.y));vec3 V=normalize(cameraPosition-vW);
        float fr=0.02+0.98*pow(1.0-max(dot(N,V),0.0),5.0);vec3 R=reflect(-V,N);
        vec3 sky=mix(uHor,uZen,pow(clamp(R.y,0.0,1.0),0.5))*0.9+uFlash*vec3(0.7,0.7,1.0);
        float sd=max(dot(R,uSunDir),0.0);vec3 spec=uSunCol*(pow(sd,220.0)*5.0+pow(sd,14.0)*0.12)*(1.0-uRain*0.8);
        float shore=smoothstep(0.0,2.2,vDep);
        vec3 deep=mix(uDeep*2.2,uDeep,shore);
        vec3 c=mix(deep,sky,fr)+spec;
        float foam=(1.0-smoothstep(0.0,0.3,vDep))*smoothstep(0.42,0.72,n2(p*3.0+t*0.35));
        c=mix(c,vec3(0.42,0.44,0.42),foam*0.45);
        float a=clamp(smoothstep(-0.02,0.9,vDep)*0.9+fr*0.1,0.0,0.96);
        gl_FragColor=vec4(applyFog(c,vW),a);}`});
  water=new THREE.Mesh(g,m);water.position.set(LAKE.x,WATER_Y,LAKE.z);water.renderOrder=2;scene.add(water);
}

/* ---------- colliders: circles, capsule walls, box outlines, raised floors, lake shore ----------
   Everything lives in a spatial hash; bodies are resolved as circles with sub-stepping so they slide
   along walls instead of snagging, and their velocity loses only the component that points into the wall. */
const CG=new Map(),CGS=6;let CQ=0;
const cgk=(i,j)=>(i+600)*1200+j+600;
function cgAdd(c,x0,z0,x1,z1){const i0=Math.floor(x0/CGS),i1=Math.floor(x1/CGS),j0=Math.floor(z0/CGS),j1=Math.floor(z1/CGS);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const k=cgk(i,j);let a=CG.get(k);if(!a){a=[];CG.set(k,a);}a.push(c);}return c;}
function addCol(x,z,r,h=4){return cgAdd({s:0,x,z,r,h,q:0},x-r,z-r,x+r,z+r);}
function addSeg(ax,az,bx,bz,r,h=4){const dx=bx-ax,dz=bz-az;
  return cgAdd({s:1,ax,az,bx,bz,dx,dz,L2:Math.max(1e-6,dx*dx+dz*dz),r,h,q:0},Math.min(ax,bx)-r,Math.min(az,bz)-r,Math.max(ax,bx)+r,Math.max(az,bz)+r);}
// oriented box footprint (same yaw convention as M4 rotation.y) as four thin walls
function addBox(x,z,w,d,yaw,h=4){const r=.06,c=Math.cos(yaw),s=Math.sin(yaw),hw=Math.max(.01,w/2-r),hd=Math.max(.01,d/2-r);
  const P=[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([u,v])=>[x+u*c+v*s,z-u*s+v*c]);
  for(let i=0;i<4;i++){const a=P[i],b=P[(i+1)%4];addSeg(a[0],a[1],b[0],b[1],r,h);}}
// chain of walls along an arc (palisades, ruined towers)
function addArc(cx,cz,R,a0,a1,r,h,step=.22){const n=Math.max(1,Math.ceil(Math.abs(a1-a0)/step));let px=cx+Math.cos(a0)*R,pz=cz+Math.sin(a0)*R;
  for(let i=1;i<=n;i++){const a=a0+(a1-a0)*i/n,x=cx+Math.cos(a)*R,z=cz+Math.sin(a)*R;addSeg(px,pz,x,z,r,h);px=x;pz=z;}}
const _cq=[];
function colQuery(x,z,r){CQ++;_cq.length=0;const i0=Math.floor((x-r)/CGS),i1=Math.floor((x+r)/CGS),j0=Math.floor((z-r)/CGS),j1=Math.floor((z+r)/CGS);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const a=CG.get(cgk(i,j));if(!a)continue;for(let q=0;q<a.length;q++){const c=a[q];if(c.q===CQ)continue;c.q=CQ;_cq.push(c);}}return _cq;}
/* lake: deep water acts as a smooth curved wall; shallow water slows (see wadeDepth) */
const SHORE=new Float32Array(96);let shoreOK=false;
function initShore(){for(let i=0;i<96;i++){const a=i/96*TAU,ca=Math.cos(a),sa=Math.sin(a);let r=0;
    for(;r<LAKE.r*1.7;r+=.2){if(WATER_Y-gH(LAKE.x+ca*r,LAKE.z+sa*r)<CFG.move.wadeDeep)break;}SHORE[i]=r;}shoreOK=true;}
function shoreR(a){const f=((a/TAU)%1+1)%1*96,i=Math.floor(f),t=f-i;return lerp(SHORE[i%96],SHORE[(i+1)%96],t);}
function wadeDepth(x,z){if(Math.abs(x-LAKE.x)>LAKE.r*1.8||Math.abs(z-LAKE.z)>LAKE.r*1.8)return 0;return Math.max(0,WATER_Y-gH(x,z));}
const COLN={x:0,z:0,n:0};
function collide(p,r,noWater){COLN.x=0;COLN.z=0;COLN.n=0;
  for(let it=0;it<4;it++){const L=colQuery(p.x,p.z,r+.02);let any=false;
    for(let q=0;q<L.length;q++){const c=L[q];let cx,cz;
      if(c.s){let t=((p.x-c.ax)*c.dx+(p.z-c.az)*c.dz)/c.L2;t=t<0?0:t>1?1:t;cx=c.ax+c.dx*t;cz=c.az+c.dz*t;}else{cx=c.x;cz=c.z;}
      const dx=p.x-cx,dz=p.z-cz,m=r+c.r,d2=dx*dx+dz*dz;if(d2>=m*m)continue;
      const d=Math.sqrt(d2);let nx=1,nz=0;if(d>1e-6){nx=dx/d;nz=dz/d;}const pen=m-d;p.x+=nx*pen;p.z+=nz*pen;COLN.x+=nx*pen;COLN.z+=nz*pen;COLN.n++;any=true;}
    if(!any)break;}
  if(!noWater&&shoreOK){const lx=p.x-LAKE.x,lz=p.z-LAKE.z,ld=Math.hypot(lx,lz);if(ld<LAKE.r*1.7&&ld>1e-4){const rw=shoreR(Math.atan2(lz,lx))+r*.35;
      if(ld<rw){const pen=rw-ld,nx=lx/ld,nz=lz/ld;p.x+=nx*pen;p.z+=nz*pen;COLN.x+=nx*pen;COLN.z+=nz*pen;COLN.n++;}}}
  const pr=Math.hypot(p.x,p.z),lim=WR+6;if(pr>lim){const pen=pr-lim,nx=-p.x/pr,nz=-p.z/pr;p.x+=nx*pen;p.z+=nz*pen;COLN.x+=nx*pen;COLN.z+=nz*pen;COLN.n++;}
  return COLN.n>0;}
// move a body by (mx,mz) with sub-steps; optional velocity v loses only its into-wall component
function moveBody(p,mx,mz,r,v,noWater){const L=Math.hypot(mx,mz),n=Math.min(12,Math.max(1,Math.ceil(L/(r*.7))));let hn=0,hx=0,hz=0;
  for(let i=0;i<n;i++){p.x+=mx/n;p.z+=mz/n;if(collide(p,r,noWater)){hn+=COLN.n;hx+=COLN.x;hz+=COLN.z;}}
  if(!hn&&L<1e-6&&collide(p,r,noWater)){hn=COLN.n;hx=COLN.x;hz=COLN.z;}
  COLN.x=hx;COLN.z=hz;COLN.n=hn;
  if(hn&&v){const l=Math.hypot(hx,hz);if(l>1e-6){const nx=hx/l,nz=hz/l,vn=v.x*nx+v.z*nz;if(vn<0){v.x-=nx*vn;v.z-=nz*vn;}}}
  return hn>0;}
/* raised walkable floors (shrine platforms): bodies stand on top instead of sinking into the stone */
const FLOORS=[];
function addFloor(x,z,r,y){FLOORS.push({x,z,r2:r*r,y});}
// floors are discs at one height, or (s:1, the demo's bridge and cliff stairs) strips from a to b, sloping from ya to ya+dy
function gY(x,z){let h=gH(x,z);for(let i=0;i<FLOORS.length;i++){const f=FLOORS[i],dx=x-f.x,dz=z-f.z;if(f.y<=h||dx*dx+dz*dz>=f.r2)continue;
    if(!f.s){h=f.y;continue;}let t=((x-f.ax)*f.dx+(z-f.az)*f.dz)/f.L2;if(t<0||t>1)continue;const ex=f.ax+f.dx*t-x,ez=f.az+f.dz*t-z;if(ex*ex+ez*ez<f.hw*f.hw){const y=f.ya+f.dy*t;if(y>h)h=y;}}return h;}
/* camera / line-of-sight ray against tall colliders; returns first hit fraction (1 = clear) */
function rayCircle(ax,az,dx,dz,L2,cx,cz,R){const fx=ax-cx,fz=az-cz,cc=fx*fx+fz*fz-R*R;if(cc<0)return 9;const b=fx*dx+fz*dz,disc=b*b-L2*cc;if(disc<0)return 9;const t=(-b-Math.sqrt(disc))/L2;return t>=0?t:9;}
function rayCapsule(ax,az,dx,dz,L2,c,R){
  let u=((ax-c.ax)*c.dx+(az-c.az)*c.dz)/c.L2;u=u<0?0:u>1?1:u;const qx=ax-(c.ax+c.dx*u),qz=az-(c.az+c.dz*u);if(qx*qx+qz*qz<R*R)return 9;
  let best=Math.min(rayCircle(ax,az,dx,dz,L2,c.ax,c.az,R),rayCircle(ax,az,dx,dz,L2,c.bx,c.bz,R));
  const l=Math.sqrt(c.L2),nx=-c.dz/l,nz=c.dx/l,dn=dx*nx+dz*nz;
  if(Math.abs(dn)>1e-7){const a0=(ax-c.ax)*nx+(az-c.az)*nz;for(let s=-1;s<=1;s+=2){const t=(s*R-a0)/dn;if(t>=0&&t<best){const px=ax+dx*t-c.ax,pz=az+dz*t-c.az,w=(px*c.dx+pz*c.dz)/c.L2;if(w>=0&&w<=1)best=t;}}}
  return best;}
function rayCols(ax,az,bx,bz,r,minH=2){let best=1;const dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz;if(L2<1e-6)return 1;
  CQ++;const i0=Math.floor((Math.min(ax,bx)-r-1)/CGS),i1=Math.floor((Math.max(ax,bx)+r+1)/CGS),j0=Math.floor((Math.min(az,bz)-r-1)/CGS),j1=Math.floor((Math.max(az,bz)+r+1)/CGS);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const a=CG.get(cgk(i,j));if(!a)continue;
    for(let q=0;q<a.length;q++){const c=a[q];if(c.q===CQ)continue;c.q=CQ;if(c.h<minH)continue;
      const t=c.s?rayCapsule(ax,az,dx,dz,L2,c,c.r+r):rayCircle(ax,az,dx,dz,L2,c.x,c.z,c.r+r);if(t<best)best=t;}}
  return best;}
const OCC=new Uint8Array(240*240);
const occK=(x,z)=>{const ix=Math.floor((x+240)/2),iz=Math.floor((z+240)/2);return(ix<0||iz<0||ix>=240||iz>=240)?-1:iz*240+ix;};
function occFree(x,z,r){const c=Math.ceil(r/2);const ix=Math.floor((x+240)/2),iz=Math.floor((z+240)/2);
  for(let i=-c;i<=c;i++)for(let j=-c;j<=c;j++){const a=ix+i,b=iz+j;if(a<0||b<0||a>=240||b>=240)continue;if(OCC[b*240+a])return false;}return true;}
function occMark(x,z){const k=occK(x,z);if(k>=0)OCC[k]=1;}
function nearStruct(x,z,pad){if(Math.hypot(x,z)<11+pad)return true;
  for(const c of CAMPS)if(Math.hypot(x-c.x,z-c.z)<16+pad)return true;
  for(const s of SHRINES)if(Math.hypot(x-s.x,z-s.z)<6+pad)return true;
  for(const r of RUINS)if(Math.hypot(x-r.x,z-r.z)<r.r+pad)return true;
  if(Math.hypot(x-LAKE.x,z-LAKE.z)<LAKE.r*1.15+pad*.5)return true;return false;}

/* ---------- vegetation geometry ---------- */
function coniferGeo(o){
  const trunk=new THREE.CylinderGeometry(o.tr*.28,o.tr,o.H,8,6,true);trunk.translate(0,o.H/2,0);
  const tp=trunk.attributes.position;for(let i=0;i<tp.count;i++){const y=tp.getY(i);if(y<.9){const k=1-y/.9,a=Math.atan2(tp.getZ(i),tp.getX(i)),f=1+k*k*(.7+.4*Math.sin(a*5));tp.setX(i,tp.getX(i)*f);tp.setZ(i,tp.getZ(i)*f);}}
  trunk.computeVertexNormals();
  const tcol=new THREE.BufferAttribute(new Float32Array(tp.count*3),3);for(let i=0;i<tp.count;i++){const y=tp.getY(i),c=lerp(.55,1,Math.min(1,y/3));tcol.setXYZ(i,c,c,c);}trunk.setAttribute('color',tcol);
  const uv=trunk.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,uv.getY(i)*o.H/3);
  const P=[],N=[],UV=[],C=[],I=[];
  for(let t=0;t<o.tiers;t++){const k=t/(o.tiers-1),y=lerp(o.c0,o.c1,k),R=lerp(o.R0,o.R1,Math.pow(k,.85))*sr(.85,1.12),nb=Math.round(lerp(o.nb0,o.nb1,k)),off=sr(0,TAU);
    for(let b=0;b<nb;b++){const a=off+b/nb*TAU+sr(-.25,.25),droop=lerp(o.d0,o.d1,k)+sr(-.08,.1),L=R*sr(.85,1.12),w=L*.5,hue=sr(.88,1.1);
      for(let cd=0;cd<3;cd++){const roll=cd*PI/3+sr(-.2,.2),cr=Math.cos(roll),sn=Math.sin(roll),cdr=Math.cos(droop),sdr=Math.sin(droop),ca=Math.cos(a),sa=Math.sin(a),base=P.length/3;
        for(const[cu,cv]of[[0,-1],[1,-1],[1,1],[0,1]]){const lx=cu*L,ly=0,lz=cv*w*.5;const ry=ly*cr-lz*sn,rz=ly*sn+lz*cr;
          let dx=lx*cdr+ry*sdr,dy=-lx*sdr+ry*cdr;dy-=cu*cu*L*.13;const wx=dx*ca+rz*sa+ca*o.tr*.3,wz=-dx*sa+rz*ca-sa*o.tr*.3;
          P.push(wx,y+dy,wz);_v1.set(wx*.9,.8+cu*.2+(dy>0?.3:0),wz*.9).normalize();N.push(_v1.x,_v1.y,_v1.z);UV.push(cu,(cv+1)/2);
          const ao=lerp(.42,1,cu)*lerp(.62,1.05,k)*hue;C.push(ao*.92,ao,ao*.9);}
        I.push(base,base+1,base+2,base,base+2,base+3);}}}
  for(let s=0;s<2;s++){const base=P.length/3,a=s*PI/2,ca=Math.cos(a),sa=Math.sin(a),y=o.c1-.3,h=1.8,w=.42;
    for(const[cu,cv]of[[0,-1],[1,-1],[1,1],[0,1]]){P.push(ca*cv*w,y+cu*h,-sa*cv*w);N.push(0,1,0);UV.push(cu,(cv+1)/2);C.push(1,1.05,1);}I.push(base,base+1,base+2,base,base+2,base+3);}
  return{trunk,leaves:rawGeo(P,N,UV,C,I)};}
function oakGeo(){
  const parts=[];const tr=new THREE.CylinderGeometry(.28,.5,5,9,5,true);tr.translate(0,2.5,0);const tp=tr.attributes.position;
  for(let i=0;i<tp.count;i++){const y=tp.getY(i);tp.setX(i,tp.getX(i)+Math.sin(y*.8)*.18);}tr.computeVertexNormals();parts.push({g:tr,vs:2});
  const ends=[];for(let i=0;i<5;i++){const a=i/5*TAU+sr(-.3,.3),L=sr(2.2,3.4),y0=sr(3.6,4.6),ex=Math.cos(a)*L,ez=Math.sin(a)*L,ey=y0+sr(1.4,2.4);
    parts.push({g:geo('unitCyl',()=>new THREE.CylinderGeometry(.6,1,1,6,1,true)),m:segM(0,y0,0,ex,ey,ez,.16)});ends.push([ex,ey,ez]);}
  ends.push([0,7,0]);
  const trunk=mergeParts(parts);
  const P=[],N=[],UV=[],C=[],I=[];const cy=5.8;
  for(const[ex,ey,ez]of ends){for(let k=0;k<9;k++){const cx=ex+sr(-1,1),cyy=ey+sr(-.6,.9),cz=ez+sr(-1,1),s=sr(1.6,2.4);
      _q.setFromEuler(_e.set(sr(0,TAU),sr(0,TAU),sr(0,TAU)));const base=P.length/3;
      for(const[cu,cv]of[[-1,-1],[1,-1],[1,1],[-1,1]]){_v1.set(cu*s,cv*s,0).applyQuaternion(_q);const px=cx+_v1.x,py=cyy+_v1.y,pz=cz+_v1.z;P.push(px,py,pz);
        _v2.set(px,py-cy,pz).normalize();_v2.y+=.35;_v2.normalize();N.push(_v2.x,_v2.y,_v2.z);UV.push((cu+1)/2,(cv+1)/2);const ao=lerp(.5,1.05,inv(cy-2.5,cy+3,py));C.push(ao,ao,ao*.9);}
      I.push(base,base+1,base+2,base,base+2,base+3);}}
  return{trunk,leaves:rawGeo(P,N,UV,C,I)};}
function deadGeo(){const parts=[];const tr=new THREE.CylinderGeometry(.12,.36,8.5,8,5,true);tr.translate(0,4.25,0);
  const tp=tr.attributes.position;for(let i=0;i<tp.count;i++){const y=tp.getY(i);tp.setX(i,tp.getX(i)+Math.sin(y*.6)*.22);if(y>8.2)tp.setY(i,y-hash2(i,7)*1.2);}tr.computeVertexNormals();parts.push({g:tr,vs:2.5,c:new THREE.Color(.8,.78,.76)});
  for(let i=0;i<7;i++){const a=sr(0,TAU),y0=sr(2.8,7.4),L=sr(1.2,3)*(1-y0/12),ex=Math.cos(a)*L,ez=Math.sin(a)*L,ey=y0+L*sr(.5,1.1);
    parts.push({g:geo('unitCyl',()=>new THREE.CylinderGeometry(.6,1,1,6,1,true)),m:segM(0,y0,0,ex,ey,ez,.07),c:new THREE.Color(.8,.78,.76)});
    parts.push({g:geo('unitCyl',()=>new THREE.CylinderGeometry(.6,1,1,6,1,true)),m:segM(ex,ey,ez,ex*1.4+sr(-.4,.4),ey+sr(.3,.9),ez*1.4+sr(-.4,.4),.035),c:new THREE.Color(.8,.78,.76)});}
  return mergeParts(parts);}
function fernGeo(){const P=[],N=[],UV=[],C=[],I=[];const nf=8;
  for(let f=0;f<nf;f++){const a=f/nf*TAU+sr(-.2,.2),L=sr(.9,1.35),w=.3,ca=Math.cos(a),sa=Math.sin(a),seg=4,base=P.length/3,lift=sr(.5,.9);
    for(let s=0;s<=seg;s++){const t=s/seg,r=t*L,y=Math.sin(t*PI*.85)*lift*L*.55;for(const cv of[-1,1]){const px=ca*r-sa*cv*w*.5,pz=-sa*r-ca*cv*w*.5;P.push(px,y,pz);N.push(ca*.3,1,-sa*.3);UV.push(t,(cv+1)/2);const ao=lerp(.55,1.05,t);C.push(ao,ao,ao);}}
    for(let s=0;s<seg;s++){const i0=base+s*2;I.push(i0,i0+2,i0+1,i0+1,i0+2,i0+3);}}
  return rawGeo(P,N,UV,C,I);}
function bushGeo(){const P=[],N=[],UV=[],C=[],I=[];
  for(let k=0;k<9;k++){const cx=sr(-.6,.6),cy=sr(.35,.95),cz=sr(-.6,.6),s=sr(.55,.8);_q.setFromEuler(_e.set(sr(0,TAU),sr(0,TAU),sr(0,TAU)));const base=P.length/3;
    for(const[cu,cv]of[[-1,-1],[1,-1],[1,1],[-1,1]]){_v1.set(cu*s,cv*s,0).applyQuaternion(_q);const px=cx+_v1.x,py=Math.max(.02,cy+_v1.y),pz=cz+_v1.z;P.push(px,py,pz);
      _v2.set(px,py-.2,pz).normalize();N.push(_v2.x,_v2.y,_v2.z);UV.push((cu+1)/2,(cv+1)/2);const ao=lerp(.45,1,py/1.3);C.push(ao,ao,ao);}
    I.push(base,base+1,base+2,base,base+2,base+3);}return rawGeo(P,N,UV,C,I);}
function rockGeo(seedk,detail=2){const g=weld(new THREE.IcosahedronGeometry(1,detail));const pa=g.attributes.position;
  for(let i=0;i<pa.count;i++){_v1.fromBufferAttribute(pa,i);const n=fbm(_v1.x*1.3+seedk*7,_v1.z*1.3+_v1.y*1.1,4),n2=vnoise(_v1.x*3+seedk,_v1.y*3-_v1.z*2);
    _v1.multiplyScalar(.78+n*.5+n2*.08);_v1.y*=.72;if(_v1.y<-.35)_v1.y=-.35+(_v1.y+.35)*.3;pa.setXYZ(i,_v1.x,_v1.y,_v1.z);}
  g.computeVertexNormals();const c=new Float32Array(pa.count*3).fill(1);g.setAttribute('color',new THREE.BufferAttribute(c,3));return g;}
function shroomGeo(caps){const parts=[];for(let i=0;i<5;i++){const x=sr(-.25,.25),z=sr(-.25,.25),h=sr(.08,.22),r=sr(.04,.09);
  if(caps)parts.push({g:geo('shcap',()=>new THREE.SphereGeometry(1,8,4,0,TAU,0,PI/2)),m:M4(x,h,z,0,0,0,r,r*.55,r)});
  else parts.push({g:geo('shstem',()=>new THREE.CylinderGeometry(.35,.5,1,5)),m:M4(x,h/2,z,0,0,0,r*.5,h,r*.5),c:col(0xd8d0c0)});}
  return mergeParts(parts);}
function logGeo(){const g=new THREE.CylinderGeometry(.32,.38,5,9,3);g.rotateZ(PI/2);g.translate(0,.3,0);const c=new Float32Array(g.attributes.position.count*3).fill(.85);g.setAttribute('color',new THREE.BufferAttribute(c,3));
  const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,uv.getY(i)*1.6);return g;}

/* ---------- forest placement in culling cells ---------- */
const CELLS=new Map(),FCELL=90;
function cellOf(x,z){const k=Math.floor(x/FCELL)+','+Math.floor(z/FCELL);let c=CELLS.get(k);
  if(!c){c={k,cx:(Math.floor(x/FCELL)+.5)*FCELL,cz:(Math.floor(z/FCELL)+.5)*FCELL,L:{},meshes:[],small:[]};CELLS.set(k,c);}return c;}
function plant(type,x,y,z,s,ry,tint){const c=cellOf(x,z);(c.L[type]=c.L[type]||[]).push({x,y,z,s,ry,tint});}
let VEG=null;
function buildForest(){
  const sp=coniferGeo({H:11,tr:.34,tiers:14,c0:1.7,c1:10.6,R0:3.1,R1:.5,nb0:10,nb1:5,d0:.44,d1:.14});
  const pine=coniferGeo({H:14,tr:.3,tiers:6,c0:8.2,c1:13.8,R0:2.6,R1:.7,nb0:7,nb1:4,d0:.22,d1:.08});
  const oak=oakGeo();
  VEG={
    spT:{g:sp.trunk,m:MAT.treeBark},spL:{g:sp.leaves,m:MAT.needles,d:TEX.needles},
    piT:{g:pine.trunk,m:MAT.treeBark},piL:{g:pine.leaves,m:MAT.needles,d:TEX.needles},
    oaT:{g:oak.trunk,m:MAT.treeBark},oaL:{g:oak.leaves,m:MAT.leaves,d:TEX.leaves},
    dead:{g:deadGeo(),m:MAT.treeBark},fern:{g:fernGeo(),m:MAT.fern,small:1,noShadow:1},bush:{g:bushGeo(),m:MAT.bush,small:1,noShadow:1},
    rockA:{g:rockGeo(1),m:MAT.rock},boulder:{g:rockGeo(3,2),m:MAT.rock},pebble:{g:rockGeo(4,1),m:MAT.rock,small:1,noShadow:1},
    log:{g:logGeo(),m:MAT.wood},shC:{g:shroomGeo(true),m:MAT.shroom,small:1,noShadow:1}};
  const tint=(h,s=.08)=>new THREE.Color(1+sr(-s,s),1+sr(-s,s),1+sr(-s,s)).multiplyScalar(h);
  let trees=0;const N=DEMO?0:Math.round(15000*DENS);
  for(let i=0;i<N;i++){const a=sr(0,TAU),r=Math.sqrt(srnd())*222,x=Math.cos(a)*r,z=Math.sin(a)*r,fd=forestD(x,z);
    const lone=srnd()<.05;if(fd<(r<WR?.49:.4)&&!lone)continue;
    if(nearStruct(x,z,3)||pdAt(x,z)<3.4)continue;if(!occFree(x,z,2.1))continue;const ny=nyAt(x,z);if(ny<.8)continue;
    const y=gH(x,z)-.15;const nearOak=RUINS.some(q=>Math.hypot(x-q.x,z-q.z)<30)||Math.hypot(x-LAKE.x,z-LAKE.z)<LAKE.r*2.2;
    const roll=srnd();let type;if(nearOak&&roll<.55)type='oak';else if(roll<.1)type='dead';else if(roll<.27)type='pine';else type='spruce';
    const s=type==='oak'?sr(.85,1.25):type==='pine'?sr(.8,1.15):sr(.55,1.3),ry=sr(0,TAU);
    if(type==='spruce'){const t=tint(1);plant('spT',x,y,z,s,ry,tint(1,.05));plant('spL',x,y,z,s,ry,t);}
    else if(type==='pine'){plant('piT',x,y,z,s,ry,tint(1,.05));plant('piL',x,y,z,s,ry,tint(1));}
    else if(type==='oak'){plant('oaT',x,y,z,s,ry,tint(1,.05));const au=srnd()<.3;plant('oaL',x,y,z,s,ry,au?new THREE.Color(1.35,1.0,.55):tint(1));}
    else plant('dead',x,y,z,s,ry,tint(1,.05));
    occMark(x,z);addCol(x,z,(type==='oak'?.5:type==='spruce'?.42:type==='pine'?.38:.36)*s,8);trees++;}
  const NU=DEMO?0:Math.round(9000*DENS);
  for(let i=0;i<NU;i++){const a=sr(0,TAU),r=Math.sqrt(srnd())*205,x=Math.cos(a)*r,z=Math.sin(a)*r,fd=forestD(x,z);
    if(nearStruct(x,z,1)||pdAt(x,z)<1.8)continue;const ny=nyAt(x,z),y=gH(x,z),roll=srnd();
    if(roll<.42){if(fd>.44&&ny>.82)plant('fern',x,y-.05,z,sr(.7,1.3),sr(0,TAU),tint(1));}
    else if(roll<.6){if(fd>.38&&ny>.8)plant('bush',x,y-.1,z,sr(.7,1.4),sr(0,TAU),tint(1));}
    else if(roll<.74){if(ny<.9||srnd()<.25){const s=sr(.4,1.5);plant('rockA',x,y-s*.15,z,s,sr(0,TAU),tint(1,.06));if(s>.62)addCol(x,z,s*.84,s>1.2?2:1);}}
    else if(roll<.8){if(ny<.86||r>WR-10){const s=sr(1.8,3.6);plant('boulder',x,y-s*.2,z,s,sr(0,TAU),tint(1,.05));addCol(x,z,s*.93,3);}}
    else if(roll<.9){plant('pebble',x,y-.05,z,sr(.12,.3),sr(0,TAU),tint(1,.08));}
    else if(roll<.95){if(fd>.5&&ny>.85&&occFree(x,z,2)){const ls=sr(.8,1.2),lr=sr(0,TAU),hl=(2.5-.36)*ls,cx=Math.cos(lr)*hl,cz=-Math.sin(lr)*hl;plant('log',x,y,z,ls,lr,tint(1,.05));addSeg(x-cx,z-cz,x+cx,z+cz,.36*ls,1);}}
    else if(fd>.56&&ny>.85){plant('shC',x,y-.03,z,sr(.8,1.4),sr(0,TAU),WHITE);}}
  // reeds around the lake shore
  if(DEMO)trees+=demoVeg(tint);
  for(let i=0;i<(DEMO?0:Math.round(260*DENS));i++){const a=sr(0,TAU),r=LAKE.r*sr(.82,1.18),x=LAKE.x+Math.cos(a)*r,z=LAKE.z+Math.sin(a)*r,y=gH(x,z);
    if(Math.abs(y-WATER_Y)<.6&&pdAt(x,z)>1.5)plant('fern',x,y-.1,z,sr(.9,1.3),sr(0,TAU),new THREE.Color(.95,1.05,.75));}
  const mtx=new THREE.Matrix4();
  for(const c of CELLS.values()){
    for(const t in c.L){const list=c.L[t],v=VEG[t];if(!list.length)continue;
      let maxS=1;for(const o of list)maxS=Math.max(maxS,o.s);
      const cy=list.reduce((s,o)=>s+o.y,0)/list.length;const center=V3(c.cx,cy+4,c.cz),rad=FCELL*.75+16*maxS;
      const im=new THREE.InstancedMesh(shareGeo(v.g,center,rad),v.m,list.length);
      list.forEach((o,i)=>{mtx.compose(_v1.set(o.x,o.y,o.z),_q.setFromAxisAngle(_up,o.ry),_v2.set(o.s,o.s,o.s));im.setMatrixAt(i,mtx);im.setColorAt(i,o.tint||WHITE);});
      im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;
      im.castShadow=!v.noShadow;im.receiveShadow=true;if(v.d)im.customDepthMaterial=depthMatFor(v.d);
      scene.add(im);c.meshes.push(im);if(v.small)c.small.push(im);}
    c.L=null;}
  return trees;}
let cellTimer=0;
function updCells(dt){cellTimer-=dt;if(cellTimer>0)return;cellTimer=.3;const cx=camera.position.x,cz=camera.position.z;
  for(const c of CELLS.values()){const d=Math.hypot(c.cx-cx,c.cz-cz);const far=d>250;for(const m of c.meshes)m.visible=!far;if(!far)for(const m of c.small)m.visible=d<88;}
  for(const o of SHRINE_OBJ){const v=Math.hypot(o.s.x-cx,o.s.z-cz)<170;if(o.vis!==v){o.vis=v;for(const m of o.meshes)m.visible=v;o.crystal.visible=v;o.rune.visible=v;}}}

/* ---------- grass (chunked, wind + player interaction) ---------- */
const GCH=16,GRASS=new Map();let grassQ=[],gPcx=1e9,gPcz=1e9,grassMat=null,GRASS_G=[];
function clumpGeo(nb,hm,flower){const P=[],N=[],C=[],B=[],I=[];const cb=col(0x222b16),cm=col(0x46532a),ct=col(0x737d45);
  for(let b=0;b<nb;b++){const ox=sr(-.3,.3),oz=sr(-.3,.3),h=sr(.24,.48)*hm,w=sr(.035,.06),a=sr(0,TAU),lean=sr(.08,.3),ca=Math.cos(a),sa=Math.sin(a),hue=sr(.85,1.15),base=P.length/3;
    const lv=[[0,1],[.5,.62],[1,0]];
    lv.forEach(([t,wk],li)=>{const bend=lean*t*t*h;const px=ox+ca*bend,pz=oz+sa*bend,py=t*h;const c=li===0?cb:li===1?cm:ct;
      if(li<2){for(const s of[-1,1]){P.push(px-sa*s*w*wk*.5,py,pz+ca*s*w*wk*.5);N.push(0,1,0);C.push(c.r*hue,c.g*hue,c.b*hue);B.push(t);}}
      else{P.push(px,py,pz);N.push(0,1,0);C.push(c.r*hue,c.g*hue,c.b*hue);B.push(1);}});
    I.push(base,base+2,base+1,base+1,base+2,base+3,base+2,base+4,base+3);}
  if(flower){const fc=flower;for(let k=0;k<3;k++){const ox=sr(-.2,.2),oz=sr(-.2,.2),h=sr(.4,.58),base=P.length/3,r=.028;
      for(const[dx,dz]of[[-1,0],[0,-1],[1,0],[0,1]]){P.push(ox+dx*r,h,oz+dz*r);N.push(0,1,0);C.push(fc.r,fc.g,fc.b);B.push(1);}
      P.push(ox,h+.035,oz);N.push(0,1,0);C.push(fc.r*1.15,fc.g*1.15,fc.b*1.15);B.push(1);P.push(ox,h-.025,oz);N.push(0,1,0);C.push(fc.r*.6,fc.g*.6,fc.b*.6);B.push(1);
      I.push(base,base+4,base+1,base+1,base+4,base+2,base+2,base+4,base+3,base+3,base+4,base,base,base+1,base+5,base+1,base+2,base+5,base+2,base+3,base+5,base+3,base,base+5);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setAttribute('bend',new THREE.Float32BufferAttribute(B,1));g.setIndex(I);g.computeBoundingSphere();return g;}
function initGrass(){
  GRASS_G=[clumpGeo(6,1),clumpGeo(7,1.2),clumpGeo(4,.9,col(0xcfcbd8)),clumpGeo(4,.9,col(0x7d62a8))];GRASS_G.flowerPick=()=>Math.random()<.6?2:3;
  grassMat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
  grassMat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{uTime:U.time,uWind:U.wind,uPlayer:U.player,uFade:U.grassFade});
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;\nuniform float uWind;\nuniform vec3 uPlayer;\nuniform float uFade;\nattribute float bend;')
      .replace('#include <begin_vertex>',`#include <begin_vertex>
        vec3 iO=vec3(instanceMatrix[3][0],instanceMatrix[3][1],instanceMatrix[3][2]);
        float s2=dot(instanceMatrix[0].xyz,instanceMatrix[0].xyz);
        float dP=length(iO.xz-cameraPosition.xz);
        transformed*=1.0-smoothstep(uFade*0.62,uFade,dP);
        float b=bend*bend;
        float ph=uTime*(1.6+uWind*0.5)+iO.x*0.37+iO.z*0.29;
        float gust=sin(uTime*0.5+iO.x*0.045+iO.z*0.03)*0.5+0.5;
        vec3 wo=vec3(sin(ph)*0.35+gust*0.9,0.0,cos(ph*0.83)*0.3+gust*0.35)*uWind*0.26;
        vec2 aw=iO.xz-uPlayer.xz;float al=length(aw);float push=1.0-smoothstep(0.2,1.25,al);
        wo.xz+=aw/(al+0.001)*push*0.6;wo.y-=push*0.28;
        wo*=b;
        transformed+=vec3(dot(instanceMatrix[0].xyz,wo),dot(instanceMatrix[1].xyz,wo),dot(instanceMatrix[2].xyz,wo))/s2;`);
    sh.fragmentShader=sh.fragmentShader.replace('( gl_FrontFacing ) ? vIndirectFront : vIndirectBack','vIndirectFront').replace('( gl_FrontFacing ) ? vLightFront : vLightBack','vLightFront');
  };
  U.grassFade.value=Q.grassR*GCH*.92;
}
function buildGrassChunk(cx,cz){const x0=cx*GCH,z0=cz*GCH,n=Math.round(GCH*GCH*Q.grassD);const lists=[[],[],[],[]];let ys=0,yc=0;const fv=hash2(cx,cz)<.6?2:3;
  for(let i=0;i<n;i++){const x=x0+Math.random()*GCH,z=z0+Math.random()*GCH;if(Math.hypot(x,z)>WR+12)continue;const sp=splatAt(x,z);
    let d=sp[0]*1.05+sp[1]*.3;d*=1-sp[2]*1.2;if(d<=0||Math.random()>d)continue;
    const y=gH(x,z);if(y<WATER_Y+.12&&Math.hypot(x-LAKE.x,z-LAKE.z)<LAKE.r*1.5)continue;
    let skip=false;for(const s of SHRINES)if(Math.abs(x-s.x)<6&&Math.abs(z-s.z)<6&&Math.hypot(x-s.x,z-s.z)<5.2){skip=true;break;}if(skip)continue;
    const meadow=sp[0]>.75;const r=Math.random();const v=meadow&&r<.035?fv:(meadow&&r<.4?1:0);
    const s=rr(.7,1.12)*(.65+d*.45);const shade=1-sp[1]*.3;const tint=new THREE.Color(shade*rr(.85,1.12),shade*rr(.9,1.1),shade*rr(.8,1.05));
    if(sp[0]<.5){tint.r*=.85;tint.b*=.9;}
    lists[v].push(x,y,z,s,Math.random()*TAU,tint);ys+=y;yc++;}
  const ch={meshes:[],sphere:new THREE.Sphere(V3(x0+GCH/2,yc?ys/yc:0,z0+GCH/2),GCH*.75+1.5)};const mtx=new THREE.Matrix4();
  lists.forEach((L,v)=>{const cnt=L.length/6;if(!cnt)return;const im=new THREE.InstancedMesh(GRASS_G[v],grassMat,cnt);im.frustumCulled=false;
    for(let i=0;i<cnt;i++){const o=i*6;mtx.compose(_v1.set(L[o],L[o+1],L[o+2]),_q.setFromAxisAngle(_up,L[o+4]),_v2.set(L[o+3],L[o+3],L[o+3]));im.setMatrixAt(i,mtx);im.setColorAt(i,L[o+5]);}
    im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.receiveShadow=true;im.castShadow=false;scene.add(im);ch.meshes.push(im);});
  return ch;}
const _frus=new THREE.Frustum(),_pm=new THREE.Matrix4();
function updGrass(force){const p=U.player.value,pcx=Math.floor(p.x/GCH),pcz=Math.floor(p.z/GCH),R=Q.grassR;
  if(pcx!==gPcx||pcz!==gPcz||force){gPcx=pcx;gPcz=pcz;const want=new Set();
    for(let i=-R;i<=R;i++)for(let j=-R;j<=R;j++){if(i*i+j*j>R*R+R)continue;const k=(pcx+i)+','+(pcz+j);want.add(k);if(!GRASS.has(k)&&!grassQ.some(q=>q.k===k))grassQ.push({k,cx:pcx+i,cz:pcz+j});}
    for(const[k,ch]of GRASS){if(!want.has(k)){ch.meshes.forEach(m=>{scene.remove(m);m.dispose();});GRASS.delete(k);}}
    grassQ=grassQ.filter(q=>want.has(q.k));grassQ.sort((a,b)=>((a.cx-pcx)**2+(a.cz-pcz)**2)-((b.cx-pcx)**2+(b.cz-pcz)**2));}
  let budget=force?999:2;while(grassQ.length&&budget-->0){const q=grassQ.shift();GRASS.set(q.k,buildGrassChunk(q.cx,q.cz));}
  _pm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);_frus.setFromProjectionMatrix(_pm);
  for(const ch of GRASS.values()){const vis=_frus.intersectsSphere(ch.sphere);for(const m of ch.meshes)m.visible=vis;}}
