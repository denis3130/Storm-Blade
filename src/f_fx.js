/* ============================== effects ============================== */
const PSCALE={value:400};
const FOGAMT_GLSL=`uniform vec3 uFogColor;uniform float uFogD;uniform float uFogH;
float fogAmt(vec3 wp){float d=length(wp-cameraPosition);return clamp(1.0-exp(-pow(uFogD*d,2.0)),0.0,1.0);}`;
class PSys{constructor(max,add){this.max=max;this.n=0;
  this.P=new Float32Array(max*3);this.V=new Float32Array(max*3);this.C=new Float32Array(max*3);this.S=new Float32Array(max);this.A=new Float32Array(max);
  this.L=new Float32Array(max);this.ML=new Float32Array(max);this.G=new Float32Array(max);this.DR=new Float32Array(max);this.S0=new Float32Array(max);this.S1=new Float32Array(max);this.A0=new Float32Array(max);this.F=new Uint8Array(max);
  const g=new THREE.BufferGeometry();const mk=(a,n)=>{const b=new THREE.BufferAttribute(a,n);b.setUsage(THREE.DynamicDrawUsage);return b;};
  this.ap=mk(this.P,3);this.ac=mk(this.C,3);this.as=mk(this.S,1);this.aa=mk(this.A,1);
  g.setAttribute('position',this.ap);g.setAttribute('pcol',this.ac);g.setAttribute('psize',this.as);g.setAttribute('palpha',this.aa);g.setDrawRange(0,0);
  this.mat=new THREE.ShaderMaterial({uniforms:Object.assign({uScale:PSCALE},FOGU),transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,
    vertexShader:`attribute vec3 pcol;attribute float psize;attribute float palpha;uniform float uScale;varying vec3 vC;varying float vA;varying vec3 vW;
      void main(){vC=pcol;vA=palpha;vW=position;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=clamp(psize*uScale/max(-mv.z,0.05),1.0,220.0);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`varying vec3 vC;varying float vA;varying vec3 vW;${FOGAMT_GLSL}
      void main(){vec2 c=gl_PointCoord-0.5;float d=dot(c,c)*4.0;if(d>1.0)discard;float a=1.0-d;${add?'a*=a;':''}float f=fogAmt(vW);
      ${add?'gl_FragColor=vec4(vC,a*vA*(1.0-f));':'gl_FragColor=vec4(mix(vC,uFogColor,f),a*vA);'}}`});
  this.pts=new THREE.Points(g,this.mat);this.pts.frustumCulled=false;this.pts.renderOrder=add?7:6;scene.add(this.pts);}
  emit(x,y,z,vx,vy,vz,life,s0,s1,r,g,b,a,grav=0,drag=0,fl=0){const i=this.n<this.max?this.n++:(Math.random()*this.max)|0,k=i*3;
    this.P[k]=x;this.P[k+1]=y;this.P[k+2]=z;this.V[k]=vx;this.V[k+1]=vy;this.V[k+2]=vz;this.C[k]=r;this.C[k+1]=g;this.C[k+2]=b;
    this.L[i]=life;this.ML[i]=life;this.S0[i]=s0;this.S1[i]=s1;this.S[i]=s0;this.A0[i]=a;this.A[i]=0;this.G[i]=grav;this.DR[i]=drag;this.F[i]=fl;}
  mv(f,t){const a=f*3,b=t*3;for(let j=0;j<3;j++){this.P[b+j]=this.P[a+j];this.V[b+j]=this.V[a+j];this.C[b+j]=this.C[a+j];}
    this.L[t]=this.L[f];this.ML[t]=this.ML[f];this.S0[t]=this.S0[f];this.S1[t]=this.S1[f];this.S[t]=this.S[f];this.A0[t]=this.A0[f];this.A[t]=this.A[f];this.G[t]=this.G[f];this.DR[t]=this.DR[f];this.F[t]=this.F[f];}
  update(dt){let n=this.n;const T=U.time.value;
    for(let i=0;i<n;i++){this.L[i]-=dt;if(this.L[i]<=0){n--;if(i<n)this.mv(n,i);i--;continue;}
      const k=i*3,d=Math.exp(-this.DR[i]*dt);this.V[k]*=d;this.V[k+1]=this.V[k+1]*d-this.G[i]*dt;this.V[k+2]*=d;
      if(this.F[i]===1){this.V[k]+=Math.sin(T*3+i)*dt*.6;this.V[k+2]+=Math.cos(T*2.6+i*1.3)*dt*.6;}
      this.P[k]+=this.V[k]*dt;this.P[k+1]+=this.V[k+1]*dt;this.P[k+2]+=this.V[k+2]*dt;
      const t=1-this.L[i]/this.ML[i];this.S[i]=this.S0[i]+(this.S1[i]-this.S0[i])*t;let a=this.A0[i]*Math.min(1,t*7)*(1-t);
      if(this.F[i]===1)a*=.6+.4*Math.sin(T*14+i*7.1);if(this.F[i]===2)a=this.A0[i]*Math.min(1,t*4)*Math.min(1,(1-t)*4)*(.5+.5*Math.sin(T*4+i*3.3));this.A[i]=a;}
    this.n=n;const g=this.pts.geometry;g.setDrawRange(0,n);
    for(const[at,s]of[[this.ap,3],[this.ac,3],[this.as,1],[this.aa,1]]){at.updateRange.offset=0;at.updateRange.count=Math.max(1,n*s);at.needsUpdate=true;}}}
let FXA=null,FXN=null;
function initFX(){FXA=new PSys(isTouch?1200:2400,true);FXN=new PSys(isTouch?600:1200,false);}
function sparks(p,dir,n,r=3.2,g=2.2,b=.9,spd=7){for(let i=0;i<n;i++){const vx=(dir?dir.x*spd*.6:0)+rr(-1,1)*spd,vy=rr(.3,1.4)*spd*.7,vz=(dir?dir.z*spd*.6:0)+rr(-1,1)*spd;
  FXA.emit(p.x,p.y,p.z,vx,vy,vz,rr(.18,.45),rr(.05,.09),.01,r,g,b,1,14,2.5);}}
function blood(p,dir,n){for(let i=0;i<n;i++){FXN.emit(p.x+rr(-.1,.1),p.y+rr(-.1,.1),p.z+rr(-.1,.1),dir.x*rr(1,4)+rr(-1.4,1.4),rr(.5,3),dir.z*rr(1,4)+rr(-1.4,1.4),rr(.3,.6),rr(.06,.12),.03,.22,.015,.01,.95,11,1.5);}}
function dust(p,n,s=1,c=[.34,.3,.25]){for(let i=0;i<n;i++){const a=rr(0,TAU),v=rr(.5,2.2)*s;FXN.emit(p.x+Math.cos(a)*.3*s,p.y+.1,p.z+Math.sin(a)*.3*s,Math.cos(a)*v,rr(.2,.9)*s,Math.sin(a)*v,rr(.6,1.3),.3*s,1.3*s,c[0],c[1],c[2],.32,-.15,2.2);}}
function splash(p,n,s=1){for(let i=0;i<n;i++){const a=rr(0,TAU),v=rr(.4,1.6)*s;FXN.emit(p.x+Math.cos(a)*.2,WATER_Y+.03,p.z+Math.sin(a)*.2,Math.cos(a)*v,rr(1.2,2.8)*s,Math.sin(a)*v,rr(.35,.6),.07*s,.16*s,.62,.66,.68,.5,9,.6);}}
// brief bright bloom where steel meets a body: reads as a flash of light without adding a real light
function impactFlash(p,s=1){FXA.emit(p.x,p.y,p.z,0,0,0,.075,.95*s,.18,3.4,2.9,2.2,1,0,0);FXA.emit(p.x,p.y,p.z,0,0,0,.05,.38*s,.1,5,4.6,4,1,0,0);}
// parry cue: a star glint on the weapon just before the blow (gold = parry it, red = get out of the way)
function glintFx(p,red){const c=red?[5,.7,.35]:[4.2,3.6,2.2];FXA.emit(p.x,p.y,p.z,0,0,0,.2,.5,.04,c[0]*.5,c[1]*.5,c[2]*.5,1,0,0);FXA.emit(p.x,p.y,p.z,0,0,0,.18,.2,.03,c[0]*1.2,c[1]*1.2,c[2]*1.2,1,0,0);
  for(let i=0;i<6;i++){const a=i/6*TAU;FXA.emit(p.x,p.y,p.z,Math.cos(a)*2.4,Math.sin(a)*2.4,0,.16,.07,.01,c[0],c[1],c[2],1,0,4);}}
function magic(p,n,c,spd=2.5,life=.8,size=.14){for(let i=0;i<n;i++){FXA.emit(p.x,p.y,p.z,rr(-1,1)*spd,rr(-.5,1.4)*spd,rr(-1,1)*spd,rr(life*.5,life),size,.01,c[0],c[1],c[2],1,-.4,2.2,1);}}
function healFx(p){for(let i=0;i<26;i++){const a=rr(0,TAU),r=rr(.2,.6);FXA.emit(p.x+Math.cos(a)*r,p.y+rr(.1,1.5),p.z+Math.sin(a)*r,0,rr(.8,1.8),0,rr(.6,1.1),.12,.02,2.4,1.2,.5,1,0,1.5,1);}}
/* ---------- fires ---------- */
const FIRES=[];let flameMat=null;
function makeFire(x,y,z,s,light=true){
  if(!flameMat)flameMat=new THREE.ShaderMaterial({uniforms:{tex:{value:TEX.flame},uTime:U.time},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
    vertexShader:'varying vec2 vUv;varying float vS;void main(){vUv=uv;vS=modelMatrix[3][0]*0.37+modelMatrix[3][2]*0.21;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform sampler2D tex;uniform float uTime;varying vec2 vUv;varying float vS;void main(){vec2 uv=vUv;uv.x+=sin(uv.y*6.0-uTime*8.0+vS)*0.07*uv.y;uv.y-=sin(uTime*3.0+vS)*0.03;vec4 t=texture2D(tex,clamp(uv,0.0,1.0));float fl=0.78+0.22*sin(uTime*19.0+vS*3.0);gl_FragColor=vec4(t.rgb*vec3(3.6,2.0,0.9)*fl,t.a);}'});
  const g=geo('flameQ',()=>{const parts=[];for(let i=0;i<3;i++)parts.push({g:new THREE.PlaneGeometry(1,1.7),m:M4(0,.8,0,0,i*PI/3,0)});return mergeParts(parts);});
  const m=new THREE.Mesh(g,flameMat);m.position.set(x,y,z);m.scale.setScalar(s);m.renderOrder=8;scene.add(m);
  const f={p:V3(x,y,z),s,m,e:0,l:light?addLight(V3(x,y+s*1.2,z),col(0xff8a3a),3.4*Math.min(1.4,s+.3),14*Math.min(1.3,s+.4),1):null};FIRES.push(f);return f;}
function updFires(dt){const cp=camera.position;for(const f of FIRES){const d=f.p.distanceToSquared(cp);if(d>70*70)continue;f.e+=dt*(d<35*35?1:.4);
  while(f.e>.07){f.e-=.07;const s=f.s;FXA.emit(f.p.x+rr(-.3,.3)*s,f.p.y+.4*s,f.p.z+rr(-.3,.3)*s,rr(-.3,.3),rr(1.2,2.6)*s,rr(-.3,.3),rr(.8,1.8),.06*s+.03,.02,3,1.3,.35,1,-.3,.6,1);
    if(Math.random()<.35)FXN.emit(f.p.x+rr(-.2,.2),f.p.y+1.4*s,f.p.z+rr(-.2,.2),rr(-.2,.2)+U.wind.value*.25,rr(.6,1.1),rr(-.2,.2),rr(2.2,3.6),.5*s,2.6*s,.11,.1,.1,.2,-.05,.25);}}}
/* ---------- sword trail ---------- */
// sword trail: a ring of n blade samples (base and tip), newest first, made once and reused every frame
const _trB=V3(),_trT=V3(),_trB2=V3(),_trT2=V3();
class Trail{constructor(n=30){this.n=n;this.B=[];this.T=[];for(let i=0;i<n;i++){this.B.push(V3());this.T.push(V3());}this.len=0;this.head=0;this.on=false;this.fade=0;const P=new Float32Array(n*2*3),A=new Float32Array(n*2),I=[];
    for(let i=0;i<n-1;i++){const a=i*2;I.push(a,a+1,a+2,a+1,a+3,a+2);}for(let i=0;i<n;i++){A[i*2]=A[i*2+1]=1-i/(n-1);}
    const g=new THREE.BufferGeometry();this.pa=new THREE.BufferAttribute(P,3);this.pa.setUsage(THREE.DynamicDrawUsage);g.setAttribute('position',this.pa);g.setAttribute('ta',new THREE.BufferAttribute(A,1));
    const side=new Float32Array(n*2);for(let i=0;i<n;i++){side[i*2]=0;side[i*2+1]=1;}g.setAttribute('ts',new THREE.BufferAttribute(side,1));g.setIndex(I);
    this.u={uC:{value:new THREE.Color(2.2,2.0,1.6)},uO:{value:0}};
    this.mesh=new THREE.Mesh(g,new THREE.ShaderMaterial({uniforms:this.u,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
      vertexShader:'attribute float ta;attribute float ts;varying float vA;varying float vS;void main(){vA=ta;vS=ts;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:'uniform vec3 uC;uniform float uO;varying float vA;varying float vS;void main(){float a=vA*vA*smoothstep(0.0,0.6,vS)*uO;gl_FragColor=vec4(uC,a);}'}));
    this.mesh.frustumCulled=false;this.mesh.renderOrder=9;scene.add(this.mesh);}
  at(i){return(this.head-i+this.n)%this.n;}   // ring slot of the i-th newest sample
  add(b,t){this.head=(this.head+1)%this.n;this.B[this.head].copy(b);this.T[this.head].copy(t);this.len=Math.min(this.n,this.len+1);}
  // two in-between samples smooth fast swings, then the new one
  push(b,t){if(this.len){_trB.copy(this.B[this.head]);_trT.copy(this.T[this.head]);for(let k=1;k<=2;k++){const f=k/3;this.add(_trB2.copy(_trB).lerp(b,f),_trT2.copy(_trT).lerp(t,f));}}
    this.add(b,t);}
  update(dt,base,tip){if(this.on){this.push(base,tip);this.fade=1;}else{this.fade=Math.max(0,this.fade-dt*5);if(this.fade<=0)this.len=0;}
    this.u.uO.value=this.fade*.9;const a=this.pa.array,m=this.len;
    for(let i=0;i<this.n;i++){const j=Math.min(i,m-1);if(j<0){a.fill(0);break;}const q=this.at(j),B=this.B[q],T=this.T[q],o=i*6;a[o]=B.x;a[o+1]=B.y;a[o+2]=B.z;a[o+3]=T.x;a[o+4]=T.y;a[o+5]=T.z;}this.pa.needsUpdate=true;}}
/* ---------- rain ---------- */
let rain=null;const RAIN_N=isTouch?650:1500;
function initRain(){const P=new Float32Array(RAIN_N*6),g=new THREE.BufferGeometry();for(let i=0;i<RAIN_N;i++){const x=rr(-30,30),y=rr(-4,26),z=rr(-30,30);P.set([x,y,z,x,y+.9,z],i*6);}
  g.setAttribute('position',new THREE.BufferAttribute(P,3));rain=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:new THREE.Color(.5,.52,.68),transparent:true,opacity:0,depthWrite:false}));
  rain.frustumCulled=false;rain.renderOrder=8;rain.visible=false;scene.add(rain);rain.userData.s=new Float32Array(RAIN_N).map(()=>rr(24,32));}
function updRain(dt,k,wx,wz){rain.visible=k>.03;rain.material.opacity=k*.5;if(!rain.visible)return;const P=rain.geometry.attributes.position.array,c=camera.position,S=rain.userData.s;
  for(let i=0;i<RAIN_N;i++){const o=i*6;let x=P[o]+wx*dt,y=P[o+1]-S[i]*dt,z=P[o+2]+wz*dt;
    if(y<c.y-5||Math.abs(x-c.x)>30||Math.abs(z-c.z)>30){x=c.x+rr(-30,30);z=c.z+rr(-30,30);y=c.y+rr(10,24);}
    P[o]=x;P[o+1]=y;P[o+2]=z;P[o+3]=x-wx*.035;P[o+4]=y+1.0;P[o+5]=z-wz*.035;}
  rain.geometry.attributes.position.needsUpdate=true;
  const sp=Math.round(k*(isTouch?3:7));for(let i=0;i<sp;i++){const x=c.x+rr(-14,14),z=c.z+rr(-14,14),y=gH(x,z)+.05;FXA.emit(x,y,z,rr(-.5,.5),rr(.6,1.4),rr(-.5,.5),.22,.05,.02,.55,.58,.75,.7,6,0);}}
/* ---------- lightning ---------- */
const BOLTS=[];
function boltMesh(pts,w){const P=[],I=[];camera.getWorldDirection(_v4);
  for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];_v1.subVectors(b,a).normalize();_v2.crossVectors(_v1,_v4).normalize().multiplyScalar(w*(1-i/pts.length*.6));const base=P.length/3;
    P.push(a.x-_v2.x,a.y-_v2.y,a.z-_v2.z,a.x+_v2.x,a.y+_v2.y,a.z+_v2.z,b.x+_v2.x,b.y+_v2.y,b.z+_v2.z,b.x-_v2.x,b.y-_v2.y,b.z-_v2.z);I.push(base,base+1,base+2,base,base+2,base+3);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);return g;}
function bolt(x,z,y0){const y=gH(x,z),top=y+(y0||75),pts=[];let px=x+rr(-6,6),pz=z+rr(-6,6);for(let i=0;i<=16;i++){const t=i/16;pts.push(V3(lerp(px,x,t)+(i&&i<16?rr(-2.2,2.2):0),lerp(top,y,t),lerp(pz,z,t)+(i&&i<16?rr(-2.2,2.2):0)));}
  const grp=new THREE.Group();const m=new THREE.MeshBasicMaterial({color:new THREE.Color(7,6.6,10),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false});
  grp.add(new THREE.Mesh(boltMesh(pts,.32),m));
  for(let b=0;b<3;b++){const s=2+((Math.random()*10)|0),bp=[pts[s].clone()];for(let i=1;i<6;i++){const p=bp[i-1].clone();p.x+=rr(-3,3);p.y-=rr(2,5);p.z+=rr(-3,3);bp.push(p);}grp.add(new THREE.Mesh(boltMesh(bp,.14),m));}
  scene.add(grp);BOLTS.push({g:grp,m,t:.28});}
function updBolts(dt){for(let i=BOLTS.length-1;i>=0;i--){const b=BOLTS[i];b.t-=dt;b.m.opacity=Math.max(0,b.t/.28)*(.6+.4*Math.random());if(b.t<=0){scene.remove(b.g);b.g.children.forEach(c=>c.geometry.dispose());b.m.dispose();BOLTS.splice(i,1);}}}
/* ---------- ground rings: shockwaves, telegraphs, scorch ---------- */
const RINGS=[];
function groundRing(x,z,r0,r1,dur,c,kind){const m=new THREE.Mesh(geo('ring',()=>{const g=new THREE.RingGeometry(.85,1,48);g.rotateX(-PI/2);return g;}),
    new THREE.MeshBasicMaterial({color:c,transparent:true,depthWrite:false,blending:kind==='scorch'?THREE.NormalBlending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
  if(kind==='scorch'||kind==='fill'){m.geometry=geo('disk',()=>{const g=new THREE.CircleGeometry(1,32);g.rotateX(-PI/2);return g;});}
  m.position.set(x,gH(x,z)+.07,z);m.scale.setScalar(r0);m.renderOrder=4;scene.add(m);const o={m,r0,r1,dur,t:0,kind};RINGS.push(o);return o;}
function updRings(dt){for(let i=RINGS.length-1;i>=0;i--){const o=RINGS[i];o.t+=dt;const k=Math.min(1,o.t/o.dur);
  if(o.kind==='scorch'){o.m.material.opacity=.65*(1-sstep(.7,1,k));}
  else if(o.kind==='tele'){o.m.scale.setScalar(lerp(o.r0,o.r1,eIn2(k)));o.m.material.opacity=.4+.6*k;}
  else if(o.kind==='fill'){o.m.material.opacity=.25*k*(1-sstep(.95,1,k));o.m.scale.setScalar(o.r0);}
  else{o.m.scale.setScalar(lerp(o.r0,o.r1,eOut(k)));o.m.material.opacity=1-k;}
  if(o.t>=o.dur){scene.remove(o.m);o.m.material.dispose();RINGS.splice(i,1);}}}
/* ---------- shrine wards & storm vortex ---------- */
const wardU={uA:{value:0},uTime:U.time};
let wardMat=null;
function makeWardMat(){wardMat=new THREE.ShaderMaterial({uniforms:wardU,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.FrontSide,
  vertexShader:'varying vec3 vN;varying vec3 vW;void main(){vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:`uniform float uA,uTime;varying vec3 vN;varying vec3 vW;void main(){float f=pow(1.0-abs(dot(normalize(cameraPosition-vW),normalize(vN))),2.2);
    float hex=abs(sin(vW.x*3.1+sin(vW.y*2.0))*sin(vW.z*3.1+uTime*0.6)*sin(vW.y*3.7-uTime));float st=smoothstep(0.92,1.0,hex);
    float band=smoothstep(0.0,0.08,fract(vW.y*0.35-uTime*0.25))*0.08;
    vec3 c=vec3(0.35,1.05,2.2)*(f*1.05+st*0.5+band+0.04)*uA;gl_FragColor=vec4(c,1.0);}`});}
let vortex=null;
function initVortex(){const g=new THREE.CylinderGeometry(34,6,160,48,20,true);g.translate(0,80,0);
  vortex=new THREE.Mesh(g,new THREE.ShaderMaterial({uniforms:{uTime:U.time,uA:{value:0},uFlash:skyU.uFlash},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;vec3 p=position;float tw=sin(p.y*0.04+uv.x*6.2831)*2.0;p.x+=tw;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}',
    fragmentShader:`uniform float uTime,uA,uFlash;varying vec2 vUv;float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n2(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);return mix(mix(hs(i),hs(i+vec2(1.,0.)),u.x),mix(hs(i+vec2(0.,1.)),hs(i+vec2(1.,1.)),u.x),u.y);}
      float fb(vec2 p){float s=0.0,a=0.5;for(int i=0;i<4;i++){s+=n2(p)*a;p*=2.1;a*=0.5;}return s;}
      void main(){vec2 p=vec2(vUv.x*10.0+vUv.y*5.0-uTime*0.55,vUv.y*5.0-uTime*0.9);p.x=mod(p.x,10.0);float n=fb(p);
        float band=smoothstep(0.38,0.82,n);float edge=smoothstep(0.0,0.12,vUv.y)*smoothstep(1.0,0.55,vUv.y);
        vec3 c=mix(vec3(0.28,0.18,0.7),vec3(1.2,1.0,2.2),n)*band*edge*uA*(0.55+uFlash*1.5);gl_FragColor=vec4(c,1.0);}`}));
  vortex.frustumCulled=false;vortex.visible=false;vortex.renderOrder=3;scene.add(vortex);}
/* ---------- ambient motes & fireflies ---------- */
let moteT=0;
function updAmbient(dt,stormK){moteT+=dt;if(moteT<.08)return;moteT=0;const c=U.player.value;
  if(stormK<.3){for(let i=0;i<2;i++){const x=c.x+rr(-16,16),z=c.z+rr(-16,16),y=gH(x,z)+rr(.4,3);FXA.emit(x,y,z,rr(-.1,.1),rr(-.05,.08),rr(-.1,.1),rr(3,6),.035,.03,.6,.6,.5,.5,0,.2,2);}
    if(forestD(c.x,c.z)>.45||Math.hypot(c.x-LAKE.x,c.z-LAKE.z)<40){const x=c.x+rr(-14,14),z=c.z+rr(-14,14),y=gH(x,z)+rr(.4,2);FXA.emit(x,y,z,rr(-.3,.3),rr(-.1,.2),rr(-.3,.3),rr(3,5),.07,.06,1.4,2.2,.5,1,0,.4,2);}}
  else{for(let i=0;i<3;i++){const x=c.x+rr(-18,18),z=c.z+rr(-18,18),y=gH(x,z)+rr(.2,4);FXA.emit(x,y,z,U.wind.value*rr(1,2),rr(.2,1),rr(-.5,.5),rr(1,2),.06,.02,1.1,.7,2.4,.9,0,.5,1);}}}
