/* ============================== demo map: buildings, nature, light (demo page only) ==============================
   The layout and the terrain are in src/w_demo.js. Everything here is made in code from boxes, lathes and planes, merged per
   material (Batch) or instanced, so the whole valley is a few dozen draw calls. */

/* ---------- textures and materials of the demo ---------- */
const TEXD={},MATD={},DX={};   // textures, materials and the places of the demo (arch, fire, gate…)
// clay roof tiles: rows of half-round tiles, dark blue-grey, with grime
function genTiles(){const S=TS,c=mkC(S),x=c.getContext('2d');x.fillStyle='#2e3236';x.fillRect(0,0,S,S);
  const cols=14,rows=9,cw=S/cols,rh=S/rows;
  for(let r=0;r<rows;r++)for(let k=0;k<cols;k++){const X=k*cw,Y=r*rh,sh=rr(-12,10);
    const g=x.createLinearGradient(X,0,X+cw,0);g.addColorStop(0,rgba(36+sh,40+sh,44+sh,1));g.addColorStop(.45,rgba(96+sh,101+sh,104+sh,1));g.addColorStop(1,rgba(30+sh,33+sh,36+sh,1));
    x.fillStyle=g;x.fillRect(X+1,Y,cw-2,rh);x.fillStyle=rgba(14,15,17,.6);x.fillRect(X,Y+rh-S*.008,cw,S*.008);}
  for(let i=0;i<S*3;i++){x.fillStyle=Math.random()<.5?rgba(70,80,60,rr(.05,.18)):rgba(10,10,10,rr(.05,.2));const s=S*rr(.004,.03);x.fillRect(Math.random()*S,Math.random()*S,s,s*rr(.5,2));}
  return c;}
// lime plaster with damp stains and a darker skirt
function genPlaster(){const S=TS,c=mkC(S);pxFill(c,(u,v,o)=>{const n=tfbm(u,v,6,4,41),s=tfbm(u,v,2,3,57),st=sstep(.55,.75,s)*.35+sstep(.7,1,v)*.25*n;
    const b=lerp(176,214,n)*(1-st);o[0]=b;o[1]=b*.965;o[2]=b*.9;});return c;}
// red cloth for banners and ribbons: woven, faded, with folds
function genCloth(){const S=TS/2,c=mkC(S);pxFill(c,(u,v,o)=>{const n=tfbm(u,v,8,3,63),f=.75+.25*Math.sin(u*TAU*5+n*3),w=(Math.floor(u*S)%2^Math.floor(v*S)%2)?.94:1;
    o[0]=lerp(92,150,n)*f*w;o[1]=lerp(10,24,n)*f*w;o[2]=lerp(12,26,n)*f*w;o[3]=v>.93&&hash2(Math.floor(u*60),3)<.5?0:255;});return c;}
// rounded cobbles for paths and plazas (the terrain's path layer in the demo)
function genCobble(){const S=TS,c=mkC(S),N=11,J=[];for(let k=0;k<N*N;k++)J.push([.15+Math.random()*.7,.15+Math.random()*.7,rr(.72,1.1)]);
  pxFill(c,(u,v,o)=>{let d1=9,d2=9,t=1;const ci=Math.floor(u*N),cj=Math.floor(v*N);
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=ci+di,jj=cj+dj,p=J[((jj%N+N)%N)*N+((ii%N+N)%N)];
      const d=Math.hypot(u-(ii+p[0])/N,v-(jj+p[1])/N);if(d<d1){d2=d1;d1=d;t=p[2];}else if(d<d2)d2=d;}
    const e=sstep(0,.02,d2-d1),n=tfbm(u,v,12,3,77),b=lerp(46,88,n)*t*(.42+.58*e)*(1-.22*sstep(.25,.9,d1*N));o[0]=b;o[1]=b*.98;o[2]=b*.95;});return c;}
// weathered ashlar for the demo's masonry: fine grain, soft stains, hairline cracks, pale lichen (tileable)
function genAshlar(){const S=TS,c=mkC(S);pxFill(c,(u,v,o)=>{const n=tfbm(u,v,4,5,301),f=tfbm(u,v,24,3,317),st=tfbm(u,v,2,3,331),cr=Math.abs(tfbm(u,v,6,4,347)-.5),li=tfbm(u,v,10,3,359);
    let b=lerp(132,190,n)*(.86+.28*f)*(1-.22*sstep(.55,.8,st));b*=1-.28*(1-sstep(0,.012,cr));const l=sstep(.66,.8,li)*.5;
    o[0]=lerp(b,b*1.08+18,l);o[1]=lerp(b*1.01,b*1.1+22,l);o[2]=lerp(b*1.03,b*.92+4,l);});return c;}
// wet flagstones: irregular stones, dark mossy joints; colour, relief (a normal map) and wetness (a roughness map), tileable
function genFlags(){const S=TS,N=6,J=[];for(let k=0;k<N*N;k++)J.push([.1+Math.random()*.8,.1+Math.random()*.8,rr(.72,1.15),rr(-1,1),rr(-1,1),Math.random()]);
  const Hh=new Float32Array(S*S),mk=()=>{const c=mkC(S),x=c.getContext('2d');return[c,x,x.createImageData(S,S)];},[ca,xa,ia]=mk(),[cn,xn,inn]=mk(),[cr,xr,ir]=mk();
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const u0=i/S,v0=j/S,u=u0+(tfbm(u0,v0,5,3,431)-.5)*.06,v=v0+(tfbm(u0,v0,5,3,433)-.5)*.06,ci=Math.floor(u*N),cj=Math.floor(v*N);let d1=9,d2=9,q=J[0],qx=0,qy=0;
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=ci+di,jj=cj+dj,p=J[((jj%N+N)%N)*N+((ii%N+N)%N)],px=(ii+p[0])/N,py=(jj+p[1])/N,d=Math.hypot(u-px,v-py);
      if(d<d1){d2=d1;d1=d;q=p;qx=px;qy=py;}else if(d<d2)d2=d;}
    const e=sstep(.004,.03,d2-d1),n=tfbm(u0,v0,8,4,401),g=tfbm(u0,v0,32,2,409),w=tfbm(u0,v0,2,3,419),cr=1-sstep(0,.014,Math.abs(tfbm(u0,v0,5,4,439)-.5)),o=(j*S+i)*4,jt=1-e,mg=sstep(.4,.7,w),wm=q[5]>.7;
    Hh[j*S+i]=Math.sqrt(e)*(.75+.25*n)+((u-qx)*q[3]+(v-qy)*q[4])*e*1.4-cr*.06*e-sstep(.72,.9,g)*.05;
    const b=lerp(40,82,n)*q[2]*(.88+.24*g)*(1-.45*cr);
    ia.data[o]=lerp(b*(wm?1.06:.97),lerp(24,40,mg),jt);ia.data[o+1]=lerp(b*(wm?1:.99),lerp(26,50,mg),jt);ia.data[o+2]=lerp(b*(wm?.9:1.03),lerp(22,28,mg),jt);ia.data[o+3]=255;
    ir.data[o]=ir.data[o+1]=ir.data[o+2]=lerp(lerp(118,34,sstep(.3,.6,w))*(.8+.4*g),235,Math.max(jt,cr*.35));ir.data[o+3]=255;}
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const h=(a,b2)=>Hh[((b2+S)%S)*S+((a+S)%S)],dx=(h(i+1,j)-h(i-1,j))*S*.012,dy=(h(i,j+1)-h(i,j-1))*S*.012,l=Math.hypot(dx,dy,1),o=(j*S+i)*4;
    inn.data[o]=(-dx/l*.5+.5)*255;inn.data[o+1]=(dy/l*.5+.5)*255;inn.data[o+2]=(1/l*.5+.5)*255;inn.data[o+3]=255;}
  xa.putImageData(ia,0,0);xn.putImageData(inn,0,0);xr.putImageData(ir,0,0);return{a:ca,n:cn,r:cr};}
// a wet sheen: the bright sky mirrored at grazing angles, stronger where the surface is smooth
function wetSheen(m,k){const prev=m.onBeforeCompile;m.onBeforeCompile=sh=>{if(prev)prev(sh);sh.uniforms.uSheen={value:new THREE.Color(.46,.49,.54).multiplyScalar(k)};
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uSheen;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n{float fr=pow(1.0-saturate(dot(normal,normalize(vViewPosition))),4.0);totalEmissiveRadiance+=uSheen*(0.03+fr)*(1.0-roughnessFactor);}');};}
// a flat floor of wet flagstones over a rectangle of the ground, 4.4 m to a repeat of the texture
function flagFloor(x0,x1,z0,z1,y){const g=new THREE.PlaneGeometry(x1-x0,z1-z0);g.rotateX(-PI/2);g.translate((x0+x1)/2,y,(z0+z1)/2);
  const uv=g.attributes.uv,pa=g.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,pa.getX(i)/4.4,-pa.getZ(i)/4.4);
  const m=new THREE.Mesh(g,MATD.flags);m.receiveShadow=true;scene.add(m);}
// vertical weathered boards for house walls
function genBoards(){const S=TS/2,c=mkC(S);pxFill(c,(u,v,o)=>{const k=Math.floor(u*9),f=(u*9)%1,n=tfbm(u*.3+k*.11,v,3,6,93+k),g=tfbm(u,v*.25,40,2,7),e=sstep(0,.06,f)*sstep(1,.94,f);
    const b=lerp(70,120,n)*(.55+.45*e)*(.9+.2*g)*(.85+.15*hash2(k,5));o[0]=b;o[1]=b*.93;o[2]=b*.86;});return c;}
function makeDemoTextures(){demoTexts();TEXD.ashlar=toTex(genAshlar(),{srgb:false});TEXD.boards=toTex(genBoards());TEXD.tiles=toTex(genTiles());TEXD.plaster=toTex(genPlaster());TEXD.cloth=toTex(genCloth());TEXD.cobble=toTex(genCobble());
  MATD.stone=stoneMat(0xb0b4b6,.18,.86,.62,TEXD.ashlar);MATD.stoneDark=stoneMat(0x959a9c,.26,.9,.55,TEXD.ashlar);MATD.rock=stoneMat(0x8b9198,.3,.92,.5);
  MATD.tile=new THREE.MeshStandardMaterial({map:TEXD.tiles,vertexColors:true,roughness:.62,metalness:.05,side:THREE.DoubleSide});
  MATD.plaster=new THREE.MeshStandardMaterial({map:TEXD.plaster,vertexColors:true,roughness:.95});
  MATD.timber=new THREE.MeshStandardMaterial({map:TEX.wood,vertexColors:true,roughness:.78,color:col(0x6b5444)});
  MATD.boards=new THREE.MeshStandardMaterial({map:TEXD.boards,vertexColors:true,roughness:.85,color:col(0xc2b4a4)});
  MATD.paper=new THREE.MeshBasicMaterial({color:new THREE.Color(3.4,1.5,.55)});
  MATD.paperRed=new THREE.MeshBasicMaterial({color:new THREE.Color(3.2,.55,.3)});
  MATD.lacquer=new THREE.MeshStandardMaterial({color:col(0x8e2a20),vertexColors:true,roughness:.55,side:THREE.DoubleSide});
  MATD.slate=new THREE.MeshStandardMaterial({map:TEXD.tiles,vertexColors:true,roughness:.5,color:col(0x9aa3ae),side:THREE.DoubleSide});
  MATD.statue=stoneMat(0x9a9e9f,.35,.85,.9);MATD.statue.vertexColors=false;
  MATD.canvas=new THREE.MeshStandardMaterial({color:col(0xb8a98e),roughness:.95,side:THREE.DoubleSide});
  MATD.window=new THREE.MeshBasicMaterial({color:new THREE.Color(1.4,.7,.28)});MATD.windowDim=new THREE.MeshBasicMaterial({color:new THREE.Color(.72,.36,.15)});MATD.windowFaint=new THREE.MeshBasicMaterial({color:new THREE.Color(.035,.03,.034)});
  MATD.dark=new THREE.MeshBasicMaterial({color:col(0x0b0a09)});
  MATD.caveGlow=new THREE.MeshBasicMaterial({vertexColors:true,color:new THREE.Color(1.9,.82,.3)});
  MATD.cloth=windMat({map:TEXD.cloth,alphaTest:.5,side:THREE.DoubleSide,roughness:.9},0,0,false);
  const bc=MAT.banner.onBeforeCompile;MATD.cloth.onBeforeCompile=bc;
  {const F=genFlags();TEXD.flags=toTex(F.a);TEXD.flagsN=toTex(F.n,{srgb:false});TEXD.flagsR=toTex(F.r,{srgb:false});
    MATD.flags=new THREE.MeshStandardMaterial({map:TEXD.flags,normalMap:TEXD.flagsN,normalScale:new THREE.Vector2(1.3,1.3),roughnessMap:TEXD.flagsR,roughness:1,metalness:0});wetSheen(MATD.flags,1);}}

/* ---------- small builders ---------- */
const DB={};   // the demo's batches, built once by buildDemo
// footprints of the demo's buildings (also their walls for collisions): tests check nobody spawns inside one
const DBOX=[];
function dBox(x,z,w,d,yaw,h){DBOX.push({x,z,w,d,yaw});addBox(x,z,w,d,yaw,h);}
const dY=(x,z)=>gH(x,z);
const grey=(v,s=.05)=>new THREE.Color(v+sr(-s,s),v+sr(-s,s),v+sr(-s,s)*1.1);
// a pointed (Gothic) arch ring of n boxes: centre x,z, springing height y0, half span w, rise above the springing, ring
// thickness t (radial) and depth d (through the wall), facing yaw
function gothicRing(b,mat,cx,y0,cz,w,rise,t,d,yaw,tint,n=14){
  const R=(w*w+rise*rise)/(2*w),c=Math.cos(yaw),s=Math.sin(yaw);
  for(const side of[-1,1]){const ox=-side*(R-w),a0=0,a1=Math.atan2(rise,R-w);
    for(let i=0;i<n;i++){const aa=a0+(a1-a0)*(i+.5)/n,da=(a1-a0)/n,r=R-t/2,lx=ox+side*Math.cos(aa)*r,ly=Math.sin(aa)*r,L=da*R*1.04;
      const wx=cx+lx*c,wz=cz-lx*s;b.add(mat,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(wx,y0+ly,wz,0,yaw,side*(aa-PI/2)+(side<0?0:0),side<0?t:t,L,d,'YXZ'),tint);}}}
// rough masonry: while RB is set, stone boxes become weathered blocks (round edges, chipped faces), four shapes shared by all
let RB=0;
function rockGeo(k){return geo('rblk'+k,()=>{const g=new THREE.SphereGeometry(1,8,6),p=g.attributes.position,nr=g.attributes.normal;let s=k*977+131;
  const rn=()=>{s=(s*16807)%2147483647;return s/2147483647;},ph=[rn()*9,rn()*9,rn()*9],f=a=>Math.sign(a)*Math.pow(Math.abs(a),.2);
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=1+.07*Math.sin(x*4.3+ph[0])*Math.sin(y*3.7+ph[1])*Math.sin(z*4.1+ph[2])-.04*Math.abs(Math.sin((x+z)*6+ph[1]));
    p.setXYZ(i,f(x)*.5*n,f(y)*.5*n,f(z)*.5*n);}
  g.computeVertexNormals();const W=new Map();// weld the normals along the seam and at the poles
  for(let i=0;i<p.count;i++){const key=p.getX(i).toFixed(4)+','+p.getY(i).toFixed(4)+','+p.getZ(i).toFixed(4);let a=W.get(key);if(!a){a=[0,0,0,[]];W.set(key,a);}a[0]+=nr.getX(i);a[1]+=nr.getY(i);a[2]+=nr.getZ(i);a[3].push(i);}
  for(const a of W.values()){const l=Math.hypot(a[0],a[1],a[2])||1;for(const i of a[3])nr.setXYZ(i,a[0]/l,a[1]/l,a[2]/l);}return g;});}
