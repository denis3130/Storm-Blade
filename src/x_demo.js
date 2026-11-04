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
// vertical weathered boards for house walls
function genBoards(){const S=TS/2,c=mkC(S);pxFill(c,(u,v,o)=>{const k=Math.floor(u*9),f=(u*9)%1,n=tfbm(u*.3+k*.11,v,3,6,93+k),g=tfbm(u,v*.25,40,2,7),e=sstep(0,.06,f)*sstep(1,.94,f);
    const b=lerp(70,120,n)*(.55+.45*e)*(.9+.2*g)*(.85+.15*hash2(k,5));o[0]=b;o[1]=b*.93;o[2]=b*.86;});return c;}
function makeDemoTextures(){TEXD.boards=toTex(genBoards());TEXD.tiles=toTex(genTiles());TEXD.plaster=toTex(genPlaster());TEXD.cloth=toTex(genCloth());TEXD.cobble=toTex(genCobble());
  MATD.stone=stoneMat(0xa3abb3,.14,.86,.95);MATD.stoneDark=stoneMat(0x7f878e,.22,.9,.8);MATD.rock=stoneMat(0x8b9198,.3,.92,.5);
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
      {if(srnd()>.03){const yy=dY(mx,mz)+.04+sr(-.02,.02);boxAt(b,MATD.stone,mx,yy-.09,mz,w,.2,dd,sr(-.02,.02),grey(sr(.62,.86)),sr(-.012,.012),sr(-.012,.012));}}
      x=cx;}z+=dz;}
  // retaining wall round the terrace, the stairs gap left open in the north
  const wall=(ax,az,bx,bz,h)=>{const L=Math.hypot(bx-ax,bz-az),n=Math.ceil(L/1.2);for(let i=0;i<n;i++){const t=(i+.5)/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=dY(px,pz);
      boxAt(b,MATD.stoneDark,px,yy-h/2+.1,pz,L/n+.02,h,.7,-Math.atan2(bz-az,bx-ax),grey(sr(.7,.85)));}};
  wall(-9,-8.4,-3.4,-8.4,3);wall(3.4,-8.4,9,-8.4,3);wall(9,-8.4,9,6.8,4);
  // balustrade on the east edge and both sides of the stairs head: square posts, a rail, turned balusters
  balustrade(b,8.8,-8.2,8.8,6.6,y);balustrade(b,-8.8,-8.2,-3.5,-8.2,y);balustrade(b,3.5,-8.2,8.8,-8.2,y);
  addSeg(8.9,-8.4,8.9,6.8,.25,1.2);addSeg(-9,-8.4,-3.5,-8.4,.25,1.2);addSeg(3.5,-8.4,9,-8.4,.25,1.2);
  // the ruined Gothic arch on the west side, with a broken wall
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
  const span=2.3,H=5.2,rise=3.4,st=MATD.stone,dk=MATD.stoneDark;
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
  const L=Math.hypot(bx-ax,bz-az),n=Math.round((ya-yb)/.19),yaw=-Math.atan2(bz-az,bx-ax)+PI/2;
  for(let i=0;i<n;i++){const t=(i+.5)/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=lerp(ya,yb,(i+1)/n);
    // each step: a few long blocks, slightly uneven, worn
    let u=-hw;while(u<hw){const w=Math.min(sr(1,2.2),hw-u);boxAt(b,MATD.stone,px+(u+w/2),yy-.16+sr(-.015,.015),pz,w-.04,.36,L/n+.06,yaw,grey(sr(.6,.8)),sr(-.01,.01),0);u+=w;}}
  // side walls with the balustrades on top, lantern posts every few metres
  for(const side of[-1,1]){const sx=side*(hw+.35);
    for(let i=0;i<n;i+=3){const t=(i+1.5)/n,pz=lerp(az,bz,t),yy=lerp(ya,yb,t),gy=dY(sx+side*1.5,pz);const h=Math.max(1,yy-gy+1.2);
      boxAt(b,MATD.stoneDark,sx,yy-h/2+.15,pz,.7,h,L/n*3+.04,0,grey(sr(.64,.76)));}
    balustradeSlope(b,sx,az,ya,sx,bz,yb);addSeg(sx,az,sx,bz,.3,1.3);}
  for(let k=0;k<4;k++){const t=k/3,pz=lerp(az,bz,t)-.3,yy=lerp(ya,yb,t);for(const side of[-1,1])lanternPost(side*(hw+.35),yy+1.05,pz);}}
