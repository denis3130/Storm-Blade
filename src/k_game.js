/* ============================== combat glue ============================== */
function damageEnemy(e,a,D,nx,nz,hp){const C=CFG.combat;const l=Math.hypot(nx,nz)||1;nx/=l;nz/=l;
  let mul=D.mul*(a.charged?1.45:1),crit=false;
  if(e.stun>0&&!D.rip){mul*=1.5;crit=true;}if(D.rip)crit=true;if(e.down>0)mul*=C.downMul;
  fwdV(e.yaw,_v1);if(!D.proj&&!D.rip&&e.type!=='spirit'&&(_v1.x*nx+_v1.z*nz)>.5){mul*=1.3;crit=true;}
  if(!D.proj&&P.perfectT>G.t){mul*=C.perfectBonus;crit=true;P.perfectT=0;}
  const base=D.proj?e.d.dmg*1.6:SWORDS[P.sword].dmg*P.dmgMul;const dmg=Math.max(1,Math.round(base*mul*rr(.92,1.08)));
  e.hp-=dmg;e.flash=.1;e.barT=4;if(!e.aggro)alertE(e);
  // body answers the blow: squash, recoil away from it (front/back and sideways)
  e.sq=Math.min(1.4,e.sq+(D.heavy?1.2:.8));const back=-(nx*_v1.x+nz*_v1.z),side=nx*-_v1.z+nz*_v1.x,fk=D.heavy?9:6;
  e.flinchV+=fk*clamp(back*1.3,-1,1);e.flinchZV-=fk*.8*clamp(side*1.3,-1,1);
  // a quick blow knocks a small foe out of its wind-up — but only once every few seconds
  if(e.atk&&!e.boss&&e.type!=='troll'&&!D.proj&&e.t<e.atk.w*.7&&G.t>e.intT){e.atk=null;e.stag=Math.max(e.stag,.32);e.intT=G.t+C.interruptCD;e.cool=Math.max(e.cool,.35);}
  if(D.rip){e.stun=0;e.stag=.6;}
  else{e.poise-=D.poise*(a.charged?1.5:1);if(e.poise<=0){e.poise=e.maxPoise;e.atk=null;if(!e.boss)TOK.delete(e);
      if(D.down&&e.type!=='troll'&&e.type!=='spirit'&&e.hp>0){e.down=C.downT;e.stag=0;e.fall=Math.random()<.5?1:-1;num('A terra',e.pos,e.h+.3,'info');sfx('down',e.pos);dust(e.pos,8,.9);}
      else{e.stag=e.type==='troll'?1.7:.8;if(e.type==='troll')num('Barcollante',e.pos,e.h+.3,'info');}}}
  const kbm=e.type==='troll'?.22:e.down>0?.35:1,kb=(D.heavy?5:2.6)*kbm;e.kb.set(nx*kb,0,nz*kb);
  if(hp)_v2.copy(hp);else _v2.set(e.pos.x-nx*e.r*.5,e.pos.y+(e.fly||0)+e.h*.62,e.pos.z-nz*e.r*.5);_v3.set(nx,0,nz);
  if(e.type==='spirit')magic(_v2,14,[1.6,.9,3],3,.5);else{blood(_v2,_v3,D.heavy?14:8);sparks(_v2,_v3,D.heavy?9:4,3,2.2,1,5);}
  impactFlash(_v2,D.heavy?1.1:.65);
  num(String(dmg),e.pos,e.h+.25+(e.fly||0),crit?'crit':'');
  G.hitstop=Math.max(G.hitstop,D.rip?C.hitstop.rip:D.heavy?C.hitstop.heavy:C.hitstop.light);CAM.trauma=Math.min(1,CAM.trauma+(D.rip?.45:D.heavy?.22:.1));
  if(D.heavy)Post.u.flash.value=Math.min(.3,Post.u.flash.value+.05);
  if(D.finisher&&!a.ring){a.ring=1;fwdV(P.yaw,_v1);const rx=P.pos.x+_v1.x*1.4,rz=P.pos.z+_v1.z*1.4;groundRing(rx,rz,.3,C.shockR*1.05,.35,new THREE.Color(1.1,.85,.55),'shock');dust(V3(rx,gH(rx,rz),rz),10,1.1);
    const SW={mul:D.mul*C.shockMul,poise:C.shockPoise,heavy:false};for(const o of E){if(o===e||o.dead||!o.active||a.hit.has(o)||o.type==='spirit'&&o.fly>.6)continue;const d=Math.hypot(o.pos.x-rx,o.pos.z-rz);if(d<C.shockR+o.r){a.hit.add(o);damageEnemy(o,a,SW,o.pos.x-rx,o.pos.z-rz,null);}}}
  sfx(D.heavy?'hitBig':'hit',e.pos);
  if(e.type==='goblin'||e.type==='archer'){if(Math.random()<.6)sfx('gobHurt',e.pos);}else if(e.type==='wolf'&&Math.random()<.5)sfx('bite',e.pos);
  if(e.hp<=0)killEnemy(e,D);}
function killEnemy(e,D){if(e.dead)return;e.dead=true;e.deadT=0;e.atk=null;e.stun=0;e.stag=0;e.down=0;TOK.delete(e);e.fall=Math.random()<.5?1:-1;P.kills++;
  emberOrbs(e,e.braci);
  sfx(e.type==='goblin'||e.type==='archer'?'gobDie':e.type==='wolf'?'growl':e.type==='troll'?'roar':'wail',e.pos);
  if(P.lock===e)P.lock=autoRelock(e);
  if(e.boss){G.slow=1.6;G.slowS=.22;CAM.trauma=1;Post.u.flash.value=.45;sfx('bossDie');
    groundRing(e.pos.x,e.pos.z,1,14,1.1,new THREE.Color(1.6,.7,.3),'shock');setTimeout(()=>groundRing(e.pos.x,e.pos.z,.5,9,.9,new THREE.Color(1.2,.9,.6),'shock'),180);
    _v2.set(e.pos.x,e.pos.y+e.h*.6,e.pos.z);for(let i=0;i<3;i++)magic(_v2,40,[3,1.4,.5],5+i*2,1.4,.2);dust(e.pos,26,2.4);
    setTimeout(()=>{banner(e.name,'Sconfitto');sfx('banner');},700);}
  if(e.type==='spirit')magic(V3(e.pos.x,e.pos.y+e.fly+1.2,e.pos.z),40,[1.4,.8,3],4,.9);
  if(e.camp>=0)setTimeout(()=>checkCamp(e.camp),900);}
/* ---------- braci fly from the fallen foe to the HUD counter; the counter grows (and bounces) as each one lands ---------- */
const ORBS=[];
function emberOrbs(e,amount){_v1.set(e.pos.x,e.pos.y+(e.fly||0)+e.h*.6,e.pos.z);num('+'+amount+' braci',e.pos,e.h+.9,'info');
  if(!toScreen(_v1,_sp)||G.state!=='play'){addBraci(amount);return;}
  const n=Math.min(9,3+Math.round(amount/18)),per=Math.floor(amount/n);let left=amount;
  for(let i=0;i<n;i++){const d=document.createElement('i');d.className='orb';$('nums').appendChild(d);const v=i===n-1?left:per;left-=v;
    ORBS.push({d,x0:_sp.x+rr(-18,18),y0:_sp.y+rr(-14,14),t:-i*.045,dur:rr(.55,.75),bx:rr(-90,90),by:rr(-120,-50),v});}}
// centre of a HUD element in game-space pixels, from layout offsets (unaffected by the CSS rotation used on portrait phones)
function hudXY(el,out){let x=el.offsetWidth/2,y=el.offsetHeight/2;const hud=$('hud');while(el&&el!==hud){x+=el.offsetLeft;y+=el.offsetTop;el=el.offsetParent;}out.x=x;out.y=y;return out;}
const _ot={x:0,y:0};
function updOrbs(rdt){if(!ORBS.length)return;hudXY($('braciN'),_ot);const tx=_ot.x,ty=_ot.y;
  for(let i=ORBS.length-1;i>=0;i--){const o=ORBS[i];o.t+=rdt;if(o.t<0){o.d.style.opacity=0;continue;}const u=Math.min(1,o.t/o.dur),k=eIn2(u);
    const x=lerp(lerp(o.x0,o.x0+o.bx,eOut2(u)),tx,k),y=lerp(lerp(o.y0,o.y0+o.by,eOut2(u)),ty,k);o.d.style.opacity=1;o.d.style.transform=`translate(${x}px,${y}px) scale(${1-u*.45})`;
    if(u>=1){o.d.remove();ORBS.splice(i,1);addBraci(o.v);}}}
function bump(el,cls='bump'){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);}
function checkCamp(i){if(P.cleared[i])return;if(E.some(o=>o.camp===i&&!o.dead))return;P.cleared[i]=true;const c=CAMPS[i];c.chest.light.i=2.4;
  const n=P.cleared.filter(Boolean).length;banner('Accampamento distrutto',c.name+' · '+n+' di 4');sfx('banner');save();
  setTimeout(()=>toast('Il forziere del capo è <em>aperto</em>'),2600);}