function boxAt(b,mat,x,y,z,w,h,d,yaw=0,tint=WHITE,rx=0,rz=0){const g=RB&&(mat===MATD.stone||mat===MATD.stoneDark||mat===MATD.rock)?rockGeo((Math.abs(x*7.3+z*3.1+y*1.7)*10|0)%4):geo('dbox',()=>new THREE.BoxGeometry(1,1,1));
  b.add(mat,g,M4(x,y,z,rx,yaw,rz,w,h,d,'YXZ'),tint);}
function cylAt(b,mat,x,y,z,r,h,seg=10,tint=WHITE,r2=r){b.add(mat,geo('dcyl'+seg+(r2===r?'':'t'+(r2/r).toFixed(2)),()=>new THREE.CylinderGeometry(r2/r,1,1,seg)),M4(x,y,z,0,0,0,r,h,r),tint);}

/* ---------- the bonfire terrace ---------- */
// the picture's foreground: wet flagstones, the bonfire with the sword at the foot of the ruined arch, a parapet of rough blocks
// along the arch towards the head of the stairs, posts and copings green with moss
function demoTerrace(){const b=DB.stone,y=dY(-4,-4);
  flagFloor(-10.8,-.85,-14.25,6.4,y+.02);flagFloor(-.75,8.4,-9.75,6.4,y+.02);
  // retaining walls under the edges
  const wall=(ax,az,bx,bz,h)=>{const L=Math.hypot(bx-ax,bz-az),n=Math.ceil(L/1.2);for(let i=0;i<n;i++){const t=(i+.5)/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=dY(px,pz);
      boxAt(b,MATD.stoneDark,px,yy-h/2+.1,pz,L/n+.02,h,.7,-Math.atan2(bz-az,bx-ax),grey(sr(.66,.8)));}};
  wall(-11,-14.65,-.6,-14.65,3.6);wall(-.65,-14.65,-.65,-9.9,3.6);wall(2.55,-9.95,9,-9.95,3.2);wall(9,-9.95,9,6.8,4);wall(-11.05,-14.65,-11.05,6.8,4);
  // parapets: under the arch towards the stairs, round the east half of the terrace
  parapet(b,-8.55,-14.45,-.95,-14.45,y);parapet(b,2.75,-9.78,8.8,-9.78,y);parapet(b,8.8,-9.78,8.8,6.6,y);parapet(b,-10.85,-14.3,-10.85,6.4,y,.7);
  addSeg(-10.9,-14.5,-.9,-14.5,.4,1.2);addSeg(2.7,-9.8,8.9,-9.8,.35,1.2);addSeg(8.9,-9.8,8.9,6.8,.35,1.2);addSeg(-10.9,-14.5,-10.9,6.8,.35,1.2);
  // a low curb along the west side of the stairs' head, with the big corner post where the parapet ends
  {const n=5;for(let i=0;i<n;i++){const z=lerp(-10.1,-14.1,(i+.5)/n);boxAt(b,MATD.stone,-.82,y+.17,z,.5,.34,4/n-.05,0,grey(sr(.64,.76)));}addSeg(-.82,-9.9,-.82,-14.3,.25,.6);}
  bigPost(b,-.95,y,-14.45);
  photoArch(b,DEMO.arch.x,y,DEMO.arch.z,DEMO.arch.yaw);
  bonfire(DEMO.shrines[0].x,y,DEMO.shrines[0].z);}
// a square post of big blocks, a cap, moss on top
function bigPost(b,x,y,z,h=1.45,s=.74){boxAt(b,MATD.stone,x,y+h/2,z,s,h,s,sr(-.05,.05),grey(sr(.62,.74)));boxAt(b,MATD.stone,x,y+h+.08,z,s+.14,.16,s+.14,sr(-.05,.05),new THREE.Color(.62,.65,.59));
  const r=srnd();if(r<.4)boxAt(b,MATD.stone,x,y+h+.27,z,s*.55,.22,s*.55,.5,grey(.7));
  else if(r<.85){cylAt(b,MATD.stone,x,y+h+.26,z,.15,.2,8,grey(.72));b.add(MATD.stone,geo('dpomS',()=>new THREE.SphereGeometry(1,10,8)),M4(x,y+h+.55,z,0,0,0,.25,.22,.25),grey(.74));
    b.add(MATD.stone,geo('dtip',()=>{const g=new THREE.ConeGeometry(1,1,8);g.translate(0,.5,0);return g;}),M4(x,y+h+.74,z,0,0,0,.08,.2,.08),grey(.74));}}
// a parapet of rough blocks in two courses, uneven, with a mossy coping and big posts every few metres
function parapet(b,ax,az,bx,bz,y0,h=1.05){const L=Math.hypot(bx-ax,bz-az),yaw=-Math.atan2(bz-az,bx-ax);
  for(const[c0,ch]of[[0,h*.52],[h*.52,h*.42]]){let u=0;while(u<L-.05){const l=Math.min(sr(.7,1.4),L-u),t=(u+l/2)/L,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=y0===undefined?dY(px,pz):y0;
      if(c0===0||srnd()>.06)boxAt(b,MATD.stone,px,yy+c0+ch/2,pz,l-.05,ch-.03,.5+sr(-.04,.04),yaw+sr(-.03,.03),grey(sr(.56,.74)),sr(-.02,.02),sr(-.02,.02));u+=l;}}
  const n=Math.max(1,Math.round(L/1.6));for(let i=0;i<n;i++){const t=(i+.5)/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=y0===undefined?dY(px,pz):y0,g=sr(.55,.7);
    boxAt(b,MATD.stone,px,yy+h+.06,pz,L/n-.04,.13,.62,yaw+sr(-.02,.02),srnd()<.25?new THREE.Color(g*.92,g*.97,g*.86):grey(g+.04));}
  const np=Math.max(1,Math.round(L/3.4));for(let i=0;i<=np;i++){const t=i/np,px=lerp(ax,bx,t),pz=lerp(az,bz,t);bigPost(b,px,y0===undefined?dY(px,pz):y0,pz);}}
// the ruined arch of the picture: a massive pier of rough blocks on the left, a slender column with a carved capital on the
// parapet to the right, a lancet arch of moulded rings with cusps hanging inside, a broken springer going on to the right
function photoArch(b,x,y,z,yaw){const c=Math.cos(yaw),s=Math.sin(yaw),P=(u,v,w)=>[x+u*c+w*s,y+v,z-u*s+w*c],st=MATD.stone,dk=MATD.stoneDark;
  const span=1.05,HS=5.1,rise=3.3;
  for(let k=0;k<10;k++){const hy=k*1.08,ok=k<8||srnd()<.6;if(!ok)continue;let u0=-span-2.2;
    while(u0<-span-.02){const w=Math.min(sr(.7,1.05),-span-u0),[px,py,pz]=P(u0+w/2+sr(-.04,.04),hy+.54,sr(-.05,.05));boxAt(b,st,px,py,pz,w-.04,1.04,1.55+sr(-.08,.08),yaw+sr(-.02,.02),grey(sr(.58,.76)),sr(-.015,.015),sr(-.015,.015));u0+=w;}}
  {const[px,py,pz]=P(-span-1.1,10.9,0);boxAt(b,dk,px,py,pz,1.7,.7,1.4,yaw+.1,grey(.62),.06,.08);}
  // the column: plinth on the parapet, a round shaft, a flared capital and an abacus
  {const[px,,pz]=P(span+.15,0,0);boxAt(b,st,px,y+1.32,pz,1,.36,1,yaw,grey(.7));cylAt(b,st,px,y+1.58,pz,.46,.18,14,grey(.72));
    cylAt(b,st,px,y+1.67+1.5,pz,.36,3,14,grey(sr(.66,.74)));cylAt(b,st,px,y+4.84,pz,.37,.46,14,grey(.74),.56);boxAt(b,st,px,y+5.15,pz,1.18,.18,1.18,yaw,grey(.78));
    boxAt(b,st,px,y+4.5,pz,.82,.12,.82,yaw+.78,grey(.72));addCol(px,pz,.6,6);}
  {const[px,,pz]=P(-span-1.1,0,0);dBox(px,pz,2.3,1.6,yaw,8);}
  // the rings: an outer archivolt, two mouldings, the hood; cusps hanging from the inner ring
  gothicRing(b,st,x,y+HS,z,span+.5,rise+.35,.95,1.45,yaw,grey(.74),20);gothicRing(b,st,x,y+HS,z,span-.12,rise-.2,.3,1,yaw,grey(.68),16);
  gothicRing(b,dk,x,y+HS,z,span-.34,rise-.42,.14,.55,yaw,grey(.66),16);
  {const R=((span-.34)**2+(rise-.42)**2)/(2*(span-.34));
    for(const[cu,cv,cr]of[[0,rise-1.1,.42],[-.62,rise-2.05,.38],[.62,rise-2.05,.38],[-.95,rise-2.9,.3],[.95,rise-2.9,.3]]){const[qx,qy,qz]=P(cu,HS+cv,0);
      b.add(st,geo('cusp',()=>new THREE.TorusGeometry(1,.16,6,14,PI*1.25)),M4(qx,qy,qz,0,yaw,-PI*.125+PI,cr,cr,cr*1.2,'YXZ'),grey(.72));
      b.add(st,geo('drop',()=>{const g=new THREE.ConeGeometry(1,1,6);g.rotateX(PI);return g;}),M4(qx,qy-cr*1.05,qz,0,yaw,0,.07,.26,.07,'YXZ'),grey(.7));}}
  // the carved springer over the capital, reaching out to the right, and the stub of the next arch
  {const[px,py,pz]=P(span+.5,HS+.2,.05);boxAt(b,st,px,py,pz,.9,.5,.66,yaw,grey(.72),0,-.08);const[qx,qy,qz]=P(span+.95,HS+.08,.05);boxAt(b,dk,qx,qy,qz,.34,.42,.5,yaw+.2,grey(.64),.1,.2);}
  // creeper on the pier: red-orange leaves, some dark green, climbing the face towards the camera
  const vines=[];for(let k=0;k<8;k++)vines.push(sr(-span-2.2,-span+.15));
  for(let i=0;i<160;i++){const vu=vines[i%8],fv=Math.pow(srnd(),.6)*10.4,fu=vu+Math.sin(fv*1.7+i)*.18+sr(-.2,.2),[lx,ly,lz]=P(fu,fv,.8+sr(0,.14)),red=srnd()<.75;
    DB.leaf.add(MATD.ivy,geo('ivyQ',()=>new THREE.PlaneGeometry(1,1)),M4(lx,ly,lz,sr(-.4,.4),yaw+sr(-.5,.5),sr(0,TAU),sr(.5,.8),sr(.5,.8),1,'YXZ'),red?new THREE.Color(sr(.55,.78),sr(.16,.27),sr(.09,.14)):new THREE.Color(sr(.2,.28),sr(.28,.36),sr(.14,.2)));}
  for(let i=0;i<22;i++){const a=sr(.15,PI*.48),[lx,ly,lz]=P(-Math.cos(a)*(span+.3),HS+Math.sin(a)*(rise+.2),.6);
    DB.leaf.add(MATD.ivy,geo('ivyQ',()=>new THREE.PlaneGeometry(1,1)),M4(lx,ly,lz,sr(-.4,.4),yaw+sr(-.5,.5),sr(0,TAU),sr(.45,.7),sr(.45,.7),1,'YXZ'),new THREE.Color(sr(.55,.78),sr(.16,.26),sr(.09,.14)));}
  // a broken wall to the west and fallen blocks
  for(let i=0;i<3;i++){const[wx,,wz]=P(-span-2.6-i*.9,0,0),h=sr(2.5,4.6)*(1-i*.2),wy=dY(wx,wz);boxAt(b,dk,wx,wy+h/2-.3,wz,.95,h,.85,yaw+sr(-.03,.03),grey(sr(.6,.72)));}
  DX.arch={x,y,z,yaw,span,H:HS-1.1,HS};}
function bonfire(x,y,z){const b=DB.stone;
  for(let i=0;i<13;i++){const a=i/13*TAU+sr(-.1,.1),r=sr(.78,.92);boxAt(b,MATD.rock,x+Math.cos(a)*r,y+.16,z+Math.sin(a)*r,sr(.34,.48),sr(.3,.42),sr(.3,.4),sr(0,3),grey(sr(.46,.62)),sr(-.3,.3),sr(-.3,.3));}
  for(let i=0;i<7;i++){const a=i/7*TAU+.3;b.add(MAT.wood,geo('dlog',()=>new THREE.CylinderGeometry(.07,.09,1,7)),M4(x+Math.cos(a)*.2,y+.28,z+Math.sin(a)*.2,Math.sin(a)*1.05,0,-Math.cos(a)*1.05,1.25,1.25,1.25),new THREE.Color(.22,.18,.16));}
  // the sword, driven into the embers at a slant, its hilt leaning left towards the arch
  const sb=DB.metal,rz=.12,dx=-Math.sin(rz),dy=Math.cos(rz),tx=x-.34,ty=y+.02,tz=z-.32,at=(k)=>[tx+dx*k,ty+dy*k,tz];
  {const[a1,a2,a3]=at(.76);boxAt(sb,MAT.metal,a1,a2,a3,.085,1.52,.024,0,new THREE.Color(.82,.82,.86),0,rz);}
  {const[a1,a2,a3]=at(1.54);boxAt(sb,MAT.metal,a1,a2,a3,.58,.07,.08,0,new THREE.Color(.5,.45,.4),0,rz);}
  {const[a1,a2,a3]=at(1.74);b.add(MAT.wood,geo('dcyl8',()=>new THREE.CylinderGeometry(1,1,1,8)),M4(a1,a2,a3,0,0,rz,.042,.36,.042,'YXZ'),new THREE.Color(.24,.15,.11));}
  {const[a1,a2,a3]=at(1.96);b.add(MAT.metal,geo('dpom',()=>new THREE.SphereGeometry(1,8,6)),M4(a1,a2,a3,0,0,0,.065),new THREE.Color(.62,.56,.45));}
  const fr=makeFire(x,y+.14,z,.78,true);if(fr.l){fr.l.i=2.4;fr.l.d=10;}DX.fire={x,y,z};addCol(x,z,1,2);}
function balustrade(b,ax,az,bx,bz,y0,h=1.05){const L=Math.hypot(bx-ax,bz-az),yaw=-Math.atan2(bz-az,bx-ax),n=Math.max(1,Math.round(L/2.4));
  for(let i=0;i<=n;i++){const t=i/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=(y0===undefined?dY(px,pz):y0);
    boxAt(b,MATD.stone,px,yy+h/2,pz,.38,h,.38,yaw,grey(sr(.72,.86)));boxAt(b,MATD.stone,px,yy+h+.07,pz,.48,.14,.48,yaw,grey(.8));
    if(srnd()<.35)boxAt(b,MATD.stone,px,yy+h+.22,pz,.22,.18,.22,yaw+.7,grey(.78));}
  for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,mx=lerp(ax,bx,(t0+t1)/2),mz=lerp(az,bz,(t0+t1)/2),yy=(y0===undefined?dY(mx,mz):y0);
    boxAt(b,MATD.stone,mx,yy+h-.04,mz,L/n,.12,.3,yaw,grey(sr(.74,.84)));boxAt(b,MATD.stone,mx,yy+.1,mz,L/n,.14,.32,yaw,grey(.72));
    const nb=Math.floor(L/n/.32);for(let k=1;k<nb;k++){const tt=lerp(t0,t1,k/nb),qx=lerp(ax,bx,tt),qz=lerp(az,bz,tt);
      cylAt(b,MATD.stone,qx,yy+.1+(h-.24)/2+.07,qz,.07,h-.24,7,grey(sr(.7,.82)),.05);}}}