function balustradeSlope(b,ax,az,ya,bx,bz,yb,h=1){const L=Math.hypot(bx-ax,bz-az),n=Math.round(L/2.2),yaw=-Math.atan2(bz-az,bx-ax),sl=Math.atan2(yb-ya,L);
  for(let i=0;i<=n;i++){const t=i/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=lerp(ya,yb,t);boxAt(b,MATD.stone,px,yy+h/2,pz,.36,h,.36,yaw,grey(sr(.72,.84)));
    boxAt(b,MATD.stone,px,yy+h+.07,pz,.46,.14,.46,yaw,grey(.8));}
  for(let i=0;i<n;i++){const t=(i+.5)/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=lerp(ya,yb,t);
    boxAt(b,MATD.stone,px,yy+h-.04,pz,L/n/Math.cos(sl),.12,.28,yaw,grey(.8),0,sl);
    const nb=6;for(let k=1;k<nb;k++){const tt=(i+k/nb)/n,qx=lerp(ax,bx,tt),qz=lerp(az,bz,tt),qy=lerp(ya,yb,tt);cylAt(b,MATD.stone,qx,qy+h/2,qz,.065,h-.1,7,grey(sr(.7,.82)),.05);}}}
// a stone post with a hanging paper lantern (warm glow), a pool light only for some of them
const LANTERNS=[];
function lanternPost(x,y,z,light=false){const b=DB.stone;boxAt(b,MATD.stone,x,y+.25,z,.24,.5,.24,0,grey(.78));
  const g=DB.glow;g.add(MATD.paper,geo('lant',()=>gLathe([[0,-.18],[.11,-.15],[.15,0],[.11,.15],[0,.18]],10)),M4(x,y+.72,z),WHITE);
  boxAt(DB.metal,MAT.metal,x,y+.92,z,.2,.04,.2,0,new THREE.Color(.25,.22,.2));
  LANTERNS.push(V3(x,y+.72,z));if(light)addLight(V3(x,y+.8,z),col(0xffa25a),1.6,9,1);}

/* ---------- the bridge over the gorge, the gate in the cliff ---------- */
function demoBridge(){const b=DB.stone,y=DEMO.bridge.y,x0=DEMO.bridge.x0,x1=DEMO.bridge.x1,z=DEMO.bridge.z,hw=DEMO.bridge.hw;
  const L=x1-x0,cx=(x0+x1)/2;
  // deck, parapets with copings, the big arch and the spandrel walls under the deck
  for(let i=0;i<Math.ceil(L/1.4);i++){const px=x0+(i+.5)*L/Math.ceil(L/1.4);boxAt(b,MATD.stone,px,y-.35,z,L/Math.ceil(L/1.4)+.02,.7,hw*2+.6,0,grey(sr(.64,.78)));}
  for(const side of[-1,1]){const pz=z+side*(hw+.15);for(let i=0;i<Math.ceil(L/1.6);i++){const px=x0+(i+.5)*L/Math.ceil(L/1.6);
      boxAt(b,MATD.stone,px,y+.45,pz,L/Math.ceil(L/1.6)-.03,.9,.42,0,grey(sr(.62,.78)));boxAt(b,MATD.stone,px,y+.96,pz,L/Math.ceil(L/1.6),.12,.52,0,grey(.78));}
    addSeg(x0-1,pz,x1+1,pz,.25,1.4);}
  const span=L*.82,R=span/2,yA=y-1.2;   // the arch's crown just under the deck
  for(let i=0;i<24;i++){const a0=i/24*PI,a1=(i+1)/24*PI,am=(a0+a1)/2;
    boxAt(b,MATD.stoneDark,cx+Math.cos(am)*R,yA-R+Math.sin(am)*R,z,(a1-a0)*R+.08,1.1,hw*2+.3,0,grey(sr(.58,.7)),0,am-PI/2);}
  for(let i=0;i<12;i++){const px=x0+(i+.5)*L/12,u=(px-cx)/R,ay=Math.abs(u)<1?yA-R+Math.sqrt(1-u*u)*R:yA-R-6,top=y-.7,h=top-ay;
    if(h>.1)boxAt(b,MATD.stoneDark,px,ay+h/2,z,L/12+.03,h,hw*2+.1,0,grey(sr(.6,.72)));}
  // piers down into the gorge at both ends
  for(const px of[x0+1.2,x1-1.2]){const gy=dY(px,z);boxAt(b,MATD.stoneDark,px,(y-.7+gy-4)/2,z,3,y-.7-gy+4,hw*2+1.2,0,grey(.62));}
  // banners on tall poles at both ends of the bridge
  for(const px of[x0+.6,x1-.6])for(const side of[-1,1]){const pz=z+side*(hw+.15);banner(px,y+1,pz,4.6,.7,1.9);}
  for(let i=1;i<4;i++){lanternPost(x0+i*L/4,y+1.02,z-hw-.15);lanternPost(x0+i*L/4,y+1.02,z+hw+.15);}
  addRamp(x0-1.5,z,y,x1+1.5,z,y,hw+.2);}
