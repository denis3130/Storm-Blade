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
    const e=sstep(0,.02,d2-d1),n=tfbm(u,v,12,3,77),b=lerp(58,104,n)*t*(.42+.58*e)*(1-.22*sstep(.25,.9,d1*N));o[0]=b;o[1]=b*.98;o[2]=b*.95;});return c;}
function makeDemoTextures(){TEXD.tiles=toTex(genTiles());TEXD.plaster=toTex(genPlaster());TEXD.cloth=toTex(genCloth());TEXD.cobble=toTex(genCobble());
  MATD.tile=new THREE.MeshStandardMaterial({map:TEXD.tiles,vertexColors:true,roughness:.62,metalness:.05});
  MATD.plaster=new THREE.MeshStandardMaterial({map:TEXD.plaster,vertexColors:true,roughness:.95});
  MATD.timber=new THREE.MeshStandardMaterial({map:TEX.wood,vertexColors:true,roughness:.78,color:col(0x6b5444)});
  MATD.paper=new THREE.MeshBasicMaterial({color:new THREE.Color(3.4,1.5,.55)});
  MATD.window=new THREE.MeshBasicMaterial({color:new THREE.Color(2.6,1.45,.6)});
  MATD.dark=new THREE.MeshBasicMaterial({color:col(0x0b0a09)});
  MATD.cloth=windMat({map:TEXD.cloth,alphaTest:.5,side:THREE.DoubleSide,roughness:.9},0,0,false);
  const bc=MAT.banner.onBeforeCompile;MATD.cloth.onBeforeCompile=bc;}

/* ---------- small builders ---------- */
const DB={};   // the demo's batches, built once by buildDemo
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
function demoTerrace(){const b=DB.stone,T=20,y=dY(0,0);
  // flagstones: rows of slabs of random length, a few cracked or missing, the whole terrace wet
  const x0=-8.6,x1=8.4,z0=-8.3,z1=6.4;let z=z0;
  while(z<z1){const dz=sr(.8,1.35);let x=x0;while(x<x1){const dx=sr(.9,1.8),cx=Math.min(x+dx,x1);const w=cx-x-.05,dd=Math.min(dz,z1-z)-.05,mx=(x+cx)/2,mz=z+dd/2;
      {if(srnd()>.03){const yy=dY(mx,mz)+.04+sr(-.02,.02);boxAt(b,MAT.stone,mx,yy-.09,mz,w,.2,dd,sr(-.02,.02),grey(sr(.62,.86)),sr(-.012,.012),sr(-.012,.012));}}
      x=cx;}z+=dz;}
  // retaining wall round the terrace, the stairs gap left open in the north
  const wall=(ax,az,bx,bz,h)=>{const L=Math.hypot(bx-ax,bz-az),n=Math.ceil(L/1.2);for(let i=0;i<n;i++){const t=(i+.5)/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=dY(px,pz);
      boxAt(b,MAT.stoneDark,px,yy-h/2+.1,pz,L/n+.02,h,.7,-Math.atan2(bz-az,bx-ax),grey(sr(.7,.85)));}};
  wall(-9,-8.4,-3.4,-8.4,3);wall(3.4,-8.4,9,-8.4,3);wall(9,-8.4,9,6.8,4);
  // balustrade on the east edge and both sides of the stairs head: square posts, a rail, turned balusters
  balustrade(b,8.8,-8.2,8.8,6.6,y);balustrade(b,-8.8,-8.2,-3.5,-8.2,y);balustrade(b,3.5,-8.2,8.8,-8.2,y);
  addSeg(8.9,-8.4,8.9,6.8,.25,1.2);addSeg(-9,-8.4,-3.5,-8.4,.25,1.2);addSeg(3.5,-8.4,9,-8.4,.25,1.2);
  // the ruined Gothic arch on the west side, with a broken wall
  gothicArch(b,-6.4,y,-4.2,.25);
  // the bonfire with a sword planted in it
  bonfire(-2.6,y,-2.2);}