/* ---------- the stairs down to the village ---------- */
// a short flight of big worn slabs from the terrace, then a cobbled road down to the village; on the gorge side a parapet of
// rough blocks with big posts, on the other side a lantern post, a wooden fence and pampas, as in the picture
function demoStairs(){const b=DB.stone,R=DEMO.RAMP[0],ax=R[0],az=R[1],ya=R[2],bx=R[3],bz=R[4],yb=R[5],hw=R[6],Q=DEMO.RAMP[3];
  const L=Math.hypot(bx-ax,bz-az),n=Math.round((ya-yb)/.24),yaw=-Math.atan2(bz-az,bx-ax)+PI/2;addRamp(ax,az,ya,bx,bz,yb,hw);
  for(let i=0;i<n;i++){const t=(i+.5)/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=lerp(ya,yb,t)+.02;
    let u=-hw;while(u<hw){const w=Math.min(sr(1.1,2.4),hw-u),g=sr(.58,.8),mo=srnd()<.25;boxAt(b,MATD.stone,px+(u+w/2),yy-.2+sr(-.02,.02),pz+sr(-.04,.04),w-.06,.44,L/n+.04,yaw+sr(-.025,.025),mo?new THREE.Color(g*.86,g*.92,g*.78):grey(g,.04),sr(-.015,.015),sr(-.015,.015));u+=w;}}
  // the west side of the flight below the terrace: a retaining wall
  for(let i=0;i<4;i++){const t=(i+.5)/4,pz=lerp(-14.6,bz,t),yy=lerp(ya,yb,(pz-az)/(bz-az)),gy=dY(ax-hw-1.4,pz),h=Math.max(1,yy-gy+.6);boxAt(b,MATD.stoneDark,ax-hw-.3,yy-h/2+.25,pz,.6,h,(bz+14.6)/4+.04,0,grey(sr(.62,.74)));}
  // the gorge side: a solid wall up from the slope, the parapet on top, along the flight and down the road
  const wallUnder=(x0,z0,y0,x1,z1,y1)=>{const L2=Math.hypot(x1-x0,z1-z0),k=Math.ceil(L2/1.6);for(let i=0;i<k;i++){const t=(i+.5)/k,px=lerp(x0,x1,t),pz=lerp(z0,z1,t),yy=lerp(y0,y1,t),gy=dY(px+1.4,pz),h=Math.max(.8,yy-gy+1);
      boxAt(b,MATD.stoneDark,px,yy-h/2+.1,pz,.62,h,L2/k+.04,-Math.atan2(z1-z0,x1-x0)+PI/2,grey(sr(.6,.72)));}};
  const ex=ax+hw+.3,qx0=Q[0]+Q[6]+.28,qx1=Q[3]+Q[6]+.28;
  wallUnder(ex,az,ya,ex,bz,yb);wallUnder(qx0,Q[1],Q[2],qx1,Q[4],Q[5]);
  parapetSlope(b,ex,az,ya,ex,bz,yb);parapetSlope(b,qx0,Q[1],Q[2],qx1,Q[4],Q[5]);
  addSeg(ex,az,ex,bz,.3,1.3);addSeg(qx0,Q[1],qx1,Q[4],.3,1.3);
  // the village side of the road: two lantern posts with lights, a fence of split rails
  const at=(t,off)=>[lerp(Q[0],Q[3],t)-Q[6]-off,lerp(Q[1],Q[4],t)];
  for(const t of[.32,.72]){const[x,z]=at(t,.55);lanternPost(x,dY(x,z),z,true);}
  {const[x0,z0]=at(.4,.9),[x1,z1]=at(.66,1.1);fence(x0,z0,x1,z1);}
  {const[x,z]=at(1,-.4);lanternPost(x+Q[6]+.8,dY(x+Q[6]+.8,z),z,false);}}
function balustradeSlope(b,ax,az,ya,bx,bz,yb,h=1){const L=Math.hypot(bx-ax,bz-az),n=Math.round(L/2.2),yaw=-Math.atan2(bz-az,bx-ax),sl=Math.atan2(yb-ya,L);
  for(let i=0;i<=n;i++){const t=i/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=lerp(ya,yb,t);boxAt(b,MATD.stone,px,yy+h/2,pz,.36,h,.36,yaw,grey(sr(.72,.84)));
    boxAt(b,MATD.stone,px,yy+h+.07,pz,.46,.14,.46,yaw,grey(.8));}
  for(let i=0;i<n;i++){const t=(i+.5)/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=lerp(ya,yb,t);
    boxAt(b,MATD.stone,px,yy+h-.04,pz,L/n/Math.cos(sl),.12,.28,yaw,grey(.8),0,sl);
    const nb=6;for(let k=1;k<nb;k++){const tt=(i+k/nb)/n,qx=lerp(ax,bx,tt),qz=lerp(az,bz,tt),qy=lerp(ya,yb,tt);cylAt(b,MATD.stone,qx,qy+h/2,qz,.065,h-.1,7,grey(sr(.7,.82)),.05);}}}
// a solid sloping parapet: wall courses following the slope, a coping, big square posts with caps every few metres
function parapetSlope(b,ax,az,ya,bx,bz,yb,h=.95){const L=Math.hypot(bx-ax,bz-az),yaw=-Math.atan2(bz-az,bx-ax),sl=Math.atan2(yb-ya,L),n=Math.ceil(L/1.3);
  for(let i=0;i<n;i++){const t=(i+.5)/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=lerp(ya,yb,t);boxAt(b,MATD.stone,px,yy+h/2-.05,pz,L/n/Math.cos(sl)+.03,h,.46,yaw,grey(sr(.6,.76)),0,sl);
    boxAt(b,MATD.stone,px,yy+h+.02,pz,L/n/Math.cos(sl)+.03,.14,.56,yaw,grey(sr(.72,.82)),0,sl);}
  const np=Math.max(1,Math.round(L/3.2));for(let i=0;i<=np;i++){const t=i/np,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=lerp(ya,yb,t);
    boxAt(b,MATD.stone,px,yy+(h+.35)/2,pz,.64,h+.35,.64,yaw,grey(sr(.64,.76)));boxAt(b,MATD.stone,px,yy+h+.42,pz,.76,.14,.76,yaw,grey(.8));
    if(srnd()<.5)boxAt(b,MATD.stone,px,yy+h+.6,pz,.4,.22,.4,yaw+.78,grey(.76));}}
// a stone post with a hanging paper lantern (warm glow), a pool light only for some of them
const LANTERNS=[];
function lanternPost(x,y,z,light=false){const b=DB.stone;boxAt(b,MATD.stone,x,y+.25,z,.24,.5,.24,0,grey(.78));
  const g=DB.glow;g.add(MATD.paper,geo('lant',()=>gLathe([[0,-.18],[.11,-.15],[.15,0],[.11,.15],[0,.18]],10)),M4(x,y+.72,z),WHITE);
  boxAt(DB.metal,MAT.metal,x,y+.92,z,.2,.04,.2,0,new THREE.Color(.25,.22,.2));
  LANTERNS.push(V3(x,y+.72,z));if(light)addLight(V3(x,y+.8,z),col(0xffa25a),1.6,9,1);}

/* ---------- the bridge over the gorge, the gate in the cliff ---------- */
// the bridge's frame: u along the deck from the village end (0) to the gate (L), w across; boxes turned by yaw lie along u
function bridgeFrame(){const B=DEMO.bridge,dx=B.bx-B.ax,dz=B.bz-B.az,L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L;
  return{B,L,ux,uz,yaw:-Math.atan2(dz,dx),P:(u,w)=>[B.ax+ux*u-uz*w,B.az+uz*u+ux*w]};}
function demoBridge(){const b=DB.stone,F=bridgeFrame(),{B,L,yaw,P}=F,y=B.y,hw=B.hw;
  // deck, parapets with copings
  const nd=Math.ceil(L/1.4);for(let i=0;i<nd;i++){const[px,pz]=P((i+.5)*L/nd,0);boxAt(b,MATD.stone,px,y-.35,pz,L/nd+.02,.7,hw*2+.6,yaw,grey(sr(.64,.78)));}
  for(const side of[-1,1]){const np=Math.ceil(L/1.6);for(let i=0;i<np;i++){const[px,pz]=P((i+.5)*L/np,side*(hw+.15));
      boxAt(b,MATD.stone,px,y+.45,pz,L/np-.03,.9,.42,yaw,grey(sr(.62,.78)));boxAt(b,MATD.stone,px,y+.96,pz,L/np,.12,.52,yaw,grey(.78));}
    const[a1,a2]=P(-1,side*(hw+.15)),[b1,b2]=P(L+1,side*(hw+.15));addSeg(a1,a2,b1,b2,.25,1.4);}
  // the big arch spans the gorge where it is deeper than 3 m under the deck; spandrel walls fill up to the deck
  let u0=-1,u1=-1;for(let u=0;u<=L;u+=.25){const[px,pz]=P(u,0);if(DEMO.h0(px,pz)<y-3){if(u0<0)u0=u;u1=u;}}
  if(u0<0){u0=L*.3;u1=L*.7;}
  const uc=(u0+u1)/2,R=(u1-u0)/2*1.08+1,yA=y-1.2;
  for(let i=0;i<28;i++){const a0=i/28*PI,a1=(i+1)/28*PI,am=(a0+a1)/2,[px,pz]=P(uc+Math.cos(am)*R,0);
    boxAt(b,MATD.stoneDark,px,yA-R+Math.sin(am)*R,pz,(a1-a0)*R+.08,1.3,hw*2+.3,yaw,grey(sr(.58,.7)),0,am-PI/2);}
  const ns=Math.ceil(L/1.5);for(let i=0;i<ns;i++){const u=(i+.5)*L/ns,q=(u-uc)/R,[px,pz]=P(u,0),gy=DEMO.h0(px,pz),ay=Math.abs(q)<1?yA-R+Math.sqrt(1-q*q)*R:Math.min(gy,yA-R),top=y-.7,h=top-ay;
    if(h>.1)boxAt(b,MATD.stoneDark,px,ay+h/2,pz,L/ns+.03,h,hw*2+.1,yaw,grey(sr(.6,.72)));}
  // piers down into the ground at both ends, banners on tall poles, lanterns along the parapets
  for(const u of[1.2,L-1.2]){const[px,pz]=P(u,0),gy=dY(px,pz);boxAt(b,MATD.stoneDark,px,(y-.7+gy-4)/2,pz,3,y-.7-gy+4,hw*2+1.2,yaw,grey(.62));}
  for(const u of[.6,L-.6])for(const side of[-1,1]){const[px,pz]=P(u,side*(hw+.15));banner(px,y+1,pz,4.6,.7,1.9,yaw);}
  for(let i=0;i<=8;i++)for(const side of[-1,1]){const[px,pz]=P(i*L/8,side*(hw+.15));boxAt(b,MATD.stone,px,y+.7,pz,.62,1.4,.62,yaw,grey(sr(.66,.78)));boxAt(b,MATD.stone,px,y+1.45,pz,.74,.14,.74,yaw,grey(.8));
    if(i%2===1)lanternPost(px,y+1.52,pz);}
  const[ra,rb]=P(-1.5,0),[rc,rd]=P(L+1.5,0);addRamp(ra,rb,y,rc,rd,y,hw+.2);}
function banner(x,y,z,pole,w,h,yaw=0){cylAt(DB.metal,MAT.wood,x,y+pole/2,z,.06,pole,6,new THREE.Color(.3,.24,.2));
  boxAt(DB.metal,MAT.wood,x,y+pole-.1,z,.05,.05,w+.2,yaw,new THREE.Color(.3,.24,.2));
  DB.cloth.add(MATD.cloth,geo('bann',()=>{const g=new THREE.PlaneGeometry(1,1,1,6);g.translate(0,-.5,0);return g;}),M4(x,y+pole-.15,z,0,yaw+PI/2,0,w,h,1),WHITE);}
// the gate at the far end of the bridge: two towers, a pointed arch with a half-raised portcullis, curtain walls along the cliff
function demoGate(){const b=DB.stone,G=DEMO.gate,F=bridgeFrame(),{ux,uz,yaw}=F,y=F.B.y,P=(u,w)=>[G.x+ux*u-uz*w,G.z+uz*u+ux*w],ry=Math.atan2(-ux,-uz);
  for(const side of[-1,1]){const[tx,tz]=P(1.5,side*3.4);boxAt(b,MATD.stoneDark,tx,y+5,tz,4.2,10,3,yaw,grey(.66));boxAt(b,MATD.stone,tx,y+10.2,tz,4.6,.4,3.4,yaw,grey(.76));
    for(let k=-1;k<=1;k++){const[cx,cz]=P(1.5+k*1.4,side*3.4);boxAt(b,MATD.stone,cx,y+10.75,cz,.8,.7,3.4,yaw,grey(.74));}
    dBox(tx,tz,4.2,3,yaw,8);const[bx,bz]=P(-.8,side*3.4);banner(bx,y+3.4,bz,3,1,3.6,yaw);
    const[lx,lz]=P(-.6,side*1.9);lanternPost(lx,y,lz,side<0);
    // a short stretch of wall either side, stepping down into the rock
    for(let k=0;k<2;k++){const w=side*(5.4+k*1.5),[cx,cz]=P(2.2,w),gy=Math.max(Math.min(dY(cx,cz),y),y-8);boxAt(b,MATD.stoneDark,cx,(gy-2+y+6-k*1.6)/2,cz,2,y+6-k*1.6-gy+2,1.5,yaw,grey(sr(.62,.72)));}
    {const[a1,a2]=P(2,side*4.8),[b1,b2]=P(2,side*7.4);addSeg(a1,a2,b1,b2,1,8);}}
  // the arch over the passage and the wall above it, then the wooden portcullis, half raised
  {const[ax,az]=P(.1,0);gothicRing(b,MATD.stone,ax,y+4.1,az,1.9,2.1,.55,3,ry,grey(.74),12);}
  {const[wx,wz]=P(1.5,0);boxAt(b,MATD.stoneDark,wx,y+8.2,wz,4.2,3.6,3.8,yaw,grey(.64));}
  for(let i=0;i<7;i++){const[px,pz]=P(.5,-1.6+i*.53);boxAt(DB.metal,MATD.timber,px,y+5.4,pz,.16,3.8,.14,yaw,new THREE.Color(.5,.42,.36));}
  for(let i=0;i<5;i++){const[px,pz]=P(.5,0);boxAt(DB.metal,MATD.timber,px,y+3.9+i*.7,pz,.16,.14,3.6,yaw,new THREE.Color(.45,.38,.32));}
  DX.gate={x:G.x,y,z:G.z};}

/* ---------- zig-zag stairs up the cliff: solid stone flights and landings, wooden railings ---------- */
function demoZig(){const b=DB.stone,w=DB.metal;
  for(const [ax,az,ya,bx,bz,yb,hw] of DEMO.ZIG){const L=Math.hypot(bx-ax,bz-az),yaw=-Math.atan2(bz-az,bx-ax),n=Math.max(2,Math.round(L/.45)),flat=Math.abs(yb-ya)<.01;
    for(let i=0;i<n;i++){const t=(i+.5)/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),top=flat?ya:lerp(ya,yb,(i+1)/n),gy=Math.min(dY(px+Math.sin(yaw)*hw,pz+Math.cos(yaw)*hw),dY(px-Math.sin(yaw)*hw,pz-Math.cos(yaw)*hw),top-.5)-1.5;
      boxAt(b,MATD.stoneDark,px,(top+gy)/2,pz,L/n+.03,top-gy,hw*2+.2,yaw,grey(sr(.6,.72)));
      boxAt(b,MATD.stone,px,top-.06,pz,L/n+.05,.14,hw*2+.32,yaw,grey(sr(.7,.82)));}
    // railings on both long sides: posts, a top rail and a mid rail
    for(const sd of[-1,1]){const ox=Math.sin(yaw)*(hw+.1)*sd,oz=Math.cos(yaw)*(hw+.1)*sd,np=Math.max(1,Math.round(L/1.8));
      for(let k=0;k<=np;k++){const t=k/np,px=lerp(ax,bx,t)+ox,pz=lerp(az,bz,t)+oz,py=lerp(ya,yb,t);boxAt(w,MATD.timber,px,py+.55,pz,.12,1.1,.12,yaw,new THREE.Color(.55,.45,.38));}
      const sl=Math.atan2(yb-ya,L);for(const hh of[1.02,.55])boxAt(w,MATD.timber,(ax+bx)/2+ox,(ya+yb)/2+hh,(az+bz)/2+oz,L/Math.cos(sl),.08,.08,yaw,new THREE.Color(.5,.41,.34),0,sl);
      addSeg(ax+ox,az+oz,bx+ox,bz+oz,.12,ya+2);}
    addRamp(ax,az,ya,bx,bz,yb,hw);}}