function banner(x,y,z,pole,w,h,yaw=0){cylAt(DB.metal,MAT.wood,x,y+pole/2,z,.06,pole,6,new THREE.Color(.3,.24,.2));
  boxAt(DB.metal,MAT.wood,x,y+pole-.1,z,.05,.05,w+.2,yaw,new THREE.Color(.3,.24,.2));
  DB.cloth.add(MATD.cloth,geo('bann',()=>{const g=new THREE.PlaneGeometry(1,1,1,6);g.translate(0,-.5,0);return g;}),M4(x,y+pole-.15,z,0,yaw+PI/2,0,w,h,1),WHITE);}
function demoGate(){const b=DB.stone,G=DEMO.gate,y=dY(G.x,G.z);
  for(const side of[-1,1]){const tz=G.z+side*3.4;boxAt(b,MATD.stoneDark,G.x+1.5,y+5,tz,4.2,10,3,0,grey(.66));boxAt(b,MATD.stone,G.x+1.5,y+10.2,tz,4.6,.4,3.4,0,grey(.76));
    for(let k=-1;k<=1;k++)boxAt(b,MATD.stone,G.x+1.5+k*1.4,y+10.75,tz,.8,.7,3.4,0,grey(.74));
    addBox(G.x+1.5,tz,4.2,3,0,8);banner(G.x-.8,y+3.4,tz,3,1,3.6);
    lanternPost(G.x-.6,y,G.z+side*1.9,side<0);}
  // the arch over the passage and the wall above it, then the wooden portcullis, half raised
  gothicRing(b,MATD.stone,G.x+.1,y+4.1,G.z,1.9,2.1,.55,3,PI/2,grey(.74),12);
  boxAt(b,MATD.stoneDark,G.x+1.5,y+8.2,G.z,4.2,3.6,3.8,0,grey(.64));
  for(let i=0;i<7;i++)boxAt(DB.metal,MATD.timber,G.x+.5,y+5.4,G.z-1.6+i*.53,.16,3.8,.14,0,new THREE.Color(.5,.42,.36));
  for(let i=0;i<5;i++)boxAt(DB.metal,MATD.timber,G.x+.5,y+3.9+i*.7,G.z,.16,.14,3.6,0,new THREE.Color(.45,.38,.32));
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
  const boards=o.boards!==undefined?o.boards:srnd()<.5;
  if(boards)boxAt(wood,MATD.boards,x,y1+Hw/2,z,W-.1,Hw,D-.1,yaw,new THREE.Color(sr(.85,1),sr(.8,.95),sr(.75,.88)));
  else boxAt(pl,MATD.plaster,x,y1+Hw/2,z,W-.1,Hw,D-.1,yaw,new THREE.Color(sr(.42,.52),sr(.41,.5),sr(.39,.47)));
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
  const yr=y1+Hw+.12,rise=D*.4,tt=new THREE.Color(sr(.7,.9),sr(.72,.9),sr(.76,.95));
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
  addBox(x,z,W+.5,D+.5,yaw,5);}
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
  let yr=y+1.2+H+.4,w=W,d=D;const tt=new THREE.Color(.72,.76,.82);
  for(let t=0;t<tiers;t++){const rise=d*.38;roofSheet(DB.tile,MATD.tile,x,yr,z,yaw,w,d,rise,1.6,.9,1,tt);roofSheet(DB.tile,MATD.tile,x,yr,z,yaw,w,d,rise,1.6,.9,-1,tt);
    for(const sd of[-1,1])gableEnd(DB.plaster,MATD.lacquer,x,yr-.02,z,yaw,sd*(w/2+.2),d*.95,rise*.9,new THREE.Color(.55,.16,.12));
    boxAt(DB.tile,MATD.tile,x,yr+rise+.12,z,w+3.4,.3,.4,yaw,tt);for(const sd of[-1,1]){const[ex,ez]=L(sd*(w/2+1.7),0);boxAt(DB.tile,MATD.tile,ex,yr+rise+.4,ez,.4,.6,.5,yaw,tt);}
    if(t<tiers-1){const h2=H*.45;boxAt(wood,MATD.boards,x,yr+rise*.5+h2/2,z,w*.62,h2,d*.6,yaw,new THREE.Color(.5,.4,.36));yr+=rise*.5+h2;w*=.66;d*=.66;}}
  addBox(x,z,W+1.6,D+1.6,yaw,6);}