function balustrade(b,ax,az,bx,bz,y0,h=1.05){const L=Math.hypot(bx-ax,bz-az),yaw=-Math.atan2(bz-az,bx-ax),n=Math.max(1,Math.round(L/2.4));
  for(let i=0;i<=n;i++){const t=i/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=(y0===undefined?dY(px,pz):y0);
    boxAt(b,MAT.stone,px,yy+h/2,pz,.38,h,.38,yaw,grey(sr(.72,.86)));boxAt(b,MAT.stone,px,yy+h+.07,pz,.48,.14,.48,yaw,grey(.8));
    if(srnd()<.35)boxAt(b,MAT.stone,px,yy+h+.22,pz,.22,.18,.22,yaw+.7,grey(.78));}
  for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,mx=lerp(ax,bx,(t0+t1)/2),mz=lerp(az,bz,(t0+t1)/2),yy=(y0===undefined?dY(mx,mz):y0);
    boxAt(b,MAT.stone,mx,yy+h-.04,mz,L/n,.12,.3,yaw,grey(sr(.74,.84)));boxAt(b,MAT.stone,mx,yy+.1,mz,L/n,.14,.32,yaw,grey(.72));
    const nb=Math.floor(L/n/.32);for(let k=1;k<nb;k++){const tt=lerp(t0,t1,k/nb),qx=lerp(ax,bx,tt),qz=lerp(az,bz,tt);
      cylAt(b,MAT.stone,qx,yy+.1+(h-.24)/2+.07,qz,.07,h-.24,7,grey(sr(.7,.82)),.05);}}}
function gothicArch(b,x,y,z,yaw){const c=Math.cos(yaw),s=Math.sin(yaw),P=(u,v,w)=>[x+u*c+w*s,y+v,z-u*s+w*c];
  const span=2.3,H=5.2,rise=3.4,st=MAT.stone,dk=MAT.stoneDark;
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
  for(let i=0;i<6;i++){const[wx,wy,wz]=P(-span-1.2-i*.9,0,0),h=sr(1.5,4.6)*(1-i*.12);boxAt(b,dk,wx,wy+h/2,wz,.95,h,.85,yaw+sr(-.03,.03),grey(sr(.62,.76)));}
  for(let i=0;i<5;i++){const[fx,fy,fz]=P(sr(-4,-1),0,sr(-1.5,2));boxAt(b,dk,fx,fy+.2,fz,sr(.4,.9),sr(.3,.5),sr(.4,.8),sr(0,3),grey(sr(.6,.75)),sr(-.3,.3),sr(-.3,.3));}
  for(const side of[-1,1]){const[px,,pz]=P(side*span,0,0);addCol(px,pz,.75,6);}
  {const[a1,,a2]=P(-span-1,0,0),[b1,,b2]=P(-span-6,0,0);addSeg(a1,a2,b1,b2,.5,4);}
  DX.arch={x,y,z,yaw,span,H};}
function bonfire(x,y,z){const b=DB.stone;
  for(let i=0;i<11;i++){const a=i/11*TAU+sr(-.1,.1),r=sr(.62,.74);boxAt(b,MAT.rock,x+Math.cos(a)*r,y+.1,z+Math.sin(a)*r,sr(.26,.38),sr(.2,.3),sr(.22,.32),sr(0,3),grey(sr(.5,.66)),sr(-.3,.3),sr(-.3,.3));}
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
  const L=Math.hypot(bx-ax,bz-az),n=Math.round((ya-yb)/.19),yaw=-Math.atan2(bz-az,bx-ax)+PI/2;
  for(let i=0;i<n;i++){const t=(i+.5)/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=lerp(ya,yb,(i+1)/n);
    // each step: a few long blocks, slightly uneven, worn
    let u=-hw;while(u<hw){const w=Math.min(sr(1,2.2),hw-u);boxAt(b,MAT.stone,px+(u+w/2),yy-.16+sr(-.015,.015),pz,w-.04,.36,L/n+.06,yaw,grey(sr(.6,.8)),sr(-.01,.01),0);u+=w;}}
  // side walls with the balustrades on top, lantern posts every few metres
  for(const side of[-1,1]){const sx=side*(hw+.35);
    for(let i=0;i<n;i+=3){const t=(i+1.5)/n,pz=lerp(az,bz,t),yy=lerp(ya,yb,t),gy=dY(sx+side*1.5,pz);const h=Math.max(1,yy-gy+1.2);
      boxAt(b,MAT.stoneDark,sx,yy-h/2+.15,pz,.7,h,L/n*3+.04,0,grey(sr(.64,.76)));}
    balustradeSlope(b,sx,az,ya,sx,bz,yb);addSeg(sx,az,sx,bz,.3,1.3);}
  for(let k=0;k<4;k++){const t=k/3,pz=lerp(az,bz,t)-.3,yy=lerp(ya,yb,t);for(const side of[-1,1])lanternPost(side*(hw+.35),yy+1.05,pz);}}