/* ---------- the village: timber houses with curved tile roofs, stalls, fences, lanterns ---------- */
// one slope of a gable roof: ridge along the house's local x at height y0+rise, eave at y0 out at local z = side*(D/2+ov),
// concave like the old tile roofs, the eave corners turned up by `up`
function roofSheet(b,mat,cx,y0,cz,yaw,W,D,rise,ov,up,side,tint){const nx=10,nz=6,P=[],UV=[],I=[],c=Math.cos(yaw),s=Math.sin(yaw),hw=W/2+ov,dz=D/2+ov;
  for(let j=0;j<=nz;j++){const t=j/nz,lz=side*t*dz,ly=rise*Math.pow(1-t,1.45);
    for(let i=0;i<=nx;i++){const u=i/nx,lx=(u*2-1)*hw,e=Math.pow(Math.abs(u*2-1),5)*up*t*t;P.push(cx+lx*c+lz*s,y0+ly+e,cz-lx*s+lz*c);UV.push(lx/2.4,t*dz/1.7);}}
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,a2=a+1,a3=a+nx+1,a4=a3+1;if(side>0)I.push(a,a3,a2,a2,a3,a4);else I.push(a,a2,a3,a2,a4,a3);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.setIndex(I);g.computeVertexNormals();
  b.add(mat,g,IDM,tint||WHITE);}
// triangle closing a gable end (local x = ±W/2), base from z -D/2 to D/2 at y0, apex at y0+rise
function gableEnd(b,mat,cx,y0,cz,yaw,lx,D,rise,tint){const c=Math.cos(yaw),s=Math.sin(yaw),w=(a,b2)=>[cx+a*c+b2*s,cz-a*s+b2*c];
  const p1=w(lx,-D/2),p2=w(lx,D/2),p3=w(lx,0),g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute([p1[0],y0,p1[1],p2[0],y0,p2[1],p3[0],y0+rise,p3[1]],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,1],2));
  g.setIndex(lx>0?[0,2,1]:[0,1,2]);g.computeVertexNormals();b.add(mat,g,IDM,tint||WHITE);}
const WOOD=()=>new THREE.Color(.42+sr(-.04,.04),.33+sr(-.03,.03),.27+sr(-.03,.03));
function house(x,z,yaw,W,D,fl,o={}){const y=dY(x,z),c=Math.cos(yaw),s=Math.sin(yaw),L=(a,b2)=>[x+a*c+b2*s,z-a*s+b2*c];
  const H1=2.8,Hw=H1*fl,y1=y+.55,wood=DB.wood,pl=DB.plaster;
  boxAt(DB.stone,MATD.stoneDark,x,y-.2,z,W+.5,1.5,D+.5,yaw,grey(.6));
  const boards=o.boards!==undefined?o.boards:srnd()<.85;
  if(boards)boxAt(wood,MATD.boards,x,y1+Hw/2,z,W-.1,Hw,D-.1,yaw,new THREE.Color(sr(.6,.72),sr(.55,.66),sr(.5,.6)));
  else boxAt(pl,MATD.plaster,x,y1+Hw/2,z,W-.1,Hw,D-.1,yaw,new THREE.Color(sr(.34,.42),sr(.33,.4),sr(.31,.37)));
  // timber frame: posts on every face, sill, head and floor beams
  for(const sd of[-1,1]){const n=Math.max(2,Math.round(W/1.7));for(let i=0;i<=n;i++){const[px,pz]=L(-W/2+i*W/n,sd*D/2);boxAt(wood,MATD.timber,px,y1+Hw/2,pz,.2,Hw,.2,yaw,WOOD());}
    const m=Math.max(2,Math.round(D/1.7));for(let i=1;i<m;i++){const[px,pz]=L(sd*W/2,-D/2+i*D/m);boxAt(wood,MATD.timber,px,y1+Hw/2,pz,.2,Hw,.2,yaw,WOOD());}}
  for(let k=0;k<=fl;k++){const hy=y1+k*H1-(k?.05:0);boxAt(wood,MATD.timber,x,hy,z,W+.06,.18,D+.06,yaw,WOOD());}
  // front: a door and lattice windows, most lit from inside
  for(let k=0;k<fl;k++){const n=Math.max(1,Math.round(W/2.6));for(let i=0;i<n;i++){const u=-W/2+(i+.5)*W/n,door=k===0&&i===Math.floor(n/2)&&!o.stall;
      const[px,pz]=L(u,D/2+.03),wy=y1+k*H1+(door?1.05:1.45),hh=door?2.1:1.1,ww=door?1.2:1.3;
      boxAt(wood,MATD.timber,px,wy,pz,ww+.16,hh+.16,.08,yaw,WOOD());
      DB.glow.add(srnd()<.42?MATD.window:MATD.dark,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(px,wy,pz,0,yaw,0,ww,hh,.1,'YXZ'),WHITE);
      if(!door){for(let q=1;q<4;q++){const[qx,qz]=L(u-ww/2+q*ww/4,D/2+.08);boxAt(wood,MATD.timber,qx,wy,qz,.05,hh,.05,yaw,WOOD());}
        const[rx,rz]=L(u,D/2+.08);boxAt(wood,MATD.timber,rx,wy,rz,ww,.05,.05,yaw,WOOD());}}}
  // roof: concave tile slopes over broad eaves, ridge beam with raised ends, gable triangles
  const yr=y1+Hw+.12,rise=D*.4,tt=new THREE.Color(sr(.72,.85),sr(.74,.86),sr(.68,.78));
  roofSheet(DB.tile,MATD.tile,x,yr,z,yaw,W,D,rise,1.05,.45,1,tt);roofSheet(DB.tile,MATD.tile,x,yr,z,yaw,W,D,rise,1.05,.45,-1,tt);
  const[ex1,ez1]=L(-W/2-1.1,0),[ex2,ez2]=L(W/2+1.1,0);boxAt(DB.tile,MATD.tile,x,yr+rise+.08,z,W+2.3,.22,.32,yaw,tt);
  for(const[ex,ez]of[[ex1,ez1],[ex2,ez2]])boxAt(DB.tile,MATD.tile,ex,yr+rise+.25,ez,.3,.42,.36,yaw,tt);
  for(const sd of[-1,1])gableEnd(pl,MATD.plaster,x,yr-.02,z,yaw,sd*(W/2-.04),D,rise*.92,new THREE.Color(.78,.75,.7));
  // a lower skirt roof over the ground floor of the tall houses
  if(fl>1){const ys=y1+H1+.05;for(const sd of[1])roofSheet(DB.tile,MATD.tile,x+s*sd*(D/2+.3),ys,z+c*sd*(D/2+.3),yaw,W,1.6,.55,.5,.25,sd,tt);}
  // an awning of canvas on poles in front of a stall, lanterns under the eaves
  if(o.stall){const[ax,az]=L(0,D/2+1.3);DB.cloth.add(MATD.canvas,geo('awn',()=>{const g=new THREE.PlaneGeometry(1,1,4,2);g.rotateX(-PI/2+.32);return g;}),M4(ax,y1+2.25,az,0,yaw,0,W*.8,1,2.4,'YXZ'),WHITE);
    for(const sd of[-1,1]){const[px,pz]=L(sd*W*.38,D/2+2.4);cylAt(wood,MATD.timber,px,y+1.1,pz,.05,2.2,6,WOOD());}
    for(let i=0;i<3;i++){const[px,pz]=L(sr(-W*.3,W*.3),D/2+sr(.8,1.8));boxAt(wood,MATD.timber,px,y+.3,pz,sr(.5,.8),.6,sr(.4,.6),yaw+sr(-.3,.3),WOOD());}}
  if(o.lant!==false)for(const sd of[-1,1]){const[lx,lz]=L(sd*W*.35,D/2+.75);hangLantern(lx,yr-.2,lz,o.red);}
  dBox(x,z,W+.5,D+.5,yaw,5);}
function hangLantern(x,y,z,red){boxAt(DB.wood,MATD.timber,x,y,z,.03,.5,.03,0,WOOD());
  DB.glow.add(red?MATD.paperRed:MATD.paper,geo('lantH',()=>gLathe([[0,-.24],[.14,-.2],[.19,0],[.14,.2],[0,.24]],10)),M4(x,y-.45,z),WHITE);LANTERNS.push(V3(x,y-.45,z));}
function fence(ax,az,bx,bz,h=1){const L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.round(L/1.6)),yaw=-Math.atan2(bz-az,bx-ax);
  for(let i=0;i<=n;i++){const t=i/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t);boxAt(DB.wood,MATD.timber,px,dY(px,pz)+h/2,pz,.1,h+.2,.1,yaw+sr(-.05,.05),WOOD(),sr(-.04,.04));}
  for(let i=0;i<n;i++){const t=(i+.5)/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),py=dY(px,pz);for(const hh of[.35,.8])boxAt(DB.wood,MATD.timber,px,py+hh*h,pz,L/n+.1,.06,.06,yaw,WOOD());}
  addSeg(ax,az,bx,bz,.12,1.2);}
function demoVillage(){for(const hd of DEMO.houses){const[x,z,yaw,W,D,fl,o]=hd;house(x,z,yaw,W,D,fl,o||{});}
  for(const f of DEMO.fences)fence(...f);
  for(const[x,z]of DEMO.villageLanterns)lanternPost(x,dY(x,z),z);}

/* ---------- the palace on the cliff: a pagoda-roofed hall in front of a Gothic church with spires; the pavilion; statues ---------- */
function hall(x,y,z,yaw,W,D,H,tiers,o={}){const c=Math.cos(yaw),s=Math.sin(yaw),L=(a,b2)=>[x+a*c+b2*s,z-a*s+b2*c],wood=DB.wood;
  boxAt(DB.stone,MATD.stone,x,y+.6,z,W+1.6,1.2,D+1.6,yaw,grey(.72));
  for(let k=0;k<=Math.round(W/2.2);k++)for(const sd of[-1,1]){const[px,pz]=L(-W/2+k*W/Math.round(W/2.2),sd*D/2);cylAt(wood,MATD.lacquer,px,y+1.2+H/2,pz,.22,H,10,new THREE.Color(.75,.2,.16));}
  boxAt(wood,MATD.boards,x,y+1.2+H/2,z,W-.8,H,D-.8,yaw,new THREE.Color(.55,.45,.4));
  for(let k=0;k<Math.round(W/2.2);k++){const[px,pz]=L(-W/2+(k+.5)*W/Math.round(W/2.2),D/2-.38);DB.glow.add(srnd()<(o.lit!==undefined?o.lit:.5)?MATD.window:MATD.dark,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(px,y+1.2+H*.48,pz,0,yaw,0,1.4,H*.7,.06,'YXZ'),WHITE);}
  boxAt(wood,MATD.timber,x,y+1.2+H+.2,z,W+.5,.4,D+.5,yaw,new THREE.Color(.5,.25,.2));
  chineseRoof(x,y+1.2+H+.4,z,yaw,W,D,tiers,H*.45,o.ov||1.6,o.steep||.38,o.up||.9);
  dBox(x,z,W+1.6,D+1.6,yaw,6);}
// tiers of curved tile roofs: each a pair of concave slopes, red gable boards, a ridge with raised ends, a narrower storey between
function chineseRoof(x,yr,z,yaw,w,d,tiers,h2,ov=1.6,steep=.38,up=.9){const c=Math.cos(yaw),s=Math.sin(yaw),L=(a,b2)=>[x+a*c+b2*s,z-a*s+b2*c],tt=new THREE.Color(.62,.65,.7);
  for(let t=0;t<tiers;t++){const rise=d*steep;roofSheet(DB.tile,MATD.tile,x,yr,z,yaw,w,d,rise,ov,up,1,tt);roofSheet(DB.tile,MATD.tile,x,yr,z,yaw,w,d,rise,ov,up,-1,tt);
    for(const sd of[-1,1])gableEnd(DB.plaster,MATD.lacquer,x,yr-.02,z,yaw,sd*(w/2+.2),d*.95,rise*.9,new THREE.Color(.5,.14,.11));
    boxAt(DB.tile,MATD.tile,x,yr+rise+.12,z,w+3.4,.3,.4,yaw,tt);for(const sd of[-1,1]){const[ex,ez]=L(sd*(w/2+1.7),0);boxAt(DB.tile,MATD.tile,ex,yr+rise+.4,ez,.4,.6,.5,yaw,tt);}
    if(t<tiers-1){boxAt(DB.wood,MATD.boards,x,yr+rise*.5+h2/2,z,w*.62,h2,d*.6,yaw,new THREE.Color(.5,.4,.36));
      for(let k=0;k<5;k++){const[px,pz]=L(-w*.24+k*w*.12,d*.3+.02);DB.glow.add(k%2?MATD.windowDim:MATD.dark,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(px,yr+rise*.5+h2*.5,pz,0,yaw,0,w*.07,h2*.55,.06,'YXZ'),WHITE);}
      yr+=rise*.5+h2;w*=.66;d*=.66;}}
  return yr;}
function b2cone(x,y,z,r,h){DB.stone.add(MATD.slate,geo('spire',()=>{const g=new THREE.ConeGeometry(1,1,8);g.translate(0,.5,0);return g;}),M4(x,y,z,0,PI/8,0,r,h,r),new THREE.Color(.6,.62,.66));}
function statue(x,y,z,yaw){addCol(x,z,.75,4);const stM=MATD.statue,sm={b:stM,m:stM},st=buildHuman({d:HERO_D,s:2.6,mats:sm,build:heroBuild});st.root.position.set(x,y+1.6,z);st.root.rotation.y=yaw;
  st.apply(pose({spi:[4,0,0],head:[8,0,0],shR:[30,-10,8],elR:60,wrR:[-90,0,0],shL:[30,10,-8],elL:60,wrL:[0,0,0],hipL:[2,0,-4],hipR:[2,0,4]}));
  const sw=buildSword(2);sw.g.traverse(o=>{if(o.isMesh)o.material=stM;});sw.g.scale.setScalar(1.3);st.P.wrR.add(sw.g);scene.add(st.root);
  boxAt(DB.stone,MATD.stoneDark,x,y+.8,z,2.4,1.6,2.4,yaw,grey(.6));boxAt(DB.stone,MATD.stone,x,y+1.65,z,2.7,.2,2.7,yaw,grey(.72));dBox(x,z,2.4,2.4,yaw,4);}
// a Gothic stone hall (buttresses with pinnacles, lancet windows lit from inside, a deep pointed portal) under a tiered tile roof
function gothicHall(x,y,z,yaw,W,D,H,tiers){const c=Math.cos(yaw),s=Math.sin(yaw),L=(a,b2)=>[x+a*c+b2*s,z-a*s+b2*c],st=MATD.stone,dk=MATD.stoneDark;
  boxAt(DB.stone,st,x,y+.5,z,W+2,1,D+2,yaw,grey(.78));boxAt(DB.stone,st,x,y+1+H/2,z,W,H,D,yaw,grey(.8));
  boxAt(DB.stone,st,x,y+1+H+.25,z,W+.8,.5,D+.8,yaw,grey(.74));
  const nb=Math.round(W/4.2);
  for(let i=0;i<=nb;i++){const u=-W/2+i*W/nb,[bx,bz]=L(u,D/2+.7);boxAt(DB.stone,st,bx,y+1+H*.45,bz,1.2,H*.9,1.4,yaw,grey(.7));
    boxAt(DB.stone,st,bx,y+1+H*.92,bz,.7,2,.7,yaw,grey(.74));b2cone(bx,y+2+H*.92,bz,.42,2.6);
    if(i<nb){const wu=u+W/nb/2,[wx,wz]=L(wu,D/2+.03);if(Math.abs(wu)>3.6){DB.glow.add(srnd()<.5?MATD.windowDim:MATD.dark,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(wx,y+1+H*.52,wz,0,yaw,0,1.3,H*.5,.1,'YXZ'),WHITE);
      gothicRing(DB.stone,st,wx,y+1+H*.77,wz,.72,1.1,.18,.3,yaw,grey(.74),6);}}}
  for(const sd of[-1,1])for(let i=0;i<3;i++){const v=-D/2+(i+.5)*D/3,[bx,bz]=L(sd*(W/2+.6),v);boxAt(DB.stone,st,bx,y+1+H*.45,bz,1.2,H*.9,1.2,yaw,grey(.7));}
  // the portal: three receding pointed rings, a lit hall behind the open doors
  for(let k=0;k<3;k++){const[px,pz]=L(0,D/2+.6-k*.45);gothicRing(DB.stone,st,px,y+1+5.4,pz,2.6-k*.38,3.4-k*.4,.42,.5,yaw,grey(.76-k*.04),14);}
  {const[px,pz]=L(0,D/2+.06);DB.glow.add(MATD.windowDim,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(px,y+1+3.4,pz,0,yaw,0,3.8,6.8,.1,'YXZ'),WHITE);
    const[qx,qz]=L(0,D/2+.1);DB.glow.add(MATD.window,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(qx,y+1+1.8,qz,0,yaw,0,2.2,3.6,.1,'YXZ'),WHITE);}
  for(const sd of[-1,1]){const[px,pz]=L(sd*2.75,D/2+.4);boxAt(DB.stone,st,px,y+1+2.8,pz,.6,5.6,1.4,yaw,grey(.74));}
  const top=chineseRoof(x,y+1+H+.5,z,yaw,W+3,D+2,tiers,3.6,4.6,.5,3.4);
  dBox(x,z,W+2,D+2,yaw,8);return top;}
