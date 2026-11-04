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
// vertical weathered boards for house walls
function genBoards(){const S=TS/2,c=mkC(S);pxFill(c,(u,v,o)=>{const k=Math.floor(u*9),f=(u*9)%1,n=tfbm(u*.3+k*.11,v,3,6,93+k),g=tfbm(u,v*.25,40,2,7),e=sstep(0,.06,f)*sstep(1,.94,f);
    const b=lerp(70,120,n)*(.55+.45*e)*(.9+.2*g)*(.85+.15*hash2(k,5));o[0]=b;o[1]=b*.93;o[2]=b*.86;});return c;}
function makeDemoTextures(){demoTexts();TEXD.boards=toTex(genBoards());TEXD.tiles=toTex(genTiles());TEXD.plaster=toTex(genPlaster());TEXD.cloth=toTex(genCloth());TEXD.cobble=toTex(genCobble());
  MATD.stone=stoneMat(0xa3abb3,.14,.86,.95);MATD.stoneDark=stoneMat(0x8e959b,.22,.9,.8);MATD.rock=stoneMat(0x8b9198,.3,.92,.5);
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
  MATD.window=new THREE.MeshBasicMaterial({color:new THREE.Color(2.6,1.45,.6)});MATD.windowDim=new THREE.MeshBasicMaterial({color:new THREE.Color(1.25,.68,.3)});
  MATD.dark=new THREE.MeshBasicMaterial({color:col(0x0b0a09)});
  MATD.caveGlow=new THREE.MeshBasicMaterial({color:new THREE.Color(1.5,.62,.22)});
  MATD.cloth=windMat({map:TEXD.cloth,alphaTest:.5,side:THREE.DoubleSide,roughness:.9},0,0,false);
  const bc=MAT.banner.onBeforeCompile;MATD.cloth.onBeforeCompile=bc;}

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
function boxAt(b,mat,x,y,z,w,h,d,yaw=0,tint=WHITE,rx=0,rz=0){b.add(mat,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(x,y,z,rx,yaw,rz,w,h,d,'YXZ'),tint);}
function cylAt(b,mat,x,y,z,r,h,seg=10,tint=WHITE,r2=r){b.add(mat,geo('dcyl'+seg+(r2===r?'':'t'+(r2/r).toFixed(2)),()=>new THREE.CylinderGeometry(r2/r,1,1,seg)),M4(x,y,z,0,0,0,r,h,r),tint);}

/* ---------- the bonfire terrace ---------- */
function demoTerrace(){const b=DB.stone,y=dY(0,0);
  // flagstones: rows of slabs of random length, a few cracked or missing, the whole terrace wet; the bay under the arch too
  const slabs=(x0,x1,z0,z1)=>{let z=z0;while(z<z1){const dz=sr(.8,1.35);let x=x0;while(x<x1){const dx=sr(.9,1.8),cx=Math.min(x+dx,x1);const w=cx-x-.05,dd=Math.min(dz,z1-z)-.05,mx=(x+cx)/2,mz=z+dd/2;
      if(srnd()>.03){const yy=dY(mx,mz)+.04+sr(-.02,.02);boxAt(b,MATD.stone,mx,yy-.09,mz,w,.2,dd,sr(-.02,.02),grey(sr(.62,.86)),sr(-.012,.012),sr(-.012,.012));}
      x=cx;}z+=dz;}};
  slabs(-8.6,8.4,-8.3,6.4);slabs(-12.7,-4.3,-16.3,-8.3);
  // retaining walls round the terrace and the bay, the stairs gap left open in the north
  const wall=(ax,az,bx,bz,h)=>{const L=Math.hypot(bx-ax,bz-az),n=Math.ceil(L/1.2);for(let i=0;i<n;i++){const t=(i+.5)/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=dY(px,pz);
      boxAt(b,MATD.stoneDark,px,yy-h/2+.1,pz,L/n+.02,h,.7,-Math.atan2(bz-az,bx-ax),grey(sr(.7,.85)));}};
  wall(-13,-16.6,-4,-16.6,3);wall(-4,-16.6,-4,-8.4,3);wall(3.4,-8.4,9,-8.4,3);wall(9,-8.4,9,6.8,4);
  // balustrades: square posts, a rail, turned balusters
  balustrade(b,8.8,-8.2,8.8,6.6,y);balustrade(b,3.5,-8.2,8.8,-8.2,y);balustrade(b,-12.8,-16.4,-4.3,-16.4,y);balustrade(b,-4.3,-16.4,-4.3,-8.6,y);
  addSeg(8.9,-8.4,8.9,6.8,.25,1.2);addSeg(3.5,-8.4,9,-8.4,.25,1.2);addSeg(-13,-16.5,-4.2,-16.5,.25,1.2);addSeg(-4.2,-16.5,-4.2,-8.5,.25,1.2);
  // the ruined Gothic arch at the corner of the bay, with a broken wall
  gothicArch(b,DEMO.arch.x,y,DEMO.arch.z,DEMO.arch.yaw);
  // the bonfire with a sword planted in it
  bonfire(DEMO.shrines[0].x,y,DEMO.shrines[0].z);}