function balustradeSlope(b,ax,az,ya,bx,bz,yb,h=1){const L=Math.hypot(bx-ax,bz-az),n=Math.round(L/2.2),yaw=-Math.atan2(bz-az,bx-ax),sl=Math.atan2(yb-ya,L);
  for(let i=0;i<=n;i++){const t=i/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=lerp(ya,yb,t);boxAt(b,MAT.stone,px,yy+h/2,pz,.36,h,.36,yaw,grey(sr(.72,.84)));
    boxAt(b,MAT.stone,px,yy+h+.07,pz,.46,.14,.46,yaw,grey(.8));}
  for(let i=0;i<n;i++){const t=(i+.5)/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=lerp(ya,yb,t);
    boxAt(b,MAT.stone,px,yy+h-.04,pz,L/n/Math.cos(sl),.12,.28,yaw,grey(.8),0,sl);
    const nb=6;for(let k=1;k<nb;k++){const tt=(i+k/nb)/n,qx=lerp(ax,bx,tt),qz=lerp(az,bz,tt),qy=lerp(ya,yb,tt);cylAt(b,MAT.stone,qx,qy+h/2,qz,.065,h-.1,7,grey(sr(.7,.82)),.05);}}}
// a stone post with a hanging paper lantern (warm glow), a pool light only for some of them
const LANTERNS=[];
function lanternPost(x,y,z,light=false){const b=DB.stone;boxAt(b,MAT.stone,x,y+.25,z,.24,.5,.24,0,grey(.78));
  const g=DB.glow;g.add(MATD.paper,geo('lant',()=>gLathe([[0,-.18],[.11,-.15],[.15,0],[.11,.15],[0,.18]],10)),M4(x,y+.72,z),WHITE);
  boxAt(DB.metal,MAT.metal,x,y+.92,z,.2,.04,.2,0,new THREE.Color(.25,.22,.2));
  LANTERNS.push(V3(x,y+.72,z));if(light)addLight(V3(x,y+.8,z),col(0xffa25a),1.6,9,1);}

/* ---------- the bridge over the gorge, the gate in the cliff ---------- */
function demoBridge(){const b=DB.stone,y=DEMO.bridge.y,x0=DEMO.bridge.x0,x1=DEMO.bridge.x1,z=DEMO.bridge.z,hw=DEMO.bridge.hw;
  const L=x1-x0,cx=(x0+x1)/2;
  // deck, parapets with copings, the big arch and the spandrel walls under the deck
  for(let i=0;i<Math.ceil(L/1.4);i++){const px=x0+(i+.5)*L/Math.ceil(L/1.4);boxAt(b,MAT.stone,px,y-.35,z,L/Math.ceil(L/1.4)+.02,.7,hw*2+.6,0,grey(sr(.64,.78)));}
  for(const side of[-1,1]){const pz=z+side*(hw+.15);for(let i=0;i<Math.ceil(L/1.6);i++){const px=x0+(i+.5)*L/Math.ceil(L/1.6);
      boxAt(b,MAT.stone,px,y+.45,pz,L/Math.ceil(L/1.6)-.03,.9,.42,0,grey(sr(.62,.78)));boxAt(b,MAT.stone,px,y+.96,pz,L/Math.ceil(L/1.6),.12,.52,0,grey(.78));}
    addSeg(x0-1,pz,x1+1,pz,.25,1.4);}
  const span=L*.82,R=span/2,yA=y-1.2;   // the arch's crown just under the deck
  for(let i=0;i<24;i++){const a0=i/24*PI,a1=(i+1)/24*PI,am=(a0+a1)/2;
    boxAt(b,MAT.stoneDark,cx+Math.cos(am)*R,yA-R+Math.sin(am)*R,z,(a1-a0)*R+.08,1.1,hw*2+.3,0,grey(sr(.58,.7)),0,am-PI/2);}
  for(let i=0;i<12;i++){const px=x0+(i+.5)*L/12,u=(px-cx)/R,ay=Math.abs(u)<1?yA-R+Math.sqrt(1-u*u)*R:yA-R-6,top=y-.7,h=top-ay;
    if(h>.1)boxAt(b,MAT.stoneDark,px,ay+h/2,z,L/12+.03,h,hw*2+.1,0,grey(sr(.6,.72)));}
  // piers down into the gorge at both ends
  for(const px of[x0+1.2,x1-1.2]){const gy=dY(px,z);boxAt(b,MAT.stoneDark,px,(y-.7+gy-4)/2,z,3,y-.7-gy+4,hw*2+1.2,0,grey(.62));}
  // banners on tall poles at both ends of the bridge
  for(const px of[x0+.6,x1-.6])for(const side of[-1,1]){const pz=z+side*(hw+.15);banner(px,y+1,pz,4.6,.7,1.9);}
  for(let i=1;i<4;i++){lanternPost(x0+i*L/4,y+1.02,z-hw-.15);lanternPost(x0+i*L/4,y+1.02,z+hw+.15);}
  addRamp(x0-1.5,z,y,x1+1.5,z,y,hw+.2);}
