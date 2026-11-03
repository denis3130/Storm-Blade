/* ============================== landmarks ============================== */
const SHRINE_OBJ=[];
function buildShrine(s){
  const y=gH(s.x,s.z);s.y=y;const b=new Batch();const tint=new THREE.Color(1,1,1);
  b.add(MAT.stone,new THREE.CylinderGeometry(4.5,4.9,.6,28),M4(s.x,y+.05,s.z),tint);
  b.add(MAT.stone,new THREE.CylinderGeometry(3.7,3.9,.24,28),M4(s.x,y+.47,s.z),new THREE.Color(.92,.92,.9));
  const rot=sr(0,TAU),N=6;const pil=[];
  for(let i=0;i<N;i++){const a=rot+i/N*TAU,px=s.x+Math.cos(a)*3.45,pz=s.z+Math.sin(a)*3.45,broken=srnd()<.28,h=broken?sr(1.2,2.3):3.4;
    b.add(MAT.stone,new THREE.BoxGeometry(.56,h,.56,1,4,1),M4(px,y+.55+h/2,pz,sr(-.03,.03),-a,sr(-.03,.03)),tint);
    if(!broken){b.add(MAT.stone,new THREE.BoxGeometry(.78,.26,.78),M4(px,y+.55+h+.13,pz,0,-a,0),tint);}
    else{for(let k=0;k<2;k++)b.add(MAT.stone,new THREE.BoxGeometry(sr(.3,.6),sr(.25,.45),sr(.3,.6)),M4(px+Math.cos(a)*sr(.6,1.6),y+.7,pz+Math.sin(a)*sr(.6,1.6),sr(0,1),sr(0,3),sr(0,1)),tint);}
    pil.push({a,px,pz,broken,h});addCol(px,pz,.45,4);}
  for(let i=0;i<N;i++){const p=pil[i],q=pil[(i+1)%N];if(p.broken||q.broken)continue;const mx=(p.px+q.px)/2,mz=(p.pz+q.pz)/2,L=Math.hypot(q.px-p.px,q.pz-p.pz);
    b.add(MAT.stone,new THREE.BoxGeometry(L+.5,.38,.5),M4(mx,y+.55+3.4+.44,mz,0,-Math.atan2(q.pz-p.pz,q.px-p.px),0),tint);}
  b.add(MAT.stoneDark,new THREE.BoxGeometry(1.15,.95,.8),M4(s.x,y+1.05,s.z,0,rot,0),tint);
  b.add(MAT.stoneDark,new THREE.BoxGeometry(1.35,.16,1.0),M4(s.x,y+1.58,s.z,0,rot,0),tint);
  const meshes=b.build();
  const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.34,0),MAT.glowBlue);crystal.scale.set(1,1.6,1);crystal.position.set(s.x,y+2.35,s.z);scene.add(crystal);
  const rune=new THREE.Mesh(geo('runeDisk',()=>{const g=new THREE.CircleGeometry(3.15,48);g.rotateX(-PI/2);return g;}),MAT.rune.clone());rune.position.set(s.x,y+.6,s.z);rune.rotation.y=rot;rune.renderOrder=3;scene.add(rune);
  const ward=new THREE.Mesh(geo('ward',()=>new THREE.SphereGeometry(5.4,40,20,0,TAU,0,PI*.56)),wardMat);ward.position.set(s.x,y+.4,s.z);ward.visible=false;ward.renderOrder=10;scene.add(ward);
  const light=addLight(V3(s.x,y+2.4,s.z),col(0x7cc8ff),2.6,13,2);
  addBox(s.x,s.z,1.15,.8,rot,2);addFloor(s.x,s.z,4.6,y+.35);addFloor(s.x,s.z,3.75,y+.59);
  const o={s,crystal,rune,ward,light,y,meshes,vis:true};SHRINE_OBJ.push(o);s.obj=o;return o;}
function updShrines(dt,stormK,phase){const T=U.time.value;wardU.uA.value=stormK;
  for(const o of SHRINE_OBJ){o.crystal.rotation.y+=dt*.8;o.crystal.position.y=o.y+2.35+Math.sin(T*1.6+o.s.id)*.12;
    o.rune.material.opacity=.55+.25*Math.sin(T*2+o.s.id)+stormK*.4;o.ward.visible=stormK>.03;o.light.k=1+stormK*.8;}}