function openChest(i){const c=CAMPS[i];if(c.chest.open)return;c.chest.open=true;P.chests[i]=true;sfx('chest',c.chest.g.position);
  magic(V3(c.chest.x,c.chest.g.position.y+1,c.chest.z),50,[3,2.2,.8],4,1.2);
  const tier=Math.max(P.sword,i+1);const newSword=tier>P.sword;if(newSword){P.sword=tier;setSword(tier);}
  P.flaskMax=Math.min(CFG.flask.max,P.flaskMax+1);P.flasks=P.flaskMax;addBraci(CFG.prog.chestBraci*(i+1));
  setTimeout(()=>{banner(newSword?SWORDS[P.sword].name:'Tesoro del capo',newSword?'Danno '+SWORDS[P.sword].dmg+' · fiaschette +1':'Fiaschette +1');sfx('level');},500);
  save();if(P.chests.every(Boolean))setTimeout(victory,4200);}
/* ---------- braci and levels: braci are carried, and spent at a shrine one level at a time ---------- */
const levelCost=l=>{const B=CFG.braci,k=l-1;return Math.round(B.lvlBase+B.lvlLin*k+B.lvlQuad*k*k);};
function addBraci(n){if(!(n>0))return;const c=levelCost(P.lvl),was=P.braci;P.braci+=n;bump($('braci'));
  if(was<c&&P.braci>=c){bump(document.querySelector('.medal'),'ready');sfx('level');toast('Hai abbastanza braci per salire di livello: <em>riposa a un santuario</em>');}}
function spendBraci(n){if(!(n>=0)||P.braci<n)return false;P.braci-=n;return true;}
function levelUp(stat){if(!P.stats||!Object.prototype.hasOwnProperty.call(P.stats,stat))return false;if(!spendBraci(levelCost(P.lvl)))return false;
  P.stats[stat]++;recalcStats();if(stat==='vig')P.hp=Math.min(P.maxHp,P.hp+CFG.hp.perVig);sfx('level');save();return true;}
let shrineAt=null;
function openShrineMenu(s){if(s)shrineAt=s;const sh=shrineAt||SHRINES[P.shrine]||SHRINES[0],c=levelCost(P.lvl),ok=P.braci>=c;G.state='shrine';showScreen('shrineMenu');
  $('smName').textContent=sh.name;$('smCost').textContent=c;$('smHave').textContent=P.braci;$('smLvl').textContent=P.lvl;$('smLevel').disabled=!ok;
  if(document.pointerLockElement)document.exitPointerLock();menuFocus(ok?$('smLevel'):$('smLeave'));}
function openLevelUp(){const c=levelCost(P.lvl);if(P.braci<c){openShrineMenu();return;}G.state='levelup';showScreen('levelup');
  $('luLvl').textContent=P.lvl+1;$('luCost').textContent=c;$('luHave').textContent=P.braci;
  $('luVig').textContent=P.maxHp+' → '+(P.maxHp+CFG.hp.perVig)+' vita';$('luEnd').textContent=Math.round(P.maxSt)+' → '+Math.round(P.maxSt+CFG.stam.perEnd)+' vigore';$('luStr').textContent='+'+Math.round((P.dmgMul+CFG.str.per)*100-100)+'% danno';
  if(document.pointerLockElement)document.exitPointerLock();menuFocus(document.querySelector('#levelup .card'));}
function pickStat(s){if(levelUp(s))toast('Livello <em>'+P.lvl+'</em>');openShrineMenu();}
function restAtShrine(s){P.hp=P.maxHp;P.flasks=P.flaskMax;P.st=P.maxSt;P.shrine=s.id;sfx('rest');healFx(P.pos);magic(V3(s.x,s.y+2.3,s.z),40,[.5,1.4,2.6],2.5,1.2);
  if(ST.phase!=='storm'&&ST.phase!=='warn')spawnWorld(true);save();toast('Hai riposato a <em>'+s.name+'</em>. I nemici sono tornati.');
  openShrineMenu(s);}
/* ---------- braci left where the player fell (last safe ground); touching the pile takes them back, dying first loses them ---------- */
let PILE=null;
// emissive map of the pile: thin glowing cracks plus scattered hot spots on black (only these glow, the ash stays dark)
function pileTex(){const c=mkC(64,64);pxFill(c,(u,v,o)=>{const n=tn2(u*5,v*5,5,5,11),s=tn2(u*13,v*13,13,13,29);
    const k=Math.min(1,sstep(.06,0,Math.abs(n-.5))*.85+sstep(.68,.86,s));o[0]=255*k;o[1]=(70+90*k)*k;o[2]=18*k*k;});return toTex(c);}
function pileMesh(){if(PILE)return PILE;const g=new THREE.Group();
  // lumpy ash mound: jitter keyed on the vertex position keeps the faces closed; the bottom half is flattened onto the ground
  const m=new THREE.Mesh(geo('pile',()=>{const q=new THREE.IcosahedronGeometry(.34,1),p=q.attributes.position;
      for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),h=Math.sin(x*91.7+y*47.3+z*63.1)*43758.5453,j=1+(h-Math.floor(h)-.5)*.3;
        p.setXYZ(i,x*j,Math.max(y,-.02)*j*.42,z*j);}q.computeVertexNormals();return q;}),
    new THREE.MeshStandardMaterial({color:col(0x2b221d),roughness:1,flatShading:true,emissive:new THREE.Color(1,1,1),emissiveIntensity:1.2,emissiveMap:pileTex()}));
  m.position.y=.07;g.add(m);g.visible=false;scene.add(g);PILE={g,m,t:0,fx:0};return PILE;}
function syncDrop(){const d=P.drop;if(!d){if(PILE)PILE.g.visible=false;return;}const p=pileMesh();p.g.visible=true;p.g.position.set(d.x,gY(d.x,d.z),d.z);}
function dropBraci(){if(P.braci>0){P.drop={x:P.safe.x,z:P.safe.z,amount:P.braci};P.braci=0;}else P.drop=null;syncDrop();
  if(P.drop){_v1.set(P.drop.x,gY(P.drop.x,P.drop.z)+.3,P.drop.z);magic(_v1,18,[2.6,1.1,.3],1.2,.8,.1);}save();}
function recoverBraci(){const d=P.drop;if(!d)return;P.drop=null;syncDrop();addBraci(d.amount);sfx('level');
  _v1.set(d.x,gY(d.x,d.z)+.4,d.z);magic(_v1,30,[2.6,1.1,.3],2.2,.9,.12);orbBurst(_v1,6);toast('Braci recuperate: <em>'+d.amount+'</em>');save();}
function updDrop(dt){const d=P.drop;if(!d||!PILE)return;const p=PILE;p.t+=dt;p.m.material.emissiveIntensity=1+Math.sin(p.t*3)*.35;p.m.rotation.y+=dt*.3;
  p.fx-=dt;if(p.fx<=0){p.fx=.07;FXA.emit(d.x+rr(-.25,.25),p.g.position.y+.15,d.z+rr(-.25,.25),rr(-.1,.1),rr(.5,1.1),rr(-.1,.1),rr(.8,1.6),.06,.01,2.6,1,.25,1,-.1,.6,1);}
  if(!P.dead&&G.state==='play'&&Math.hypot(P.pos.x-d.x,P.pos.z-d.z)<CFG.braci.pickR)recoverBraci();}
// decorative embers flying to the counter (no value: the braci were already added)
function orbBurst(p,n){if(G.state!=='play'||!toScreen(p,_sp))return;
  for(let i=0;i<n;i++){const d=document.createElement('i');d.className='orb';$('nums').appendChild(d);
    ORBS.push({d,x0:_sp.x+rr(-18,18),y0:_sp.y+rr(-14,14),t:-i*.045,dur:rr(.55,.75),bx:rr(-90,90),by:rr(-120,-50),v:0});}}
function victory(){if(G.won)return;G.won=true;G.state='victory';showScreen('victory');if(document.pointerLockElement)document.exitPointerLock();
  const m=Math.floor(G.playTime/60),s=Math.floor(G.playTime%60);
  $('winStats').innerHTML=`<div><b>${P.lvl}</b><span>Livello</span></div><div><b>${P.kills}</b><span>Nemici</span></div><div><b>${m}:${String(s).padStart(2,'0')}</b><span>Tempo</span></div>`;}

/* ============================== world population ============================== */
function spawnWorld(keepNear){
  for(const e of[...E]){if(keepNear&&!e.dead&&e.aggro)continue;removeEnemy(e);}for(const p of PROJ)scene.remove(p.mesh);PROJ.length=0;TOK.clear();
  CAMPS.forEach((c,i)=>{if(P.cleared[i])return;const t=c.tier,ng=3+t,na=1+(t>=2?1:0),nw=2+(t>=1?1:0);
    for(let k=0;k<ng;k++){const[x,z]=c.spawnR[k];spawnEnemy('goblin',x,z,{camp:i,tier:t,sit:k%2===0,yaw:yawTo(c.x-x,c.z-z)});}
    spawnEnemy('archer',c.tower.x,c.tower.z,{camp:i,tier:t,static:true,baseY:c.tower.y,yaw:c.ent});
    for(let k=1;k<na;k++){const[x,z]=c.spawnR[ng+k];spawnEnemy('archer',x,z,{camp:i,tier:t});}
    for(let k=0;k<nw;k++){const a=c.ent+rr(-.5,.5),r=rr(20,24);spawnEnemy('wolf',c.x+Math.cos(a)*r,c.z+Math.sin(a)*r,{camp:i,tier:t});}
    const ba=c.ent+PI*.5,bx=c.x+Math.cos(ba)*3.2,bz=c.z+Math.sin(ba)*3.2;
    spawnEnemy('troll',bx,bz,{camp:i,tier:t,boss:true,sleep:true,name:c.boss,king:t===3,scale:t===3?1.16:1+t*.04,yaw:yawTo(c.x-bx,c.z-bz)});});
  [[-30,60,1],[74,40,0],[-62,-88,2],[122,-62,1],[22,-112,1],[-140,40,2]].forEach(([x,z,t])=>{for(let k=0;k<2+(t>1?1:0);k++)spawnEnemy('wolf',x+rr(-3,3),z+rr(-3,3),{tier:t});});
  [[-62,22,0],[36,78,1],[104,-8,1]].forEach(([x,z,t])=>{for(let k=0;k<2;k++)spawnEnemy('goblin',x+rr(-2,2),z+rr(-2,2),{tier:t});});}