function banner(x,y,z,pole,w,h,yaw=0){cylAt(DB.metal,MAT.wood,x,y+pole/2,z,.06,pole,6,new THREE.Color(.3,.24,.2));
  boxAt(DB.metal,MAT.wood,x,y+pole-.1,z,.05,.05,w+.2,yaw,new THREE.Color(.3,.24,.2));
  DB.cloth.add(MATD.cloth,geo('bann',()=>{const g=new THREE.PlaneGeometry(1,1,1,6);g.translate(0,-.5,0);return g;}),M4(x,y+pole-.15,z,0,yaw+PI/2,0,w,h,1),WHITE);}
function demoGate(){const b=DB.stone,G=DEMO.gate,y=dY(G.x,G.z);
  for(const side of[-1,1]){const tz=G.z+side*3.4;boxAt(b,MAT.stoneDark,G.x+1.5,y+5,tz,4.2,10,3,0,grey(.66));boxAt(b,MAT.stone,G.x+1.5,y+10.2,tz,4.6,.4,3.4,0,grey(.76));
    for(let k=-1;k<=1;k++)boxAt(b,MAT.stone,G.x+1.5+k*1.4,y+10.75,tz,.8,.7,3.4,0,grey(.74));
    addBox(G.x+1.5,tz,4.2,3,0,8);banner(G.x-.8,y+3.4,tz,3,1,3.6);
    lanternPost(G.x-.6,y,G.z+side*1.9,side<0);}
  // the arch over the passage and the wall above it, then the wooden portcullis, half raised
  gothicRing(b,MAT.stone,G.x+.1,y+4.1,G.z,1.9,2.1,.55,3,PI/2,grey(.74),12);
  boxAt(b,MAT.stoneDark,G.x+1.5,y+8.2,G.z,4.2,3.6,3.8,0,grey(.64));
  for(let i=0;i<7;i++)boxAt(DB.metal,MATD.timber,G.x+.5,y+5.4,G.z-1.6+i*.53,.16,3.8,.14,0,new THREE.Color(.5,.42,.36));
  for(let i=0;i<5;i++)boxAt(DB.metal,MATD.timber,G.x+.5,y+3.9+i*.7,G.z,.16,.14,3.6,0,new THREE.Color(.45,.38,.32));
  DX.gate={x:G.x,y,z:G.z};}

/* ---------- zig-zag stairs up the cliff: solid stone flights and landings, wooden railings ---------- */
function demoZig(){const b=DB.stone,w=DB.metal;
  for(const [ax,az,ya,bx,bz,yb,hw] of DEMO.ZIG){const L=Math.hypot(bx-ax,bz-az),yaw=-Math.atan2(bz-az,bx-ax),n=Math.max(2,Math.round(L/.45)),flat=Math.abs(yb-ya)<.01;
    for(let i=0;i<n;i++){const t=(i+.5)/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),top=flat?ya:lerp(ya,yb,(i+1)/n),gy=Math.min(dY(px+Math.sin(yaw)*hw,pz+Math.cos(yaw)*hw),dY(px-Math.sin(yaw)*hw,pz-Math.cos(yaw)*hw),top-.5)-1.5;
      boxAt(b,MAT.stoneDark,px,(top+gy)/2,pz,L/n+.03,top-gy,hw*2+.2,yaw,grey(sr(.6,.72)));
      boxAt(b,MAT.stone,px,top-.06,pz,L/n+.05,.14,hw*2+.32,yaw,grey(sr(.7,.82)));}
    // railings on both long sides: posts, a top rail and a mid rail
    for(const sd of[-1,1]){const ox=Math.sin(yaw)*(hw+.1)*sd,oz=Math.cos(yaw)*(hw+.1)*sd,np=Math.max(1,Math.round(L/1.8));
      for(let k=0;k<=np;k++){const t=k/np,px=lerp(ax,bx,t)+ox,pz=lerp(az,bz,t)+oz,py=lerp(ya,yb,t);boxAt(w,MATD.timber,px,py+.55,pz,.12,1.1,.12,yaw,new THREE.Color(.55,.45,.38));}
      const sl=Math.atan2(yb-ya,L);for(const hh of[1.02,.55])boxAt(w,MATD.timber,(ax+bx)/2+ox,(ya+yb)/2+hh,(az+bz)/2+oz,L/Math.cos(sl),.08,.08,yaw,new THREE.Color(.5,.41,.34),0,sl);
      addSeg(ax+ox,az+oz,bx+ox,bz+oz,.12,ya+2);}
    addRamp(ax,az,ya,bx,bz,yb,hw);}}