/* ---------- chest ---------- */
function buildChest(x,z,yaw){const g=new THREE.Group();g.position.set(x,gH(x,z),z);g.rotation.y=yaw;
  const wood=new THREE.MeshStandardMaterial({map:TEX.wood,color:col(0x9a7a5a),roughness:.85}),gold=new THREE.MeshStandardMaterial({color:col(0xc9a04a),metalness:.85,roughness:.32});
  const base=new THREE.Mesh(new THREE.BoxGeometry(1.2,.62,.74),wood);base.position.y=.31;g.add(base);
  for(const sx of[-.45,.45]){const band=new THREE.Mesh(new THREE.BoxGeometry(.08,.64,.78),gold);band.position.set(sx,.31,0);g.add(band);}
  const lid=new THREE.Group();lid.position.set(0,.62,.37);g.add(lid);
  const lm=new THREE.Mesh(new THREE.CylinderGeometry(.37,.37,1.2,12,1,false,0,PI),wood);lm.rotation.z=PI/2;lm.position.set(0,0,-.37);lm.scale.set(1,1,1);lid.add(lm);
  for(const sx of[-.45,.45]){const band=new THREE.Mesh(new THREE.CylinderGeometry(.39,.39,.08,12,1,false,0,PI),gold);band.rotation.z=PI/2;band.position.set(sx,0,-.37);lid.add(band);}
  const lock=new THREE.Mesh(new THREE.BoxGeometry(.16,.2,.06),gold);lock.position.set(0,.5,-.39);g.add(lock);
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});scene.add(g);addBox(x,z,1.22,.76,yaw,1);
  const light=addLight(V3(x,g.position.y+1.2,z),col(0xffc35a),0,7,2);
  return{g,lid,lock,light,x,z,open:false,t:0};}