function balustrade(b,ax,az,bx,bz,y0,h=1.05){const L=Math.hypot(bx-ax,bz-az),yaw=-Math.atan2(bz-az,bx-ax),n=Math.max(1,Math.round(L/2.4));
  for(let i=0;i<=n;i++){const t=i/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=(y0===undefined?dY(px,pz):y0);
    boxAt(b,MATD.stone,px,yy+h/2,pz,.38,h,.38,yaw,grey(sr(.72,.86)));boxAt(b,MATD.stone,px,yy+h+.07,pz,.48,.14,.48,yaw,grey(.8));
    if(srnd()<.35)boxAt(b,MATD.stone,px,yy+h+.22,pz,.22,.18,.22,yaw+.7,grey(.78));}
  for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,mx=lerp(ax,bx,(t0+t1)/2),mz=lerp(az,bz,(t0+t1)/2),yy=(y0===undefined?dY(mx,mz):y0);
    boxAt(b,MATD.stone,mx,yy+h-.04,mz,L/n,.12,.3,yaw,grey(sr(.74,.84)));boxAt(b,MATD.stone,mx,yy+.1,mz,L/n,.14,.32,yaw,grey(.72));
    const nb=Math.floor(L/n/.32);for(let k=1;k<nb;k++){const tt=lerp(t0,t1,k/nb),qx=lerp(ax,bx,tt),qz=lerp(az,bz,tt);
      cylAt(b,MATD.stone,qx,yy+.1+(h-.24)/2+.07,qz,.07,h-.24,7,grey(sr(.7,.82)),.05);}}}
function gothicArch(b,x,y,z,yaw){const c=Math.cos(yaw),s=Math.sin(yaw),P=(u,v,w)=>[x+u*c+w*s,y+v,z-u*s+w*c];
  const span=2.3,H=4.6,rise=3.4,st=MATD.stone,dk=MATD.stoneDark;
  // compound piers: a core and four shafts, base and capital
  for(const side of[-1,1]){const[px,py,pz]=P(side*span,0,0);
    boxAt(b,dk,px,py+.35,pz,1.3,.7,1.3,yaw,grey(.7));boxAt(b,st,px,py+H/2+.6,pz,.78,H,.78,yaw,grey(.8));
    for(const[ox,oz]of[[.42,0],[-.42,0],[0,.42],[0,-.42]]){const qx=px+ox*c+oz*s,qz=pz-ox*s+oz*c;cylAt(b,st,qx,py+.7+H/2,qz,.17,H,9,grey(sr(.76,.86)));}
    boxAt(b,st,px,py+H+.75,pz,1.15,.32,1.15,yaw,grey(.82));boxAt(b,st,px,py+H+1,pz,.95,.2,.95,yaw,grey(.8));}
  // three moulded rings, the inner one thinner, with tracery in the head: two lancets and a quatrefoil
  gothicRing(b,st,x,y+H+1.1,z,span,rise,.62,.9,yaw,grey(.8),16);gothicRing(b,st,x,y+H+1.1,z,span-.42,rise-.36,.26,.55,yaw,grey(.74),14);
  const[mx,my,mz]=P(0,H+1.1,0);cylAt(b,st,mx,my-.9,mz,.13,2.2,8,grey(.8));
  gothicRing(b,st,x+(-.95)*c,y+H+.35,z+.95*s,.86,1.3,.16,.4,yaw,grey(.76),8);gothicRing(b,st,x+(.95)*c,y+H+.35,z-.95*s,.86,1.3,.16,.4,yaw,grey(.76),8);
  const[qx,qy,qz]=P(0,H+2.55,0);for(let i=0;i<4;i++){const a=i*PI/2+PI/4;b.add(st,geo('qfoil',()=>new THREE.TorusGeometry(.34,.07,6,14)),M4(qx+Math.cos(a)*.28*c,qy+Math.sin(a)*.28,qz-Math.cos(a)*.28*s,0,yaw,0,1,1,1,'YXZ'),grey(.78));}
  // a broken wall to the west and fallen blocks
  for(let i=0;i<3;i++){const[wx,,wz]=P(-span-1.2-i*.9,0,0),h=sr(2.5,4.6)*(1-i*.2),wy=dY(wx,wz);boxAt(b,dk,wx,wy+h/2-.3,wz,.95,h,.85,yaw+sr(-.03,.03),grey(sr(.62,.76)));}
  for(let i=0;i<5;i++){const[fx,fy,fz]=P(sr(-4,-1),0,sr(-1.5,2));boxAt(b,dk,fx,fy+.2,fz,sr(.4,.9),sr(.3,.5),sr(.4,.8),sr(0,3),grey(sr(.6,.75)),sr(-.3,.3),sr(-.3,.3));}
  for(const side of[-1,1]){const[px,,pz]=P(side*span,0,0);addCol(px,pz,.75,6);}
  {const[a1,,a2]=P(-span-1,0,0),[b1,,b2]=P(-span-3.6,0,0);addSeg(a1,a2,b1,b2,.5,4);}
  DX.arch={x,y,z,yaw,span,H};}
function bonfire(x,y,z){const b=DB.stone;
  for(let i=0;i<11;i++){const a=i/11*TAU+sr(-.1,.1),r=sr(.62,.74);boxAt(b,MATD.rock,x+Math.cos(a)*r,y+.1,z+Math.sin(a)*r,sr(.26,.38),sr(.2,.3),sr(.22,.32),sr(0,3),grey(sr(.5,.66)),sr(-.3,.3),sr(-.3,.3));}
  for(let i=0;i<5;i++){const a=i/5*TAU+.3;b.add(MAT.wood,geo('dlog',()=>new THREE.CylinderGeometry(.07,.09,1,7)),M4(x+Math.cos(a)*.18,y+.24,z+Math.sin(a)*.18,Math.sin(a)*.9,0,-Math.cos(a)*.9,1,.95,1),new THREE.Color(.28,.24,.22));}
  // the sword, planted blade down, leaning a little
  const sb=DB.metal,lean=.1;
  boxAt(sb,MAT.metal,x+.05,y+.55,z,.075,1.15,.018,.4,new THREE.Color(.9,.9,.92),0,lean);
  boxAt(sb,MAT.metal,x+.05-Math.sin(lean)*.55,y+1.16,z,.5,.06,.07,.4,new THREE.Color(.55,.5,.45),0,lean);
  b.add(MAT.wood,geo('dcyl8',()=>new THREE.CylinderGeometry(1,1,1,8)),M4(x+.05-Math.sin(lean)*.72,y+1.33,z,0,.4,lean,.035,.3,.035),new THREE.Color(.25,.16,.12));
  b.add(MAT.metal,geo('dpom',()=>new THREE.SphereGeometry(1,8,6)),M4(x+.05-Math.sin(lean)*.9,y+1.5,z,0,0,0,.05),new THREE.Color(.6,.55,.45));
  makeFire(x,y+.12,z,.7,true);DX.fire={x,y,z};}