/* ---------- walkable ramps (bridge, stairs on the cliff) ---------- */
function addRamp(ax,az,ya,bx,bz,yb,hw){const dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz;FLOORS.push({s:1,ax,az,ya,dx,dz,dy:yb-ya,L2,hw,x:(ax+bx)/2,z:(az+bz)/2,r2:(Math.sqrt(L2)/2+hw)**2,y:Math.max(ya,yb)});}

/* ---------- terrain layers: grass, moss, cobbles (paths and plazas), rock (steep ground, the gorge) ---------- */
function demoSplat(x,z,h,ny,pd){
  let r=sstep(.84,.6,ny);if(h<2&&x>14&&x<48)r=Math.max(r,sstep(4,-2,h));if(h<-6)r=1;
  let d=1-sstep(1.3,2.7,pd+(vnoise(x*.5,z*.5)-.5)*1.1);
  d=Math.max(d,1-sstep(-1,2.5,DEMO.box(x,z,-8,-53,8,6,3)));d=Math.max(d,1-sstep(-1,2,DEMO.box(x,z,58,-128,10,6,3)));
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

/* ---------- karst peaks in the mist: three layers of spires, each one mesh, fading into the fog at their feet ---------- */
const MTND=[];
function demoMountains(){const mat=(k)=>new THREE.ShaderMaterial({uniforms:{uFog:{value:scene.fog.color},uK:{value:k},uSun:{value:SUN_DIR},uSunC:skyU.uSunCol},fog:false,
    vertexShader:'varying vec3 vW;varying vec3 vN;void main(){vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:`uniform vec3 uFog,uSun,uSunC;uniform float uK;varying vec3 vW;varying vec3 vN;
      float h(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5);}
      void main(){vec3 rock=vec3(0.16,0.18,0.2)*(0.75+0.5*h(floor(vW.xz*0.3+vW.y*0.2)));float lit=max(dot(vN,normalize(vec3(uSun.x,0.2,uSun.z))),0.0);
        float rim=pow(1.0-abs(dot(vN,normalize(cameraPosition-vW))),3.0);rock+=uSunC*(lit*0.18+rim*0.22);
        float base=smoothstep(-30.0,110.0,vW.y);float d=length(vW.xz-cameraPosition.xz);float m=clamp(uK+(1.0-base)*0.9,0.0,1.0);
        gl_FragColor=vec4(mix(rock,uFog*(1.0+0.12*base),m),1.0);}`});
  const layers=[[240,330,.18,14,60,150],[340,450,.42,16,90,210],[460,540,.62,14,120,260]];
  layers.forEach(([r0,r1,k,n,h0,h1],li)=>{const parts=[];
    for(let i=0;i<n;i++){const a=-PI/2+(i/(n-1)-.5)*2.4+sr(-.05,.05),r=sr(r0,r1),x=Math.cos(a)*r,z=Math.sin(a)*r,H=sr(h0,h1),R=sr(14,32)*(1+li*.25);
      const g=new THREE.CylinderGeometry(R*.45,R,H,16,10,true),pa=g.attributes.position,sd=sr(0,99);
      for(let j=0;j<pa.count;j++){const vx=pa.getX(j),vy=pa.getY(j),vz=pa.getZ(j),an=Math.atan2(vz,vx),t=(vy/H)+.5;
        const f=1+.28*(fbm(Math.cos(an)*1.6+sd,t*2.2+sd,3)-.5)*2+.08*Math.sin(an*9+t*4)-(t>.86?(t-.86)*2.4:0);pa.setXYZ(j,vx*f,vy,vz*f);}
      g.computeVertexNormals();parts.push({g,m:M4(x,H/2-40,z,sr(-.04,.04),sr(0,TAU),sr(-.04,.04))});}
    const m=new THREE.Mesh(mergeParts(parts),mat(k));m.renderOrder=-6+li*0;m.frustumCulled=false;scene.add(m);MTND.push(m);});}

/* ---------- everything, in the order of the loading bar ---------- */
function buildDemo(){
  DB.stone=new Batch();DB.metal=new Batch();DB.glow=new Batch();DB.cloth=new Batch();
  demoTerrace();demoStairs();demoBridge();demoGate();demoZig();demoMountains();
  DB.stone.build();DB.metal.build();DB.glow.build(false);DB.cloth.build();}
/* ---------- trees, bushes and grass of the demo (planted into the forest cells of d_world, so they are instanced) ---------- */
function demoVeg(tint){return 0;}