function church(x,y,z){const st=MATD.stone,dk=MATD.stoneDark,W=16,D=30,H=24;
  boxAt(DB.stone,dk,x,y+H/2-1,z,W,H+2,D,0,grey(.62));
  // buttresses with pinnacles, tall lancet windows lit from inside
  for(let i=0;i<6;i++){const zz=z-D/2+2+i*(D-4)/5;for(const sd of[-1,1]){const bx=x+sd*(W/2+.8);boxAt(DB.stone,st,bx,y+H*.42,zz,1.6,H*.84,1.2,0,grey(.66));
      boxAt(DB.stone,st,bx,y+H*.9,zz,.8,2.4,.8,0,grey(.7));b2cone(bx,y+H*.9+1.2,zz,.45,2.2);
      if(i<5){const wz=zz+(D-4)/10;DB.glow.add(srnd()<.8?MATD.window:MATD.dark,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(x+sd*(W/2+.02),y+H*.5,wz,0,0,0,.1,H*.5,1.4),WHITE);
        gothicRing(DB.stone,st,x+sd*(W/2+.05),y+H*.75,wz,.75,1.1,.18,.25,PI/2,grey(.72),6);}}}
  // steep slate roof
  roofSheet(DB.tile,MATD.slate,x,y+H,z,PI/2,D,W,W*.85,.4,0,1);roofSheet(DB.tile,MATD.slate,x,y+H,z,PI/2,D,W,W*.85,.4,0,-1);
  // the front: gable wall, portal, rose window; two towers with spires
  const fz=z+D/2;gableEnd(DB.stone,dk,x,y+H-.05,fz-.2,PI/2,-.0001,W,W*.85,grey(.62));
  boxAt(DB.stone,st,x,y+H/2,fz+.4,W*.8,H,1,0,grey(.68));
  const rose=new THREE.Mesh(geo('rose',()=>new THREE.CircleGeometry(2.4,24)),MATD.window);rose.position.set(x,y+H*.68,fz+.95);scene.add(rose);
  for(let i=0;i<12;i++){const a=i/12*TAU;boxAt(DB.stone,st,x+Math.cos(a)*1.2,y+H*.68+Math.sin(a)*1.2,fz+1,.12,2.4,.12,0,grey(.75),0,a+PI/2);}
  DB.stone.add(st,geo('roseRing',()=>new THREE.TorusGeometry(2.5,.28,8,28)),M4(x,y+H*.68,fz+1),grey(.78));
  gothicRing(DB.stone,st,x,y+3.4,fz+1,2.2,3.2,.6,1.4,0,grey(.72),12);DB.glow.add(MATD.window,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(x,y+2.6,fz+.92,0,0,0,3.8,5,.1),WHITE);
  for(const sd of[-1,1]){const tx=x+sd*(W/2+1.6),tz=fz-.5,TH=44;boxAt(DB.stone,dk,tx,y+TH/2,tz,5.6,TH,5.6,0,grey(.64));
    for(let k=0;k<3;k++){boxAt(DB.stone,st,tx,y+8+k*8,tz,4.9,.5,4.9,0,grey(.72));DB.glow.add(srnd()<.6?MATD.window:MATD.dark,geo('dbox',()=>new THREE.BoxGeometry(1,1,1)),M4(tx,y+11+k*8,tz+2.33,0,0,0,1,3,.1),WHITE);}
    b2cone(tx,y+TH,tz,3.2,17);for(const[ox,oz]of[[-2,-2],[2,-2],[-2,2],[2,2]])b2cone(tx+ox,y+TH,tz+oz,.4,3.4);
    banner(tx+sd*-2.4,y+H*.55,tz+2.6,.01,1.4,7);}
  DX.church={x,y,z};}