function placeAtShrine(id){const s=SHRINES[id]||SHRINES[0];const a=Math.atan2(-s.z,-s.x)+PI+.6;P.pos.set(s.x+Math.cos(a)*3,0,s.z+Math.sin(a)*3);P.pos.y=gH(P.pos.x,P.pos.z);
  P.yaw=yawTo(P.pos.x-s.x,P.pos.z-s.z);if(id===0){P.pos.set(1.5,0,5.5);P.pos.y=gH(1.5,5.5);P.yaw=yawTo(CAMPS[0].x-1.5,CAMPS[0].z-5.5);}
  CAM.yaw=P.yaw;CAM.pitch=-.18;CAM.init=false;P.vel.set(0,0,0);if(PL)PL.cape.reset();P.safe.x=P.pos.x;P.safe.z=P.pos.z;P.safeT=.5;}

/* ============================== storm ============================== */
const ST={phase:'calm',t:150,k:0,flash:0,boltT:3,spawnT:2,strikeT:4};
const SDUR=CFG.storm;
const STRIKES=[];
function setStormPhase(ph){ST.phase=ph;ST.t=SDUR[ph];
  if(ph==='warn'){banner('Tempesta in arrivo','Raggiungi un santuario prima che si scateni','storm');sfx('warn');const a=rr(0,TAU);ST.vx=P.pos.x+Math.cos(a)*110;ST.vz=P.pos.z+Math.sin(a)*110;
    if(!P.stormTip){P.stormTip=1;hint('Le barriere azzurre dei <b>santuari</b> proteggono dalla tempesta. Segui il cerchio blu sulla bussola',6);}}
  else if(ph==='storm'){banner('La tempesta è qui',P.inWard?'Resta dentro la barriera':'Corri al santuario più vicino','storm');ST.strikeT=3;}
  else if(ph==='clear'){toast('La tempesta si placa');for(const e of E)if(e.type==='spirit'&&!e.dead){e.dead=true;e.deadT=0;}}}
function updStorm(dt){ST.t-=dt;if(ST.t<=0){setStormPhase(ST.phase==='calm'?'warn':ST.phase==='warn'?'storm':ST.phase==='storm'?'clear':'calm');}
  const tk=ST.phase==='storm'?1:ST.phase==='warn'?.6*(1-ST.t/SDUR.warn):ST.phase==='clear'?ST.t/SDUR.clear:0;
  ST.k=damp(ST.k,tk,1.1,dt);const k=ST.k;U.storm.value=k;U.wind.value=1+k*2.6;U.wet.value=damp(U.wet.value,ST.phase==='storm'?1:ST.phase==='clear'?.7:0,ST.phase==='calm'?.08:.35,dt);
  ST.flash=Math.max(0,ST.flash-dt*3.2);
  const C=SKYC.calm,S=SKYC.storm;skyU.uHorizon.value.copy(C.hor).lerp(S.hor,k);skyU.uZenith.value.copy(C.zen).lerp(S.zen,k);skyU.uCloud.value.copy(C.cloud).lerp(S.cloud,k);skyU.uSunCol.value.copy(C.sun).lerp(S.sun,k);
  skyU.uFlash.value=ST.flash;scene.fog.color.copy(C.fog).lerp(S.fog,k).multiplyScalar(1+ST.flash*1.4);scene.fog.near=lerp(.0085,.0165,k);scene.fog.far=lerp(.55,.95,k);FOGU.uFogD.value=scene.fog.near;FOGU.uFogH.value=scene.fog.far;
  hemi.color.copy(C.hemiS).lerp(S.hemiS,k);hemi.groundColor.copy(C.hemiG).lerp(S.hemiG,k);hemi.intensity=lerp(.5,.34,k)+ST.flash*2.6;sun.intensity=lerp(2.6,.22,k);
  const env=k>.5?ENV_STORM:ENV_CALM;if(scene.environment!==env)scene.environment=env;
  if(vortex){vortex.visible=k>.04;vortex.material.uniforms.uA.value=k;if(ST.vx!==undefined){const dx=ST.vx-P.pos.x,dz=ST.vz-P.pos.z,d=Math.hypot(dx,dz);if(d<95){ST.vx=P.pos.x+dx/d*95;ST.vz=P.pos.z+dz/d*95;}
    ST.vx+=Math.sin(G.t*.05)*dt*2;vortex.position.set(ST.vx,gH(clamp(ST.vx,-200,200),clamp(ST.vz,-200,200))-10,ST.vz);}}
  if(k>.35){ST.boltT-=dt;if(ST.boltT<=0){ST.boltT=rr(1.8,5.5)/k;const a=rr(0,TAU),r=rr(45,120),x=P.pos.x+Math.cos(a)*r,z=P.pos.z+Math.sin(a)*r;bolt(x,z,90);ST.flash=Math.max(ST.flash,.6+Math.random()*.4);sfx('thunder',V3(x,0,z));}}
  if(G.state!=='play')return;
  if(ST.phase==='storm'&&!P.dead){
    if(!P.inWard){P.hp-=(2.6+P.maxHp*.012)*dt;P.lastHit=G.t;if(P.hp<=0)playerDie();
      ST.strikeT-=dt;if(ST.strikeT<=0){ST.strikeT=rr(3.4,5.8);const x=P.pos.x+P.vel.x*.9+rr(-1.4,1.4),z=P.pos.z+P.vel.z*.9+rr(-1.4,1.4);
        STRIKES.push({x,z,t:1.05});groundRing(x,z,3.2,.4,1.05,new THREE.Color(1.4,.7,3.2),'tele');groundRing(x,z,2.7,2.7,1.05,new THREE.Color(.5,.25,1.2),'fill');sfx('tele',V3(x,P.pos.y,z));}}
    ST.spawnT-=dt;const nsp=E.filter(e=>e.type==='spirit'&&!e.dead).length,maxSp=Math.min(5,2+Math.floor(P.lvl/3));
    if(ST.spawnT<=0&&nsp<maxSp){ST.spawnT=rr(3.5,6);const a=rr(0,TAU),r=rr(15,21);const x=clamp(P.pos.x+Math.cos(a)*r,-WR,WR),z=clamp(P.pos.z+Math.sin(a)*r,-WR,WR);
      if(!SHRINES.some(s=>Math.hypot(x-s.x,z-s.z)<8)){const e=spawnEnemy('spirit',x,z,{tier:Math.min(3,Math.floor(P.lvl/3))});alertE(e);}}}}
function updStrikes(dt){for(let i=STRIKES.length-1;i>=0;i--){const s=STRIKES[i];s.t-=dt;if(s.t>0)continue;STRIKES.splice(i,1);bolt(s.x,s.z,80);ST.flash=1;sfx('thunder',V3(s.x,0,s.z));
  CAM.trauma=Math.min(1,CAM.trauma+.5);groundRing(s.x,s.z,2.6,2.6,18,new THREE.Color(0,0,0),'scorch');sparks(V3(s.x,gH(s.x,s.z)+.2,s.z),null,30,3,2.6,4,9);dust(V3(s.x,gH(s.x,s.z),s.z),10,1.3,[.25,.22,.3]);
  if(Math.hypot(P.pos.x-s.x,P.pos.z-s.z)<2.7&&!P.inWard)playerHit(24+P.maxHp*.08,V3(s.x,0,s.z),{unblock:true,knock:true});
  for(const e of E){if(!e.dead&&e.type!=='spirit'&&Math.hypot(e.pos.x-s.x,e.pos.z-s.z)<2.7)damageEnemy(e,{hit:new Set()},{mul:1.6,poise:40,heavy:true,proj:true},e.pos.x-s.x,e.pos.z-s.z);}}}

/* ============================== HUD ============================== */
const NUMS=[];let numPool=[];
function num(txt,pos,h,cls){if(!SET.nums&&!['parry','info'].includes(cls)&&cls!=='crit'&&!/[^0-9]/.test(txt)){return;}
  const d=numPool.pop()||document.createElement('div');d.className='num'+(cls?' '+cls:'');d.textContent=txt;$('nums').appendChild(d);
  NUMS.push({d,p:V3(pos.x+rr(-.25,.25),pos.y+h,pos.z+rr(-.25,.25)),t:0,vx:rr(-20,20)});if(NUMS.length>28){const o=NUMS.shift();o.d.remove();numPool.push(o.d);}}