// a square Gothic tower: storeys marked by string courses, lit lancets, a rose window, corner pinnacles
function gothicTower(x,y,z,yaw,S,H,rose){const c=Math.cos(yaw),s=Math.sin(yaw),L=(a,b2)=>[x+a*c+b2*s,z-a*s+b2*c],st=MATD.stone;
  boxAt(DB.stone,st,x,y+H/2,z,S,H,S,yaw,grey(.8));
  for(let k=1;k<5;k++)if(!rose||k!==3)boxAt(DB.stone,st,x,y+k*H/5,z,S+.4,.4,S+.4,yaw,grey(.76));
  // buttresses at the corners, stepping in as they rise
  for(const[a,b2]of[[-1,-1],[1,-1],[-1,1],[1,1]])for(let k=0;k<3;k++){const w=1.4-k*.35,[px,pz]=L(a*(S/2+.2),b2*(S/2+.2));boxAt(DB.stone,st,px,y+H*(k/3+.167),pz,w,H/3+.02,w,yaw,grey(.78));}
  if(rose){// a tall pointed frame holding the rose, two lancets under it, all lit warm from inside
    const fy=y+H*.36,[fx,fz]=L(0,S/2+.06);DB.glow.add(MATD.windowFaint,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(fx,fy+H*.17,fz,0,yaw,0,S*.62,H*.34,.08,'YXZ'),WHITE);
    gothicRing(DB.stone,st,fx,fy+H*.34,fz,S*.33,S*.42,.4,.5,yaw,grey(.84),14);
    for(const sd of[-1,1]){const[lx,lz]=L(sd*S*.16,S/2+.12);boxAt(DB.stone,st,lx,fy+H*.12,lz,.16,H*.24,.14,yaw,grey(.8));}
    {const[mx,mz]=L(0,S/2+.12);boxAt(DB.stone,st,mx,fy+H*.12,mz,.22,H*.24,.16,yaw,grey(.8));}
    const[rx,rz]=L(0,S/2+.14),ry=fy+H*.31,R=S*.25;const m=new THREE.Mesh(geo('rose',()=>new THREE.CircleGeometry(1,24)),MATD.windowDim);m.position.set(rx,ry,rz);m.rotation.y=yaw;m.scale.setScalar(R);scene.add(m);
    DB.stone.add(st,geo('roseRing',()=>new THREE.TorusGeometry(1,.11,8,28)),M4(rx,ry,rz,0,yaw,0,R*1.06,R*1.06,R*1.06,'YXZ'),grey(.84));
    for(let i=0;i<6;i++){const a=i/6*PI;DB.stone.add(st,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(rx,ry,rz,0,yaw,a,.09,R*2,.08,'YXZ'),grey(.8));}
    for(let i=0;i<6;i++){const a=i/6*TAU;DB.stone.add(st,geo('roseRing',()=>new THREE.TorusGeometry(1,.11,8,28)),M4(rx+Math.cos(a)*R*.58*c,ry+Math.sin(a)*R*.58,rz-Math.cos(a)*R*.58*s,0,yaw,0,R*.3,R*.3,R*.3,'YXZ'),grey(.82));}
    for(let k=0;k<2;k++){const[wx,wz]=L(0,S/2+.03);DB.glow.add(srnd()<.6?MATD.windowDim:MATD.dark,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(wx,y+(k*.85+3.9)*H/5,wz,0,yaw,0,1,H/5*.5,.1,'YXZ'),WHITE);}}
  else for(let k=0;k<4;k++){const[wx,wz]=L(0,S/2+.03);DB.glow.add(srnd()<.4?MATD.windowDim:MATD.dark,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(wx,y+(k+.55)*H/5,wz,0,yaw,0,1,H/5*.52,.1,'YXZ'),WHITE);}
  // a pierced parapet and tall pinnacles at the top
  for(let i=0;i<4;i++){const a=i/4*TAU+PI/4;for(let k=-2;k<=2;k++){const ca=Math.cos(a+PI/4),sa=Math.sin(a+PI/4),u=ca*S/2+(-sa)*k*S/5,w=sa*S/2+ca*k*S/5,[px,pz]=L(u,w);if(k%2===0)boxAt(DB.stone,st,px,y+H+.5,pz,.5,1,.5,yaw,grey(.8));}}
  for(const[a,b2]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const[px,pz]=L(a*S/2,b2*S/2);boxAt(DB.stone,st,px,y+H+1.2,pz,.9,2.4,.9,yaw,grey(.78));b2cone(px,y+H+2.4,pz,.55,5.2);}
  for(const[a,b2]of[[0,-1],[0,1],[-1,0],[1,0]]){const[px,pz]=L(a*S/2,b2*S/2);b2cone(px,y+H+.9,pz,.3,2.6);}
  dBox(x,z,S+.8,S+.8,yaw,8);}
// the Gothic front of the palace: a wall of buttresses with pinnacles, dim lancets, a deep portal lit from inside, a gable
// with a small rose, a balustrade along the top
function gothicFront(x,y,z,yaw,W,D,H){const c=Math.cos(yaw),s=Math.sin(yaw),L=(a,b2)=>[x+a*c+b2*s,z-a*s+b2*c],st=MATD.stone,dk=MATD.stoneDark;
  boxAt(DB.stone,st,x,y+H/2,z,W,H,D,yaw,grey(.8));boxAt(DB.stone,st,x,y+H+.2,z,W+.6,.4,D+.6,yaw,grey(.84));
  const nb=Math.round(W/3.6);
  for(let i=0;i<=nb;i++){const u=-W/2+i*W/nb,[bx,bz]=L(u,D/2+.6);boxAt(DB.stone,st,bx,y+H*.47,bz,1,H*.94,1.2,yaw,grey(.78));
    boxAt(DB.stone,st,bx,y+H+.9,bz,.62,1.8,.62,yaw,grey(.8));b2cone(bx,y+H+1.8,bz,.36,2.6);
    if(i<nb){const wu=u+W/nb/2,[wx,wz]=L(wu,D/2+.03);if(Math.abs(wu)>3.4){DB.glow.add(srnd()<.35?MATD.windowDim:MATD.dark,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(wx,y+H*.5,wz,0,yaw,0,1.1,H*.42,.1,'YXZ'),WHITE);
      gothicRing(DB.stone,st,wx,y+H*.71,wz,.6,1,.16,.3,yaw,grey(.8),6);}}}
  for(let k=0;k<4;k++){const[px,pz]=L(0,D/2+.85-k*.4);gothicRing(DB.stone,st,px,y+6.2,pz,2.9-k*.36,4-k*.42,.44,.46,yaw,grey(.84-k*.04),14);}
  {const[px,pz]=L(0,D/2+.06);DB.glow.add(MATD.windowDim,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(px,y+4,pz,0,yaw,0,4.4,8,.1,'YXZ'),WHITE);
    const[qx,qz]=L(0,D/2+.1);DB.glow.add(MATD.window,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(qx,y+2.1,qz,0,yaw,0,2.6,4.2,.1,'YXZ'),WHITE);}
  for(const sd of[-1,1]){const[px,pz]=L(sd*3.3,D/2+.5);boxAt(DB.stone,st,px,y+3.1,pz,.7,6.2,1.5,yaw,grey(.82));}
  // gable over the portal with a small rose window
  {const[gx,gz]=L(0,D/2+.05);gableEnd(DB.stone,st,gx,y+H+.4,gz,yaw+PI/2,-.0001,8.4,4.6,grey(.8));
    const m=new THREE.Mesh(geo('rose',()=>new THREE.CircleGeometry(1,24)),MATD.windowDim);const[rx,rz]=L(0,D/2+.12);m.position.set(rx,y+H+2,rz);m.rotation.y=yaw;m.scale.setScalar(1.05);scene.add(m);
    DB.stone.add(st,geo('roseRing',()=>new THREE.TorusGeometry(1,.11,8,28)),M4(rx,y+H+2,rz,0,yaw,0,1.12,1.12,1.12,'YXZ'),grey(.84));
    for(const sd of[-1,1]){const[px,pz]=L(sd*4.3,D/2+.3);boxAt(DB.stone,st,px,y+H+1.4,pz,.6,2.8,.6,yaw,grey(.8));b2cone(px,y+H+2.8,pz,.34,2.4);}}
  dBox(x,z,W,D,yaw,8);}
// an arcade wall: pointed arches on piers, dark openings, pinnacles on the piers, a balustrade on top
function arcadeWall(x,y,z,yaw,W,H,n){const c=Math.cos(yaw),s=Math.sin(yaw),L=(a,b2)=>[x+a*c+b2*s,z-a*s+b2*c],st=MATD.stone;
  boxAt(DB.stone,MATD.stoneDark,x,y+H/2,z-0,W,H,2.2,yaw,grey(.6));
  for(let i=0;i<=n;i++){const u=-W/2+i*W/n,[px,pz]=L(u,1.2);boxAt(DB.stone,st,px,y+H/2,pz,.9,H,.6,yaw,grey(.8));boxAt(DB.stone,st,px,y+H+.7,pz,.5,1.4,.5,yaw,grey(.8));b2cone(px,y+H+1.4,pz,.28,1.8);}
  for(let i=0;i<n;i++){const u=-W/2+(i+.5)*W/n,[px,pz]=L(u,1.15),hw=W/n/2-.5;gothicRing(DB.stone,st,px,y+H*.5,pz,hw,H*.32,.3,.5,yaw,grey(.8),10);
    const[dx,dz]=L(u,1.12);DB.glow.add(srnd()<.3?MATD.windowDim:MATD.dark,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(dx,y+H*.42,dz,0,yaw,0,hw*1.9,H*.84,.05,'YXZ'),WHITE);}
  {const[bx,bz]=L(-W/2,1.3),[ex,ez]=L(W/2,1.3);balustrade(DB.stone,bx,bz,ex,ez,y+H,.8);}
  dBox(x,z,W,2.4,yaw,8);}
// the palace of the picture, left to right: a pavilion with tiered roofs at the cliff's edge, an arcade wall, the Gothic front
// with the portal and the great tiered hall rising behind it, the rose-window tower, an arcade walk running off along the cliff
function demoPalace(){const P=DEMO.palace,y=P.y,c=Math.cos(P.yaw),s=Math.sin(P.yaw),L=(a,b2)=>[P.x+a*c+b2*s,P.z-a*s+b2*c];
  // the great hall on its stone podium, behind the front
  {const[x,z]=L(-1,-7);boxAt(DB.stone,MATD.stone,x,y+6,z,26,12,16,P.yaw,grey(.78));
    for(let i=0;i<9;i++){const[px,pz]=L(-1-12+i*3,1.05);DB.glow.add(srnd()<.4?MATD.windowDim:MATD.dark,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(px,y+6.5,pz,0,P.yaw,0,.9,2.2,.1,'YXZ'),WHITE);}
    hall(x,y+12,z,P.yaw,22,12.5,5.4,2,{steep:.62,up:3.2,ov:4,lit:.7});}
  {const[x,z]=L(-1,4.5);gothicFront(x,y,z,P.yaw,17,5,13);}
  {const[x,z]=L(-16,4);arcadeWall(x,y,z,P.yaw,13,9,3);}
  {const[x,z]=L(-25.5,3.5);hall(x,y,z,P.yaw,7,6,3.4,2,{steep:.55,up:1.8,ov:1.8,lit:.6});}
  {const[x,z]=L(14,-3);gothicTower(x,y,z,P.yaw,9,31,true);}
  {const[x,z]=L(-10.5,-6);gothicTower(x,y,z,P.yaw,4.4,24,false);}
  // the arcade walk along the cliff on the right: piers down to the rock, pointed arches, a balustrade
  for(let i=0;i<7;i++){const[ax,az]=L(20.5+i*3.6,4+i*1.3),gy=dY(ax,az),top=y+7;boxAt(DB.stone,MATD.stone,ax,(gy+top)/2-1,az,1.1,top-gy+2,1.4,P.yaw-.35,grey(.76));
    if(i<6){const[mx,mz]=L(22.3+i*3.6,4.65+i*1.3);gothicRing(DB.stone,MATD.stone,mx,top-3.2,mz,1.5,2,.42,1.3,P.yaw-.35,grey(.8),8);boxAt(DB.stone,MATD.stone,mx,top+.45,mz,3.8,.9,1.5,P.yaw-.35,grey(.78));}}
  {const[bx,bz]=L(20.5,4.8),[ex,ez]=L(20.5+6*3.6,4.8+6*1.3);balustrade(DB.stone,bx,bz,ex,ez,y+8,.8);}
  // the plaza: statues either side of the portal, lanterns, red banners hung on the front
  for(const sd of[-1,1]){const[x,z]=L(sd*6.2,10.5);statue(x,dY(x,z),z,P.yaw+sd*.25);}
  for(const[a,b2]of[[-4.5,13],[4.5,13],[-12,10],[12,10]]){const[x,z]=L(a,b2);lanternPost(x,dY(x,z),z,a<0&&b2>11);}
  for(const sd of[-1,1]){const[x,z]=L(sd*5.4,7.6);DB.cloth.add(MATD.cloth,geo('bann',()=>{const g=new THREE.PlaneGeometry(1,1,1,6);g.translate(0,-.5,0);return g;}),M4(x,y+12,z,0,P.yaw,0,1.6,8.5,1,'YXZ'),WHITE);}
  {const[bx,bz]=L(-14,14.5),[ex,ez]=L(-5,14.5);balustrade(DB.stone,bx,bz,ex,ez,undefined,.9);const[b3,b4]=L(5,14.5),[e3,e4]=L(13,14.5);balustrade(DB.stone,b3,b4,e3,e4,undefined,.9);}
  palaceStairs(DEMO.RAMP[1]);
  hall(DEMO.pavilion.x,dY(DEMO.pavilion.x,DEMO.pavilion.z),DEMO.pavilion.z,P.yaw,6,6,3,2,{steep:.5,up:1.6,ov:1.8});}
function palaceStairs(R){const[ax,az,ya,bx,bz,yb,hw]=R,L=Math.hypot(bx-ax,bz-az),n=Math.round((yb-ya)/.2),yaw=-Math.atan2(bz-az,bx-ax)+PI/2;
  for(let i=0;i<n;i++){const t=(i+.5)/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=lerp(ya,yb,(i+.5)/n);boxAt(DB.stone,MATD.stone,px,yy-.3,pz,hw*2,.6,L/n+.05,yaw,grey(sr(.66,.8)));}
  for(const sd of[-1,1]){const sx=sd*(hw+.3);balustradeSlope(DB.stone,ax+sx,az,ya,bx+sx,bz,yb);addSeg(ax+sx,az,bx+sx,bz,.3,1.3);}}