function b2cone(x,y,z,r,h){DB.stone.add(MATD.slate,geo('spire',()=>{const g=new THREE.ConeGeometry(1,1,8);g.translate(0,.5,0);return g;}),M4(x,y,z,0,PI/8,0,r,h,r),new THREE.Color(.6,.62,.66));}
function statue(x,y,z,yaw){const stM=MATD.statue,sm={b:stM,m:stM},st=buildHuman({d:HERO_D,s:2.6,mats:sm,build:heroBuild});st.root.position.set(x,y+1.6,z);st.root.rotation.y=yaw;
  st.apply(pose({spi:[4,0,0],head:[8,0,0],shR:[30,-10,8],elR:60,wrR:[-90,0,0],shL:[30,10,-8],elL:60,wrL:[0,0,0],hipL:[2,0,-4],hipR:[2,0,4]}));
  const sw=buildSword(2);sw.g.traverse(o=>{if(o.isMesh)o.material=stM;});sw.g.scale.setScalar(1.3);st.P.wrR.add(sw.g);scene.add(st.root);
  boxAt(DB.stone,MATD.stoneDark,x,y+.8,z,2.4,1.6,2.4,yaw,grey(.6));boxAt(DB.stone,MATD.stone,x,y+1.65,z,2.7,.2,2.7,yaw,grey(.72));addBox(x,z,2.4,2.4,yaw,4);}
function demoPalace(){const P=DEMO.palace,y=dY(P.x,P.z);
  hall(P.x,y,P.z+2,0,26,11,5.2,3);hall(P.x-17,y,P.z-1,.1,11,8,4,2);hall(P.x+17,y,P.z-1,-.1,11,8,4,2);church(P.x,dY(P.x,P.z-18),P.z-18);
  const R=DEMO.RAMP[1];palaceStairs(R);
  for(const sd of[-1,1])statue(R[3]+sd*5.6,dY(R[3]+sd*5.6,R[4]-.5),R[4]-.5,sd>0?.3:-.3);
  // arcade along the east edge of the plateau
  for(let i=0;i<6;i++){const ax=P.x+15+i*4.2,az=P.z+6,gy=dY(ax,az),top=y+7;boxAt(DB.stone,MATD.stoneDark,ax,(gy+top)/2,az,1.2,top-gy,1.4,0,grey(.64));
    if(i<5){gothicRing(DB.stone,MATD.stone,ax+2.1,top-3.2,az,1.5,2,.45,1.3,0,grey(.72),8);boxAt(DB.stone,MATD.stone,ax+2.1,top+.4,az,4.4,.8,1.5,0,grey(.7));}}
  hall(DEMO.pavilion.x,dY(DEMO.pavilion.x,DEMO.pavilion.z),DEMO.pavilion.z,.3,5,5,3,2);
  for(let i=0;i<4;i++){const a=i/4*TAU;lanternPost(P.x+Math.cos(a)*9,y,P.z+6+Math.sin(a)*3);}}