let bannerT=0;
function banner(t,s,cls){$('bannerTitle').textContent=t;$('bannerSub').textContent=s||'';const b=$('banner');b.className='show'+(cls?' '+cls:'');bannerT=3.6;}
function toast(h){const d=document.createElement('div');d.className='toast';d.innerHTML=h;$('toasts').appendChild(d);setTimeout(()=>d.remove(),4300);while($('toasts').children.length>3)$('toasts').firstChild.remove();}
let hintT=0;function hint(h,dur=5){const e=$('hint');e.innerHTML=h;e.classList.add('show');hintT=dur;}
const _pv=V3();
function toScreen(p,out){_pv.copy(p).project(camera);if(_pv.z>1||_pv.z<-1)return false;out.x=(_pv.x*.5+.5)*viewW();out.y=(-_pv.y*.5+.5)*viewH();return true;}
const _sp={x:0,y:0};
const CMP={el:null,items:[]};
function buildCompass(){const el=$('compass');CMP.el=el;el.innerHTML='';const W=[['N',0],['O',PI/2],['S',PI],['E',-PI/2]];
  for(let i=0;i<24;i++){const a=i/24*TAU;const isC=i%6===0;const n=document.createElement('div');if(isC){n.className='c';n.textContent=W.find(w=>Math.abs(angD(w[1],a))<.01)[0];}else if(i%3===0){n.className='c minor';n.textContent=String((360-i*15)%360);}else n.className='t';
    el.appendChild(n);CMP.items.push({n,a,kind:'tick'});}
  CAMPS.forEach((c,i)=>{const n=document.createElement('div');n.className='m camp';el.appendChild(n);CMP.items.push({n,x:c.x,z:c.z,kind:'camp',i});});
  SHRINES.forEach((s)=>{const n=document.createElement('div');n.className='m shrine';el.appendChild(n);CMP.items.push({n,x:s.x,z:s.z,kind:'shrine'});});
  const ob=document.createElement('div');ob.className='m obj';el.appendChild(ob);CMP.obj={n:ob};}
function updCompass(objP){const W=CMP.el.clientWidth||400,half=W/2;const yaw=CAM.yaw;
  for(const it of CMP.items){let a;if(it.kind==='tick')a=angD(yaw,it.a);else{const dx=it.x-P.pos.x,dz=it.z-P.pos.z;const d=Math.hypot(dx,dz);a=angD(yaw,yawTo(dx,dz));
      if(it.kind==='shrine'){it.n.style.opacity=d>140?0:(d<6?.3:1);}if(it.kind==='camp'){it.n.classList.toggle('done',P.cleared[it.i]);}}
    const x=half-a/(PI*.55)*half;it.n.style.display=Math.abs(a)>PI*.6?'none':'block';it.n.style.left=x+'px';}
  if(objP){const dx=objP.x-P.pos.x,dz=objP.z-P.pos.z,d=Math.hypot(dx,dz),a=angD(yaw,yawTo(dx,dz));const x=half-clamp(a/(PI*.55),-1,1)*half;
    CMP.obj.n.style.display='block';CMP.obj.n.style.left=x+'px';$('compassDist').textContent=Math.round(d)+' m';$('compassDist').style.display=d>8?'block':'none';}
  else{CMP.obj.n.style.display='none';$('compassDist').style.display='none';}}
function nearestShrine(){let b=null,bd=1e9;for(const s of SHRINES){const d=Math.hypot(P.pos.x-s.x,P.pos.z-s.z);if(d<bd){bd=d;b=s;}}return[b,bd];}
function objective(){
  if((ST.phase==='warn'||ST.phase==='storm')&&!P.inWard){const[s,d]=nearestShrine();return{t:'Raggiungi un santuario: '+s.name,p:s};}
  for(let i=0;i<4;i++)if(P.cleared[i]&&!P.chests[i])return{t:'Apri il forziere: '+CAMPS[i].name,p:{x:CAMPS[i].chest.x,z:CAMPS[i].chest.z}};
  let best=-1;for(let i=0;i<4;i++)if(!P.cleared[i]){best=i;break;}
  if(best<0)return{t:'La valle è libera',p:null};const n=P.cleared.filter(Boolean).length;
  return{t:'Distruggi '+CAMPS[best].name+' ('+n+'/4)',p:CAMPS[best]};}
const EBARS=[],HUDC={};
function updHUD(rdt){
  const hw=Math.min(380,220+(P.maxHp-100)*1.1),sw=Math.min(360,200+(P.maxSt-100)*1.2);
  if(viewW()>640){$('hpBar').style.width=hw+'px';$('stBar').style.width=sw+'px';}
  const hr=clamp(P.hp/P.maxHp,0,1);P.chipT=(P.chipT||0)-rdt;if(P.chipT<=0)P.chip=damp(P.chip,P.hp,4,rdt);if(P.chip<P.hp)P.chip=P.hp;
  $('hpFill').style.transform=`scaleX(${hr})`;$('hpChip').style.transform=`scaleX(${clamp(P.chip/P.maxHp,0,1)})`;
  $('stFill').style.transform=`scaleX(${clamp(P.st/P.maxSt,0,1)})`;
  const lt=P.lvl;if(HUDC.lvl!==lt){if(HUDC.lvl!==undefined)bump(document.querySelector('.medal'));HUDC.lvl=lt;$('lvl').textContent=lt;}
  if(HUDC.br!==P.braci){HUDC.br=P.braci;$('braciN').textContent=P.braci;}
  if(HUDC.fl!==P.flasks){if(HUDC.fl!==undefined)bump($('flaskSlot'));HUDC.fl=P.flasks;$('flaskN').textContent=P.flasks;$('flaskSlot').classList.toggle('off',P.flasks<=0);}
  updOrbs(rdt);
  const ob=objective();$('objText').textContent=ob.t;updCompass(ob.p);
  const sl=$('stormLine'),t=Math.ceil(ST.t),ts=Math.floor(t/60)+':'+String(t%60).padStart(2,'0');
  if(ST.phase==='calm'){sl.className='';sl.textContent='Prossima tempesta tra '+ts;}else if(ST.phase==='warn'){sl.className='warn';sl.textContent='Tempesta tra '+ts;}
  else if(ST.phase==='storm'){sl.className=P.inWard?'safe':'on';sl.textContent=(P.inWard?'Al sicuro · ':'Allo scoperto · ')+ts;}else{sl.className='';sl.textContent='Il cielo si schiarisce';}
  let boss=null;for(const e of E)if(e.boss&&!e.dead&&e.aggro&&e.dist<45){boss=e;break;}
  const bb=$('boss');if(boss){bb.hidden=false;$('bossName').innerHTML=boss.name+(boss.phase>1?'<small>infuriato</small>':'');$('bossFill').style.transform=`scaleX(${clamp(boss.hp/boss.maxHp,0,1)})`;
    boss.chip=boss.chip===undefined?boss.hp:damp(boss.chip,boss.hp,3,rdt);$('bossChip').style.transform=`scaleX(${clamp(boss.chip/boss.maxHp,0,1)})`;$('bossBar').classList.toggle('enraged',boss.phase>1);}else bb.hidden=true;
  let bi=0;for(const e of E){if(e.dead||e.boss||!e.active||e.barT<=0||e.dist>32)continue;_v1.set(e.pos.x,e.pos.y+(e.fly||0)+e.h+.35,e.pos.z);if(!toScreen(_v1,_sp))continue;
    let el=EBARS[bi];if(!el){el=document.createElement('div');el.style.cssText='position:absolute;left:0;top:0;width:54px;height:5px;margin-left:-27px;background:rgba(0,0,0,.6);border:1px solid rgba(236,229,211,.25)';
      const f=document.createElement('i');f.style.cssText='display:block;height:100%;background:linear-gradient(180deg,#d6553b,#8a1d12);transform-origin:left';el.appendChild(f);$('nums').appendChild(el);EBARS.push(el);}
    el.style.display='block';el.style.transform=`translate(${_sp.x}px,${_sp.y}px)`;el.firstChild.style.transform=`scaleX(${clamp(e.hp/e.maxHp,0,1)})`;el.style.opacity=Math.min(1,e.barT);bi++;}
  for(let i=bi;i<EBARS.length;i++)EBARS[i].style.display='none';
  const lk=$('lock');if(P.lock&&!P.lock.dead&&!G.fp){_v1.set(P.lock.pos.x,P.lock.pos.y+(P.lock.fly||0)+P.lock.h*.6,P.lock.pos.z);if(toScreen(_v1,_sp)){lk.hidden=false;lk.style.transform=`translate(${_sp.x}px,${_sp.y}px)`;}else lk.hidden=true;}else lk.hidden=true;
  for(let i=NUMS.length-1;i>=0;i--){const n=NUMS[i];n.t+=rdt;n.p.y+=rdt*.9;if(n.t>1.0||!toScreen(n.p,_sp)){n.d.remove();numPool.push(n.d);NUMS.splice(i,1);continue;}
    const s=n.t<.12?1+(.12-n.t)*4:1;n.d.style.transform=`translate(${_sp.x+n.vx*n.t-20}px,${_sp.y-12}px) scale(${s})`;n.d.style.opacity=1-Math.max(0,n.t-.65)/.35;}
  if(bannerT>0){bannerT-=rdt;if(bannerT<=0)$('banner').classList.remove('show');}
  if(hintT>0){hintT-=rdt;if(hintT<=0)$('hint').classList.remove('show');}
  const ch=$('charge');if(P.act&&P.act.k==='charge'){ch.style.opacity=1;$('chargeF').style.width=Math.min(100,P.act.t/1.0*100)+'%';$('chargeF').style.background=P.act.t>=1?'#fff':'';}else ch.style.opacity=0;
}
/* ---------- interaction ---------- */
let interactT=null;
function updInteract(){interactT=null;if(P.dead||P.act&&P.act.k!=='block')return showPrompt(null);
  for(let i=0;i<4;i++){const c=CAMPS[i].chest;if(c.open)continue;if(Math.hypot(P.pos.x-c.x,P.pos.z-c.z)<2.4){interactT={k:'chest',i,locked:!P.cleared[i]};break;}}
  if(!interactT){for(const s of SHRINES){if(Math.hypot(P.pos.x-s.x,P.pos.z-s.z)<2.9){interactT={k:'shrine',s};break;}}}
  if(!interactT)return showPrompt(null);
  if(interactT.k==='chest')showPrompt(interactT.locked?'Bloccato: sconfiggi '+CAMPS[interactT.i].boss:'Apri il forziere',!interactT.locked);
  else showPrompt(E.some(e=>!e.dead&&e.aggro&&e.dist<14)?'Non puoi riposare con nemici vicini':'Riposa: '+interactT.s.name,!E.some(e=>!e.dead&&e.aggro&&e.dist<14));
  if(IN.actP){if(interactT.k==='chest'&&!interactT.locked)openChest(interactT.i);
    else if(interactT.k==='shrine'&&!E.some(e=>!e.dead&&e.aggro&&e.dist<14)){startAct('rest',{shrine:interactT.s});P.yaw=yawTo(interactT.s.x-P.pos.x,interactT.s.z-P.pos.z);}}}