/* ---------- goblin camps ---------- */
function buildCamp(c){
  const y0=gH(c.x,c.z),ent=Math.atan2(-c.z,-c.x);c.y=y0;c.ent=ent;const b=new Batch();const W=col(0xb7a58f),W2=col(0x8a7a68);
  const logG=geo('clog',()=>new THREE.CylinderGeometry(.19,.24,1,7,1)),tipG=geo('ctip',()=>{const g=new THREE.ConeGeometry(.19,.55,7);g.translate(0,.275,0);return g;});
  const R=14.5,N=Math.round(TAU*R/.43);
  for(let i=0;i<N;i++){const a=i/N*TAU;if(Math.abs(angD(a,ent))<.23)continue;if(srnd()<.04)continue;const r=R+sr(-.12,.12),x=c.x+Math.cos(a)*r,z=c.z+Math.sin(a)*r,y=gH(x,z);
    const h=sr(2.4,3.3),lean=sr(-.12,.05),tw=sr(-.04,.04);const m=M4(x,y,z,0,-a,0);m.multiply(M4(0,0,0,tw,0,lean));
    const lm=m.clone().multiply(M4(0,h/2-.3,0,0,0,0,1,h,1));b.add(MAT.wood,logG,lm,srnd()<.5?W:W2,{vs:h/2});
    b.add(MAT.wood,tipG,m.clone().multiply(M4(0,h-.3,0)),W2,{vs:.4});}
  addArc(c.x,c.z,R,ent+.23,ent+TAU-.23,.3,3);
  for(const side of[-1,1]){const a=ent+side*.27,x=c.x+Math.cos(a)*(R+.1),z=c.z+Math.sin(a)*(R+.1),y=gH(x,z);
    b.add(MAT.wood,logG,M4(x,y+2.1,z,0,0,0,1.4,4.6,1.4),W,{vs:2});
    b.add(MAT.bone,geo('skull',()=>gSph(.22,12,10)),M4(x,y+4.55,z,0,0,0,1,1.1,1.15),WHITE);
    for(const s of[-1,1])b.add(MAT.bone,geo('horn',()=>gCone(.07,.45,6)),M4(x+s*.18,y+4.8,z,0,0,-s*.6),WHITE);
    makeFire(x+Math.cos(ent)*.45,y+3.6,z+Math.sin(ent)*.45,.3,side>0);
    b.add(MAT.wood,logG,M4(x+Math.cos(ent)*.4,y+3.1,z+Math.sin(ent)*.4,0,0,0,.5,1.1,.5),W2);addCol(x,z,.4,4);}
  // watchtower
  const ta=ent+2.35,tx=c.x+Math.cos(ta)*9.4,tz=c.z+Math.sin(ta)*9.4,ty=gH(tx,tz);const TH=5.6,cyl=geo('unitCyl',()=>new THREE.CylinderGeometry(.6,1,1,6,1,true));
  const corners=[[-1.3,-1.3],[1.3,-1.3],[1.3,1.3],[-1.3,1.3]];
  for(const[cx,cz]of corners){b.add(MAT.wood,cyl,segM(tx+cx,ty-.3,tz+cz,tx+cx*.78,ty+TH+1.2,tz+cz*.78,.17),W);addCol(tx+cx,tz+cz,.25,4);}
  for(let i=0;i<4;i++){const[a1,a2]=corners[i],[b1,b2]=corners[(i+1)%4];b.add(MAT.wood,cyl,segM(tx+a1,ty+.6,tz+a2,tx+b1*.86,ty+TH-.4,tz+b2*.86,.08),W2);
    b.add(MAT.wood,cyl,segM(tx+a1*.8,ty+TH+.9,tz+a2*.8,tx+b1*.8,ty+TH+.9,tz+b2*.8,.07),W2);}
  b.add(MAT.plank,new THREE.BoxGeometry(2.9,.18,2.9),M4(tx,ty+TH,tz),W);
  b.add(MAT.hide,geo('roof',()=>{const g=new THREE.ConeGeometry(2.3,1.6,6,1,true);return g;}),M4(tx,ty+TH+2.75,tz),col(0xb09070));
  for(const[cx,cz]of corners)b.add(MAT.wood,cyl,segM(tx+cx*.78,ty+TH+1.2,tz+cz*.78,tx+cx*.7,ty+TH+2.1,tz+cz*.7,.07),W2);
  const lx=tx+Math.cos(ta+PI)*1.45,lz=tz+Math.sin(ta+PI)*1.45;
  for(const s of[-1,1]){const ox=-Math.sin(ta+PI)*.3*s,oz=Math.cos(ta+PI)*.3*s;b.add(MAT.wood,cyl,segM(lx+ox+Math.cos(ta+PI)*.8,ty,lz+oz+Math.sin(ta+PI)*.8,lx+ox,ty+TH,lz+oz,.05),W2);}
  for(let k=0;k<9;k++){const t=(k+.5)/9,px=lx+Math.cos(ta+PI)*.8*(1-t),pz=lz+Math.sin(ta+PI)*.8*(1-t);b.add(MAT.wood,cyl,segM(px-Math.sin(ta+PI)*.32,ty+t*TH,pz+Math.cos(ta+PI)*.32,px+Math.sin(ta+PI)*.32,ty+t*TH,pz-Math.cos(ta+PI)*.32,.035),W2);}
  b.add(MAT.wood,cyl,segM(tx,ty+TH+3.4,tz,tx,ty+TH+5.6,tz,.05),W2);
  const ban=new THREE.Mesh(geo('banner',()=>{const g=new THREE.PlaneGeometry(.9,1.8,4,8);g.translate(.47,-.9,0);return g;}),MAT.banner);ban.position.set(tx,ty+TH+5.5,tz);ban.rotation.y=-ta;ban.castShadow=true;scene.add(ban);
  c.tower=V3(tx,ty+TH+.1,tz);
  // tents
  for(let k=0;k<3;k++){const a=ent+PI+(k-1)*1.05,x=c.x+Math.cos(a)*7.8,z=c.z+Math.sin(a)*7.8,y=gH(x,z);
    b.add(MAT.hide,geo('tent',()=>new THREE.ConeGeometry(2.3,3,6,2)),M4(x,y+1.48,z,0,sr(0,3),0),col(0xc8a888));
    for(let p=0;p<3;p++){const pa=p/3*TAU;b.add(MAT.wood,cyl,segM(x,y+2.4,z,x+Math.cos(pa)*.45,y+3.6,z+Math.sin(pa)*.45,.045),W2);}
    addCol(x,z,1.95,3);
    for(let q=0;q<2;q++){const qa=a+sr(-.7,.7),qx=c.x+Math.cos(qa)*sr(10.5,12.5),qz=c.z+Math.sin(qa)*sr(10.5,12.5),qy=gH(qx,qz);
      if(srnd()<.5){const cr=sr(0,3);b.add(MAT.plank,geo('crate',()=>new THREE.BoxGeometry(.9,.9,.9)),M4(qx,qy+.45,qz,0,cr,0),W);addBox(qx,qz,.9,.9,cr,1);}
      else{b.add(MAT.plank,geo('barrel',()=>{const g=new THREE.CylinderGeometry(.38,.38,1,10,3);const pa=g.attributes.position;for(let i=0;i<pa.count;i++){const yy=pa.getY(i),f=1+.13*(1-4*yy*yy);pa.setX(i,pa.getX(i)*f);pa.setZ(i,pa.getZ(i)*f);}g.computeVertexNormals();return g;}),M4(qx,qy+.5,qz,0,sr(0,3),0),col(0x9a8068));addCol(qx,qz,.45,1);}}}
  // fire pit
  for(let k=0;k<9;k++){const a=k/9*TAU;b.add(MAT.stoneDark,geo('pitStone',()=>new THREE.DodecahedronGeometry(.28,0)),M4(c.x+Math.cos(a)*1.05,y0+.12,c.z+Math.sin(a)*1.05,sr(0,2),sr(0,2),0,1,.7,1),WHITE);}
  for(let k=0;k<3;k++)b.add(MAT.wood,logG,M4(c.x,y0+.18,c.z,PI/2,k*1.05,0,.45,1.5,.45),col(0x50402f));
  b.add(MAT.plain,geo('ash',()=>new THREE.CircleGeometry(1,16)),M4(c.x,y0+.03,c.z,-PI/2,0,0),col(0x141210));
  for(const s of[-1,1])b.add(MAT.wood,cyl,segM(c.x+s*1.3,y0,c.z,c.x+s*1.3,y0+1.5,c.z,.05),W2);
  b.add(MAT.wood,cyl,segM(c.x-1.5,y0+1.45,c.z,c.x+1.5,y0+1.45,c.z,.035),W2);
  b.add(MAT.plain,gSph(.24,10,8),M4(c.x,y0+1.3,c.z,0,0,0,1.6,1,1),col(0x5a2c1a));
  makeFire(c.x,y0+.1,c.z,1.05);addCol(c.x,c.z,1.2,1);c.fireP=V3(c.x,y0+.5,c.z);
  // totem + bone piles + weapon rack
  const toa=ent+PI*.55,tox=c.x+Math.cos(toa)*4.5,toz=c.z+Math.sin(toa)*4.5,toy=gH(tox,toz);
  b.add(MAT.wood,logG,M4(tox,toy+1.7,toz,0,0,0,1.3,3.4,1.3),W);for(let k=0;k<3;k++)b.add(MAT.bone,geo('skull',()=>gSph(.22,12,10)),M4(tox,toy+1.3+k*.85,toz,0,k,0,1.1,1,1.2),WHITE);
  const eyes=new THREE.Mesh(geo('totemEyes',()=>mergeParts([{g:gSph(.05,6,4),m:M4(-.08,0,-.2)},{g:gSph(.05,6,4),m:M4(.08,0,-.2)}])),MAT.glowRed);eyes.position.set(tox,toy+3.0,toz);eyes.rotation.y=-toa-PI/2;scene.add(eyes);
  b.add(MAT.bone,geo('skull',()=>gSph(.22,12,10)),M4(tox,toy+3.0,toz,0,-toa-PI/2,0,1.2,1.2,1.3),WHITE);addCol(tox,toz,.45,3);
  for(let k=0;k<14;k++){const a=ent+PI*.3+sr(-.3,.3),r=sr(4,6),x=c.x+Math.cos(a)*r,z=c.z+Math.sin(a)*r;b.add(MAT.bone,geo('bone',()=>gCaps(.03,.04,.4,6,2)),M4(x,gH(x,z)+.05,z,PI/2,sr(0,3),sr(-.3,.3)),WHITE);}
  const ra=ent-PI*.5,rx=c.x+Math.cos(ra)*10.8,rz=c.z+Math.sin(ra)*10.8,ry=gH(rx,rz);
  for(const s of[-1,1])b.add(MAT.wood,cyl,segM(rx-Math.sin(ra)*s*1.2,ry,rz+Math.cos(ra)*s*1.2,rx-Math.sin(ra)*s*1.2,ry+1.6,rz+Math.cos(ra)*s*1.2,.06),W2);
  b.add(MAT.wood,cyl,segM(rx-Math.sin(ra)*1.3,ry+1.35,rz+Math.cos(ra)*1.3,rx+Math.sin(ra)*1.3,ry+1.35,rz-Math.cos(ra)*1.3,.045),W2);addSeg(rx-Math.sin(ra)*1.2,rz+Math.cos(ra)*1.2,rx+Math.sin(ra)*1.2,rz-Math.cos(ra)*1.2,.24,2);
  for(let k=0;k<4;k++){const o=-.9+k*.6;b.add(MAT.wood,cyl,segM(rx-Math.sin(ra)*o+Math.cos(ra)*.3,ry,rz+Math.cos(ra)*o+Math.sin(ra)*.3,rx-Math.sin(ra)*o-Math.cos(ra)*.1,ry+2.1,rz+Math.cos(ra)*o-Math.sin(ra)*.1,.025),W2);
    b.add(MAT.metal,geo('spearTip',()=>gCone(.04,.22,4)),M4(rx-Math.sin(ra)*o-Math.cos(ra)*.12,ry+2.2,rz+Math.cos(ra)*o-Math.sin(ra)*.12),WHITE);}
  b.build();
  const ca=ent+PI,cx=c.x+Math.cos(ca)*3.4,cz=c.z+Math.sin(ca)*3.4;c.chest=buildChest(cx,cz,yawTo(c.x-cx,c.z-cz)+PI);
  c.spawnR=[];for(let k=0;k<12;k++){const a=k/12*TAU+.2;c.spawnR.push([c.x+Math.cos(a)*sr(4,9.5),c.z+Math.sin(a)*sr(4,9.5)]);}
}
/* ---------- ruins ---------- */
function buildRuin(r){const b=new Batch(),y=gH(r.x,r.z),T=WHITE;
  if(r.t==='tower'){const ts=sr(0,TAU),tl=TAU*.8;
    const og=new THREE.CylinderGeometry(4.1,4.6,12,26,8,true,ts,tl);const pa=og.attributes.position;for(let i=0;i<pa.count;i++){const yy=pa.getY(i);if(yy>2){const a=Math.atan2(pa.getX(i),pa.getZ(i));pa.setY(i,Math.min(yy,2+(fbm(a*2.3,1.7,3))*11));}}og.computeVertexNormals();
    b.add(MAT.stone,og,M4(r.x,y+5.6,r.z),T);
    const ig=flipGeo(new THREE.CylinderGeometry(3.5,3.9,11.8,26,8,true,ts,tl));const ia=ig.attributes.position;for(let i=0;i<ia.count;i++){const yy=ia.getY(i);if(yy>2){const a=Math.atan2(ia.getX(i),ia.getZ(i));ia.setY(i,Math.min(yy,2+(fbm(a*2.3,1.7,3))*11-.2));}}
    b.add(MAT.stoneDark,ig,M4(r.x,y+5.6,r.z),T);
    for(const e of[ts,ts+tl]){const ex=r.x+Math.sin(e)*3.9,ez=r.z+Math.cos(e)*3.9;b.add(MAT.stone,new THREE.BoxGeometry(.7,5,.75),M4(ex,y+2.3,ez,0,e,0),T);}
    for(let k=0;k<26;k++){const a=sr(0,TAU),d=sr(2,8.5),s=sr(.35,.9);const x=r.x+Math.sin(a)*d,z=r.z+Math.cos(a)*d;b.add(MAT.stone,new THREE.BoxGeometry(s*1.4,s*.8,s),M4(x,gH(x,z)+s*.3,z,sr(-.4,.4),sr(0,3),sr(-.4,.4)),T);}
    addArc(r.x,r.z,4.05,PI/2-ts,PI/2-ts-tl,.56,6);}
  else if(r.t==='arch'){const a=sr(0,TAU),ca=Math.cos(a),sa=Math.sin(a);for(const s of[-1,1]){const x=r.x+ca*2.1*s,z=r.z+sa*2.1*s;b.add(MAT.stone,new THREE.BoxGeometry(.85,4.6,.85,1,4,1),M4(x,y+2.3,z,0,-a,0),T);addBox(x,z,.85,.85,-a,5);}
    b.add(MAT.stone,new THREE.BoxGeometry(5.2,.8,1.0),M4(r.x,y+5,r.z,0,-a,sr(-.05,.05)),T);
    for(let k=0;k<8;k++){const x=r.x+sr(-4,4),z=r.z+sr(-4,4);const s=sr(.3,.8);b.add(MAT.stone,new THREE.BoxGeometry(s*1.3,s*.7,s),M4(x,gH(x,z)+s*.25,z,sr(0,1),sr(0,3),sr(0,1)),T);}}
  else if(r.t==='circle'){for(let k=0;k<9;k++){const a=k/9*TAU+.3,x=r.x+Math.cos(a)*9,z=r.z+Math.sin(a)*9,h=sr(2.4,4.2),fallen=k===4;
      if(fallen)b.add(MAT.stone,new THREE.BoxGeometry(1,h,.6),M4(x,gH(x,z)+.3,z,PI/2-.1,-a,0),T);else{b.add(MAT.stone,new THREE.BoxGeometry(1,h,.6,1,3,1),M4(x,gH(x,z)+h/2-.2,z,sr(-.08,.08),-a+PI/2,sr(-.08,.08)),T);addBox(x,z,1.02,.64,-a+PI/2,4);}}
    b.add(MAT.stoneDark,new THREE.BoxGeometry(2.4,.6,1.4),M4(r.x,y+.25,r.z,0,.4,0),T);addBox(r.x,r.z,2.4,1.4,.4,1);
    const g=new THREE.Mesh(geo('runeDisk',()=>{const g=new THREE.CircleGeometry(3.15,48);g.rotateX(-PI/2);return g;}),MAT.rune.clone());g.material.color.setRGB(.9,.5,2.2);g.material.opacity=.5;g.scale.setScalar(2.4);g.position.set(r.x,y+.08,r.z);scene.add(g);}
  else if(r.t==='wall'){const a=sr(0,TAU),ca=Math.cos(a),sa=Math.sin(a);for(let k=-5;k<=5;k++){const x=r.x+ca*k*.95,z=r.z+sa*k*.95,h=Math.max(.6,4.2-Math.abs(k)*.3+sr(-1.4,.6));
      if(k===0)continue;b.add(MAT.stone,new THREE.BoxGeometry(.95,h,1.1,1,3,1),M4(x,gH(x,z)+h/2-.1,z,0,-a,0),T);}
    for(const sd of[-1,1])addBox(r.x+ca*3*.95*sd,r.z+sa*3*.95*sd,4.75,1.12,-a,3);
    b.add(MAT.stone,new THREE.BoxGeometry(1.1,.6,1.2),M4(r.x,y+3.4,r.z,0,-a,0),T);
    for(let k=0;k<10;k++){const x=r.x+sr(-4,4),z=r.z+sr(-4,4),s=sr(.3,.7);b.add(MAT.stone,new THREE.BoxGeometry(s*1.4,s*.7,s),M4(x,gH(x,z)+s*.25,z,sr(0,1),sr(0,3),sr(0,1)),T);}}
  else if(r.t==='statue'){b.add(MAT.stoneDark,new THREE.BoxGeometry(3.6,1.2,3.6),M4(r.x,y+.5,r.z),T);b.add(MAT.stone,new THREE.BoxGeometry(3.2,.3,3.2),M4(r.x,y+1.2,r.z),T);addBox(r.x,r.z,3.6,3.6,0,5);
    const stM=stoneMat(0xa9a59c,.5);stM.vertexColors=false;const sm={b:stM,m:stM};const st=buildHuman({d:HERO_D,s:2.4,mats:sm,build:heroBuild});st.root.position.set(r.x,y+1.32,r.z);st.root.rotation.y=sr(0,TAU);
    st.apply(pose({y:-.46,spi:[16,0,0],head:[22,0,0],hipL:[92,0,-6],knL:-92,hipR:[-6,0,6],knR:-118,ftR:30,shR:[50,-20,10],elR:40,wrR:[-118,0,0],shL:[50,30,-10],elL:50,wrL:[0,0,0]}));
    const sw=buildSword(2);sw.g.traverse(o=>{if(o.isMesh)o.material=stM;});sw.g.scale.setScalar(1.15);sw.g.position.set(0,-.07,0);st.P.wrR.add(sw.g);scene.add(st.root);}
  b.build();}