function palaceStairs(R){const[ax,az,ya,bx,bz,yb,hw]=R,L=Math.hypot(bx-ax,bz-az),n=Math.round((yb-ya)/.2),yaw=-Math.atan2(bz-az,bx-ax)+PI/2;
  for(let i=0;i<n;i++){const t=(i+.5)/n,px=lerp(ax,bx,t),pz=lerp(az,bz,t),yy=lerp(ya,yb,(i+.5)/n);boxAt(DB.stone,MATD.stone,px,yy-.3,pz,hw*2,.6,L/n+.05,yaw,grey(sr(.66,.8)));}
  for(const sd of[-1,1]){const sx=sd*(hw+.3);balustradeSlope(DB.stone,ax+sx,az,ya,bx+sx,bz,yb);addSeg(ax+sx,az,bx+sx,bz,.3,1.3);}}

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
function demoUpdate(dt){const cp=camera.position;
  if(FALL){const F=FALL.F,d2=(cp.x-F.x)**2+(cp.z-F.z)**2;FALL.e+=dt;if(d2<220*220)while(FALL.e>.05){FALL.e-=.05;
      FXN.emit(F.bx+rr(-3,3),F.y1+rr(0,3),F.bz+rr(-3,3),rr(-.6,.6),rr(.6,1.8),rr(-.6,.6),rr(3,5),2.5,9,.62,.66,.7,.5,-.02,.2);}}
  for(const r of RAYS)r.material.uniforms.uT.value=U.time.value;}