function showPrompt(t,ok=true){const p=$('prompt');if(!t){p.hidden=true;if(isTouch)$('tAct').hidden=true;return;}p.hidden=false;$('promptText').textContent=t;$('promptKey').hidden=!ok||isTouch;p.style.opacity=ok?1:.7;if(isTouch)$('tAct').hidden=!ok;}

/* ============================== input ============================== */
const KEYS={};let hadLock=false;
addEventListener('keydown',e=>{if(e.repeat&&!['KeyW','KeyA','KeyS','KeyD'].includes(e.code)){if(e.code==='Space'||e.code==='Tab')e.preventDefault();return;}KEYS[e.code]=true;
  if(G.state==='play'){if(e.code==='Space'){e.preventDefault();IN.dodgeP=true;}if(e.code==='Tab'){e.preventDefault();IN.lockP=true;}
    if(e.code==='KeyE')IN.actP=true;if(e.code==='KeyR')IN.flaskP=true;if(e.code==='KeyF')IN.lockP=true;if(e.code==='KeyV')IN.viewP=true;
    if(e.code==='KeyJ'){IN.atk=true;IN.atkP=true;}if(e.code==='KeyK'){IN.blk=true;IN.blkP=true;}if(e.code==='KeyL')IN.dodgeP=true;
    if(e.code==='KeyQ'){IN.hvy=true;IN.hvyP=true;}if(e.code==='KeyC')IN.lockSwitch=1;if(e.code==='KeyX')IN.lockSwitch=-1;
    if(e.code==='Escape'||e.code==='KeyP')IN.pauseP=true;}
  else if(e.code==='KeyP'&&G.state==='pause')resume();
  else menuKey(e);});
addEventListener('keyup',e=>{KEYS[e.code]=false;if(e.code==='KeyJ')IN.atk=false;if(e.code==='KeyK')IN.blk=false;if(e.code==='KeyQ')IN.hvy=false;});
addEventListener('blur',()=>{for(const k in KEYS)KEYS[k]=false;IN.atk=IN.blk=IN.hvy=false;if(G.state==='play'&&!isTouch)pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G.state==='play')pause();});
canvas.addEventListener('mousedown',e=>{if(G.state!=='play'||isTouch)return;audioInit();
  if(document.pointerLockElement!==canvas&&canvas.requestPointerLock){try{const p=canvas.requestPointerLock();if(p&&p.catch)p.catch(()=>{});}catch(_){}}
  if(e.button===0){IN.atk=true;IN.atkP=true;}if(e.button===2){IN.blk=true;IN.blkP=true;}if(e.button===1){e.preventDefault();IN.lockP=true;}});
addEventListener('mouseup',e=>{if(e.button===0)IN.atk=false;if(e.button===2)IN.blk=false;});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement===canvas)hadLock=true;else if(hadLock&&G.state==='play'){hadLock=false;pause();}});
let lockAcc=0;
addEventListener('mousemove',e=>{if(G.state!=='play'||isTouch)return;const k=.0023;const mx=(e.movementX||0),my=(e.movementY||0);
  if(Math.abs(mx)>200||Math.abs(my)>200)return;
  if(P.lock&&!G.fp){lockAcc+=mx;if(Math.abs(lockAcc)>110){IN.lockSwitch=lockAcc>0?-1:1;lockAcc=0;}IN.lookY+=my*k;}else{IN.lookX+=mx*k;IN.lookY+=my*k;}});
setInterval(()=>{lockAcc*=.5;},120);
let wheelT=0;canvas.addEventListener('wheel',e=>{if(G.state!=='play'||!P.lock)return;const n=performance.now();if(n-wheelT<160)return;wheelT=n;IN.lockSwitch=e.deltaY>0?-1:1;},{passive:true});
function readKeys(dt){if(isTouch&&!KEYS.KeyW&&!KEYS.KeyA&&!KEYS.KeyS&&!KEYS.KeyD&&TOUCH.joy.id!==null){IN.mx=TOUCH.joy.x;IN.mz=-TOUCH.joy.y;}
  else if(TOUCH.joy.id!==null){IN.mx=TOUCH.joy.x;IN.mz=-TOUCH.joy.y;}
  else{IN.mx=(KEYS.KeyD?1:0)-(KEYS.KeyA?1:0);IN.mz=(KEYS.KeyW?1:0)-(KEYS.KeyS?1:0);}
  IN.sprint=!!(KEYS.ShiftLeft||KEYS.ShiftRight)||TOUCH.sprint;
  const ak=2.2*dt;if(KEYS.ArrowLeft)IN.lookX-=ak;if(KEYS.ArrowRight)IN.lookX+=ak;if(KEYS.ArrowUp)IN.lookY-=ak*.7;if(KEYS.ArrowDown)IN.lookY+=ak*.7;
  if(IN.atk)IN.atkHeld+=dt;else IN.atkHeld=0;
  pollPad(dt);}
/* ---------- gamepad ---------- */
const PAD={prev:[]};
function pollPad(dt){let gp=null;try{const l=navigator.getGamepads?navigator.getGamepads():[];for(const g of l)if(g&&g.connected){gp=g;break;}}catch(e){}if(!gp)return;
  const b=i=>!!(gp.buttons[i]&&gp.buttons[i].pressed),pr=i=>b(i)&&!PAD.prev[i];const dz=v=>Math.abs(v)<.18?0:(v-Math.sign(v)*.18)/.82;
  const lx=dz(gp.axes[0]||0),ly=dz(gp.axes[1]||0),rx=dz(gp.axes[2]||0),ry=dz(gp.axes[3]||0);
  if(Math.abs(lx)+Math.abs(ly)>0){IN.mx=lx;IN.mz=-ly;}
  if(G.state==='play'){IN.lookX+=rx*2.6*dt;IN.lookY+=ry*1.9*dt;if(P.lock&&Math.abs(rx)>.8&&!PAD.flick){PAD.flick=1;IN.lockSwitch=rx>0?-1:1;}if(Math.abs(rx)<.3)PAD.flick=0;
    if(pr(5))IN.atkP=true;IN.atk=IN.atk||b(5);if(pr(7))IN.hvyP=true;IN.hvy=IN.hvy||b(7);if(pr(4)||pr(6))IN.blkP=true;IN.blk=IN.blk||b(4)||b(6);if(pr(1))IN.dodgeP=true;if(pr(0))IN.actP=true;if(pr(2))IN.flaskP=true;if(pr(3))IN.viewP=true;
    if(pr(11))IN.lockP=true;if(pr(9))IN.pauseP=true;if(b(10)||(b(1)&&PAD.bHeld>.35))IN.sprint=true;PAD.bHeld=b(1)?(PAD.bHeld||0)+dt:0;}
  else if(pr(9)&&G.state==='pause')resume();
  else padMenu(pr,lx,ly);
  PAD.prev=gp.buttons.map(x=>x.pressed);if(!PAD.seen){PAD.seen=1;toast('Controller collegato');}}