/* ---------- the stairs down to the village ---------- */
function demoStairs(){const b=DB.stone,R=DEMO.RAMP[0],ax=R[0],az=R[1],ya=R[2],bx=R[3],bz=R[4],yb=R[5],hw=R[6];
  const L=Math.hypot(bx-ax,bz-az),n=Math.round((ya-yb)/.24),yaw=-Math.atan2(bz-az,bx-ax)+PI/2;addRamp(ax,az,ya,bx,bz,yb,hw);
  for(let i=0;i<n;i++){const t=(i+.5)/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=lerp(ya,yb,t)+.02;
    // each step: a few long blocks, slightly uneven, worn
    let u=-hw;while(u<hw){const w=Math.min(sr(1.1,2.6),hw-u),g=sr(.58,.82),mo=srnd()<.25;boxAt(b,MATD.stone,px+(u+w/2),yy-.2+sr(-.02,.02),pz+sr(-.04,.04),w-.06,.44,L/n+.04,yaw+sr(-.02,.02),mo?new THREE.Color(g*.86,g*.92,g*.78):grey(g,.04),sr(-.015,.015),sr(-.015,.015));u+=w;}}
  // side walls with the balustrades on top, lantern posts every few metres
  for(const side of[-1,1]){const sx=side*(hw+.35);
    for(let i=0;i<n;i+=3){const t=(i+1.5)/n,pz=lerp(az,bz,t),yy=lerp(ya,yb,t),gy=dY(sx+side*1.5,pz);const h=Math.max(1,yy-gy+1.2);
      boxAt(b,MATD.stoneDark,sx,yy-h/2+.15,pz,.7,h,L/n*3+.04,0,grey(sr(.64,.76)));}
    parapetSlope(b,sx,az,ya,sx,bz,yb);addSeg(sx,az,sx,bz,.3,1.3);}
  for(let k=0;k<4;k++){const t=k/3,pz=lerp(az,bz,t)-.3,yy=lerp(ya,yb,t);for(const side of[-1,1])lanternPost(side*(hw+.35),yy+1.05,pz);}}
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
    // curtain wall with merlons, out along the cliff on both sides
    for(let k=0;k<5;k++){const w=side*(5.6+k*1.6),[cx,cz]=P(2,w),gy=Math.max(Math.min(dY(cx,cz),y),y-14);boxAt(b,MATD.stoneDark,cx,(gy-3+y+7)/2,cz,2.2,y+7-gy+3,1.65,yaw,grey(sr(.6,.7)));
      if(k%2===0){const[mx,mz]=P(2,w);boxAt(b,MATD.stone,mx,y+7.5,mz,2.3,1,.8,yaw,grey(.72));}}
    {const[a1,a2]=P(2,side*4.8),[b1,b2]=P(2,side*12.6);addSeg(a1,a2,b1,b2,1.1,8);}}
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
  const boards=o.boards!==undefined?o.boards:srnd()<.7;
  if(boards)boxAt(wood,MATD.boards,x,y1+Hw/2,z,W-.1,Hw,D-.1,yaw,new THREE.Color(sr(.85,1),sr(.8,.95),sr(.75,.88)));
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
  for(let k=0;k<Math.round(W/2.2);k++){const[px,pz]=L(-W/2+(k+.5)*W/Math.round(W/2.2),D/2-.38);DB.glow.add(k%2?MATD.window:MATD.dark,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(px,y+1.2+H*.48,pz,0,yaw,0,1.4,H*.7,.06,'YXZ'),WHITE);}
  boxAt(wood,MATD.timber,x,y+1.2+H+.2,z,W+.5,.4,D+.5,yaw,new THREE.Color(.5,.25,.2));
  chineseRoof(x,y+1.2+H+.4,z,yaw,W,D,tiers,H*.45);
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
function statue(x,y,z,yaw){const stM=MATD.statue,sm={b:stM,m:stM},st=buildHuman({d:HERO_D,s:2.6,mats:sm,build:heroBuild});st.root.position.set(x,y+1.6,z);st.root.rotation.y=yaw;
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
function gothicTower(x,y,z,yaw,S,H,rose){const c=Math.cos(yaw),s=Math.sin(yaw),L=(a,b2)=>[x+a*c+b2*s,z-a*s+b2*c],st=MATD.stone,dk=MATD.stoneDark;
  boxAt(DB.stone,st,x,y+H/2,z,S,H,S,yaw,grey(.78));
  for(let k=1;k<5;k++)boxAt(DB.stone,st,x,y+k*H/5,z,S+.5,.45,S+.5,yaw,grey(.72));
  for(let k=0;k<4;k++){const[wx,wz]=L(0,S/2+.03);if(k===3&&rose)continue;DB.glow.add(srnd()<.5?MATD.windowDim:MATD.dark,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(wx,y+(k+.55)*H/5,wz,0,yaw,0,1.1,H/5*.55,.1,'YXZ'),WHITE);}
  if(rose){const[rx,rz]=L(0,S/2+.12),ry=y+3.5*H/5+.6;const m=new THREE.Mesh(geo('rose',()=>new THREE.CircleGeometry(1,24)),MATD.windowDim);m.position.set(rx,ry,rz);m.rotation.y=yaw;m.scale.setScalar(S*.3);scene.add(m);
    DB.stone.add(st,geo('roseRing',()=>new THREE.TorusGeometry(1,.11,8,28)),M4(rx,ry,rz,0,yaw,0,S*.32,S*.32,S*.32,'YXZ'),grey(.78));
    for(let i=0;i<8;i++){const a=i/8*PI;DB.stone.add(st,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(rx,ry,rz,0,yaw,a,.1,S*.6,.1,'YXZ'),grey(.75));}}
  for(const[a,b2]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const[px,pz]=L(a*S/2,b2*S/2);boxAt(DB.stone,st,px,y+H+.9,pz,.8,1.8,.8,yaw,grey(.72));b2cone(px,y+H+1.8,pz,.5,4.4);}
  b2cone(x,y+H,z,S*.3,6);dBox(x,z,S,S,yaw,8);}
// the palace of the picture: the great hall in the middle, a chapel with two spires on the left, the rose-window tower and an
// arcade along the cliff on the right, statues on the plaza; the pavilion on the terrace below
function demoPalace(){const P=DEMO.palace,y=P.y,c=Math.cos(P.yaw),s=Math.sin(P.yaw),L=(a,b2)=>[P.x+a*c+b2*s,P.z-a*s+b2*c];
  {const[x,z]=L(0,-3);gothicHall(x,y,z,P.yaw,24,16,13,2);}
  {const[x,z]=L(-19,-4);boxAt(DB.stone,MATD.stone,x,y+6,z,10,12,12,P.yaw,grey(.78));chineseRoof(x,y+12.3,z,P.yaw,10.4,12.4,1,4,1.4);dBox(x,z,10,12,P.yaw,8);
    for(const sd of[-1,1]){const[tx,tz]=L(-19+sd*4.4,2.2);boxAt(DB.stone,MATD.stone,tx,y+9,tz,2.2,18,2.2,P.yaw,grey(.7));b2cone(tx,y+18,tz,1.4,11);
      for(const[a,b2]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const[px,pz]=L(-19+sd*4.4+a*1.1,2.2+b2*1.1);b2cone(px,y+18,pz,.25,2.4);}}
    const[wx,wz]=L(-19,2.05);DB.glow.add(MATD.window,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(wx,y+6,wz,0,P.yaw,0,1.6,6,.1,'YXZ'),WHITE);
    gothicRing(DB.stone,MATD.stone,wx,y+8.6,wz,.95,1.4,.22,.3,P.yaw,grey(.74),8);}
  {const[x,z]=L(15,-6);gothicTower(x,dY(x,z),z,P.yaw,7.5,27,true);}
  {const[x,z]=L(-27,-2);gothicTower(x,dY(x,z),z,P.yaw,4.6,19,false);}
  // arcade along the cliff's edge: piers, pointed arches, a parapet walk on top
  for(let i=0;i<6;i++){const[ax,az]=L(20.5+i*3.4,3+i*1.25),gy=dY(ax,az),top=y+8;boxAt(DB.stone,MATD.stoneDark,ax,(gy+top)/2-1,az,1.1,top-gy+2,1.3,P.yaw-.35,grey(.64));
    if(i<5){const[mx,mz]=L(22.2+i*3.4,3.6+i*1.25);gothicRing(DB.stone,MATD.stone,mx,top-3,mz,1.45,1.9,.4,1.2,P.yaw-.35,grey(.72),8);boxAt(DB.stone,MATD.stone,mx,top+.4,mz,3.6,.8,1.4,P.yaw-.35,grey(.7));}}
  for(const sd of[-1,1]){const[x,z]=L(sd*7.5,9.5);statue(x,dY(x,z),z,P.yaw+sd*.25);}
  for(const[a,b2]of[[-4.5,12.5],[4.5,12.5],[-12,9],[12,9]]){const[x,z]=L(a,b2);lanternPost(x,dY(x,z),z,a<0&&b2>10);}
  for(const sd of[-1,1]){const[x,z]=L(sd*3.6,6.2);banner(x,y+1,z,6,1.2,4.4,P.yaw+PI/2);}
  palaceStairs(DEMO.RAMP[1]);
  hall(DEMO.pavilion.x,dY(DEMO.pavilion.x,DEMO.pavilion.z),DEMO.pavilion.z,P.yaw,6,6,3,2);}
function palaceStairs(R){const[ax,az,ya,bx,bz,yb,hw]=R,L=Math.hypot(bx-ax,bz-az),n=Math.round((yb-ya)/.2),yaw=-Math.atan2(bz-az,bx-ax)+PI/2;
  for(let i=0;i<n;i++){const t=(i+.5)/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=lerp(ya,yb,(i+.5)/n);boxAt(DB.stone,MATD.stone,px,yy-.3,pz,hw*2,.6,L/n+.05,yaw,grey(sr(.66,.8)));}
  for(const sd of[-1,1]){const sx=sd*(hw+.3);balustradeSlope(DB.stone,ax+sx,az,ya,bx+sx,bz,yb);addSeg(ax+sx,az,bx+sx,bz,.3,1.3);}}

/* ---------- the cave in the rock wall, the ruined churches ---------- */
// a dark mouth framed by rough blocks, warm light deep inside, lanterns at the threshold
function demoCave(){const C=DEMO.cave,y=dY(C.x-2,C.z),c=Math.cos(C.yaw),s=Math.sin(C.yaw),L=(a,b2)=>[C.x+a*c+b2*s,C.z-a*s+b2*c];
  {const[x,z]=L(0,-2.2);DB.glow.add(MATD.dark,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(x,y+2.4,z,0,C.yaw,0,6.4,5.2,4.4,'YXZ'),WHITE);}
  {const[x,z]=L(.6,-4.1);DB.glow.add(MATD.caveGlow,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(x,y+1.4,z,0,C.yaw,0,3.4,2.6,.2,'YXZ'),WHITE);}
  for(let i=0;i<=12;i++){const a=i/12*PI,[x,z]=L(Math.cos(a)*3.6,.1),ry=y+Math.sin(a)*5.4,sz=sr(1,1.7);
    boxAt(DB.stone,MATD.rock,x,ry,z,sz,sz*sr(.8,1.2),sr(1.2,2),C.yaw+sr(-.3,.3),grey(sr(.48,.6)),sr(-.4,.4),sr(-.4,.4));}
  for(const sd of[-1,1]){const[x,z]=L(sd*2.5,1.1);lanternPost(x,dY(x,z),z,sd>0);}
  for(let i=0;i<4;i++){const[x,z]=L(sr(-2,2),sr(-1.5,-.3));boxAt(DB.wood,MATD.timber,x,y+.35,z,sr(.6,.9),.7,sr(.6,.9),sr(0,3),WOOD());}
  {const[x,z]=L(0,-3);addLight(V3(x,y+2,z),col(0xff9a4a),2.4,13,1);}
  {const[a1,a2]=L(-3.4,-.4),[b1,b2]=L(-3.4,-4.6),[c1,c2]=L(3.4,-.4),[d1,d2]=L(3.4,-4.6),[e1,e2]=L(-3.4,-4.4),[f1,f2]=L(3.4,-4.4);addSeg(a1,a2,b1,b2,.4,5);addSeg(c1,c2,d1,d2,.4,5);addSeg(e1,e2,f1,f2,.4,5);}
  DX.cave={x:C.x,y,z:C.z};}
// a ruined Gothic church: the west front with its great window, broken side walls with lancets and buttresses, fallen blocks.
// Local u runs across the nave, v along it; the front faces +v
function ruin(x,z,yaw,Ln,W,H){const c=Math.cos(yaw),s=Math.sin(yaw),L=(a,b2)=>[x+a*c+b2*s,z-a*s+b2*c],st=MATD.stone,dk=MATD.stone,b=DB.stone,y=dY(x,z);
  // the front: two piers either side of the great window, its ring and mullion, a broken gable
  const fv=Ln/2,pw=W/2-1.9,Hp=H*.7;
  for(const sd of[-1,1]){const[px,pz]=L(sd*(1.9+pw/2),fv);boxAt(b,dk,px,y+Hp/2-.3,pz,pw,Hp+.6,1.2,yaw,grey(sr(.6,.68)));dBox(px,pz,pw,1.2,yaw,6);
    const[qx,qz]=L(sd*(W/2+.5),fv+.4);boxAt(b,st,qx,y+H*.4,qz,1.1,H*.8,1.6,yaw,grey(.66));}
  {const[wx,wz]=L(0,fv);gothicRing(b,st,wx,y+H*.38,wz,1.9,H*.3,.5,1.25,yaw,grey(.72),14);gothicRing(b,st,wx,y+H*.38,wz,1.5,H*.25,.18,.5,yaw,grey(.7),12);
    cylAt(b,st,wx,y+H*.38-1.2,wz,.13,H*.48,8,grey(.72));
    for(const sd of[-1,1])gothicRing(b,st,wx+sd*.75*c,y+H*.38+.4,wz-sd*.75*s,.62,1.5,.13,.4,yaw,grey(.7),8);
    for(let k=0;k<3;k++){const w=W*(1-k*.3)*(k===2?.5:1),off=k===2?-W*.18:0,[gx,gz]=L(off,fv);boxAt(b,dk,gx,y+Hp+k*1.6+.8,gz,w,1.6,1.15,yaw,grey(sr(.6,.68)));}}
  // side walls: a buttress at every bay, a lancet between; the walls break down towards the east end
  const nb=Math.max(2,Math.round(Ln/3.6));
  for(const sd of[-1,1])for(let i=0;i<nb;i++){const v0=fv-i*Ln/nb,v1=fv-(i+1)*Ln/nb,vm=(v0+v1)/2,h=H*.62*(1-i/nb*.55)*sr(.6,1),[bx,bz]=L(sd*(W/2+.45),v1);
    if(srnd()<.85)boxAt(b,st,bx,y+h*.45,bz,.9,h*.9,1.2,yaw,grey(sr(.62,.7)));
    const[wx,wz]=L(sd*W/2,vm),sill=1.6;boxAt(b,dk,wx,y+sill/2-.2,wz,.7,sill+.4,Ln/nb+.02,yaw,grey(sr(.58,.66)));
    if(h>sill+3){for(const e of[-1,1]){const[ex,ez]=L(sd*W/2,vm+e*(Ln/nb/2-.4));boxAt(b,dk,ex,y+h/2,ez,.7,h,.8,yaw,grey(sr(.58,.66)));}
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
    [-30,-100,4,60,20,.5],[0,-104,2,60,18,.5],[-58,-96,8,60,22,.4],[-20,-150,10,110,30,.45],[-90,-150,14,110,30,.4],[40,-160,16,120,30,.35],
    [48,-100,10,30,14,.4],[44,-64,-8,24,12,.5],[-75,-40,10,70,24,.3]];
  for(const[x,z,y,w,h,a]of banks){const m=new THREE.Mesh(geo('mistQ',()=>new THREE.PlaneGeometry(1,1)),new THREE.MeshBasicMaterial({map:TEXD.mist,color:scene.fog.color,transparent:true,depthWrite:false,opacity:a,fog:true}));
    m.position.set(x,y,z);m.scale.set(w,h,1);m.renderOrder=5;m.userData.a=a;m.userData.ph=sr(0,TAU);scene.add(m);MIST.push(m);}}
function updMist(){const cp=camera.position,t=U.time.value;
  for(const m of MIST){const dx=cp.x-m.position.x,dz=cp.z-m.position.z,d=Math.hypot(dx,dz);m.rotation.y=Math.atan2(dx,dz);
    m.material.opacity=m.userData.a*sstep(m.scale.x*.25,m.scale.x*.25+30,d)*(.85+.15*Math.sin(t*.15+m.userData.ph));}}
// a strip of red cloth tied to a post or an arch, hanging and swaying in the wind
function ribbon(x,y,z,yaw,len,w=.22,lean=0){DB.cloth.add(MATD.cloth,geo('bann',()=>{const g=new THREE.PlaneGeometry(1,1,1,6);g.translate(0,-.5,0);return g;}),M4(x,y,z,lean,yaw,0,w,len,1,'YXZ'),WHITE);}
function demoRibbons(){const A=DX.arch,c=Math.cos(A.yaw),s=Math.sin(A.yaw),P=(u,v,w)=>[A.x+u*c+w*s,A.y+v,A.z-u*s+w*c];
  for(const[u,v,w,len,wd]of[[1.9,A.H+1,.45,2.6,.26],[1.2,A.H+2.4,.35,3.4,.3],[-.4,A.H+3.6,.3,2.2,.2],[2.5,A.H+.9,-.4,1.8,.18]]){const[x,y,z]=P(u,v,w);ribbon(x,y,z,A.yaw+sr(-.3,.3),len,wd,sr(-.08,.08));}
  // on the posts of the terrace's parapet and at the head of the stairs
  for(const[x,z,len]of[[5.6,-8.2,1.6],[8.8,-8.2,2],[8.8,-3,1.2],[3.6,-8.3,1.3],[-4.3,-12,1.5]]){ribbon(x+.2,dY(x,z)+1.18,z+.2,sr(0,TAU),len,.2,.05);ribbon(x-.15,dY(x,z)+1.15,z+.22,sr(0,TAU),len*.8,.16,-.06);}}
/* ---------- the waterfall: a falling ribbon off the cliff, spray at its foot ---------- */
let FALL=null;
function demoWaterfall(){const F=DEMO.fall,parts=[];const g=new THREE.PlaneGeometry(1,1,1,24),pa=g.attributes.position;
  // the sheet leaves the lip horizontally, curves down and widens; its local y runs 0 (top) to 1 (bottom)
  for(let i=0;i<pa.count;i++){const u=pa.getX(i)+.5,t=.5-pa.getY(i),w=lerp(F.w0,F.w1,Math.pow(t,.7)),out=F.out*(1-Math.pow(1-Math.min(1,t*4),2));
    pa.setXYZ(i,(u-.5)*w,lerp(F.y0,F.y1,t)+(t<.06?-(t/.06)*.4:0),out);}
  g.computeVertexNormals();
  const m=new THREE.ShaderMaterial({uniforms:Object.assign({uT:U.time},FOGU),transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:'varying vec2 vUv;varying vec3 vW;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:`uniform float uT;varying vec2 vUv;varying vec3 vW;${FOG_GLSL}
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n2(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
      void main(){float t=1.0-vUv.y;vec2 p=vec2(vUv.x*14.0,t*26.0-uT*3.2);float s=n2(p)*0.55+n2(p*vec2(2.3,1.6)+7.0)*0.3+n2(p*4.1-3.0)*0.15;
        float edge=smoothstep(0.0,0.16,vUv.x)*smoothstep(1.0,0.84,vUv.x);float a=clamp(smoothstep(0.32,0.8,s)*edge*(0.55+0.45*t)+edge*0.18,0.0,1.0)*smoothstep(0.0,0.03,t);
        vec3 c=mix(vec3(0.55,0.62,0.66),vec3(0.95,0.97,1.0),s);gl_FragColor=vec4(applyFog(c,vW),a*0.92);}`});
  const mesh=new THREE.Mesh(g,m);mesh.position.set(F.x,0,F.z);mesh.rotation.y=F.yaw;mesh.renderOrder=4;scene.add(mesh);
  FALL={F,mesh,e:0};}
const DFILL=V3(.45,-.7,-.55).normalize();
function demoUpdate(dt){const cp=camera.position;fill.position.copy(fill.target.position).addScaledVector(DFILL,-60);
  // the title is the picture's view: the hero stands at the bonfire but is shown only once the game starts
  if(PL){const v=G.state!=='title';PL.rig.root.visible=v;PL.cape.mesh.visible=v&&!G.fp;}
  if(FALL){const F=FALL.F,d2=(cp.x-F.x)**2+(cp.z-F.z)**2;FALL.e+=dt;if(d2<220*220)while(FALL.e>.05){FALL.e-=.05;
      FXN.emit(F.bx+rr(-3,3),F.y1+rr(0,3),F.bz+rr(-3,3),rr(-.6,.6),rr(.6,1.8),rr(-.6,.6),rr(3,5),2.5,9,.62,.66,.7,.5,-.02,.2);}}
  for(const r of RAYS)r.material.uniforms.uT.value=U.time.value;updMist();}

/* ---------- light shafts from the break in the clouds ---------- */
const RAYS=[];
function demoRays(){const m=()=>new THREE.ShaderMaterial({uniforms:{uT:{value:0},uC:{value:new THREE.Color(1,.88,.7)}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform float uT;uniform vec3 uC;varying vec2 vUv;void main(){float x=abs(vUv.x-0.5)*2.0;float a=(1.0-x*x)*smoothstep(0.0,0.35,vUv.y)*smoothstep(1.0,0.55,vUv.y);a*=0.085+0.03*sin(uT*0.4+vUv.x*9.0);gl_FragColor=vec4(uC*a,1.0);}'});
  const S=SUN_DIR,top=V3(S.x,S.y,S.z).multiplyScalar(420);
  for(let i=0;i<5;i++){const g=new THREE.PlaneGeometry(1,1),mesh=new THREE.Mesh(g,m());const tgt=V3(sr(-70,40),sr(-10,10),sr(-160,-60)),d=top.clone().sub(tgt),L=d.length();
    mesh.position.copy(tgt).addScaledVector(d,.5);mesh.scale.set(sr(14,30),L,1);mesh.quaternion.setFromUnitVectors(V3(0,1,0),d.normalize());mesh.rotateY(sr(-.4,.4));mesh.renderOrder=6;scene.add(mesh);RAYS.push(mesh);}}

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
        float ledge=smoothstep(0.62,0.8,n2(vec2(an*0.7,vW.y*0.11)));
        vec3 rock=vec3(0.055,0.062,0.07)*(0.45+0.9*streak);
        // pines on the ledges and near the tops: dark green-black specks
        float pine=ledge*smoothstep(0.55,0.75,n2(vec2(an*6.0,vW.y*0.4)))*smoothstep(0.2,0.6,vN.y+0.5);
        rock=mix(rock,vec3(0.012,0.018,0.014),pine*0.85);
        vec3 V=normalize(cameraPosition-vW);float rim=pow(1.0-abs(dot(vN,V)),2.5);float lit=max(dot(vN,normalize(vec3(uSun.x,0.35,uSun.z))),0.0);
        rock+=uSunC*(lit*0.05+rim*0.07)+vec3(0.03,0.034,0.038)*smoothstep(0.3,1.0,vN.y);
        float base=smoothstep(-25.0,95.0,vW.y);float m=clamp(uK+(1.0-base)*0.95,0.0,1.0);
        gl_FragColor=vec4(mix(rock,uFog*(1.0+0.1*base),m),1.0);}`});
  // granite massifs (Huangshan): a dome of ridged noise with a few needle peaks on it, in three layers of distance;
  // x, z (from the bonfire's view), width, depth, height of the ridge, needles, seed
  const camX=DEMO.title.p[0],camZ=DEMO.title.p[2];
  const ridged=(x,z,o)=>{let s=0,a=.5,f=1,n=0;for(let i=0;i<o;i++){const v=1-Math.abs(vnoise(x*f+i*13.1,z*f-i*7.7)*2-1);s+=v*v*a;n+=a;a*=.5;f*=2.1;}return s/n;};
  const layers=[[.2,[[-26,280,150,70,118,5],[2,300,140,64,104,4],[-55,250,120,60,84,3]]],
    [.4,[[-12,380,190,80,132,6],[16,400,170,80,104,4],[-40,370,160,70,112,5],[34,420,150,70,92,3]]],
    [.6,[[-30,500,260,90,146,6],[5,510,240,90,132,5],[30,480,200,90,112,4],[-62,450,200,90,104,4]]]];
  layers.forEach(([k,list],li)=>{const parts=[];
    for(const[bd,dist,W,D,H,nn]of list){const a=bd*PI/180,cx=camX+Math.sin(a)*dist,cz=camZ-Math.cos(a)*dist,sd=sr(0,90);
      const g=new THREE.PlaneGeometry(W,D,56,24);g.rotateX(-PI/2);const pa=g.attributes.position;
      const nd=[];for(let i=0;i<nn;i++)nd.push([sr(-W*.36,W*.36),sr(-D*.25,D*.2),sr(.1,.24)*H,sr(7,14)]);
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
  for(const[y,a,sc]of[[-14,.9,.012],[-2,.55,.02]]){const p=new THREE.Mesh(new THREE.PlaneGeometry(1400,900,1,1),cm(y,a,sc));p.rotation.x=-PI/2;p.position.set(0,y,-430);p.renderOrder=3;scene.add(p);CLOUDS.push(p);}}

/* ---------- everything, in the order of the loading bar ---------- */
function buildDemo(){
  DB.stone=new Batch();DB.metal=new Batch();DB.glow=new Batch();DB.cloth=new Batch();DB.wood=new Batch();DB.plaster=new Batch();DB.tile=new Batch();
  demoTerrace();demoStairs();demoBridge();demoGate();demoZig();demoVillage();demoPalace();demoCave();demoRuins();demoRibbons();demoWaterfall();demoRays();demoMountains();demoMist();
  for(const k of['stone','metal','cloth','wood','plaster','tile'])DB[k].build();DB.glow.build(false);
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
  for(let i=0;i<260;i++){const t=Math.random(),y=S*(.04+t*.9),w=(S/4)*Math.sin(t*PI)*rr(.4,1);x.strokeStyle=rgba(235,228,210,rr(.25,.6));x.lineWidth=rr(.6,1.4);
    x.beginPath();x.moveTo(S/4,y);x.quadraticCurveTo(S/4+rr(-1,1)*w*.5,y-rr(4,10),S/4+rr(-1,1)*w,y-rr(8,18));x.stroke();}
  x.strokeStyle=rgba(150,140,120,.9);x.lineWidth=1.2;x.beginPath();x.moveTo(S/4,S);x.lineTo(S/4,S*.05);x.stroke();return c;}
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
    for(let j=0;j<3;j++){const t=(j+1)/3,nx=ca*out*t*t,ny=L*Math.sin(t*1.2)*1.05,nz=sa*out*t*t;quad(B,[px-sa*w,py,pz+ca*w],[px+sa*w,py,pz-ca*w],[nx+sa*w*(1-t*.7),ny,nz-ca*w*(1-t*.7)],[nx-sa*w*(1-t*.7),ny,nz+ca*w*(1-t*.7)],[k*.75,k*.82,k*.62]);px=nx;py=ny;pz=nz;}}
  for(let i=0;i<7;i++){const a=sr(0,TAU),r=sr(0,.25),H=sr(1.5,2.2),bx=Math.cos(a)*r,bz=Math.sin(a)*r,tx=bx+Math.cos(a)*sr(.1,.35),tz=bz+Math.sin(a)*sr(.1,.35),rot=sr(0,PI),cw=.11,cs=Math.cos(rot)*cw,sn=Math.sin(rot)*cw;
    quad(Q,[bx-cs,0,bz-sn],[bx+cs,0,bz+sn],[tx+cs*1.6,H,tz+sn*1.6],[tx-cs*1.6,H,tz-sn*1.6],[1,1,1]);}
  return{blades:rawGeo(B.P,B.N,B.UV,B.C,B.I),plumes:rawGeo(Q.P,Q.N,Q.UV,Q.C,Q.I)};}
function genMaple(){const S=256,c=mkC(S),x=c.getContext('2d');x.clearRect(0,0,S,S);
  for(let i=0;i<130;i++){const cx=S*(.12+Math.random()*.76),cy=S*(.12+Math.random()*.76),r=S*rr(.03,.06),a0=Math.random()*TAU,h=rr(-8,14);
    x.fillStyle=`hsl(${h},${rr(40,62)}%,${rr(20,36)}%)`;x.beginPath();for(let k=0;k<=10;k++){const a=a0+k/10*TAU,rr2=(k%2?.42:1)*r;x.lineTo(cx+Math.cos(a)*rr2,cy+Math.sin(a)*rr2);}x.fill();}
  for(let i=0;i<40;i++){x.strokeStyle='rgba(50,30,25,.7)';x.lineWidth=rr(1,2.2);x.beginPath();const a=Math.random()*TAU;x.moveTo(S/2,S/2);x.lineTo(S/2+Math.cos(a)*S*.4,S/2+Math.sin(a)*S*.4);x.stroke();}
  return c;}
function leafGeo(){const g=new THREE.PlaneGeometry(.16,.16);g.rotateX(-PI/2);g.translate(0,.012,0);return g;}
function demoVeg(tint){TEXD.plume=toTex(genPlume(),{rep:false});TEXD.leaf=toTex(genLeaf(),{rep:false});
  MATD.blade=windMat({vertexColors:true,side:THREE.DoubleSide,roughness:.9,color:col(0x8a8c76)},.6,.4,true);
  MATD.plume=windMat({map:TEXD.plume,vertexColors:true,alphaTest:.22,side:THREE.DoubleSide,roughness:.95,color:col(0x57544d)},1.4,.5,true);
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
    if(!free(x,z,2.4)||pdAt(x,z)<3)continue;const ny=nyAt(x,z);if(ny<.62)continue;tree('up',x,z,sr(.8,1.25),new THREE.Color(sr(.75,.95),sr(.85,1),sr(.7,.85)),.3);}
  for(const[cx,cz,r,k]of DEMO.firAreas)for(let i=0;i<k*3;i++){const a=sr(0,TAU),d=Math.sqrt(srnd())*r,x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d;
    if(!free(x,z,2.2)||pdAt(x,z)<3||nyAt(x,z)<.78)continue;const type=srnd()<.5?'sp':'pi';tree(type,x,z,sr(.6,1.15),tint(.8),.38);}
  // pampas along the edges, fallen leaves on the stones
  for(const[ax,az,bx,bz,k]of DEMO.pampas)for(let i=0;i<k;i++){const t=srnd(),x=lerp(ax,bx,t)+sr(-1.2,1.2),z=lerp(az,bz,t)+sr(-1.2,1.2);if(nyAt(x,z)<.55)continue;
    const y=gH(x,z)-.05,s=sr(.75,1.25),ry=sr(0,TAU);plant('pamB',x,y,z,s,ry,new THREE.Color(sr(.8,1),sr(.8,1),sr(.75,.9)));plant('pamP',x,y,z,s,ry,new THREE.Color(sr(.9,1.05),sr(.88,1),sr(.8,.92)));}
  for(const[cx,cz,hx,hz,k]of DEMO.leaves)for(let i=0;i<k;i++){const x=cx+sr(-hx,hx),z=cz+sr(-hz,hz);plant('leafG',x,gY(x,z)+.02,z,sr(.7,1.4),sr(0,TAU),srnd()<.7?red():amber());}
  for(let i=0;i<260;i++){const x=sr(-70,90),z=sr(-160,30),ny=nyAt(x,z);if(ny<.4||ny>.9||!free(x,z,1.5))continue;const s=sr(.5,1.6);plant('rockA',x,gH(x,z)-s*.15,z,s,sr(0,TAU),tint(.85,.06));}
  for(let i=0;i<160;i++){const sd=srnd()<.5?-1:1,x=sd*sr(4.6,13),z=sr(-31,-12),h=gH(x,z);if(h>19.5||!free(x,z,.9))continue;plant(srnd()<.6?'bush':'fern',x,h-.1,z,sr(.9,1.6),sr(0,TAU),tint(.85,.08));}
  // pines clinging to the cliffs of the gorge and under the palace
  for(let i=0;i<700&&n<400;i++){const x=sr(20,100),z=sr(-140,-20),ny=nyAt(x,z);if(ny<.3||ny>.66||!free(x,z,2.5)||gH(x,z)<-6)continue;tree('up',x,z,sr(.55,.85),new THREE.Color(sr(.7,.9),sr(.8,.95),sr(.65,.8)),.25);}
  for(let i=0;i<220;i++){const x=sr(-70,30),z=sr(-100,30),ny=nyAt(x,z);if(ny<.86||!free(x,z,1.2)||pdAt(x,z)<2.5)continue;const h=gH(x,z);if(h<5)continue;
    plant(srnd()<.5?'bush':'fern',x,h-.08,z,sr(.7,1.3),sr(0,TAU),tint(.9));}
  return n;}
