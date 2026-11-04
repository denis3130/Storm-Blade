'use strict';
/* ============================== utilities ============================== */
const $=id=>document.getElementById(id);
const TAU=Math.PI*2,PI=Math.PI,DEG=Math.PI/180;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const inv=(a,b,v)=>clamp((v-a)/(b-a),0,1);
const sstep=(a,b,v)=>{const t=inv(a,b,v);return t*t*(3-2*t);};
const eOut=t=>1-Math.pow(1-t,3),eIn=t=>t*t*t,eIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,eLin=t=>t,eOut2=t=>1-(1-t)*(1-t),eIn2=t=>t*t;
const damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
const angD=(a,b)=>{let d=(b-a)%TAU;if(d>PI)d-=TAU;else if(d<-PI)d+=TAU;return d;};
const dampA=(a,b,k,dt)=>a+angD(a,b)*(1-Math.exp(-k*dt));
const turnTo=(a,b,m)=>a+clamp(angD(a,b),-m,m);
const yawTo=(dx,dz)=>Math.atan2(-dx,-dz);
let _seed=1337;const srnd=()=>{_seed=(_seed*16807)%2147483647;return(_seed-1)/2147483646;};
const sr=(a,b)=>a+srnd()*(b-a),rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[(Math.random()*a.length)|0];
function hash2(x,z){let h=(Math.imul(x|0,374761393)+Math.imul(z|0,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>0)/4294967296;}
function vnoise(x,z){const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,u=xf*xf*(3-2*xf),v=zf*zf*(3-2*zf);
  const a=hash2(xi,zi),b=hash2(xi+1,zi),c=hash2(xi,zi+1),d=hash2(xi+1,zi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function fbm(x,z,o=4){let s=0,a=.5,n=0,f=1;for(let i=0;i<o;i++){s+=vnoise(x*f+i*31.7,z*f-i*17.3)*a;n+=a;a*=.5;f*=2.03;}return s/n;}
function tnoise(x,y,P,so){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const x0=((xi%P)+P)%P,x1=(x0+1)%P,y0=((yi%P)+P)%P,y1=(y0+1)%P;
  const a=hash2(x0+so,y0),b=hash2(x1+so,y0),c=hash2(x0+so,y1),d=hash2(x1+so,y1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function tfbm(u,v,base,o,so=0){let s=0,a=.5,n=0,f=base;for(let i=0;i<o;i++){s+=tnoise(u*f,v*f,f,so+i*1013)*a;n+=a;a*=.5;f*=2;}return s/n;}
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const _v1=V3(),_v2=V3(),_v3=V3(),_v4=V3(),_m4=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler();
const col=h=>new THREE.Color(h).convertSRGBToLinear();
const nextFrame=()=>new Promise(r=>{let done=false;const f=()=>{if(!done){done=true;r();}};requestAnimationFrame(f);setTimeout(f,60);});
function lsGet(k){try{const s=localStorage.getItem(k);return s?JSON.parse(s):null;}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function lsDel(k){try{localStorage.removeItem(k);}catch(e){}}

/* ============================== settings ============================== */
const isTouch=(()=>{try{const c=matchMedia('(pointer: coarse)').matches,f=matchMedia('(pointer: fine)').matches;return (c&&!f)||(navigator.maxTouchPoints>1&&!f);}catch(e){return false;}})();
const SET=Object.assign({quality:isTouch?'medium':'high',sens:1,invertY:false,music:.65,sfx:.85,fp:false,nums:true},lsGet('stormblade.settings')||{});
function saveSettings(){lsSet('stormblade.settings',SET);}
const QP={
  low:{pr:.8,shadow:0,grassR:1,grassD:1.4,rays:false,msaa:0,mips:4,cloud:3},
  medium:{pr:1.1,shadow:1024,grassR:2,grassD:2.4,rays:false,msaa:0,mips:5,cloud:4},
  high:{pr:1.5,shadow:2048,grassR:3,grassD:3.2,rays:true,msaa:4,mips:5,cloud:5}};
let Q=QP[SET.quality]||QP.medium;
const DENS=isTouch?.62:1;

/* ============================== renderer ============================== */
const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance',stencil:false});
renderer.outputEncoding=THREE.LinearEncoding;
renderer.toneMapping=THREE.NoToneMapping;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,Q.pr));
renderer.setSize(viewW(),viewH());   // game size (r_orient.js): swapped when a phone held upright gets the rotated layout
const canvas=renderer.domElement;canvas.tabIndex=0;$('game').appendChild(canvas);
const gl=renderer.getContext();
const isGL2=renderer.capabilities.isWebGL2;
let HDR=false;try{HDR=isGL2&&!!(gl.getExtension('EXT_color_buffer_float')||gl.getExtension('EXT_color_buffer_half_float'));}catch(e){}
const MAXANI=Math.min(8,renderer.capabilities.getMaxAnisotropy()||1);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(60,viewW()/viewH(),.06,560);
camera.rotation.order='YXZ';
const U={time:{value:0},wind:{value:1},player:{value:V3(0,0,0)},grassFade:{value:40},wet:{value:0},storm:{value:0}};

/* ---------- global fog: distance + ground mist + sun in-scattering (replaces three's fog chunks) ---------- */
const SUN_DIR=V3(.56,.29,-.78).normalize();
const FOG_BASE=-1.5;
const gv=v=>`vec3(${v.x.toFixed(4)},${v.y.toFixed(4)},${v.z.toFixed(4)})`;
THREE.ShaderChunk.fog_pars_vertex='#ifdef USE_FOG\nvarying vec3 vFogWP;\nvarying float vFogD;\n#endif\n';
THREE.ShaderChunk.fog_vertex='#ifdef USE_FOG\nvFogD=-mvPosition.z;\nvFogWP=(mvPosition.xyz-viewMatrix[3].xyz)*mat3(viewMatrix);\n#endif\n';
THREE.ShaderChunk.fog_pars_fragment='#ifdef USE_FOG\nuniform vec3 fogColor;\nvarying vec3 vFogWP;\nvarying float vFogD;\nuniform float fogNear;\nuniform float fogFar;\n#endif\n';
THREE.ShaderChunk.fog_fragment=`#ifdef USE_FOG
  float fogF=1.0-exp(-pow(fogNear*vFogD,2.0));
  float hfog=exp(-max(vFogWP.y-(${FOG_BASE.toFixed(2)}),0.0)*0.16)*(1.0-exp(-vFogD*0.028))*fogFar;
  fogF=clamp(fogF+hfog*(1.0-fogF),0.0,1.0);
  float sunA=pow(max(dot(normalize(vFogWP-cameraPosition),${gv(SUN_DIR)}),0.0),6.0);
  gl_FragColor.rgb=mix(gl_FragColor.rgb,fogColor*(1.0+sunA*0.95),fogF);
#endif
`;
const FOGC=col(0x6c7783);
scene.fog=new THREE.Fog(FOGC.clone(),.0085,.55); // near=density, far=ground-mist amount (custom chunk)
const FOG_GLSL=`
uniform vec3 uFogColor;uniform float uFogD;uniform float uFogH;
vec3 applyFog(vec3 c,vec3 wp){
  float d=length(wp-cameraPosition);
  float f=1.0-exp(-pow(uFogD*d,2.0));
  float h=exp(-max(wp.y-(${FOG_BASE.toFixed(2)}),0.0)*0.16)*(1.0-exp(-d*0.028))*uFogH;
  f=clamp(f+h*(1.0-f),0.0,1.0);
  float sunA=pow(max(dot(normalize(wp-cameraPosition),${gv(SUN_DIR)}),0.0),6.0);
  return mix(c,uFogColor*(1.0+sunA*0.95),f);
}`;
const FOGU={uFogColor:{value:scene.fog.color},uFogD:{value:.0085},uFogH:{value:.55}};

/* ---------- lights ---------- */
const hemi=new THREE.HemisphereLight(col(0x95a3b0),col(0x2b261d),.5);scene.add(hemi);
const sun=new THREE.DirectionalLight(col(0xffdcb4),2.6);
sun.castShadow=Q.shadow>0;
sun.shadow.mapSize.set(Q.shadow||1024,Q.shadow||1024);
const SHR=36;Object.assign(sun.shadow.camera,{left:-SHR,right:SHR,top:SHR,bottom:-SHR,near:1,far:240});
sun.shadow.bias=-.00035;sun.shadow.normalBias=.045;
scene.add(sun,sun.target);
const fill=new THREE.DirectionalLight(col(0xb4c2d4),.7);scene.add(fill,fill.target);
const PLPOOL=[];for(let i=0;i<4;i++){const l=new THREE.PointLight(0xffffff,0,18,2);scene.add(l);PLPOOL.push(l);}
const LIGHTS=[]; // {p,c:Color,i,d,f(flicker kind),ph,on}
function addLight(p,c,i,d,f=0){const o={p:p.clone(),c:new THREE.Color(c),i,d,f,ph:Math.random()*10,on:true,k:1};LIGHTS.push(o);return o;}
function updLights(t){
  const cp=camera.position;
  for(const l of LIGHTS)l._d=l.on?l.p.distanceToSquared(cp):1e12;
  LIGHTS.sort((a,b)=>a._d-b._d);
  for(let i=0;i<PLPOOL.length;i++){const L=PLPOOL[i],s=LIGHTS[i];
    if(!s||s._d>90*90){L.intensity=0;continue;}
    let fl=1;if(s.f===1)fl=.82+Math.sin(t*13+s.ph)*.1+Math.sin(t*7.7+s.ph*2)*.08;else if(s.f===2)fl=.85+Math.sin(t*2+s.ph)*.15;
    L.position.copy(s.p);L.color.copy(s.c);L.distance=s.d;L.intensity=s.i*fl*s.k;}
}

/* ---------- sky ---------- */
const SKY_VS=`varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const SKY_FS=(oct,clouds)=>`
uniform vec3 uSunDir,uHorizon,uZenith,uSunCol,uCloud;uniform float uTime,uStorm,uFlash;varying vec3 vDir;
float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);return mix(mix(hs(i),hs(i+vec2(1.,0.)),u.x),mix(hs(i+vec2(0.,1.)),hs(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float s=0.0,a=0.5;for(int i=0;i<${oct};i++){s+=n2(p)*a;p=p*2.03+vec2(1.7,9.2);a*=0.5;}return s;}
void main(){
  vec3 d=normalize(vDir);float y=d.y;
  vec3 c=mix(uHorizon,uZenith,pow(clamp(y,0.0,1.0),0.52));
  c=mix(c,uHorizon*0.82,clamp(-y*3.0,0.0,1.0));
  float sd=max(dot(d,uSunDir),0.0);float clear=1.0-uStorm*0.9;
  c+=uSunCol*(pow(sd,7.0)*0.32+pow(sd,48.0)*0.9)*clear;
  c+=uSunCol*smoothstep(0.99945,0.99975,sd)*14.0*clear;
  ${clouds?`if(y>-0.02){
    vec2 cp=d.xz/(max(y,0.0)+0.11)*1.15+vec2(uTime*0.010,uTime*0.004)*(1.0+uStorm*4.0);
    float n=fbm(cp*1.1)*0.75+fbm(cp*3.1+vec2(uTime*0.02,0.0))*0.25;
    float cov=mix(0.36,0.12,uStorm);
    float cl=smoothstep(cov-0.12,cov+0.42,n);
    float sh=fbm(cp*1.1+uSunDir.xz*0.1);
    vec3 cc=mix(uCloud*1.08,uCloud*0.5,clamp((n-sh)*4.0+0.5,0.0,1.0));
    cc+=uSunCol*pow(sd,6.0)*0.32*clear;
    float fade=smoothstep(0.0,0.32,y);
    c=mix(c,cc,cl*fade*0.9);
  }`:''}
  c+=uFlash*vec3(0.75,0.72,1.0)*(0.55+0.45*clamp(y,0.0,1.0));
  gl_FragColor=vec4(c,1.0);
  #include <encodings_fragment>
}`;
const SKYC={
  calm:{hor:col(0x8b949b),zen:col(0x2a3540),cloud:col(0x6a7178),sun:new THREE.Color(1.0,.74,.46),fog:col(0x6d7884),hemiS:col(0x95a3b0),hemiG:col(0x2b261d)},
  storm:{hor:col(0x4b3e66),zen:col(0x140f22),cloud:col(0x3a3050),sun:new THREE.Color(.5,.4,.7),fog:col(0x3c3352),hemiS:col(0x6c5f8e),hemiG:col(0x1a1620)}};
const skyU={uSunDir:{value:SUN_DIR},uHorizon:{value:SKYC.calm.hor.clone()},uZenith:{value:SKYC.calm.zen.clone()},uSunCol:{value:SKYC.calm.sun.clone()},
  uCloud:{value:SKYC.calm.cloud.clone()},uTime:U.time,uStorm:U.storm,uFlash:{value:0}};
const sky=new THREE.Mesh(new THREE.SphereGeometry(500,48,24),new THREE.ShaderMaterial({uniforms:skyU,vertexShader:SKY_VS,fragmentShader:SKY_FS(Q.cloud,true),side:THREE.BackSide,depthWrite:false,fog:false}));
sky.renderOrder=-10;sky.frustumCulled=false;scene.add(sky);

function makeEnv(c,storm){
  const es=new THREE.Scene();
  const m=new THREE.ShaderMaterial({uniforms:{uSunDir:{value:SUN_DIR},uHorizon:{value:c.hor},uZenith:{value:c.zen},uSunCol:{value:c.sun.clone().multiplyScalar(.6)},uCloud:{value:c.cloud},uTime:{value:0},uStorm:{value:storm},uFlash:{value:0}},
    vertexShader:SKY_VS,fragmentShader:SKY_FS(3,false),side:THREE.BackSide,depthWrite:false});
  es.add(new THREE.Mesh(new THREE.SphereGeometry(50,32,16),m));
  const g=new THREE.Mesh(new THREE.CircleGeometry(45,24),new THREE.MeshBasicMaterial({color:storm?col(0x18151c):col(0x2a261e)}));g.rotation.x=-PI/2;g.position.y=-3;es.add(g);
  const pm=new THREE.PMREMGenerator(renderer);const rt=pm.fromScene(es,.03);pm.dispose();return rt.texture;
}
let ENV_CALM=null,ENV_STORM=null;

/* ============================== post-processing ============================== */
const Post=(()=>{
  const sz=new THREE.Vector2();
  const opts={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,type:HDR?THREE.HalfFloatType:THREE.UnsignedByteType,depthBuffer:false,stencilBuffer:false};
  let rtS=null,rtR=null;const D=[],UP=[];
  const qg=new THREE.BufferGeometry();
  qg.setAttribute('position',new THREE.BufferAttribute(new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),3));
  qg.setAttribute('uv',new THREE.BufferAttribute(new Float32Array([0,0,2,0,0,2]),2));
  const quad=new THREE.Mesh(qg);quad.frustumCulled=false;const qs=new THREE.Scene();qs.add(quad);const qc=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}';
  const mk=(fs,u)=>new THREE.ShaderMaterial({uniforms:u,vertexShader:VS,fragmentShader:fs,depthTest:false,depthWrite:false});
  const mPre=mk(`uniform sampler2D tex;uniform vec2 tx;uniform float th,kn;varying vec2 vUv;
    void main(){vec3 c=texture2D(tex,vUv+tx*vec2(-.5,-.5)).rgb+texture2D(tex,vUv+tx*vec2(.5,-.5)).rgb+texture2D(tex,vUv+tx*vec2(-.5,.5)).rgb+texture2D(tex,vUv+tx*vec2(.5,.5)).rgb;
    c=min(c*0.25,vec3(24.0));float br=max(c.r,max(c.g,c.b));float rq=clamp(br-th+kn,0.0,2.0*kn);rq=rq*rq/(4.0*kn+1e-4);
    gl_FragColor=vec4(c*max(rq,br-th)/max(br,1e-4),1.0);}`,{tex:{value:null},tx:{value:new THREE.Vector2()},th:{value:HDR?1.05:.78},kn:{value:.55}});
  const mDn=mk(`uniform sampler2D tex;uniform vec2 tx;varying vec2 vUv;
    void main(){vec3 s=texture2D(tex,vUv).rgb*4.0+texture2D(tex,vUv-tx).rgb+texture2D(tex,vUv+tx).rgb+texture2D(tex,vUv+vec2(tx.x,-tx.y)).rgb+texture2D(tex,vUv-vec2(tx.x,-tx.y)).rgb;gl_FragColor=vec4(s*0.125,1.0);}`,{tex:{value:null},tx:{value:new THREE.Vector2()}});
  const mUp=mk(`uniform sampler2D tex,add;uniform vec2 tx;varying vec2 vUv;
    void main(){vec2 h=tx;vec3 s=texture2D(tex,vUv+vec2(-h.x*2.0,0.0)).rgb+texture2D(tex,vUv+vec2(-h.x,h.y)).rgb*2.0+texture2D(tex,vUv+vec2(0.0,h.y*2.0)).rgb
    +texture2D(tex,vUv+vec2(h.x,h.y)).rgb*2.0+texture2D(tex,vUv+vec2(h.x*2.0,0.0)).rgb+texture2D(tex,vUv+vec2(h.x,-h.y)).rgb*2.0
    +texture2D(tex,vUv+vec2(0.0,-h.y*2.0)).rgb+texture2D(tex,vUv+vec2(-h.x,-h.y)).rgb*2.0;gl_FragColor=vec4(s/12.0+texture2D(add,vUv).rgb,1.0);}`,{tex:{value:null},add:{value:null},tx:{value:new THREE.Vector2()}});
  const mRay=mk(`uniform sampler2D tex;uniform vec2 sun;uniform float str;varying vec2 vUv;
    void main(){vec2 d=(vUv-sun)*(0.92/30.0);vec2 uv=vUv;float dec=1.0;vec3 acc=vec3(0.0);
    for(int i=0;i<30;i++){uv-=d;acc+=texture2D(tex,uv).rgb*dec*exp(-length(uv-sun)*3.2);dec*=0.962;}
    gl_FragColor=vec4(acc*(str/30.0),1.0);}`,{tex:{value:null},sun:{value:new THREE.Vector2(.5,.5)},str:{value:0}});
  const cu={tS:{value:null},tB:{value:null},tR:{value:null},bloom:{value:.62},rays:{value:0},exposure:{value:1},time:U.time,res:{value:new THREE.Vector2(1,1)},
    hurt:{value:0},storm:{value:0},lowhp:{value:0},flash:{value:0},sat:{value:.88},contrast:{value:1.06},vig:{value:.4},grain:{value:.03},aberr:{value:.0022},fade:{value:0},desat:{value:0},ward:{value:0}};
  const mC=mk(`uniform sampler2D tS,tB,tR;uniform float bloom,rays,exposure,time,hurt,storm,lowhp,flash,sat,contrast,vig,grain,aberr,fade,desat,ward;uniform vec2 res;varying vec2 vUv;
    vec3 aces(vec3 x){return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0);}
    float hh(vec2 p){p=fract(p*vec2(443.897,441.423));p+=dot(p,p.yx+19.19);return fract((p.x+p.y)*p.x);}
    void main(){vec2 uv=vUv;vec2 cc=uv-0.5;float r2=dot(cc,cc);float ca=aberr*(1.0+hurt*3.0);
      vec3 c=vec3(texture2D(tS,uv-cc*ca).r,texture2D(tS,uv).g,texture2D(tS,uv+cc*ca).b);
      c+=texture2D(tB,uv).rgb*bloom;c+=texture2D(tR,uv).rgb*rays;c*=exposure;c=aces(c);
      float l=dot(c,vec3(0.2126,0.7152,0.0722));c=mix(vec3(l),c,sat*(1.0-desat));c=(c-0.5)*contrast+0.5;
      c*=vec3(1.025,1.0,0.965);c+=vec3(0.003,0.008,0.016)*(1.0-l);
      c*=1.0-vig*smoothstep(0.16,0.95,r2*1.85);
      float e=smoothstep(0.05,0.62,r2*1.6);
      c=mix(c,vec3(0.30,0.012,0.008),clamp(hurt*e*1.15+lowhp*e*0.38*(0.72+0.28*sin(time*6.5)),0.0,0.86));
      c=mix(c,c*vec3(0.72,0.6,1.12),storm*0.32);
      c=mix(c,c*vec3(0.8,0.95,1.15),ward*e*0.5);
      c+=flash*vec3(0.85,0.82,1.0);
      c=pow(max(c,0.0),vec3(1.0/2.2));
      c+=(hh(uv*res+fract(time*7.31)*97.0)-0.5)*grain;
      c*=1.0-fade;
      gl_FragColor=vec4(c,1.0);}`,cu);
  const sunNdc=V3();
  function pass(m,t){quad.material=m;renderer.setRenderTarget(t);renderer.render(qs,qc);}
  function resize(){
    renderer.getDrawingBufferSize(sz);const w=Math.max(2,sz.x|0),h=Math.max(2,sz.y|0);
    if(rtS)rtS.dispose();D.forEach(r=>r.dispose());UP.forEach(r=>r.dispose());if(rtR)rtR.dispose();D.length=0;UP.length=0;
    const so=Object.assign({},opts,{depthBuffer:true});
    if(Q.msaa&&isGL2&&THREE.WebGLMultisampleRenderTarget){rtS=new THREE.WebGLMultisampleRenderTarget(w,h,so);rtS.samples=Q.msaa;}else rtS=new THREE.WebGLRenderTarget(w,h,so);
    let bw=w,bh=h;for(let i=0;i<Q.mips;i++){bw=Math.max(1,bw>>1);bh=Math.max(1,bh>>1);D.push(new THREE.WebGLRenderTarget(bw,bh,opts));if(i<Q.mips-1)UP.push(new THREE.WebGLRenderTarget(bw,bh,opts));}
    rtR=new THREE.WebGLRenderTarget(Math.max(1,w>>2),Math.max(1,h>>2),opts);
    cu.res.value.set(w,h);
  }
  function render(raysStr){
    renderer.setRenderTarget(rtS);renderer.render(scene,camera);
    mPre.uniforms.tex.value=rtS.texture;mPre.uniforms.tx.value.set(1/rtS.width,1/rtS.height);pass(mPre,D[0]);
    for(let i=1;i<D.length;i++){mDn.uniforms.tex.value=D[i-1].texture;mDn.uniforms.tx.value.set(1/D[i-1].width,1/D[i-1].height);pass(mDn,D[i]);}
    let src=D[D.length-1];
    for(let i=D.length-2;i>=0;i--){mUp.uniforms.tex.value=src.texture;mUp.uniforms.add.value=D[i].texture;mUp.uniforms.tx.value.set(1/src.width,1/src.height);pass(mUp,UP[i]);src=UP[i];}
    cu.rays.value=0;
    if(Q.rays&&raysStr>0.01){
      sunNdc.copy(camera.position).addScaledVector(SUN_DIR,400).project(camera);
      camera.getWorldDirection(_v4);const facing=_v4.dot(SUN_DIR);
      if(facing>0&&sunNdc.z<1){const sx=sunNdc.x*.5+.5,sy=sunNdc.y*.5+.5;const edge=1-sstep(.55,1.05,Math.max(Math.abs(sx-.5),Math.abs(sy-.5)));
        if(edge>0){mRay.uniforms.tex.value=D[Math.min(1,D.length-1)].texture;mRay.uniforms.sun.value.set(sx,sy);mRay.uniforms.str.value=raysStr*edge*1.7;pass(mRay,rtR);cu.rays.value=1;}}
    }
    cu.tS.value=rtS.texture;cu.tB.value=src.texture;cu.tR.value=rtR.texture;
    pass(mC,null);
  }
  return {resize,render,u:cu};
})();

function applyQuality(){
  Q=QP[SET.quality]||QP.medium;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,Q.pr));
  renderer.setSize(viewW(),viewH());
  const want=Q.shadow>0;
  if(sun.castShadow!==want||sun.shadow.mapSize.x!==(Q.shadow||1024)){
    sun.castShadow=want;sun.shadow.mapSize.set(Q.shadow||1024,Q.shadow||1024);
    if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}
    scene.traverse(o=>{if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true);}});
  }
  U.grassFade.value=Q.grassR*GCH*.92;gPcx=1e9;
  Post.resize();
}
// called by applyOrient (r_orient.js), which listens to resize and orientationchange
function onResize(){camera.aspect=viewW()/Math.max(1,viewH());camera.updateProjectionMatrix();renderer.setSize(viewW(),viewH());Post.resize();}
Post.resize();