/* ---------- touch ---------- */
const TOUCH={joy:{id:null,ox:0,oy:0,x:0,y:0,t:0},look:{id:null,lx:0,ly:0},sprint:false};
function initTouch(){const z=$('touchZone'),J=$('joy'),K=$('joyK');
  // all positions in game space (touchXY), so the stick and the look drag follow what the player sees when the layout is rotated
  z.addEventListener('pointerdown',e=>{if(G.state!=='play')return;audioInit();e.preventDefault();const p=touchXY(e);
    if(p.x<viewW()*.42&&TOUCH.joy.id===null){TOUCH.joy.id=e.pointerId;TOUCH.joy.ox=p.x;TOUCH.joy.oy=p.y;TOUCH.joy.x=TOUCH.joy.y=0;TOUCH.joy.t=0;J.style.display='block';J.style.left=p.x+'px';J.style.top=p.y+'px';K.style.transform='';}
    else if(TOUCH.look.id===null){TOUCH.look.id=e.pointerId;TOUCH.look.lx=p.x;TOUCH.look.ly=p.y;}
    try{z.setPointerCapture(e.pointerId);}catch(_){}});
  z.addEventListener('pointermove',e=>{const j=TOUCH.joy,p=touchXY(e);if(e.pointerId===j.id){let dx=p.x-j.ox,dy=p.y-j.oy;const l=Math.hypot(dx,dy),m=52;if(l>m){dx*=m/l;dy*=m/l;}j.x=dx/m;j.y=dy/m;K.style.transform=`translate(${dx}px,${dy}px)`;}
    else if(e.pointerId===TOUCH.look.id){const L=TOUCH.look;const mx=p.x-L.lx,my=p.y-L.ly;if(P.lock&&!G.fp){if(Math.abs(mx)>40){IN.lockSwitch=mx>0?-1:1;L.lx=p.x;}}else IN.lookX+=mx*.0065;IN.lookY+=my*.005;if(!P.lock||G.fp)L.lx=p.x;L.ly=p.y;}});
  const end=e=>{if(e.pointerId===TOUCH.joy.id){TOUCH.joy.id=null;TOUCH.joy.x=TOUCH.joy.y=0;J.style.display='none';TOUCH.sprint=false;}if(e.pointerId===TOUCH.look.id)TOUCH.look.id=null;};
  z.addEventListener('pointerup',end);z.addEventListener('pointercancel',end);
  const btn=(id,down,up)=>{const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();audioInit();b.classList.add('on');try{b.setPointerCapture(e.pointerId);}catch(_){}down();});
    const u=()=>{b.classList.remove('on');if(up)up();};b.addEventListener('pointerup',u);b.addEventListener('pointercancel',u);b.addEventListener('contextmenu',e=>e.preventDefault());};
  btn('tAtk',()=>{IN.atk=true;IN.atkP=true;},()=>{IN.atk=false;});btn('tHvy',()=>{IN.hvy=true;IN.hvyP=true;},()=>{IN.hvy=false;});btn('tBlk',()=>{IN.blk=true;IN.blkP=true;},()=>{IN.blk=false;});btn('tDdg',()=>{IN.dodgeP=true;});
  btn('tFlk',()=>{IN.flaskP=true;});btn('tLck',()=>{IN.lockP=true;});btn('tAct',()=>{IN.actP=true;});btn('tView',()=>{IN.viewP=true;});btn('tPause',()=>{IN.pauseP=true;});}
function updTouchSprint(dt){const j=TOUCH.joy;if(j.id!==null&&Math.hypot(j.x,j.y)>.96){j.t+=dt;if(j.t>.9)TOUCH.sprint=true;}else{j.t=0;TOUCH.sprint=false;}}

/* ============================== menus ============================== */
const SCREENS=['title','charsel','pause','settings','controls','levelup','shrineMenu','death','victory'];let settingsBack='title';
function showScreen(id){for(const s of SCREENS)$(s).hidden=s!==id;$('fpCross').hidden=!(G.fp&&G.state==='play');for(const o of document.querySelectorAll('.padf'))o.classList.remove('padf');}
/* ---------- menu navigation shared by keyboard (arrows, Esc) and controller (d-pad/stick, A, B); a screen's data-back names its "back" button ---------- */
function menuScreen(){for(const id of SCREENS){const s=$(id);if(s&&!s.hidden)return s;}return null;}
function menuButtons(s){return[...s.querySelectorAll('button')].filter(b=>!b.disabled&&!b.hidden&&b.offsetParent!==null);}
function menuFocus(b){for(const o of document.querySelectorAll('.padf'))o.classList.remove('padf');if(!b)return;try{b.focus({preventScroll:true});}catch(_){b.focus();}b.classList.add('padf');}
function menuMove(d){const s=menuScreen();if(!s)return;const L=menuButtons(s);if(!L.length)return;let i=L.indexOf(document.activeElement);
  i=i<0?(d>0?0:L.length-1):(i+d+L.length)%L.length;menuFocus(L[i]);sfx('ui');}
function menuPress(){const s=menuScreen();if(!s)return;const L=menuButtons(s);if(!L.length)return;const a=document.activeElement;(L.includes(a)?a:L[0]).click();}
function menuBack(){const s=menuScreen(),id=s&&s.dataset.back,b=id&&$(id);if(b&&!b.disabled)b.click();}
function menuKey(e){if(!menuScreen())return;if(e.code==='Escape'){e.preventDefault();menuBack();return;}
  const a=document.activeElement;if(a&&a!==document.body&&a.tagName!=='BUTTON')return;
  const d=e.code==='ArrowDown'||e.code==='ArrowRight'?1:e.code==='ArrowUp'||e.code==='ArrowLeft'?-1:0;if(d){e.preventDefault();menuMove(d);}}
function padMenu(pr,lx,ly){const yv=ly<-.5?-1:ly>.5?1:0,xv=lx<-.5?-1:lx>.5?1:0;let d=0;
  if(pr(12)||pr(14)||(yv<0&&PAD.my!==-1)||(xv<0&&PAD.mx!==-1))d=-1;else if(pr(13)||pr(15)||(yv>0&&PAD.my!==1)||(xv>0&&PAD.mx!==1))d=1;PAD.my=yv;PAD.mx=xv;
  if(d)menuMove(d);if(pr(0))menuPress();else if(pr(1))menuBack();}
function pause(){if(G.state!=='play')return;G.state='pause';showScreen('pause');IN.atk=IN.blk=IN.hvy=false;if(document.pointerLockElement)document.exitPointerLock();}
function resume(){G.state='play';showScreen(null);$('hud').hidden=false;if(!isTouch){try{const p=canvas.requestPointerLock&&canvas.requestPointerLock();if(p&&p.catch)p.catch(()=>{});}catch(_){}}setView(G.fp);}
function fillControls(){const pc=[['Muoversi',['W','A','S','D']],['Visuale','Mouse · frecce'],['Correre',['Shift']],['Attacco (combo di 4)',['Clic sinistro']],['Colpo pesante · tieni premuto: rotante caricato',['Q']],
    ['Parata (deviazione al momento giusto)',['Clic destro']],['Schivata con invulnerabilità',['Spazio']],['Fiaschetta di cura',['R']],['Interagisci · riposa',['E']],['Aggancia bersaglio',['Tab','F']],['Cambia bersaglio','Rotella · muovi il mouse · C / X'],['Prima / terza persona',['V']],['Pausa',['Esc']]];
  const tc=[['Muoversi','Pollice sinistro'],['Visuale','Trascina a destra'],['Correre','Spingi il pollice al bordo'],['Attacco (combo di 4)','Tocca la spada'],['Colpo pesante','Ascia · tienila premuta per caricare'],['Parata','Scudo'],['Schivata','Freccia curva'],['Fiaschetta','Ampolla rossa'],['Aggancia','Mirino'],['Interagisci','Compare quando serve']];
  const gp=[['Attacco','RB'],['Colpo pesante · caricato','RT · tieni RT'],['Parata','LB'],['Schivata','B (tieni: corsa)'],['Fiaschetta','X'],['Interagisci','A'],['Aggancia','R3'],['Visuale','Y'],['Pausa','Start']];
  const rows=(isTouch?tc:pc).concat(isTouch?[]:gp.map(r=>['Controller · '+r[0],r[1]]));
  $('keysList').innerHTML=rows.map(([a,b])=>`<div class="row"><span>${a}</span><span>${Array.isArray(b)?b.map(k=>`<kbd>${k}</kbd>`).join(''):b}</span></div>`).join('');}
function syncSettingsUI(){const seg=(id,v)=>{for(const b of $(id).querySelectorAll('button'))b.classList.toggle('on',b.dataset.v===String(v));};
  seg('sQuality',SET.quality);seg('sView',G.fp?'fp':'tp');seg('sInv',SET.invertY?'1':'0');seg('sNums',SET.nums?'1':'0');seg('sFps',SET.fps?'1':'0');$('sSens').value=SET.sens;$('sMusic').value=SET.music;$('sSfx').value=SET.sfx;}