/* ---------- the cave in the rock wall, the ruined churches ---------- */
// a dark mouth framed by rough blocks, warm light deep inside, lanterns at the threshold
function demoCave(){const C=DEMO.cave,y=dY(C.x-2,C.z),c=Math.cos(C.yaw),s=Math.sin(C.yaw),L=(a,b2)=>[C.x+a*c+b2*s,C.z-a*s+b2*c],rb=RB;RB=1;
  // a real recess in the rock: side walls, a ceiling and a back wall, lit warm from inside by a lamp and two lanterns
  {const[x,z]=L(0,-5.6);boxAt(DB.stone,MATD.rock,x,y+3.4,z,9.6,7.4,1.5,C.yaw,grey(.16));const[bx,bz]=L(0,-4.3);DB.glow.add(MATD.dark,geo('dquad',()=>new THREE.PlaneGeometry(1,1)),M4(bx,y+2.4,bz,0,C.yaw,0,6.6,4.8,1,'YXZ'),WHITE);}
  for(const sd of[-1,1]){const[x,z]=L(sd*4.45,-2.7);boxAt(DB.stone,MATD.rock,x,y+3.3,z,1.7,7.2,5.8,C.yaw+sd*.04,grey(.2));}
  {const[x,z]=L(0,-2.7);boxAt(DB.stone,MATD.rock,x,y+6,z,9.8,1.8,5.8,C.yaw,grey(.18));}
  for(let i=0;i<=16;i++){const a=i/16*PI,[x,z]=L(Math.cos(a)*4.7,.15),ry=y+Math.sin(a)*6.6,sz=sr(1.2,2.1);
    boxAt(DB.stone,MATD.rock,x,ry,z,sz,sz*sr(.8,1.2),sr(1.2,2),C.yaw+sr(-.3,.3),grey(sr(.6,.76)),sr(-.4,.4),sr(-.4,.4));}
  // a soft pool of lamplight on the floor inside
  {const[x,z]=L(0,-2.4);DB.glow.add(MATD.caveGlow,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(x,dY(x,z)+.03,z,0,C.yaw,0,3.4,.04,2.4,'YXZ'),new THREE.Color(.05,.035,.02));}
  for(const sd of[-1,1]){const[x,z]=L(sd*3.4,1.3);lanternPost(x,dY(x,z),z,sd>0);const[hx,hz]=L(sd*2.3,-3.3);hangLantern(hx,y+3.6,hz,sd<0);}
  for(let i=0;i<4;i++){const[x,z]=L(sr(-2.4,2.4),sr(-4.2,-2.6));boxAt(DB.wood,MATD.timber,x,y+.35,z,sr(.6,.9),.7,sr(.6,.9),sr(0,3),WOOD());}
  {const[x,z]=L(0,-3);addLight(V3(x,y+2.2,z),col(0xff9a4a),2.4,10,1);}
  {const[a1,a2]=L(-3.65,-.4),[b1,b2]=L(-3.65,-5),[c1,c2]=L(3.65,-.4),[d1,d2]=L(3.65,-5),[e1,e2]=L(-3.9,-4.85),[f1,f2]=L(3.9,-4.85);addSeg(a1,a2,b1,b2,.4,5);addSeg(c1,c2,d1,d2,.4,5);addSeg(e1,e2,f1,f2,.4,5);}
  RB=rb;
  DX.cave={x:C.x,y,z:C.z};}
// a ruined Gothic church: the west front with its great window, broken side walls with lancets and buttresses, fallen blocks.
// Local u runs across the nave, v along it; the front faces +v
function ruin(x,z,yaw,Ln,W,H){const c=Math.cos(yaw),s=Math.sin(yaw),L=(a,b2)=>[x+a*c+b2*s,z-a*s+b2*c],st=MATD.stone,dk=MATD.stone,b=DB.stone,y=dY(x,z);
  // the front: two piers either side of the great window, its ring and mullion, a broken gable
  const fv=Ln/2,pw=W/2-1.9,Hp=H*.7;
  for(const sd of[-1,1]){const[px,pz]=L(sd*(1.9+pw/2),fv);boxAt(b,dk,px,y+Hp/2-.3,pz,pw,Hp+.6,1.2,yaw,grey(sr(.74,.82)));dBox(px,pz,pw,1.2,yaw,6);
    const[qx,qz]=L(sd*(W/2+.5),fv+.4);boxAt(b,st,qx,y+H*.4,qz,1.1,H*.8,1.6,yaw,grey(.66));}
  {const[wx,wz]=L(0,fv);gothicRing(b,st,wx,y+H*.38,wz,1.9,H*.3,.5,1.25,yaw,grey(.72),14);gothicRing(b,st,wx,y+H*.38,wz,1.5,H*.25,.18,.5,yaw,grey(.7),12);
    cylAt(b,st,wx,y+H*.38-1.2,wz,.13,H*.48,8,grey(.72));
    for(const sd of[-1,1])gothicRing(b,st,wx+sd*.75*c,y+H*.38+.4,wz-sd*.75*s,.62,1.5,.13,.4,yaw,grey(.7),8);
    for(let k=0;k<3;k++){const w=W*(1-k*.3)*(k===2?.5:1),off=k===2?-W*.18:0,[gx,gz]=L(off,fv);boxAt(b,dk,gx,y+Hp+k*1.6+.8,gz,w,1.6,1.15,yaw,grey(sr(.74,.82)));}}
  // side walls: a buttress at every bay, a lancet between; the walls break down towards the east end
  const nb=Math.max(2,Math.round(Ln/3.6));
  for(const sd of[-1,1])for(let i=0;i<nb;i++){const v0=fv-i*Ln/nb,v1=fv-(i+1)*Ln/nb,vm=(v0+v1)/2,h=H*.62*(1-i/nb*.55)*sr(.6,1),[bx,bz]=L(sd*(W/2+.45),v1);
    if(srnd()<.85)boxAt(b,st,bx,y+h*.45,bz,.9,h*.9,1.2,yaw,grey(sr(.74,.84)));
    const[wx,wz]=L(sd*W/2,vm),sill=1.6;boxAt(b,dk,wx,y+sill/2-.2,wz,.7,sill+.4,Ln/nb+.02,yaw,grey(sr(.72,.8)));
    if(h>sill+3){for(const e of[-1,1]){const[ex,ez]=L(sd*W/2,vm+e*(Ln/nb/2-.4));boxAt(b,dk,ex,y+h/2,ez,.7,h,.8,yaw,grey(sr(.72,.8)));}
      gothicRing(b,st,wx,y+h-2.2,wz,Ln/nb/2-.8,1.6,.3,.7,yaw+PI/2,grey(.7),8);}
    const[s1,s2]=L(sd*W/2,v0),[s3,s4]=L(sd*W/2,v1);addSeg(s1,s2,s3,s4,.4,3);}
  // fallen blocks and rubble inside and around
  for(let i=0;i<14;i++){const[fx,fz]=L(sr(-W*.7,W*.7),sr(-fv-2,fv+3));boxAt(b,dk,fx,dY(fx,fz)+.2,fz,sr(.4,1.1),sr(.3,.6),sr(.4,.9),sr(0,3),grey(sr(.55,.7)),sr(-.3,.3),sr(-.3,.3));}}
function demoRuins(){for(const[x,z,yaw,Ln,W,H]of DEMO.ruins)ruin(x,z,yaw,Ln,W,H);}
/* ---------- mist banks and red ribbons ---------- */
// soft banks of mist over the gorge, beyond the village and under the cliffs: camera-facing sheets of noise, fading out
// near the camera so a player never walks through one
const MIST=[];
function genMist(){const W=256,H=128,c=mkC(W,H);pxFill(c,(u,v,o)=>{const n=tfbm(u,v,3,4,211),e=Math.sin(u*PI)*Math.pow(Math.sin(v*PI),1.4);
    const a=Math.max(0,Math.min(1,(n-.32)*2.4))*e;o[0]=o[1]=o[2]=255;o[3]=a*255;});return c;}
function demoMist(){TEXD.mist=toTex(genMist(),{rep:false});
  const banks=[[30,-28,-4,34,12,.5],[29,-52,-6,36,14,.6],[28,-76,-4,40,14,.55],[27,-100,-2,44,16,.5],[24,-126,2,50,18,.45],
    [-30,-100,4,60,20,.7],[0,-104,2,60,18,.7],[-58,-96,8,60,22,.55],[-20,-95,7,46,16,.55],[-45,-88,9,40,16,.5],[8,-128,8,70,22,.55],[-20,-150,10,110,30,.45],[-90,-150,14,110,30,.4],[40,-160,16,120,30,.35],
    [48,-100,10,30,14,.4],[44,-64,-8,24,12,.5],[-75,-40,10,70,24,.3],[14,-31,2,22,10,.5]];
  for(const[x,z,y,w,h,a]of banks){const m=new THREE.Mesh(geo('mistQ',()=>new THREE.PlaneGeometry(1,1)),new THREE.MeshBasicMaterial({map:TEXD.mist,color:scene.fog.color,transparent:true,depthWrite:false,opacity:a,fog:true}));
    m.position.set(x,y,z);m.scale.set(w,h,1);m.renderOrder=5;m.userData.a=a;m.userData.ph=sr(0,TAU);scene.add(m);MIST.push(m);}}
function updMist(){const cp=camera.position,t=U.time.value;
  for(const m of MIST){const dx=cp.x-m.position.x,dz=cp.z-m.position.z,d=Math.hypot(dx,dz);m.rotation.y=Math.atan2(dx,dz);
    m.material.opacity=m.userData.a*sstep(m.scale.x*.25,m.scale.x*.25+30,d)*(.85+.15*Math.sin(t*.15+m.userData.ph));}}
// a strip of red cloth tied to a post or an arch, hanging and swaying in the wind
function ribbon(x,y,z,yaw,len,w=.22,lean=0){DB.cloth.add(MATD.cloth,geo('bann',()=>{const g=new THREE.PlaneGeometry(1,1,1,6);g.translate(0,-.5,0);return g;}),M4(x,y,z,lean,yaw,0,w,len,1,'YXZ'),WHITE);}
function demoRibbons(){const A=DX.arch,c=Math.cos(A.yaw),s=Math.sin(A.yaw),P=(u,v,w)=>[A.x+u*c+w*s,A.y+v,A.z-u*s+w*c];
  {const[x,y,z]=P(A.span+.15,4.05,.45);ribbon(x-.25,y,z,A.yaw+.5,2.7,.3,.22);ribbon(x-.1,y-.05,z+.05,A.yaw-.3,1.7,.22,.12);ribbon(x-.5,y+.02,z,A.yaw+.9,2.1,.2,.32);}
  // on the posts of the parapets and at the head of the stairs
  for(const[x,z,len,yw]of[[5.7,-9.78,2.2,-1.2],[8.8,-9.78,2.6,-1.4],[8.8,-4,1.6,-1.6],[2.75,-9.78,1.9,-1.1]]){ribbon(x+.2,dY(x,z)+1.5,z+.2,yw,len,.26,1.05);ribbon(x-.15,dY(x,z)+1.45,z+.22,yw+.5,len*.75,.2,.8);}}
/* ---------- the waterfall: a falling ribbon off the cliff, spray at its foot ---------- */
const FALLS=[];
// the falls of the picture: an upper sheet down the cliff by the cave, a stream across the ledge, a lower sheet into the gorge
function demoWaterfall(){let wm=null;
  for(const F of DEMO.falls){const g=new THREE.PlaneGeometry(1,1,1,24),pa=g.attributes.position;
    // the sheet leaves the lip horizontally, curves down and widens; its local y runs 0 (top) to 1 (bottom)
    for(let i=0;i<pa.count;i++){const u=pa.getX(i)+.5,t=.5-pa.getY(i),w=lerp(F.w0,F.w1,Math.pow(t,.7)),out=F.out*(1-Math.pow(1-Math.min(1,t*4),2));
      pa.setXYZ(i,(u-.5)*w,lerp(F.y0,F.y1,t)+(t<.06?-(t/.06)*.4:0),out);}
    g.computeVertexNormals();
    wm=wm||new THREE.ShaderMaterial({uniforms:Object.assign({uT:U.time},FOGU),transparent:true,depthWrite:false,side:THREE.DoubleSide,
      vertexShader:'varying vec2 vUv;varying vec3 vW;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
      fragmentShader:`uniform float uT;varying vec2 vUv;varying vec3 vW;${FOG_GLSL}
        float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float n2(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
        void main(){float t=1.0-vUv.y;vec2 p=vec2(vUv.x*14.0,t*26.0-uT*3.2);float s=n2(p)*0.55+n2(p*vec2(2.3,1.6)+7.0)*0.3+n2(p*4.1-3.0)*0.15;
          float edge=smoothstep(0.0,0.16,vUv.x)*smoothstep(1.0,0.84,vUv.x);float a=clamp(smoothstep(0.32,0.8,s)*edge*(0.55+0.45*t)+edge*0.18,0.0,1.0)*smoothstep(0.0,0.03,t);
          vec3 c=mix(vec3(0.55,0.62,0.66),vec3(0.95,0.97,1.0),s);gl_FragColor=vec4(applyFog(c,vW),a*0.92);}`});
    const mesh=new THREE.Mesh(g,wm);mesh.position.set(F.x,0,F.z);mesh.rotation.y=F.yaw;mesh.renderOrder=4;scene.add(mesh);FALLS.push({F,mesh,e:0});}
  // the stream across the ledge: a shallow band of the same water, flowing from the foot of the upper fall to the lip of the lower
  const S=DEMO.stream;if(S){const L=Math.hypot(S.bx-S.ax,S.bz-S.az),g=new THREE.PlaneGeometry(1,1,1,8);g.rotateX(-PI/2);
    const sm=new THREE.ShaderMaterial({uniforms:Object.assign({uT:U.time},FOGU),transparent:true,depthWrite:false,
      vertexShader:'varying vec2 vUv;varying vec3 vW;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
      fragmentShader:`uniform float uT;varying vec2 vUv;varying vec3 vW;${FOG_GLSL}
        float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float n2(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
        void main(){vec2 p=vec2(vUv.x*6.0,vUv.y*30.0-uT*2.4);float s=n2(p)*0.6+n2(p*2.7+3.0)*0.4;float e=smoothstep(0.0,0.25,vUv.x)*smoothstep(1.0,0.75,vUv.x);
          vec3 c=mix(vec3(0.42,0.5,0.55),vec3(0.9,0.94,0.97),smoothstep(0.45,0.9,s));gl_FragColor=vec4(applyFog(c,vW),e*(0.55+0.35*s));}`});
    const m=new THREE.Mesh(g,sm);m.position.set((S.ax+S.bx)/2,S.y,(S.az+S.bz)/2);m.rotation.y=-Math.atan2(S.bz-S.az,S.bx-S.ax)+PI/2;m.scale.set(S.w,1,L);m.renderOrder=4;scene.add(m);}}
const DFILL=V3(.45,-.7,-.55).normalize();
function demoUpdate(dt){const cp=camera.position;fill.position.copy(fill.target.position).addScaledVector(DFILL,-60);
  // the title is the picture's view: the hero stands at the bonfire but is shown only once the game starts
  if(PL){const v=G.state!=='title';PL.rig.root.visible=v;PL.cape.mesh.visible=v&&!G.fp;}
  for(const W of FALLS){const F=W.F,d2=(cp.x-F.x)**2+(cp.z-F.z)**2;W.e+=dt;if(d2<220*220)while(W.e>.06){W.e-=.06;
      FXN.emit(F.bx+rr(-2.5,2.5),F.by+rr(0,2.5),F.bz+rr(-2.5,2.5),rr(-.6,.6),rr(.6,1.8),rr(-.6,.6),rr(3,5),2.2,8,.62,.66,.7,.45,-.02,.2);}}
  for(const r of RAYS)r.material.uniforms.uT.value=U.time.value;updMist();}