/* ---------- light shafts from the break in the clouds ---------- */
const RAYS=[];
function demoRays(){const m=()=>new THREE.ShaderMaterial({uniforms:{uT:{value:0},uC:{value:new THREE.Color(1,.88,.7)}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform float uT;uniform vec3 uC;varying vec2 vUv;void main(){float x=abs(vUv.x-0.5)*2.0;float a=(1.0-x*x)*smoothstep(0.0,0.35,vUv.y)*smoothstep(1.0,0.55,vUv.y);a*=0.05+0.02*sin(uT*0.4+vUv.x*9.0);gl_FragColor=vec4(uC*a,1.0);}'});
  const S=SUN_DIR,top=V3(S.x,S.y,S.z).multiplyScalar(420);
  for(let i=0;i<5;i++){const g=new THREE.PlaneGeometry(1,1),mesh=new THREE.Mesh(g,m());const tgt=V3(sr(-70,40),sr(-10,10),sr(-160,-60)),d=top.clone().sub(tgt),L=d.length();
    mesh.position.copy(tgt).addScaledVector(d,.5);mesh.scale.set(sr(14,30),L,1);mesh.quaternion.setFromUnitVectors(V3(0,1,0),d.normalize());mesh.rotateY(sr(-.4,.4));mesh.renderOrder=6;scene.add(mesh);RAYS.push(mesh);}}

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

/* ---------- karst peaks in the mist: three layers of spires (one mesh each) and two layers of cloud sea ---------- */
const MTND=[],CLOUDS=[];
function demoMountains(){
  const mat=(k)=>new THREE.ShaderMaterial({uniforms:{uFog:{value:scene.fog.color},uK:{value:k},uSun:{value:SUN_DIR},uSunC:skyU.uSunCol},fog:false,
    vertexShader:'attribute float aSd;varying vec3 vW;varying vec3 vN;varying float vSd;void main(){vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);vSd=aSd;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:`uniform vec3 uFog,uSun,uSunC;uniform float uK;varying vec3 vW;varying vec3 vN;varying float vSd;
      float h(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5);}
      float n2(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
      void main(){float an=atan(vW.z-0.0,vW.x)*60.0+vSd*13.0;
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
  const layers=[[250,330,.12,16,45,115],[340,440,.36,18,70,150],[450,540,.58,15,90,190]];
  layers.forEach(([r0,r1,k,n,h0,h1],li)=>{const parts=[];
    for(let i=0;i<n;i++){const a=-PI/2-.2+(i/(n-1)-.5)*2.5+sr(-.06,.06),r=sr(r0,r1),x=Math.cos(a)*r,z=Math.sin(a)*r,H=sr(h0,h1)*(.7+.3*Math.cos(a+PI/2)),R=sr(12,26)*(1+li*.3);
      const g=new THREE.CylinderGeometry(R*.38,R,H,18,12,true),pa=g.attributes.position,sd=sr(0,99),sda=new Float32Array(pa.count).fill(sd);
      for(let j=0;j<pa.count;j++){const vx=pa.getX(j),vy=pa.getY(j),vz=pa.getZ(j),an=Math.atan2(vz,vx),t=(vy/H)+.5;
        const f=1+.32*(fbm(Math.cos(an)*1.7+sd,t*2.6+sd,3)-.5)*2+.1*Math.sin(an*7+t*5+sd)-(t>.84?(t-.84)*3:0);pa.setXYZ(j,vx*f,vy+(t>.9?(fbm(an*2+sd,sd,2)-.5)*R*.6:0),vz*f);}
      g.computeVertexNormals();g.setAttribute('aSd',new THREE.BufferAttribute(sda,1));parts.push({g,m:M4(x,H/2-38,z,sr(-.05,.05),sr(0,TAU),sr(-.05,.05))});}
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
  demoTerrace();demoStairs();demoBridge();demoGate();demoZig();demoVillage();demoPalace();demoWaterfall();demoRays();demoMountains();
  for(const k of['stone','metal','cloth','wood','plaster','tile'])DB[k].build();DB.glow.build(false);}
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
  for(let i=0;i<190;i++){const cx=S*(.12+Math.random()*.76),cy=S*(.12+Math.random()*.76),r=S*rr(.03,.06),a0=Math.random()*TAU,h=rr(-8,14);
    x.fillStyle=`hsl(${h},${rr(55,80)}%,${rr(28,48)}%)`;x.beginPath();for(let k=0;k<=10;k++){const a=a0+k/10*TAU,rr2=(k%2?.42:1)*r;x.lineTo(cx+Math.cos(a)*rr2,cy+Math.sin(a)*rr2);}x.fill();}
  for(let i=0;i<40;i++){x.strokeStyle='rgba(50,30,25,.7)';x.lineWidth=rr(1,2.2);x.beginPath();const a=Math.random()*TAU;x.moveTo(S/2,S/2);x.lineTo(S/2+Math.cos(a)*S*.4,S/2+Math.sin(a)*S*.4);x.stroke();}
  return c;}
function leafGeo(){const g=new THREE.PlaneGeometry(.16,.16);g.rotateX(-PI/2);g.translate(0,.012,0);return g;}
function demoVeg(tint){TEXD.plume=toTex(genPlume(),{rep:false});TEXD.leaf=toTex(genLeaf(),{rep:false});
  MATD.blade=windMat({vertexColors:true,side:THREE.DoubleSide,roughness:.9},.6,.4,true);
  MATD.plume=windMat({map:TEXD.plume,vertexColors:true,alphaTest:.22,side:THREE.DoubleSide,roughness:.95,color:col(0xb9b3a6)},1.4,.5,true);
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
  for(const[x,z,s,c]of DEMO.maples)tree('mp',x,z,s,c==='a'?new THREE.Color(1.25,1.05,.7):new THREE.Color(sr(.95,1.15),sr(.8,.95),sr(.8,.95)),.5);
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
  for(let i=0;i<220;i++){const x=sr(-70,30),z=sr(-100,30),ny=nyAt(x,z);if(ny<.86||!free(x,z,1.2)||pdAt(x,z)<2.5)continue;const h=gH(x,z);if(h<5)continue;
    plant(srnd()<.5?'bush':'fern',x,h-.08,z,sr(.7,1.3),sr(0,TAU),tint(.9));}
  return n;}