function initMenus(){
  // "Nuova partita" opens the character select (still over the title camera); the choice starts the game with that body
  $('mNew').onclick=()=>{sfx('ui');lockLandscape();showScreen('charsel');menuFocus($('csM'));};$('mContinue').onclick=()=>{sfx('ui');lockLandscape();startGame(true);};
  $('csM').onclick=()=>{sfx('ui');startGame(false,'m');};$('csF').onclick=()=>{sfx('ui');startGame(false,'f');};
  $('csBack').onclick=()=>{sfx('ui');showScreen('title');menuFocus($('mNew'));};
  $('mSettings').onclick=()=>{settingsBack='title';syncSettingsUI();showScreen('settings');};$('mControls').onclick=()=>{settingsBack='title';fillControls();showScreen('controls');};
  $('pResume').onclick=()=>resume();$('pSettings').onclick=()=>{settingsBack='pause';syncSettingsUI();showScreen('settings');};$('pControls').onclick=()=>{settingsBack='pause';fillControls();showScreen('controls');};
  $('pTitle').onclick=()=>{save();showTitle();};
  $('sBack').onclick=()=>showScreen(settingsBack);$('cBack').onclick=()=>showScreen(settingsBack);
  $('sQuality').onclick=e=>{const v=e.target.dataset&&e.target.dataset.v;if(!v)return;SET.quality=v;saveSettings();applyQuality();syncSettingsUI();};
  $('sView').onclick=e=>{const v=e.target.dataset&&e.target.dataset.v;if(!v)return;SET.fp=v==='fp';saveSettings();setView(SET.fp);syncSettingsUI();};
  $('sInv').onclick=e=>{const v=e.target.dataset&&e.target.dataset.v;if(!v)return;SET.invertY=v==='1';saveSettings();syncSettingsUI();};
  $('sNums').onclick=e=>{const v=e.target.dataset&&e.target.dataset.v;if(!v)return;SET.nums=v==='1';saveSettings();syncSettingsUI();};
  $('sFps').onclick=e=>{const v=e.target.dataset&&e.target.dataset.v;if(!v)return;SET.fps=v==='1';saveSettings();syncSettingsUI();$('fps').hidden=!SET.fps;};$('fps').hidden=!SET.fps;
  $('sSens').oninput=e=>{SET.sens=+e.target.value;saveSettings();};$('sMusic').oninput=e=>{SET.music=+e.target.value;saveSettings();setVolumes();};$('sSfx').oninput=e=>{SET.sfx=+e.target.value;saveSettings();setVolumes();};
  for(const c of document.querySelectorAll('#levelup .card'))c.onclick=()=>pickStat(c.dataset.stat);
  $('luBack').onclick=()=>{sfx('ui');openShrineMenu();};$('smLevel').onclick=()=>{sfx('ui');openLevelUp();};$('smLeave').onclick=()=>{sfx('ui');resume();};
  $('dRetry').onclick=()=>respawn();$('vCont').onclick=()=>{G.state='play';resume();};$('vTitle').onclick=()=>showTitle();
  if(isTouch)initTouch();}
/* ============================== save ============================== */
// save data v4: a new key, so v2/v3 games (made for the old world) are never read nor deleted; settings live in their own key
const SAVE_K='stormblade.save.v4';
function save(){lsSet(SAVE_K,{v:CFG.ver,hero:P.hero,stats:P.stats,braci:P.braci,drop:P.drop,sword:P.sword,flasks:P.flasks,flaskMax:P.flaskMax,shrine:P.shrine,kills:P.kills,
  time:G.playTime,quests:P.quests,flags:P.flags,cleared:P.cleared,chests:P.chests,tips:{p:P.parryTip,s:P.stormTip}});}
function readSave(){const s=lsGet(SAVE_K);return s&&typeof s==='object'&&s.v===CFG.ver?s:null;}
function resetPlayer(){Object.assign(P,{hero:'m',stats:{vig:1,end:1,str:1},braci:0,drop:null,sword:0,flaskMax:CFG.flask.start,cleared:[false,false,false,false],chests:[false,false,false,false],
  shrine:0,kills:0,quests:{},flags:{}});G.playTime=0;G.won=false;syncDrop();}
function loadSave(){const s=readSave();if(!s)return false;resetPlayer();
  const st=s.stats,d=s.drop,okSt=st&&['vig','end','str'].every(k=>st[k]>=1),okD=d&&isFinite(d.x)&&isFinite(d.z)&&d.amount>0;
  Object.assign(P,{hero:s.hero==='f'?'f':'m',stats:okSt?{vig:st.vig|0,end:st.end|0,str:st.str|0}:P.stats,braci:Math.max(0,Math.round(+s.braci||0)),
    drop:okD?{x:+d.x,z:+d.z,amount:Math.round(d.amount)}:null,sword:s.sword||0,flasks:s.flasks||0,flaskMax:s.flaskMax||CFG.flask.start,
    cleared:s.cleared||P.cleared,chests:s.chests||P.chests,shrine:s.shrine||0,kills:s.kills||0,quests:s.quests&&typeof s.quests==='object'?s.quests:{},flags:s.flags&&typeof s.flags==='object'?s.flags:{}});
  G.playTime=s.time||0;if(s.tips){P.parryTip=s.tips.p;P.stormTip=s.tips.s;}syncDrop();return true;}
/* ============================== flow ============================== */
function syncWorldToSave(){CAMPS.forEach((c,i)=>{const ch=c.chest;ch.open=!!P.chests[i];ch.t=ch.open?1:0;ch.lid.rotation.x=ch.open?-1.9:0;ch.light.i=P.cleared[i]&&!ch.open?2.4:0;});}
function startGame(cont,hero){audioInit();if(!(cont&&loadSave())){resetPlayer();P.hero=hero==='f'?'f':'m';}if(!cont)lsDel(SAVE_K);
  setHero(P.hero);
  recalcStats();P.hp=P.maxHp;P.st=P.maxSt;P.flasks=P.flaskMax;P.dead=false;P.act=null;P.lock=null;P.chip=P.hp;P.heal=0;setSword(P.sword);syncWorldToSave();
  placeAtShrine(P.shrine);spawnWorld();Object.assign(ST,{phase:'calm',t:cont?95:150,k:0});STRIKES.length=0;
  G.state='play';showScreen(null);$('hud').hidden=false;$('touch').hidden=!isTouch;setView(SET.fp);resume();
  banner('Valle di Cenere',cont?'Bentornato, viandante':'Distruggi i quattro accampamenti dei goblin');sfx('banner');
  if(!cont){tutorial=0;tutT=4.4;}else tutorial=99;}
let tutorial=99,tutT=0;
const TUT_PC=['<span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> muovi</span><span><kbd>Shift</kbd> corri</span><span>Mouse visuale</span>',
  '<span><kbd>Clic</kbd> combo</span><span><kbd>Q</kbd> colpo pesante, tieni per caricare</span><span><kbd>Tab</kbd> aggancia</span>',
  '<span><kbd>Destro</kbd> al bagliore dell\'arma: deviazione</span><span><kbd>Spazio</kbd> schiva all\'ultimo: schivata perfetta</span>',
  '<span><kbd>R</kbd> fiaschetta</span><span><kbd>E</kbd> riposa ai santuari</span><span><kbd>V</kbd> prima persona</span>'];
const TUT_T=['<span>Pollice sinistro: muovi</span><span>Trascina a destra: visuale</span>','<span>Spada: combo</span><span>Ascia: colpo pesante, tienila per caricare</span>','<span>Scudo al bagliore dell\'arma: deviazione</span><span>Freccia all\'ultimo: schivata perfetta</span>','<span>Ampolla: cura</span><span>Riposa ai santuari per salvare</span>'];
function updTutorial(rdt){if(tutorial>=4)return;tutT-=rdt;if(tutT<=0&&bannerT<=0){hint((isTouch?TUT_T:TUT_PC)[tutorial],6.5);tutorial++;tutT=9;}}
function respawn(){P.dead=false;recalcStats();P.hp=P.maxHp;P.st=P.maxSt;P.flasks=P.flaskMax;P.act=null;P.lock=null;P.chip=P.hp;P.heal=0;
  placeAtShrine(P.shrine);spawnWorld();Object.assign(ST,{phase:'calm',t:110});ST.k=0;STRIKES.length=0;Post.u.desat.value=0;
  G.state='play';showScreen(null);resume();banner(SHRINES[P.shrine].name,'Ti sei rialzato');}
function showTitle(){G.state='title';$('hud').hidden=true;showScreen('title');$('loading').hidden=true;const s=readSave();const mc=$('mContinue');
  if(s){mc.hidden=false;const lv=(s.stats?s.stats.vig+s.stats.end+s.stats.str-2:1);$('mContinueInfo').textContent='Livello '+lv+' · '+(s.cleared?s.cleared.filter(Boolean).length:0)+' accampamenti su 4';}else mc.hidden=true;
  if(document.pointerLockElement)document.exitPointerLock();placeAtShrine(0);setTimeout(()=>{const b=mc.hidden?$('mNew'):mc;b.focus();},60);}
let titleA=0;
function titleCam(rdt){titleA+=rdt*.045;const cx=4,cz=8,R=17;const x=cx+Math.cos(titleA)*R,z=cz+Math.sin(titleA)*R;camera.position.set(x,gH(x,z)+3.6,z);
  camera.lookAt(0,gH(0,0)+2.2,0);U.player.value.set(x,gH(x,z),z);}