/* ---------- light shafts from the break in the clouds ---------- */
const RAYS=[];
function demoRays(){const m=()=>new THREE.ShaderMaterial({uniforms:{uT:{value:0},uC:{value:new THREE.Color(1,.88,.7)}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform float uT;uniform vec3 uC;varying vec2 vUv;void main(){float x=abs(vUv.x-0.5)*2.0;float a=(1.0-x*x)*smoothstep(0.0,0.35,vUv.y)*smoothstep(1.0,0.55,vUv.y);a*=0.085+0.03*sin(uT*0.4+vUv.x*9.0);gl_FragColor=vec4(uC*a,1.0);}'});
  const S=SUN_DIR,top=V3(S.x,S.y,S.z).multiplyScalar(420);
  for(let i=0;i<5;i++){const g=new THREE.PlaneGeometry(1,1),mesh=new THREE.Mesh(g,m());const tgt=V3(sr(-10,70),sr(0,25),sr(-170,-95)),d=top.clone().sub(tgt),L=d.length();
    mesh.position.copy(tgt).addScaledVector(d,.5);mesh.scale.set(sr(14,30),L,1);mesh.quaternion.setFromUnitVectors(V3(0,1,0),d.normalize());mesh.rotateY(sr(-.4,.4));mesh.renderOrder=6;scene.add(mesh);RAYS.push(mesh);}}

// granite crags on the steep faces of the gorge and the palace's cliff: rough pillars half sunk in the rock, so the faces
// break up like the picture's instead of standing as smooth slopes; never on a walk, a fall, the cave or the bridge
function demoCrags(){let n=0;const nearWalk=(x,z,r)=>{for(const F of FLOORS){const t=Math.max(0,Math.min(1,((x-F.ax)*F.dx+(z-F.az)*F.dz)/F.L2)),qx=F.ax+F.dx*t-x,qz=F.az+F.dz*t-z;if(qx*qx+qz*qz<(F.hw+r)**2)return true;}return false;};
  for(let i=0;i<1400&&n<260;i++){const x=sr(4,104),z=sr(-160,-10),h=gH(x,z),ny=nyAt(x,z);if(ny>.52||h<-26||nearWalk(x,z,3.5))continue;
    if(DEMO.falls.some(F=>Math.hypot(x-F.x,z-F.z)<5||Math.hypot(x-F.bx,z-F.bz)<5)||Math.hypot(x-DEMO.cave.x,z-DEMO.cave.z)<9||Math.hypot(x-DEMO.gate.x,z-DEMO.gate.z)<8)continue;
    const w=sr(1.6,4.2),hh=sr(3.5,9),g=sr(.42,.62);boxAt(DB.stone,MATD.rock,x,h-hh*.18,z,w,hh,w*sr(.6,1),sr(0,TAU),new THREE.Color(g,g*1.01,g*1.03),sr(-.12,.12),sr(-.12,.12));n++;}
  return n;}
// every solid block standing across the body's height gets its footprint as a wall (a circle for a column), unless a collider
// already covers it: crags, cave walls, gate towers, ruins and the palace stop the player, the enemies and the camera like the houses
function demoSolids(){const P=new THREE.Vector3(),Q=new THREE.Quaternion(),S=new THREE.Vector3(),E=new THREE.Euler();let n=0;
  for(const bk of['stone','wood','plaster'])for(const[,parts]of DB[bk].m)for(const p of parts){const t=p.g.type,gp=p.g.parameters||{};
    const box=t==='BoxGeometry'||(t==='SphereGeometry'&&gp.widthSegments===8&&gp.heightSegments===6),cyl=t==='CylinderGeometry';if(!box&&!cyl)continue;
    p.m.decompose(P,Q,S);E.setFromQuaternion(Q,'YXZ');if(Math.abs(E.x)>.35||Math.abs(E.z)>.35)continue;
    const w=S.x*(cyl?2:1),d=S.z*(cyl?2:1);if(w<.35||d<.35)continue;const g=gY(P.x,P.z),y0=P.y-S.y/2,y1=P.y+S.y/2;if(!(y0<g+.5&&y1>g+1.1))continue;
    const c=Math.cos(E.y),s=Math.sin(E.y);
    if([[w/2-.07,0],[-w/2+.07,0],[0,d/2-.07],[0,-d/2+.07]].every(([u,v])=>collide({x:P.x+u*c+v*s,z:P.z-u*s+v*c},.05,true)))continue;if(cyl)addCol(P.x,P.z,Math.max(w,d)/2,y1-g);else addBox(P.x,P.z,w,d,E.y,y1-g);n++;}
  return n;}
/* ---------- walkable ramps (bridge, stairs on the cliff) ---------- */
function addRamp(ax,az,ya,bx,bz,yb,hw){const dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz;FLOORS.push({s:1,ax,az,ya,dx,dz,dy:yb-ya,L2,hw,x:(ax+bx)/2,z:(az+bz)/2,r2:(Math.sqrt(L2)/2+hw)**2,y:Math.max(ya,yb)});}

/* ---------- terrain layers: grass, moss, cobbles (paths and plazas), rock (steep ground, the gorge) ---------- */
function demoSplat(x,z,h,ny,pd){
  let r=sstep(.84,.6,ny);if(h<2&&x>14&&x<48)r=Math.max(r,sstep(4,-2,h));if(h<-6)r=1;
  let d=1-sstep(1.3,2.7,pd+(vnoise(x*.5,z*.5)-.5)*1.1);
  d=Math.max(d,1-sstep(-1,2.5,DEMO.box(x,z,-8,-53,8,6,3)));d=Math.max(d,1-sstep(-1,2,DEMO.box(x,z,62,-110,12,6,3)));
  const mo=sstep(.45,.7,fbm(x*.06+3,z*.06-8,3))*.8+(1-sstep(8,16,Math.hypot(x+4,z+2)))*.5;
  const rest=1-r;d=Math.min(d,1)*rest;const left=(1-d)*rest,m=Math.min(1,mo);return[left*(1-m),left*m,d,r];}

/* ---------- camps, shrine, enemies, title camera ---------- */
function demoShrine(s){const y=gH(s.x,s.z);s.y=y;
  // the bonfire is the shrine: an invisible crystal and rune keep updShrines happy, the ward still shows in a storm
  const crystal=new THREE.Mesh(geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),MATD.dark);crystal.visible=false;scene.add(crystal);
  const rune=new THREE.Mesh(geo('runeDisk',()=>{const g=new THREE.CircleGeometry(3.15,48);g.rotateX(-PI/2);return g;}),MAT.rune.clone());rune.visible=false;scene.add(rune);
  const ward=new THREE.Mesh(geo('ward',()=>new THREE.SphereGeometry(5.4,40,20,0,TAU,0,PI*.56)),wardMat);ward.position.set(s.x,y+.4,s.z);ward.visible=false;ward.renderOrder=10;scene.add(ward);
  const light=FIRES.length?FIRES[FIRES.length-1].l:addLight(V3(s.x,y+1.2,s.z),col(0xff8a3a),3,14,1);
  const o={s,crystal,rune,ward,light,y,meshes:[],vis:true};SHRINE_OBJ.push(o);s.obj=o;return o;}
function demoCamp(c,i){c.y=gH(c.x,c.z);c.ent=0;c.spawnR=[];c.tower=null;const ch=DEMO.chests[i];c.chest=buildChest(ch[0],ch[1],ch[2]);}
function spawnDemo(){const W=DEMO.enemies;
  W.forEach(([type,x,z,camp,o])=>{const c=CAMPS[camp];if(camp>=0&&P.cleared[camp])return;
    spawnEnemy(type,x,z,Object.assign({camp,tier:camp>=0?c.tier:0,yaw:camp>=0?yawTo(c.x-x,c.z-z):0},o||{}));});}
let demoCamA=0;
function demoTitleCam(rdt){demoCamA+=rdt;const T=DEMO.title,k=Math.sin(demoCamA*.05)*.5;
  camera.position.set(T.p[0]+k*.6,T.p[1]+Math.sin(demoCamA*.08)*.1,T.p[2]);camera.lookAt(T.t[0]+k*.8,T.t[1],T.t[2]);U.player.value.set(T.p[0],gH(T.p[0],T.p[2]),T.p[2]);}

/* ---------- karst peaks in the mist: three layers of spires (one mesh each) and two layers of cloud sea ---------- */
const MTND=[],CLOUDS=[];
function demoMountains(){
  const mat=(k)=>new THREE.ShaderMaterial({uniforms:{uFog:{value:scene.fog.color},uK:{value:k},uSun:{value:SUN_DIR},uSunC:skyU.uSunCol},fog:false,
    vertexShader:'attribute float aSd;varying vec3 vW;varying vec3 vN;varying float vSd;void main(){vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);vSd=aSd;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:`uniform vec3 uFog,uSun,uSunC;uniform float uK;varying vec3 vW;varying vec3 vN;varying float vSd;
      float h(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5);}
      float n2(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
      void main(){float an=(vW.x*0.7+vW.z*0.7)*0.25+vSd*13.0;
        float streak=n2(vec2(an*0.9,vW.y*0.018))*0.6+n2(vec2(an*3.1,vW.y*0.05))*0.4;
        float ledge=smoothstep(0.5,0.72,n2(vec2(an*0.7,vW.y*0.11)));
        vec3 rock=vec3(0.085,0.09,0.096)*(0.35+1.25*streak);
        // pines on the ledges and near the tops: dark green-black specks
        float pine=ledge*smoothstep(0.55,0.75,n2(vec2(an*6.0,vW.y*0.4)))*smoothstep(0.2,0.6,vN.y+0.5);
        rock=mix(rock,vec3(0.014,0.021,0.016),min(1.0,pine*1.4+smoothstep(0.5,0.95,vN.y)*0.55));
        vec3 V=normalize(cameraPosition-vW);float rim=pow(1.0-abs(dot(vN,V)),2.5);float lit=max(dot(vN,normalize(vec3(uSun.x,0.35,uSun.z))),0.0);
        rock+=uSunC*(lit*0.05+rim*0.07)+vec3(0.03,0.034,0.038)*smoothstep(0.3,1.0,vN.y);
        float base=smoothstep(-45.0,22.0,vW.y);float m=clamp(uK+pow(1.0-base,1.4)*0.9,0.0,1.0);
        gl_FragColor=vec4(mix(rock,uFog*(1.0+0.1*base),m),1.0);}`});
  // granite massifs (Huangshan): a dome of ridged noise with a few needle peaks on it, in three layers of distance;
  // x, z (from the bonfire's view), width, depth, height of the ridge, needles, seed
  const camX=DEMO.title.p[0],camZ=DEMO.title.p[2];
  const ridged=(x,z,o)=>{let s=0,a=.5,f=1,n=0;for(let i=0;i<o;i++){const v=1-Math.abs(vnoise(x*f+i*13.1,z*f-i*7.7)*2-1);s+=v*v*a;n+=a;a*=.5;f*=2.1;}return s/n;};
  const keep=_seed;_seed=4242;
  const layers=[[.07,[[-38,220,170,60,86,7],[-12,245,120,60,96,7],[-62,230,120,60,80,4]]],
    [.17,[[-24,330,210,90,142,9],[-2,350,170,80,166,7],[18,385,150,80,112,4],[-48,320,150,70,122,5]]],
    [.26,[[-30,480,280,100,172,6],[8,500,260,100,152,5],[34,470,220,100,122,4],[-64,440,220,100,122,4]]]];
  layers.forEach(([k,list],li)=>{const parts=[];
    for(const[bd,dist,W,D,H,nn]of list){const a=bd*PI/180,cx=camX+Math.sin(a)*dist,cz=camZ-Math.cos(a)*dist,sd=sr(0,90);
      const g=new THREE.PlaneGeometry(W,D,56,24);g.rotateX(-PI/2);const pa=g.attributes.position;
      const nd=[];for(let i=0;i<nn;i++){const thin=srnd()<.45;nd.push([sr(-W*.38,W*.38),sr(-D*.25,D*.2),sr(.06,thin?.12:.16)*H,thin?sr(6,9):sr(11,19)]);}
      for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i),u=x/(W/2),v=z/(D/2);
        const m=Math.max(0,1-Math.pow(Math.abs(u),2.4))*Math.max(0,1-Math.pow(Math.abs(v),2));
        let h=H*.85*Math.pow(m,1.1)*(.5+.5*ridged(x*.014+sd,z*.02-sd,5))+(fbm(x*.09+sd,z*.09,3)-.5)*H*.14*m;
        for(const[px,pz,ph,pr]of nd){const d2=((x-px)**2+(z-pz)**2)/(pr*pr);h+=ph*Math.exp(-d2)*m;}
        pa.setY(i,h-40);}
      g.rotateY(-a);g.translate(cx,0,cz);g.computeVertexNormals();
      const sda=new Float32Array(pa.count).fill(sd);g.setAttribute('aSd',new THREE.BufferAttribute(sda,1));parts.push({g,m:IDM});}
    const merged=mergeParts(parts);let off=0;const sdv=new Float32Array(merged.attributes.position.count);for(const p of parts){sdv.set(p.g.attributes.aSd.array,off);off+=p.g.attributes.aSd.count;}
    merged.setAttribute('aSd',new THREE.BufferAttribute(sdv,1));
    const m=new THREE.Mesh(merged,mat(k));m.frustumCulled=false;scene.add(m);MTND.push(m);});
  // the sea of mist: two soft cloud layers below the village, drifting
  const cm=(y,a,sc)=>new THREE.ShaderMaterial({uniforms:{uFog:{value:scene.fog.color},uT:U.time,uA:{value:a},uS:{value:sc}},transparent:true,depthWrite:false,fog:false,
    vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:`uniform vec3 uFog;uniform float uT,uA,uS;varying vec3 vW;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n2(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
      float fb(vec2 p){float s=0.0,a=0.5;for(int i=0;i<5;i++){s+=n2(p)*a;p=p*2.02+vec2(3.1,1.7);a*=0.5;}return s;}
      void main(){vec2 p=vW.xz*uS+vec2(uT*0.006,uT*0.002);float c=fb(p)*0.7+fb(p*2.7-uT*0.004)*0.3;float a=smoothstep(0.3,0.75,c)*uA;
        float d=length(vW.xz-cameraPosition.xz);a*=smoothstep(30.0,90.0,d);gl_FragColor=vec4(uFog*(1.04+c*0.12),a);}`});
  for(const[y,a,sc,zc,dz]of[[-14,.9,.012,-430,900],[-2,.55,.02,-430,900],[24,.5,.016,-520,700],[46,.38,.012,-600,520]]){const p=new THREE.Mesh(new THREE.PlaneGeometry(1400,dz,1,1),cm(y,a,sc));p.rotation.x=-PI/2;p.position.set(0,y,zc);p.renderOrder=3;scene.add(p);CLOUDS.push(p);}
  _seed=keep;}

/* ---------- everything, in the order of the loading bar ---------- */
function buildDemo(){_seed=20261104;
  DB.stone=new Batch();DB.metal=new Batch();DB.glow=new Batch();DB.cloth=new Batch();DB.wood=new Batch();DB.plaster=new Batch();DB.tile=new Batch();DB.leaf=new Batch();
  TEXD.ivy=toTex(genIvy(),{rep:false});MATD.ivy=new THREE.MeshStandardMaterial({map:TEXD.ivy,vertexColors:true,alphaTest:.5,side:THREE.DoubleSide,roughness:.75});
  // each builder draws from its own seed, so an edit in one does not reshuffle the others; the terrace and the stairs are rough masonry
  [demoTerrace,demoStairs,demoBridge,demoGate,demoZig,demoVillage,demoPalace,demoCave,demoRuins,demoRibbons,demoWaterfall,demoRays,demoMountains,demoMist].forEach((f,k)=>{_seed=20261104+k*7919;RB=k<2?1:0;f();});_seed=31337;RB=1;demoCrags();RB=0;DEMO.solids=demoSolids();
  for(const k of['stone','metal','cloth','wood','plaster','tile','leaf'])DB[k].build();DB.glow.build(false);
  fill.intensity=1.35;fill.color.set(0xc9ccd0);demoTexts();DEMO.boxes=DBOX;}
// the words of the demo's title and victory screens
function demoTexts(){const q=(s)=>document.querySelector(s),set=(s,t)=>{const e=q(s);if(e)e.textContent=t;};
  set('#title .rule','Demo · La Valle delle Lanterne');set('#loading .rule','La Valle delle Lanterne');
  set('#title .tag','Un falò sotto l\'arco, un villaggio di lanterne, un ponte sulla gola e un palazzo sulla rupe. Due guardiani ti aspettano.');
  set('#title .foot','Prima demo · tutto costruito nel codice, ispirato alla tua immagine');
  set('#victory .rule','Fine della demo');set('#victory h2','La valle delle lanterne è libera');
  set('#victory .tag','Gorrak e il Custode Velato sono caduti: il villaggio e il palazzo sulla rupe sono salvi.');}
/* ---------- trees, bushes and grass of the demo (planted into the forest cells of d_world, so they are instanced) ---------- */
// feathery plume of the pampas grass, and a fallen maple leaf (both with alpha)
function genPlume(){const S=128,c=mkC(S/2,S),x=c.getContext('2d');x.clearRect(0,0,S/2,S);
  for(let i=0;i<760;i++){const t=Math.random(),y=S*(.03+t*.36),w=(S/4)*Math.sin(Math.min(1,t*1.4)*PI*.85+.15)*rr(.5,1);x.strokeStyle=rgba(232,226,214,rr(.35,.8));x.lineWidth=rr(.8,1.6);
    x.beginPath();x.moveTo(S/4,y);x.quadraticCurveTo(S/4+rr(-1,1)*w*.6,y+rr(2,6),S/4+rr(-1,1)*w,y+rr(6,14));x.stroke();}
  x.strokeStyle=rgba(140,132,112,.95);x.lineWidth=1.3;x.beginPath();x.moveTo(S/4,S);x.quadraticCurveTo(S/4+2,S*.5,S/4,S*.06);x.stroke();return c;}
function genIvy(){const S=128,c=mkC(S),x=c.getContext('2d');x.clearRect(0,0,S,S);
  for(let k=0;k<5;k++){const cx=S*(.25+Math.random()*.5),cy=S*(.25+Math.random()*.5),r=S*rr(.13,.2),a0=rr(0,TAU);x.save();x.translate(cx,cy);x.rotate(a0);
    x.fillStyle=`rgb(${(rr(200,255))|0},${(rr(200,240))|0},${(rr(200,230))|0})`;x.beginPath();
    for(let i=0;i<=15;i++){const a=-PI/2+i/15*TAU,l=i%3===0?1:i%3===1?.55:.62,rad=r*l*(Math.abs(Math.sin(a*2.5))*.35+.65);x.lineTo(Math.cos(a)*rad,Math.sin(a)*rad);}x.closePath();x.fill();
    x.strokeStyle='rgba(60,20,10,.55)';x.lineWidth=1.2;for(let i=0;i<5;i++){const a=-PI/2+i/5*TAU;x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(a)*r*.85,Math.sin(a)*r*.85);x.stroke();}x.restore();}
  return c;}
function genLeaf(){const S=64,c=mkC(S),x=c.getContext('2d');x.clearRect(0,0,S,S);x.translate(S/2,S/2);
  x.fillStyle='#fff';x.beginPath();for(let i=0;i<=10;i++){const a=-PI/2+i/10*TAU,r=(i%2?.18:.46)*S;x.lineTo(Math.cos(a)*r,Math.sin(a)*r);}x.closePath();x.fill();
  x.strokeStyle='rgba(90,40,20,.6)';x.lineWidth=1;for(let i=0;i<5;i++){const a=-PI/2+i/5*TAU;x.beginPath();x.moveTo(0,0);x.lineTo(Math.cos(a)*S*.4,Math.sin(a)*S*.4);x.stroke();}return c;}
// Huangshan pine: a leaning, kinked trunk; branches spread flat near the top, each ending in a level pad of needles
function umbrellaGeo(){const parts=[],P=[],N=[],UV=[],C=[],I=[];let px=0,py=0,pz=0;const H=sr(6,9),lean=sr(.5,1.6),la=sr(0,TAU);
  for(let k=0;k<4;k++){const t=(k+1)/4,nx=Math.cos(la)*lean*t+sr(-.4,.4),ny=H*t,nz=Math.sin(la)*lean*t+sr(-.4,.4);
    parts.push({g:geo('unitCyl',()=>new THREE.CylinderGeometry(.6,1,1,6,1,true)),m:segM(px,py,pz,nx,ny,nz,.34*(1-t*.55))});px=nx;py=ny;pz=nz;}
  const pads=[[px,py+.3,pz,sr(1.6,2.2)]];
  for(let b=0;b<5;b++){const a=b/5*TAU+sr(-.4,.4),y0=H*sr(.55,.92),L=sr(1.8,3.6),bx=Math.cos(la)*lean*y0/H+Math.cos(a)*L,bz=Math.sin(la)*lean*y0/H+Math.sin(a)*L,by=y0+sr(-.2,.6);
    parts.push({g:geo('unitCyl',()=>new THREE.CylinderGeometry(.6,1,1,6,1,true)),m:segM(Math.cos(la)*lean*y0/H,y0,Math.sin(la)*lean*y0/H,bx,by,bz,.1)});pads.push([bx,by+.15,bz,sr(1.2,1.9)]);}
  for(const[cx,cy,cz,R]of pads)for(let q=0;q<7;q++){const a=sr(0,TAU),r=sr(0,R*.55),qx=cx+Math.cos(a)*r,qz=cz+Math.sin(a)*r,qy=cy+sr(-.12,.18),s2=sr(.8,1.3),rot=sr(0,TAU),tl=sr(-.12,.12),base=P.length/3;
    const tl2=tl+(q%2?.42:-.38);
    for(const[u,v]of[[-1,-1],[1,-1],[1,1],[-1,1]]){const lx=u*s2,lz=v*s2,rx=lx*Math.cos(rot)-lz*Math.sin(rot),rz=lx*Math.sin(rot)+lz*Math.cos(rot);
      P.push(qx+rx,qy+rx*tl2+(v>0?.25:-.05),qz+rz);N.push(rx*.15,1,rz*.15);UV.push((u+1)/2,(v+1)/2);const ao=sr(.7,1);C.push(ao*.85,ao,ao*.8);}I.push(base,base+1,base+2,base,base+2,base+3);}
  return{trunk:mergeParts(parts),leaves:rawGeo(P,N,UV,C,I)};}
// pampas grass clump: arching grey-green blades and tall stems with plumes
function pampasGeo(){const B={P:[],N:[],UV:[],C:[],I:[]},Q={P:[],N:[],UV:[],C:[],I:[]};
  const quad=(o,a,b2,c2,d,col)=>{const base=o.P.length/3;for(const p of[a,b2,c2,d]){o.P.push(...p);o.N.push(0,1,0);}o.UV.push(0,0,1,0,1,1,0,1);for(let i=0;i<4;i++)o.C.push(...col);o.I.push(base,base+1,base+2,base,base+2,base+3);};
  for(let i=0;i<26;i++){const a=sr(0,TAU),L=sr(.8,1.5),out=sr(.3,.9),w=.035,ca=Math.cos(a),sa=Math.sin(a),k=sr(.55,.8);let px=0,py=0,pz=0;
    for(let j=0;j<3;j++){const t=(j+1)/3,nx=ca*out*t*t,ny=L*Math.sin(t*1.2)*1.05,nz=sa*out*t*t;quad(B,[px-sa*w,py,pz+ca*w],[px+sa*w,py,pz-ca*w],[nx+sa*w*(1-t*.7),ny,nz-ca*w*(1-t*.7)],[nx-sa*w*(1-t*.7),ny,nz+ca*w*(1-t*.7)],[k*.86,k*.8,k*.58]);px=nx;py=ny;pz=nz;}}
  for(let i=0;i<15;i++){const a=sr(0,TAU),ca=Math.cos(a),sa=Math.sin(a),H=sr(1.25,2),out=sr(.3,.85),dr=sr(.15,.45),cs=-sa,sn=ca,r0=sr(0,.18),NS=6;let prev=null;
    for(let j=0;j<=NS;j++){const t=j/NS,r=r0+out*t*t,y=H*Math.sin(t*PI*.5)-dr*Math.pow(Math.max(0,t-.5)*2,2),w=.02+.19*sstep(.42,.8,t)*(1-.35*sstep(.88,1,t)),px=ca*r,pz=sa*r,L=[px-cs*w,y,pz-sn*w],R=[px+cs*w,y,pz+sn*w];
      if(prev){const base=Q.P.length/3;for(const p of[prev[0],prev[1],R,L]){Q.P.push(...p);Q.N.push(0,1,0);}Q.UV.push(0,(j-1)/NS,1,(j-1)/NS,1,t,0,t);for(let k=0;k<4;k++)Q.C.push(1,1,1);Q.I.push(base,base+1,base+2,base,base+2,base+3);}
      prev=[L,R];}}
  return{blades:rawGeo(B.P,B.N,B.UV,B.C,B.I),plumes:rawGeo(Q.P,Q.N,Q.UV,Q.C,Q.I)};}
function genMaple(){const S=256,c=mkC(S),x=c.getContext('2d');x.clearRect(0,0,S,S);
  for(let i=0;i<130;i++){const cx=S*(.12+Math.random()*.76),cy=S*(.12+Math.random()*.76),r=S*rr(.03,.06),a0=Math.random()*TAU,h=rr(-8,14);
    x.fillStyle=`hsl(${h},${rr(40,62)}%,${rr(20,36)}%)`;x.beginPath();for(let k=0;k<=10;k++){const a=a0+k/10*TAU,rr2=(k%2?.42:1)*r;x.lineTo(cx+Math.cos(a)*rr2,cy+Math.sin(a)*rr2);}x.fill();}
  for(let i=0;i<40;i++){x.strokeStyle='rgba(50,30,25,.7)';x.lineWidth=rr(1,2.2);x.beginPath();const a=Math.random()*TAU;x.moveTo(S/2,S/2);x.lineTo(S/2+Math.cos(a)*S*.4,S/2+Math.sin(a)*S*.4);x.stroke();}
  return c;}
function leafGeo(){const g=new THREE.PlaneGeometry(.16,.16);g.rotateX(-PI/2);g.translate(0,.012,0);return g;}
function demoVeg(tint){const s0=_seed;_seed=8128;TEXD.plume=toTex(genPlume(),{rep:false});TEXD.leaf=toTex(genLeaf(),{rep:false});
  MATD.blade=windMat({vertexColors:true,side:THREE.DoubleSide,roughness:.9,color:col(0x6c7262)},.6,.4,true);
  MATD.plume=windMat({map:TEXD.plume,vertexColors:true,alphaTest:.13,side:THREE.DoubleSide,roughness:.95,color:col(0x938d81),emissive:col(0x1c1a16)},1.4,.5,true);
  MATD.leaf=new THREE.MeshStandardMaterial({map:TEXD.leaf,vertexColors:true,alphaTest:.5,side:THREE.DoubleSide,roughness:.7});
  TEXD.maple=toTex(genMaple(),{rep:false});MATD.maple=windMat({map:TEXD.maple,vertexColors:true,alphaTest:.45,side:THREE.DoubleSide,roughness:.75,emissive:col(0x0b0302)},1,1.1,true);
  const ok=oakGeo();
  const up=umbrellaGeo(),pa=pampasGeo();
  Object.assign(VEG,{mpT:{g:ok.trunk,m:MAT.treeBark},mpL:{g:ok.leaves,m:MATD.maple,d:TEXD.maple},upT:{g:up.trunk,m:MAT.treeBark},upL:{g:up.leaves,m:MAT.needles,d:TEX.needles},pamB:{g:pa.blades,m:MATD.blade,small:1,noShadow:1},
    pamP:{g:pa.plumes,m:MATD.plume,small:1,noShadow:1,d:TEXD.plume},leafG:{g:leafGeo(),m:MATD.leaf,small:1,noShadow:1}});
  const red=()=>new THREE.Color(sr(1.5,1.9),sr(.32,.5),sr(.2,.28)),amber=()=>new THREE.Color(sr(1.4,1.6),sr(.75,.95),sr(.3,.4));
  const free=(x,z,r)=>occFree(x,z,r)&&!DEMO.houses.some(h=>Math.hypot(x-h[0],z-h[1])<Math.max(h[3],h[4])*.75+r);
  const tree=(type,x,z,s,t,col=.45)=>{const y=gH(x,z)-.15;plant(type+'T',x,y,z,s,sr(0,TAU),tint(1,.05));plant(type+'L',x,y,z,s,sr(0,TAU),t||tint(1));occMark(x,z);addCol(x,z,col*s,8);n++;};
  let n=0;
  // maples: the big red one in the square, a few round the village and the terrace
  for(const[x,z,s,c]of DEMO.maples)tree('mp',x,z,s,c==='a'?new THREE.Color(1.25,1.05,.7):new THREE.Color(sr(.85,1),sr(.75,.9),sr(.75,.9)),.5);
  // pines on the cliff tops and edges, firs on the far slopes
  for(const[cx,cz,r,k]of DEMO.pineAreas)for(let i=0;i<k*3;i++){const a=sr(0,TAU),d=Math.sqrt(srnd())*r,x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d;
    if(!free(x,z,2.4)||pdAt(x,z)<3)continue;const ny=nyAt(x,z);if(ny<.62)continue;tree('up',x,z,sr(.9,1.6),new THREE.Color(sr(.75,.95),sr(.85,1),sr(.7,.85)),.3);}
  for(const[cx,cz,r,k]of DEMO.firAreas)for(let i=0;i<k*3;i++){const a=sr(0,TAU),d=Math.sqrt(srnd())*r,x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d;
    if(!free(x,z,2.2)||pdAt(x,z)<3||nyAt(x,z)<.78)continue;const type=srnd()<.5?'sp':'pi';tree(type,x,z,sr(.6,1.15),tint(.8),.38);}
  // pampas along the edges, fallen leaves on the stones
  for(const[ax,az,bx,bz,k,sp=1.2]of DEMO.pampas)for(let i=0;i<k;i++){const t=srnd(),x=lerp(ax,bx,t)+sr(-sp,sp),z=lerp(az,bz,t)+sr(-sp,sp);if(nyAt(x,z)<.55)continue;
    const y=gH(x,z)-.05,s=sr(.6,1.05),ry=sr(0,TAU);plant('pamB',x,y,z,s,ry,new THREE.Color(sr(.8,1),sr(.8,1),sr(.75,.9)));plant('pamP',x,y,z,s,ry,new THREE.Color(sr(.9,1.05),sr(.88,1),sr(.8,.92)));}
  for(const[cx,cz,hx,hz,k]of DEMO.leaves)for(let i=0;i<k;i++){const x=cx+sr(-hx,hx),z=cz+sr(-hz,hz);plant('leafG',x,gY(x,z)+.02,z,sr(.7,1.4),sr(0,TAU),srnd()<.7?red():amber());}
  for(let i=0;i<260;i++){const x=sr(-70,90),z=sr(-160,30),ny=nyAt(x,z);if(ny<.4||ny>.9||!free(x,z,1.5))continue;const s=sr(.5,1.6);plant('rockA',x,gH(x,z)-s*.15,z,s,sr(0,TAU),tint(.85,.06));}
  for(let i=0;i<160;i++){const sd=srnd()<.5?-1:1,x=sd*sr(4.6,13),z=sr(-31,-12),h=gH(x,z);if(h>19.5||!free(x,z,.9)||nyAt(x,z)<.6)continue;plant(srnd()<.6?'bush':'fern',x,h-.1,z,sr(.9,1.6),sr(0,TAU),tint(.85,.08));}
  // pines clinging to the cliffs of the gorge and under the palace
  for(let i=0;i<700&&n<400;i++){const x=sr(6,100),z=sr(-140,-12),ny=nyAt(x,z);if(ny<.3||ny>.66||!free(x,z,2.5)||gH(x,z)<-6)continue;tree('up',x,z,sr(.55,.85),new THREE.Color(sr(.7,.9),sr(.8,.95),sr(.65,.8)),.25);}
  for(let i=0;i<220;i++){const x=sr(-70,30),z=sr(-100,30),ny=nyAt(x,z);if(ny<.86||!free(x,z,1.2)||pdAt(x,z)<2.5)continue;const h=gH(x,z);if(h<5)continue;
    plant(srnd()<.5?'bush':'fern',x,h-.08,z,sr(.7,1.3),sr(0,TAU),tint(.9));}
  _seed=s0;return n;}