/* ============================== main loop ============================== */
let last=performance.now();const _db=new THREE.Vector2();
const FPS={n:0,t:0,v:0,worst:0,el:null};
function fpsTick(dt){FPS.n++;FPS.t+=dt;if(dt>FPS.worst)FPS.worst=dt;if(FPS.t>=.5){FPS.v=Math.round(FPS.n/FPS.t);if(SET.fps){FPS.el=FPS.el||$('fps');FPS.el.textContent=FPS.v+' FPS · picco '+Math.round(FPS.worst*1000)+' ms';}FPS.n=0;FPS.t=0;FPS.worst=0;}}
function frame(now){requestAnimationFrame(frame);let rdt=(now-last)/1000;last=now;if(!(rdt>0))return;fpsTick(rdt);rdt=Math.min(rdt,.05);tick(rdt,true);}
function tick(rdt,doRender){
  readKeys(rdt);if(isTouch)updTouchSprint(rdt);
  let ts=1;if(G.hitstop>0){G.hitstop-=rdt;ts=.05;}else if(G.slow>0){G.slow-=rdt;ts=lerp(1,G.slowS,clamp(G.slow/.35,0,1));}
  const playing=G.state==='play'||G.state==='dying',title=G.state==='title';
  const dt=(playing||title)?rdt*ts:0;G.t+=dt;U.time.value+=dt;if(G.cine>0)G.cine-=rdt;
  if(playing){G.playTime+=dt;
    if(G.state==='play'){if(IN.pauseP){pause();}if(IN.viewP){setView(!G.fp);SET.fp=G.fp;saveSettings();}if(IN.lockP)toggleLock();if(IN.lockSwitch)switchLock(IN.lockSwitch);updTutorial(rdt);}
    updPlayer(dt);updEnemies(dt);updProjectiles(dt);updStorm(dt);updStrikes(dt);updDrop(dt);if(G.state==='play')updInteract();
    updCamera(rdt,dt);}
  else if(title){titleCam(rdt);animPlayer(dt);updStorm(0);}
  camera.updateMatrixWorld();
  sky.position.copy(camera.position);fill.position.copy(camera.position).add(_v1.set(0,2,0));fill.target.position.copy(P.pos);fill.target.updateMatrixWorld();
  const tg=P.pos;const tex=(SHR*2)/(Q.shadow||1024);_v1.copy(tg);_v2.copy(SUN_DIR).negate();_v3.crossVectors(_v2,_up).normalize();_v4.crossVectors(_v3,_v2);
  const sx=Math.round(_v1.dot(_v3)/tex)*tex,sy=Math.round(_v1.dot(_v4)/tex)*tex,sz=_v1.dot(_v2);
  sun.target.position.set(0,0,0).addScaledVector(_v3,sx).addScaledVector(_v4,sy).addScaledVector(_v2,sz);sun.position.copy(sun.target.position).addScaledVector(SUN_DIR,110);sun.target.updateMatrixWorld();
  updMountains();updCells(rdt);updGrass();updLights(G.t);updFires(dt);FXA.update(dt);FXN.update(dt);updRain(dt,ST.k,U.wind.value*1.6,U.wind.value*.6);updBolts(dt);updRings(dt);updShrines(dt,ST.k);updAmbient(dt,ST.k);
  for(const c of CAMPS){const ch=c.chest;if(ch.open&&ch.t<1){ch.t=Math.min(1,ch.t+dt*1.6);ch.lid.rotation.x=-eOut(ch.t)*1.9;ch.light.i=2.4*(1-ch.t);}else if(!ch.open&&ch.light.i>0){ch.light.i=2.4*(.8+.2*Math.sin(G.t*3));}}
  const pu=Post.u;pu.hurt.value=Math.max(0,pu.hurt.value-rdt*1.6);pu.lowhp.value=damp(pu.lowhp.value,P.hp/P.maxHp<.3&&!P.dead&&playing?1:0,3,rdt);pu.storm.value=ST.k*(P.inWard?.35:1);
  pu.flash.value=Math.max(0,pu.flash.value-rdt*2)+ST.flash*.18;pu.desat.value=damp(pu.desat.value,P.dead?.85:0,1.5,rdt);pu.ward.value=damp(pu.ward.value,P.inWard&&ST.k>.3?1:0,3,rdt);
  pu.exposure.value=lerp(1.0,.92,ST.k);
  if(pu.lowhp.value>.5&&playing&&!P.dead){P.hbT=(P.hbT||0)-rdt;if(P.hbT<=0){P.hbT=.95;sfx('heart');}}
  renderer.getDrawingBufferSize(_db);PSCALE.value=_db.y/(2*Math.tan(camera.fov*DEG/2));
  if(G.state!=='loading'&&G.state!=='title')updHUD(rdt);
  updAudio(rdt,ST.k,U.wind.value);
  MUS.combat=damp(MUS.combat,playing&&E.some(e=>!e.dead&&e.aggro&&!e.boss&&e.dist<26)?1:0,.6,rdt);MUS.boss=damp(MUS.boss,playing&&E.some(e=>!e.dead&&e.aggro&&e.boss&&e.dist<40)?1:0,.5,rdt);
  MUS.storm=damp(MUS.storm,ST.k,.5,rdt);MUS.calm=1-Math.max(MUS.combat,MUS.boss)*.8;
  clearPresses();
  if(doRender)Post.render(Q.rays?(1-ST.k)*.9:0);}
async function boot(){const L=(p,t)=>{$('loadFill').style.width=(p*100)+'%';$('loadTxt').textContent=t;};
  applyOrient();
  try{L(.04,'Forgiando le texture');await nextFrame();makeTextures();makeMaterials();makeWardMat();
    L(.16,'Modellando la valle');await nextFrame();buildPaths();setupFlats();buildTerrain();buildMountains();
    L(.34,'Riempiendo il lago');await nextFrame();buildWater();initShore();
    L(.42,'Piantando la foresta');await nextFrame();buildForest();initGrass();initFX();initRain();initVortex();
    L(.6,'Erigendo santuari e rovine');await nextFrame();SHRINES.forEach(buildShrine);RUINS.forEach(buildRuin);
    L(.72,'Accendendo i fuochi dei goblin');await nextFrame();CAMPS.forEach(buildCamp);
    L(.82,'Risvegliando le creature');await nextFrame();initHeroPoses();initEnemyPoses();enemyBaseMats();createPlayer();buildCompass();initMenus();
    L(.86,'Vestendo l\'eroe');await loadMeshyHero();
    L(.9,'Compilando la luce');await nextFrame();ENV_CALM=makeEnv(SKYC.calm,0);ENV_STORM=makeEnv(SKYC.storm,1);scene.environment=ENV_CALM;
    placeAtShrine(0);setView(SET.fp);spawnWorld();titleCam(0);camera.updateMatrixWorld();updGrass(true);
    try{renderer.compile(scene,camera);}catch(e){}
    L(1,'Pronto');await nextFrame();showTitle();}
  catch(e){console.error('BOOT',e&&e.stack||e);$('loadTxt').textContent='Errore di avvio: '+(e&&e.message);}
  requestAnimationFrame(frame);}
window.__SB={estudio(type,o,cx,cy,cz,a){const e=spawnEnemy(type,P.pos.x+3,P.pos.z,o||{});e.aggro=false;e.state='idle';e.static=true;if(a){e.atk=EA[type].find(q=>q.k===a.k);e.t=a.t;}e.yaw=yawTo(cx,cz);for(let i=0;i<20;i++)animEnemy(e,1/60,0);camera.position.set(e.pos.x+cx,e.pos.y+cy,e.pos.z+cz);camera.lookAt(e.pos.x,e.pos.y+e.h*.5+(e.fly||0),e.pos.z);camera.updateMatrixWorld();window.__e=e;return e.type;},sim(n,dt=1/60){for(let i=0;i<n;i++)tick(dt,false);return n;},animPlayer,get PL(){return PL;},HT,HP,ET,tp(x,z){P.pos.set(x,gH(x,z),z);PL.cape.reset();CAM.init=false;},studio(k,t,cx,cy,cz){G.state='victory';for(const id of SCREENS)$(id).hidden=true;$('hud').hidden=true;if(k){P.act={k,t,hit:new Set()};}else P.act=null;P.combatK=k==='idle'?0:1;if(k==='idle')P.act=null;P.vel.set(0,0,0);PL.cape.reset();for(let i=0;i<90;i++)animPlayer(1/60);if(P.act)P.act.t=t;animPlayer(0);const y=P.pos.y;camera.position.set(P.pos.x+cx,y+cy,P.pos.z+cz);camera.lookAt(P.pos.x,y+1.0,P.pos.z);camera.updateMatrixWorld();return 'ok';},get P(){return P;},get E(){return E;},FPS,CFG,startEAtk,TOK,PROJ,COLN,collide,moveBody,gY,rayCols,wadeDepth,CG,LAKE,get WATER_Y(){return WATER_Y;},G,ST,CAM,IN,startGame,camera,scene,renderer,Post,THREE,spawnEnemy,startAct,toggleLock,setView,sfx,openLevelUp,setStormPhase,placeAtShrine,SHRINES,CAMPS,KEYS,respawn,playerDie,save,loadSave,resetPlayer,showTitle,showScreen,removeEnemy,MESHY,loadMeshyHero,levelCost,addBraci,spendBraci,levelUp,openShrineMenu,syncDrop,dropBraci,recoverBraci,viewW,viewH,touchXY,applyOrient,HEROINE_D,setHero};
boot();
