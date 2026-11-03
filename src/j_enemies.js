/* ============================== enemies ============================== */
const ET=CFG.enemy,EA=CFG.eatk;
const GP={},TP={};
function initEnemyPoses(){
  GP.base=pose({y:-.05,spi:[32,0,0],head:[-30,0,0],shL:[18,0,-14],elL:32,shR:[24,0,14],elR:40,wrR:[-78,0,0],hipL:[16,0,-6],knL:-28,hipR:[16,0,6],knR:-28,ftL:10,ftR:10});
  const b=GP.base;
  GP.stun=pose({y:-.12,spi:[42,0,22],head:[22,0,12],shL:[10,0,-30],elL:10,shR:[10,0,30],elR:10,wrR:[-10,0,0],hipL:[32,0,-8],knL:-54,hipR:[30,0,8],knR:-52},b);
  GP.stag=pose({y:-.06,spi:[-14,10,0],head:[-30,0,0],shL:[40,0,-40],shR:[30,0,40],hipL:[-10,0,0],hipR:[24,0,0],knR:-30},b);
  GP.dead=pose({y:-.52,pel:[82,0,0],spi:[10,0,0],head:[20,30,0],shL:[140,0,-40],shR:[120,0,40],hipL:[-6,0,-10],hipR:[4,0,10],knL:-24,knR:-12},b);
  GP.sit=pose({y:-.36,spi:[30,0,0],head:[-10,0,0],hipL:[86,0,-14],knL:-110,hipR:[86,0,14],knR:-110,shL:[30,0,-10],elL:60,shR:[30,0,10],elR:60},b);
  GP.chopW=pose({spi:[0,-12,0],shR:[172,10,8],elR:72,wrR:[30,0,0],head:[-32,0,0],shL:[40,0,-30]},b);
  GP.chopS=pose({spi:[44,8,0],shR:[46,4,4],elR:8,wrR:[-74,0,0],hipR:[34,0,0],knR:-44,head:[-10,0,0]},b);
  GP.swW=pose({spi:[20,-38,0],pel:[0,-14,0],shR:[72,-84,40],elR:30,wrR:[-74,0,0]},b);
  GP.swS=pose({spi:[24,42,0],pel:[0,16,0],shR:[72,92,0],elR:20,wrR:[-74,0,0],hipL:[24,0,-6],knL:-34},b);
  GP.lgW=pose({y:-.12,spi:[40,0,0],shR:[40,0,20],elR:100,wrR:[-90,0,0],hipL:[40,0,-6],knL:-60,hipR:[-10,0,6],knR:-50},b);
  GP.lgS=pose({y:-.08,spi:[30,0,0],shR:[88,0,10],elR:4,wrR:[-90,0,0],hipL:[-20,0,-6],knL:-10,hipR:[50,0,6],knR:-30},b);
  GP.drawW=pose({spi:[12,-36,0],head:[-14,-28,0],shL:[90,-36,-4],elL:4,wrL:[0,0,0],shR:[90,42,0],elR:142},b);
  GP.drawS=pose({spi:[12,-36,0],head:[-14,-28,0],shL:[90,-36,-4],elL:4,shR:[70,62,30],elR:60},b);
  GP.archerIdle=pose({shL:[30,-20,-6],elL:30,wrL:[0,0,0]},b);
  TP.base=pose({y:-.06,spi:[22,0,0],head:[-26,0,0],shL:[10,0,-16],elL:26,shR:[16,0,16],elR:32,wrR:[-50,0,0],hipL:[10,0,-6],knL:-18,hipR:[10,0,6],knR:-18});
  const t=TP.base;
  TP.slamW=pose({y:.02,spi:[-12,0,0],shR:[176,0,8],elR:40,wrR:[20,0,0],shL:[164,0,-10],elL:40,head:[-34,0,0]},t);
  TP.slamS=pose({y:-.14,spi:[48,0,0],shR:[40,0,6],elR:4,wrR:[-80,0,0],shL:[52,0,-10],elL:10,hipR:[30,0,0],knR:-42,head:[-6,0,0]},t);
  TP.swW=pose({spi:[16,-52,0],pel:[0,-20,0],shR:[80,-112,40],elR:20,wrR:[-85,0,0]},t);
  TP.swS=pose({spi:[20,52,0],pel:[0,24,0],shR:[80,102,0],elR:20,wrR:[-85,0,0],hipL:[20,0,-6],knL:-24},t);
  TP.stW=pose({hipR:[62,0,10],knR:-74,spi:[0,0,-8],shL:[60,0,-50],shR:[60,0,50],elR:30},t);
  TP.stS=pose({y:-.12,hipR:[16,0,6],knR:-22,spi:[32,0,0],shL:[40,0,-40],shR:[40,0,40]},t);
  TP.roar=pose({spi:[-26,0,0],head:[-44,0,0],shL:[60,34,-74],elL:40,shR:[60,-34,74],elR:40},t);
  TP.charge=pose({spi:[42,0,0],head:[-6,0,0],shL:[50,0,-20],shR:[50,0,20]},t);
  TP.stun=pose({y:-.18,spi:[46,0,16],head:[26,0,0],shL:[20,0,-20],shR:[20,0,20],hipL:[26,0,-8],knL:-52,hipR:[26,0,8],knR:-48},t);
  TP.stag=pose({y:-.08,spi:[-10,14,0],head:[-30,0,0],shL:[50,0,-50],shR:[40,0,50],hipR:[20,0,0],knR:-24},t);
  TP.dead=pose({y:-1.22,pel:[-80,0,0],spi:[10,0,0],head:[20,20,0],shL:[150,0,-40],shR:[130,0,40],hipL:[10,0,-10],hipR:[20,0,10],knL:-20,knR:-30},t);
  TP.sleep=pose({y:-.62,spi:[40,0,0],head:[30,0,0],hipL:[80,0,-20],knL:-110,hipR:[80,0,20],knR:-110,shL:[40,0,-20],elL:70,shR:[40,0,20],elR:70},t);
}
let BASEM=null;
function enemyBaseMats(){BASEM={gob:enemyMats([3.4,2.7,.5]),wolf:enemyMats([3.2,1.7,.3]),troll:enemyMats([4.4,.7,.2])};}
function spawnEnemy(type,x,z,o={}){
  const d=ET[type],tier=o.tier||0,sc=o.scale||1;
  const e={type,d,pos:V3(x,gH(x,z),z),home:V3(x,0,z),vel:V3(),yaw:o.yaw!==undefined?o.yaw:rr(0,TAU),tier,camp:o.camp===undefined?-1:o.camp,
    dmgM:(1+tier*.3)*(o.dmgM||1),spd:d.spd*(1+tier*.04),r:d.r*sc,h:d.h*sc,state:o.sleep?'sleep':(o.sit?'sit':'idle'),aggro:false,t:0,cool:rr(.4,1.4),atk:null,stun:0,stag:0,flash:0,
    kb:V3(),av:V3(),ph:rr(0,10),gait:{ph:Math.random(),w:0,seed:rr(0,6)},yawRate:0,sc,wt:rr(1,4),wx:x,wz:z,orbit:rr(0,TAU),sdir:Math.random()<.5?1:-1,dead:false,deadT:0,active:true,static:!!o.static,boss:!!o.boss,name:o.name||'',phase:1,
    alertT:0,barT:0,flinch:0,flinchV:0,flinchZ:0,flinchZV:0,sq:0,down:0,intT:0,glint:0,fly:0,baseY:o.baseY,ripT:0,king:!!o.king,aw:0,dpose:null,spawnO:o,spawnType:type,sx:x,sz:z,roared:false};
  e.pers={aggr:rr(.75,1.3),caution:rr(.5,1.5),ring:rr(3.5,4.6)};e.spd*=rr(.94,1.06);e.pace={a:0,r:0,t:0};e.appOff=rr(-.55,.55);
  Object.assign(e,{mode:'wait',modeT:0,taunt:0,evadeT:0,evCD:0,evx:0,evz:0,avT:0,avA:0,avS:1,blinkCD:0,combo:0,wxt:0,losT:0,los:true,fled:0});
  e.maxHp=Math.round(d.hp*(1+tier*.55)*(o.boss?1+tier*.2:1));e.hp=e.maxHp;e.maxPoise=d.poise*(o.boss?1+tier*.25:1);e.poise=e.maxPoise;
  e.xp=Math.round(d.xp*(1+tier*.4)*(o.boss?1+tier*.35:1));
  if(type==='goblin'||type==='archer'){const mats=cloneMats(BASEM.gob);const rig=buildHuman({d:GOB_D,s:sc,mats,build:goblinBuild(type==='archer')});e.rig=rig;e.mats=mats;
    if(type==='archer'){const bw=gobWeapon('bow');bw.position.set(0,-.06,0);rig.P.wrL.add(bw);e.bow=bw;}else{const w=gobWeapon(Math.random()<.5?'cleaver':'club');w.position.set(0,-.06,0);rig.P.wrR.add(w);}}
  else if(type==='troll'){const mats=cloneMats(BASEM.troll);const rig=buildHuman({d:TROLL_D,s:sc,mats,build:trollBuild(o.king)});e.rig=rig;e.mats=mats;const w=trollWeapon(o.king);w.position.set(0,-.2,0);rig.P.wrR.add(w);}
  else if(type==='wolf'){const mats=cloneMats(BASEM.wolf);e.rig=buildWolf(mats);e.mats=mats;}
  else{e.sp=buildSpirit();e.rig={root:e.sp.root};e.mats={b:e.sp.robeM,eye:e.sp.eyeM};e.fly=1;magic(V3(x,gH(x,z)+1.4,z),30,[1.2,.7,2.6],3,.7);}
  if(e.mats&&e.mats.eye)e.eyeC=e.mats.eye.color.clone();
  e.rig.root.position.copy(e.pos);e.rig.root.rotation.y=e.yaw;scene.add(e.rig.root);E.push(e);return e;}
function removeEnemy(e){scene.remove(e.rig.root);if(e.mats)for(const k in e.mats)e.mats[k].dispose();const i=E.indexOf(e);if(i>=0)E.splice(i,1);TOK.delete(e);if(P.lock===e)P.lock=null;}
const TOK=new Set();
function token(e){if(TOK.has(e))return true;if(e.boss){TOK.add(e);return true;}if(e.tokCool>G.t)return false;const bossOn=[...TOK].some(o=>o.boss&&!o.dead&&o.aggro);let n=0;
  for(const o of TOK){if(o.dead||!o.aggro){TOK.delete(o);continue;}if(!o.boss)n++;}if(n<(bossOn?CFG.ai.tokensBoss:CFG.ai.tokens)){TOK.add(e);return true;}return false;}
function alertE(e,delay=0){if(e.aggro||e.dead)return;e.aggro=true;e.alertT=delay+(e.type==='troll'?1.0:.45);e.state='combat';
  if(e.type==='goblin'||e.type==='archer')setTimeout(()=>sfx('gobAlert',e.pos),delay*1000);else if(e.type==='wolf'){setTimeout(()=>sfx(Math.random()<.5?'howl':'growl',e.pos),delay*1000);}
  else if(e.type==='spirit')sfx('wail',e.pos);
  if(e.type==='troll'&&!e.roared){e.roared=true;e.introT=1.2;setTimeout(()=>{if(e.dead)return;sfx('roar',e.pos);CAM.trauma=Math.min(1,CAM.trauma+.5);banner(e.name,'Capo · '+CAMPS[e.camp].name,'red');},500);}
  if(e.camp>=0)for(const o of E){if(o!==e&&o.camp===e.camp&&!o.aggro&&!o.dead&&o.type!=='troll'&&o.pos.distanceTo(e.pos)<26)alertE(o,rr(.2,.9));}
  if(e.type==='wolf')for(const o of E){if(o!==e&&o.type==='wolf'&&!o.aggro&&!o.dead&&o.pos.distanceTo(e.pos)<22)alertE(o,rr(.1,.5));}}
function startEAtk(e,a){e.atk=a;e.t=0;e.hitDone=false;e.didAct=false;e.glint=0;e.wxt=0;
  if(!a.ranged&&!a.roar&&!a.charge){const imp=G.t+a.w*(e.phase>1?.82:1),gap=CFG.ai.strikeGap;if(imp<AIS.lastImpact+gap&&AIS.lastImpact-imp<1.5)e.wxt=AIS.lastImpact+gap-imp;AIS.lastImpact=Math.max(AIS.lastImpact,imp+e.wxt);}e.cool=a.k==='roar'?3:e.type==='archer'?rr(2.2,3.6):rr(1.1,2.2)*(e.type==='troll'?.8:1)*(e.phase>1?.7:1);
  if(a.red){_v1.set(e.pos.x,e.pos.y+e.h*.85,e.pos.z);magic(_v1,14,[4,.4,.15],2,.4,.22);sfx('tele',e.pos);}
  else if(e.type==='goblin')sfx('gobAtk',e.pos);else if(e.type==='wolf'&&Math.random()<.6)sfx('growl',e.pos);}
function chooseAtk(e,d){const L=EA[e.type];
  if(e.type==='goblin'){if(d>2.5&&d<3.7)return L[2];if(d<2.2)return Math.random()<.55?L[0]:L[1];return null;}
  if(e.type==='wolf'){if(d>3.2&&d<6&&Math.random()<.5)return L[1];if(d<2.1)return L[0];return null;}
  if(e.type==='archer')return d<30?L[0]:null;
  if(e.type==='spirit'){if(d<2.4)return L[1];if(d<22)return L[0];return null;}
  if(e.type==='troll'){if(e.phase===2&&!e.enraged){e.enraged=true;return L[4];}
    if(d>7.5&&d<20&&Math.random()<.5)return L[3];fwdV(e.yaw,_v1);const dx=P.pos.x-e.pos.x,dz=P.pos.z-e.pos.z,c=(dx*_v1.x+dz*_v1.z)/(d||1);
    if(d<3.2&&c<.35)return L[2];const r=Math.random(),last=e.lastAtk;let a=null;
    if(d<3.3)a=r<.45?L[1]:r<.8?L[0]:L[2];else if(d<4.4)a=r<.55?L[0]:L[1];
    if(a&&a===last&&Math.random()<.6)a=a===L[0]?L[1]:L[0];if(a)e.lastAtk=a;return a;}
  return null;}
function eAtkHitPlayer(e,a){const dmg=e.d.dmg*e.dmgM*(a.dmg||1)*(e.phase>1?1.15:1);const r=playerHit(dmg,e.pos,{parry:a.parry,unblock:a.unblock,knock:a.knock});
  if(r==='parry')parried(e);return r;}
function parried(e){e.atk=null;e.stun=e.type==='troll'?1.5:2.3;e.poise=0;sfx('parryHit',P.pos);fwdV(P.yaw,_v1);_v2.set(P.pos.x+_v1.x*.7,P.pos.y+1.35,P.pos.z+_v1.z*.7);sparks(_v2,_v1,26,3.4,2.6,1.2,8);
  G.hitstop=.11;G.slow=.55;G.slowS=.3;CAM.trauma=Math.min(1,CAM.trauma+.3);Post.u.flash.value=.25;num('Parata!',e.pos,e.h+.4,'parry');
  e.kb.set(-_v1.x*-3,0,-_v1.z*-3);if(e.type==='wolf')e.kb.set(_v1.x*7,0,_v1.z*7);if(!P.parryTip){P.parryTip=1;hint(isTouch?'Nemico stordito: tocca <b>Attacca</b> per il colpo di grazia':'Nemico stordito: <kbd>Clic</kbd> per il colpo di grazia',4);}}
function runEAtk(e,a,dt,dx,dz,d){e.t+=dt;const w=a.w*(e.phase>1?.82:1)+e.wxt,A=a.a,R=a.r;const toYaw=yawTo(dx,dz);
  if(a.ranged==='arrow'&&e.t<w&&!losOK(e)){e.atk=null;e.cool=rr(.3,.6);return 0;}   // you ducked behind cover: the archer lowers the bow
  if(e.t<w){e.yaw=dampA(e.yaw,toYaw,e.type==='troll'?2.4:(a.k==='pounce'?7:5),dt);
    if(!e.glint&&(a.parry||a.red)&&w-e.t<=CFG.combat.glintLead&&d<14){e.glint=1;weaponPoint(e,_v1);glintFx(_v1,!!a.red);sfx('glint',e.pos,a.red?.6:1);}return 0;}
  const ta=e.t-w;
  if(ta<A){fwdV(e.yaw,_v1);
    if(!e.didAct){e.didAct=true;
      if(a.ranged==='arrow'){shootArrow(e);}else if(a.ranged==='orb'){shootOrb(e);}
      else if(a.aoe){const ix=e.pos.x+_v1.x*a.fwd,iz=e.pos.z+_v1.z*a.fwd;groundRing(ix,iz,.5,a.aoe*1.15,.5,new THREE.Color(1.1,.8,.5),'shock');dust(V3(ix,gH(ix,iz),iz),16,1.6);sfx('slam',e.pos);
        CAM.trauma=Math.min(1,CAM.trauma+(d<12?.55:.2));if(Math.hypot(P.pos.x-ix,P.pos.z-iz)<a.aoe)eAtkHitPlayer(e,a);}
      else if(a.roar){sfx('roar',e.pos);CAM.trauma=Math.min(1,CAM.trauma+.6);groundRing(e.pos.x,e.pos.z,1,9,.8,new THREE.Color(1.4,.4,.2),'shock');
        if(d<7&&P.act&&P.act.k!=='block'&&P.iframe<=0)startAct('stagger',{dx:dx/d,dz:dz/d});e.mats.eye.color.setRGB(6,1.4,.3);e.eyeC.setRGB(6,1.4,.3);}
      if(a.lunge){e.vel.x+=_v1.x*a.lunge;e.vel.z+=_v1.z*a.lunge;}}
    if(a.charge){const sp=e.spd*3.2;e.yaw=dampA(e.yaw,toYaw,1.2,dt);fwdV(e.yaw,_v1);if(Math.random()<.3)dust(e.pos,2,1.2);
      if((Math.floor(e.t*4)%2)===0&&!e.stepS){e.stepS=1;sfx('stepBig',e.pos);}else if((Math.floor(e.t*4)%2)===1)e.stepS=0;
      if(!e.hitDone&&d<e.r+.9){e.hitDone=true;eAtkHitPlayer(e,a);e.t=w+A;}
      if(moveBody(e.pos,_v1.x*sp*dt,_v1.z*sp*dt,e.r)&&ta>.2&&(COLN.x*_v1.x+COLN.z*_v1.z)<-.004){e.atk=null;e.stag=1.4;sfx('slam',e.pos);CAM.trauma=Math.min(1,CAM.trauma+.3);dust(e.pos,14,1.5);num('Barcollante',e.pos,e.h,'info');return 0;}}
    else if(a.range&&!e.hitDone){if(d<a.range+e.r*.5+.3){const c=(dx*_v1.x+dz*_v1.z)/(d||1);if(c>a.cos||d<e.r+.6){e.hitDone=true;eAtkHitPlayer(e,a);}}}
    return 0;}
  if(ta<A+R)return 0;
  e.atk=null;
  if(e.type==='goblin'||e.type==='wolf'){if(e.type==='goblin'&&!e.combo&&d<3.2&&Math.random()<e.pers.aggr*.3){e.combo=1;e.cool=rr(.12,.3);}else{e.combo=0;e.mode='retreat';e.modeT=e.type==='wolf'?rr(.7,1.1):rr(.35,.6);}}
  else if(!e.boss&&e.type!=='archer'){TOK.delete(e);e.tokCool=G.t+rr(.8,1.8);}return 0;}
function weaponPoint(e,out){const R=e.rig;if(e.type==='wolf'&&R.P&&R.P.jaw)R.P.jaw.getWorldPosition(out);else if(e.type==='spirit')e.sp.core.getWorldPosition(out);
  else if(R.P&&R.P.wrR){R.P.wrR.getWorldPosition(out);out.y+=.18*(e.sc||1)*(e.type==='troll'?2:1);}else out.set(e.pos.x,e.pos.y+e.h*.7,e.pos.z);return out;}
function shootArrow(e){const m=new THREE.Group();const s=new THREE.Mesh(geo('arrowS',()=>{const g=new THREE.CylinderGeometry(.012,.012,.8,4);g.rotateX(PI/2);return g;}),geo('arrowM',()=>new THREE.MeshStandardMaterial({color:col(0x5a4532),roughness:.8})));
  const tp=new THREE.Mesh(geo('arrowT',()=>{const g=new THREE.ConeGeometry(.035,.12,4);g.rotateX(-PI/2);g.translate(0,0,-.45);return g;}),MAT.metal);
  const fl=new THREE.Mesh(geo('arrowF',()=>{const g=new THREE.PlaneGeometry(.06,.14);g.rotateX(PI/2);g.translate(0,0,.35);return g;}),geo('arrowFM',()=>new THREE.MeshStandardMaterial({color:col(0xd8d0c0),side:THREE.DoubleSide})));
  m.add(s,tp,fl);const p=V3(e.pos.x,e.pos.y+1.3*(e.static?1:1),e.pos.z);fwdV(e.yaw,_v1);p.addScaledVector(_v1,.5);
  const tgt=V3(P.pos.x,P.pos.y+1.15,P.pos.z);const fl2=p.distanceTo(tgt)/26;tgt.x+=P.vel.x*fl2*.7;tgt.z+=P.vel.z*fl2*.7;
  const v=tgt.sub(p).normalize().multiplyScalar(26);v.y+=fl2*2.2;v.x+=rr(-.6,.6);m.position.copy(p);scene.add(m);
  PROJ.push({k:'arrow',pos:p,vel:v,life:3,dmg:e.d.dmg*e.dmgM,owner:e,mesh:m,ref:false});sfx('bow',e.pos);}
function shootOrb(e){const m=new THREE.Mesh(geo('orbG',()=>new THREE.IcosahedronGeometry(.22,1)),new THREE.MeshBasicMaterial({color:new THREE.Color(2.4,1.2,4.6)}));
  const p=V3(e.pos.x,e.pos.y+e.fly+1.35,e.pos.z);m.position.copy(p);scene.add(m);const v=V3(P.pos.x-p.x,P.pos.y+1.2-p.y,P.pos.z-p.z).normalize().multiplyScalar(9.5);
  PROJ.push({k:'orb',pos:p,vel:v,life:4.5,dmg:e.d.dmg*e.dmgM,owner:e,mesh:m,ref:false});sfx('orb',p);}
function updProjectiles(dt){for(let i=PROJ.length-1;i>=0;i--){const p=PROJ[i];p.life-=dt;let kill=p.life<=0;
  if(p.k==='arrow')p.vel.y-=4*dt;else if(!p.ref){_v1.set(P.pos.x-p.pos.x,P.pos.y+1.2-p.pos.y,P.pos.z-p.pos.z).normalize().multiplyScalar(p.vel.length());p.vel.lerp(_v1,Math.min(1,dt*1.1));
    if(Math.random()<.7)FXA.emit(p.pos.x,p.pos.y,p.pos.z,rr(-.3,.3),rr(-.3,.3),rr(-.3,.3),.4,.18,.02,1.6,.8,3,1,0,1);}
  p.pos.addScaledVector(p.vel,dt);p.mesh.position.copy(p.pos);if(p.k==='arrow')p.mesh.lookAt(_v2.copy(p.pos).add(p.vel));else p.mesh.rotation.y+=dt*5;
  if(p.pos.y<gH(p.pos.x,p.pos.z))kill=true;
  for(const s of SHRINES){if(!p.ref&&Math.hypot(p.pos.x-s.x,p.pos.z-s.z)<5.4&&U.storm.value>.03){kill=true;magic(p.pos,10,[.5,1.4,2.6],2,.4);sfx('orbHit',p.pos);break;}}
  if(!kill&&!p.ref){const dx=p.pos.x-P.pos.x,dy=p.pos.y-(P.pos.y+1.15),dz=p.pos.z-P.pos.z;if(dx*dx+dy*dy*.4+dz*dz<.42&&!P.dead){
      const r=playerHit(p.dmg,_v3.copy(p.pos).addScaledVector(p.vel,-.1),{parry:true});
      if(r==='parry'){p.ref=true;p.life=3;const o=p.owner;const tg=o&&!o.dead?V3(o.pos.x,o.pos.y+(o.fly||0)+o.h*.6,o.pos.z):p.pos.clone().addScaledVector(p.vel,-1);
        p.vel.copy(tg.sub(p.pos).normalize().multiplyScalar(p.vel.length()*1.4));sfx('parryHit',P.pos);sparks(p.pos,null,16);num('Deviata!',P.pos,2.1,'parry');G.hitstop=.08;}
      else if(r!=='dodge'){kill=true;if(p.k==='orb'){magic(p.pos,16,[1.6,.8,3],3,.5);sfx('orbHit',p.pos);}}}}
  if(!kill&&p.ref){for(const e of E){if(e.dead||!e.active)continue;const dx=p.pos.x-e.pos.x,dz=p.pos.z-e.pos.z,dy=p.pos.y-(e.pos.y+(e.fly||0)+e.h*.5);if(dx*dx+dz*dz<(e.r+.45)**2&&Math.abs(dy)<e.h*.7){
      damageEnemy(e,{hit:new Set(),charged:false},{mul:2.2,poise:30,heavy:true,proj:true},p.vel.x,p.vel.z);kill=true;break;}}}
  if(kill){scene.remove(p.mesh);if(p.k==='orb')p.mesh.material.dispose();PROJ.splice(i,1);}}}
/* ============================== enemy brains ============================== */
const AIS={lastImpact:-9},BR={x:0,z:0,s:0,face:null},_nav={x:0,z:0},_av={x:0,z:0};
// palisades: route through the gate when the straight line would cross the wall
function navTo(e,tx,tz){_nav.x=tx;_nav.z=tz;
  for(const c of CAMPS){const R=14.5,ex=e.pos.x-c.x,ez=e.pos.z-c.z,qx=tx-c.x,qz=tz-c.z,de=Math.hypot(ex,ez),dT=Math.hypot(qx,qz);
    if(de>R+30&&dT>R+30)continue;
    const ang=Math.atan2(ez,ex),inGate=Math.abs(angD(c.ent,ang))<.27&&Math.abs(de-R)<3.4,tIn=dT<R-.3;
    let zone=de<R-1?0:de>R+1?2:1;                       // 0 inside, 1 on the wall line, 2 clear outside
    if(zone===1){if(inGate){const k=tIn?R-2.6:R+2.6;_nav.x=c.x+Math.cos(c.ent)*k;_nav.z=c.z+Math.sin(c.ent)*k;return true;}zone=de<R?0:2;}
    if((zone===0)!==tIn){const k=inGate?(zone===0?R+2.6:R-2.6):(zone===0?R-2.4:R+2.4);_nav.x=c.x+Math.cos(c.ent)*k;_nav.z=c.z+Math.sin(c.ent)*k;return true;}
    if(zone===2&&!tIn){// both outside: if the straight line cuts through the camp, walk round it the short way
      const sx=qx-ex,sz=qz-ez,L2=sx*sx+sz*sz;if(L2<1)continue;const u=clamp(-(ex*sx+ez*sz)/L2,0,1),cx=ex+sx*u,cz=ez+sz*u;if(cx*cx+cz*cz>(R+.6)*(R+.6))continue;
      const ae=Math.atan2(ez,ex),at=Math.atan2(qz,qx),a=ae+(angD(ae,at)>=0?1:-1)*.75,r2=Math.max(R+2.6,de);_nav.x=c.x+Math.cos(a)*r2;_nav.z=c.z+Math.sin(a)*r2;return true;}}
  return false;}
// trees, rocks, walls: probe ahead and swing to the clear side (sticky, so it does not dither)
function avoidDir(e,dx,dz){
  if(G.t>=e.avT){e.avT=G.t+.18;const L=1.8+e.r*1.5,r=e.r*.75;e.avA=0;
    if(rayCols(e.pos.x,e.pos.z,e.pos.x+dx*L,e.pos.z+dz*L,r,.5)<1){const s0=e.avS;
      out:for(const a of[.55,1.0,1.5,2.1])for(const sg of[s0,-s0]){const A=a*sg,ca=Math.cos(A),sa=Math.sin(A),rx=dx*ca-dz*sa,rz=dx*sa+dz*ca;
        if(rayCols(e.pos.x,e.pos.z,e.pos.x+rx*L,e.pos.z+rz*L,r,.5)>=1){e.avA=A;e.avS=sg;break out;}}}}
  const ca=Math.cos(e.avA),sa=Math.sin(e.avA);_av.x=dx*ca-dz*sa;_av.z=dx*sa+dz*ca;return _av;}
function goTo(e,tx,tz,spd,stop=.3){navTo(e,tx,tz);let dx=_nav.x-e.pos.x,dz=_nav.z-e.pos.z;const l=Math.hypot(dx,dz);if(l<stop){BR.s=0;return l;}dx/=l;dz/=l;
  const v=avoidDir(e,dx,dz);BR.x=v.x;BR.z=v.z;BR.s=spd*Math.min(1,l/1.4+.3);return l;}
// waiting ring: spread out from the other waiting foes and stay where the camera can see them
function ringPos(e,R,out){let a=Math.atan2(e.pos.z-P.pos.z,e.pos.x-P.pos.x);
  for(const o of E){if(o===e||o.dead||!o.aggro||o.mode!=='wait'||o.type!==e.type&&o.type!=='goblin'||o.dist>14)continue;
    const d=angD(a,Math.atan2(o.pos.z-P.pos.z,o.pos.x-P.pos.x)),sep=.95;if(Math.abs(d)<sep)a-=(d>=0?1:-1)*(sep-Math.abs(d))*.7;}
  fwdV(CAM.yaw,_v4);const af=Math.atan2(_v4.z,_v4.x),off=angD(af,a);if(Math.abs(off)>1.85)a=af+(off>0?1:-1)*1.85;
  a+=e.pace.a;out.x=P.pos.x+Math.cos(a)*R;out.z=P.pos.z+Math.sin(a)*R;return out;}
// every foe re-decides its spot now and then: shuffles, the odd feint step toward you
function pacing(e){if(G.t<e.pace.t)return;e.pace.t=G.t+rr(1.2,2.8);e.pace.a=rr(-.35,.35);e.pace.r=Math.random()<.13*e.pers.aggr?-1.7:rr(-.6,.6);}
function losOK(e){if(G.t<e.losT)return e.los;e.losT=G.t+.25;e.los=rayCols(e.pos.x,e.pos.z,P.pos.x,P.pos.z,.12,e.static?6:2)>=1;return e.los;}
function aloneFoe(e){for(const o of E)if(o!==e&&!o.dead&&o.aggro&&o.pos.distanceToSquared(e.pos)<18*18)return false;return true;}
// a foe about to be cut may hop out of reach (caution decides how often)
function maybeEvade(e,dx,dz,d){const pa=P.act;if(!pa||!ATTACKS.has(pa.k)||e.atk||e.evadeT>0||G.t<e.evCD||d>2.9||pa.t>PA[pa.k].hit[0])return false;
  pa.evc=pa.evc||new Set();if(pa.evc.has(e))return false;pa.evc.add(e);fwdV(P.yaw,_v4);if((-dx*_v4.x-dz*_v4.z)/d<.55)return false;
  if(Math.random()>(e.type==='wolf'?.3:.17)*e.pers.caution)return false;
  const side=Math.random()<.5?1:-1,ux=-dx/d,uz=-dz/d;let vx=ux*.75-uz*.66*side,vz=uz*.75+ux*.66*side;const l=Math.hypot(vx,vz);
  const v=avoidDir(e,vx/l,vz/l);e.evx=v.x;e.evz=v.z;e.evadeT=.34;e.evCD=G.t+rr(2.5,4.2);dust(e.pos,4,.6);sfx('roll',e.pos,.7);return true;}
function brainGoblin(e,dt,dx,dz,d){const pr=e.pers;
  if(e.mode==='flee'){e.modeT-=dt;const v=avoidDir(e,-dx/d,-dz/d);BR.x=v.x;BR.z=v.z;BR.s=e.spd;BR.face=yawTo(v.x,v.z);if(e.modeT<=0)e.mode='wait';return;}
  if(e.hp<e.maxHp*.3&&!e.fled&&aloneFoe(e)&&Math.random()<.5){e.fled=1;e.mode='flee';e.modeT=rr(2.2,3.4);TOK.delete(e);sfx('gobHurt',e.pos);return;}
  if(maybeEvade(e,dx,dz,d))return;
  if(e.mode==='retreat'){e.modeT-=dt;const v=avoidDir(e,-dx/d,-dz/d);BR.x=v.x;BR.z=v.z;BR.s=e.spd*.6;if(e.modeT<=0||d>pr.ring){e.mode='wait';TOK.delete(e);e.tokCool=G.t+rr(.9,2.0)/pr.aggr;}return;}
  if(token(e)){e.mode='engage';const reach=1.5+e.r*.4;
    if(d>reach){if(navTo(e,P.pos.x,P.pos.z))goTo(e,_nav.x,_nav.z,e.spd,.2);
      else{const off=e.appOff*clamp((d-2)/5,0,1),ca=Math.cos(off),sa=Math.sin(off),ux=dx/d,uz=dz/d;const v=avoidDir(e,ux*ca-uz*sa,ux*sa+uz*ca);BR.x=v.x;BR.z=v.z;BR.s=e.spd*(d>6?1:.85);}}
    if(e.cool<=0){const a=chooseAtk(e,d);if(a)startEAtk(e,a);}return;}
  e.mode='wait';pacing(e);ringPos(e,pr.ring+e.pace.r,_v4);goTo(e,_v4.x,_v4.z,e.spd*.5,.35);
  if(e.taunt<=0&&d<10&&Math.random()<dt*.05*pr.aggr){e.taunt=.9;sfx('gobAlert',e.pos,.6);}}
function brainWolf(e,dt,dx,dz,d){const pr=e.pers;
  if(maybeEvade(e,dx,dz,d))return;
  if(e.mode==='retreat'){e.modeT-=dt;const v=avoidDir(e,-dx/d,-dz/d);BR.x=v.x;BR.z=v.z;BR.s=e.spd*.85;BR.face=yawTo(v.x,v.z);
    if(e.modeT<=0||d>7.5){e.mode='circle';TOK.delete(e);e.tokCool=G.t+rr(1.0,2.2)/pr.aggr;}return;}
  if(token(e)){e.mode='dart';if(d>1.6){const v=avoidDir(e,dx/d,dz/d);BR.x=v.x;BR.z=v.z;BR.s=e.spd;}if(e.cool<=0){const a=chooseAtk(e,d);if(a)startEAtk(e,a);}return;}
  // the pack trots round its prey, drifting toward the flanks
  e.mode='circle';pacing(e);if(Math.random()<dt*.18)e.sdir*=-1;
  const a=Math.atan2(e.pos.z-P.pos.z,e.pos.x-P.pos.x)+e.sdir*.65,R=6.6+e.pace.r*1.4;goTo(e,P.pos.x+Math.cos(a)*R,P.pos.z+Math.sin(a)*R,e.spd*.5,.3);
  if(BR.s>1.2)BR.face=yawTo(BR.x,BR.z);}
function brainArcher(e,dt,dx,dz,d){if(e.static){if(e.cool<=0&&losOK(e)){const a=chooseAtk(e,d);if(a)startEAtk(e,a);}return;}
  const los=losOK(e);
  if(d<6.5){const v=avoidDir(e,-dx/d,-dz/d);BR.x=v.x;BR.z=v.z;BR.s=e.spd*.95;}
  else if(!los||d>17){if(!los&&Math.random()<dt*.25)e.sdir*=-1;const a=Math.atan2(e.pos.z-P.pos.z,e.pos.x-P.pos.x)+e.sdir*.5,R=clamp(d-2.5,9,15);goTo(e,P.pos.x+Math.cos(a)*R,P.pos.z+Math.sin(a)*R,e.spd*.8,.4);}
  else{BR.x=-dz/d*e.sdir;BR.z=dx/d*e.sdir;BR.s=e.spd*.22;if(Math.random()<dt*.35)e.sdir*=-1;}
  if(e.cool<=0&&los&&d<28){let n=0;for(const p of PROJ)if(p.k==='arrow'&&!p.ref)n++;if(n<2){const a=chooseAtk(e,d);if(a)startEAtk(e,a);}}}
function blink(e,dx,dz,d){magic(V3(e.pos.x,e.pos.y+e.fly+1.2,e.pos.z),22,[1.2,.7,2.6],3,.5);const side=Math.random()<.5?1:-1,a=Math.atan2(-dz,-dx)+side*rr(.5,1.1),R=rr(5.5,7.5);
  e.pos.x=P.pos.x+Math.cos(a)*R;e.pos.z=P.pos.z+Math.sin(a)*R;e.pos.y=gH(e.pos.x,e.pos.z);e.orbit=a;e.blinkCD=G.t+rr(4,6.5);magic(V3(e.pos.x,e.pos.y+e.fly+1.2,e.pos.z),22,[1.2,.7,2.6],3,.5);sfx('orb',e.pos,.7);}
function brainSpirit(e,dt,dx,dz,d){
  if(d<3.2&&G.t>e.blinkCD&&!e.atk){blink(e,dx,dz,d);return;}
  pacing(e);if(Math.random()<dt*.15)e.sdir*=-1;e.orbit+=e.sdir*dt*(.32+.25*Math.sin(G.t*.7+e.ph));
  const R=7+e.pace.r*2,tx=P.pos.x+Math.cos(e.orbit)*R,tz=P.pos.z+Math.sin(e.orbit)*R,ox=tx-e.pos.x,oz=tz-e.pos.z,ol=Math.hypot(ox,oz);if(ol>.4){BR.x=ox/ol;BR.z=oz/ol;BR.s=e.spd*Math.min(1,ol/3);}
  if(e.cool<=0&&token(e)){const a=chooseAtk(e,d);if(a&&!(P.inWard&&a.k==='claw'))startEAtk(e,a);}}
function brainTroll(e,dt,dx,dz,d){if(d>2.5){if(navTo(e,P.pos.x,P.pos.z))goTo(e,_nav.x,_nav.z,e.spd*1.1,.3);else{const v=avoidDir(e,dx/d,dz/d);BR.x=v.x;BR.z=v.z;BR.s=e.spd*(e.phase>1?1.25:1)*(d>8?1.15:.95);}}
  if(e.cool<=0&&!(e.introT>0)){const a=chooseAtk(e,d);if(a)startEAtk(e,a);}}
function updEnemies(dt){const pp=P.pos;
  for(let i=E.length-1;i>=0;i--){const e=E[i];if(e.dead){e.deadT+=dt;animEnemy(e,dt,0);if(e.deadT>9){removeEnemy(e);}continue;}
    const dx=pp.x-e.pos.x,dz=pp.z-e.pos.z,d=Math.hypot(dx,dz);e.dist=d;const act=d<95||e.aggro;if(act!==e.active){e.active=act;}e.rig.root.visible=act&&(d<78||e.aggro);if(!act)continue;
    updEnemy(e,dt,dx,dz,d);}}
function updEnemy(e,dt,dx,dz,d){
  e.flash=Math.max(0,e.flash-dt);e.cool-=dt;e.barT=Math.max(0,e.barT-dt);e.flinch+=e.flinchV*dt;e.flinchV+=(-e.flinch*200-e.flinchV*16)*dt;
  e.flinchZ+=e.flinchZV*dt;e.flinchZV+=(-e.flinchZ*200-e.flinchZV*16)*dt;e.sq=damp(e.sq,0,13,dt);
  if(e.introT>0)e.introT-=dt;
  const kbx=e.kb.x*dt,kbz=e.kb.z*dt;e.kb.multiplyScalar(Math.exp(-dt*7));const ox=e.pos.x,oz=e.pos.z,yaw0=e.yaw;
  let mvx=0,mvz=0,spd=0,face=null;const toYaw=yawTo(dx,dz);
  if(!e.aggro&&!P.dead&&G.state==='play'){let sight=e.d.sight*(e.state==='sleep'?.4:1)*(P.sprinting?1.25:1)*(U.storm.value>.5?.75:1);if(e.static)sight=26;
    if(e.type==='troll'){const mates=E.filter(o=>o.camp===e.camp&&!o.dead&&!o.boss).length;if(d<10||mates<=2&&d<30)alertE(e);}
    else if(d<sight){fwdV(e.yaw,_v1);const c=(dx*_v1.x+dz*_v1.z)/(d||1);if(c>-.25||d<sight*.45||e.type==='spirit')alertE(e);}}
  if(e.down>0){e.down-=dt;e.atk=null;if(e.down<=0)sfx('gobAtk',e.pos,.6);}
  else if(e.stun>0){e.stun-=dt;e.atk=null;}
  else if(e.stag>0){e.stag-=dt;e.atk=null;}
  else if(e.atk){runEAtk(e,e.atk,dt,dx,dz,d);}
  else if(e.aggro&&!P.dead){
    if(e.alertT>0){e.alertT-=dt;face=toYaw;}
    else{BR.x=BR.z=BR.s=0;BR.face=toYaw;const T=e.type;
      if(T==='archer')brainArcher(e,dt,dx,dz,d);else if(T==='spirit')brainSpirit(e,dt,dx,dz,d);else if(T==='troll')brainTroll(e,dt,dx,dz,d);else if(T==='wolf')brainWolf(e,dt,dx,dz,d);else brainGoblin(e,dt,dx,dz,d);
      mvx=BR.x;mvz=BR.z;spd=BR.s;face=BR.face;}
    const leash=e.camp>=0?e.pos.distanceTo(e.home)>48:d>45;if(leash&&!e.boss||d>60||(e.type!=='spirit'&&e.camp>=0&&P.inWard&&U.storm.value>.5&&d>14)){e.aggro=false;e.state='return';TOK.delete(e);}}
  else{// idle behaviours
    if(e.state==='return'){const hx=e.home.x-e.pos.x,hz=e.home.z-e.pos.z,hl=Math.hypot(hx,hz);if(hl>1){goTo(e,e.home.x,e.home.z,e.spd*.6,.5);mvx=BR.x;mvz=BR.z;spd=BR.s;face=yawTo(BR.x,BR.z);}else{e.state=e.spawnO.sleep?'sleep':'idle';}e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.15*dt);}
    else if(e.state==='idle'&&!e.static){e.wt-=dt;if(e.wt<=0){e.wt=rr(2,6);const a=rr(0,TAU),r=rr(0,e.type==='wolf'?9:5.5);e.wx=e.home.x+Math.cos(a)*r;e.wz=e.home.z+Math.sin(a)*r;}
      const wx=e.wx-e.pos.x,wz=e.wz-e.pos.z,wl=Math.hypot(wx,wz);if(wl>.6){goTo(e,e.wx,e.wz,e.spd*.28,.6);mvx=BR.x;mvz=BR.z;spd=BR.s;face=yawTo(BR.x||wx,BR.z||wz);}
      if(e.type==='wolf'&&Math.random()<dt*.01)sfx('howl',e.pos);}
    else if(e.static)face=e.yaw;}
  if(e.evadeT>0&&!e.atk&&e.stun<=0&&!(e.down>0)){e.evadeT-=dt;mvx=e.evx;mvz=e.evz;spd=7.6;face=yawTo(dx,dz);}
  if(e.taunt>0)e.taunt-=dt;
  if(e.type==='spirit'&&P.inWard){for(const s of SHRINES){const sx=e.pos.x-s.x,sz=e.pos.z-s.z,sl=Math.hypot(sx,sz);if(sl<6.6){e.pos.x=s.x+sx/sl*6.6;e.pos.z=s.z+sz/sl*6.6;}}}
  const resp=e.type==='troll'?5:8;e.vel.x=damp(e.vel.x,mvx*spd,resp,dt);e.vel.z=damp(e.vel.z,mvz*spd,resp,dt);
  if(face!==null&&!e.atk&&e.stun<=0)e.yaw=dampA(e.yaw,face,e.type==='troll'?3:8,dt);
  if(!e.static){let mx=e.vel.x*dt+kbx,mz=e.vel.z*dt+kbz;const soft=Math.min(1,dt*20);
    // crowding: heavier bodies win, overlaps resolve over a few frames instead of popping
    for(const o of E){if(o===e||o.dead||!o.active||o.type==='spirit'&&e.type!=='spirit')continue;const sx=e.pos.x-o.pos.x,sz=e.pos.z-o.pos.z,m=e.r+o.r,d2=sx*sx+sz*sz;
      if(d2<m*m&&d2>1e-8){const dd=Math.sqrt(d2),k=(m-dd)/dd*(o.d.mass/(o.d.mass+e.d.mass))*soft;mx+=sx*k;mz+=sz*k;}}
    if(!P.dead&&e.type!=='spirit'&&!(P.iframe>0&&e.type!=='troll')){const sx=e.pos.x-P.pos.x,sz=e.pos.z-P.pos.z,m=e.r+CFG.move.radius,dd=Math.hypot(sx,sz);
      if(dd<m&&dd>1e-4){const k=(m-dd)/dd*(CFG.move.mass/(CFG.move.mass+e.d.mass))*Math.min(1,dt*24);mx+=sx*k;mz+=sz*k;}}
    if(e.type==='spirit'){e.pos.x+=mx;e.pos.z+=mz;}else moveBody(e.pos,mx,mz,e.r*.9,e.vel);
    e.pos.y=gY(e.pos.x,e.pos.z);}
  else e.pos.y=e.baseY!==undefined?e.baseY:e.pos.y;
  const idt=1/Math.max(dt,1e-4);e.av.set((e.pos.x-ox)*idt,0,(e.pos.z-oz)*idt);e.yawRate=damp(e.yawRate,angD(yaw0,e.yaw)*idt,12,dt);
  if(e.type==='spirit')e.fly=damp(e.fly,1.1+Math.sin(G.t*2+e.orbit)*.3,3,dt);
  if(e.boss&&e.phase===1&&e.hp<e.maxHp*.5){e.phase=2;num('Furia!',e.pos,e.h+.6,'crit');}
  animEnemy(e,dt,Math.hypot(e.av.x,e.av.z));}
// a hit squashes the body a touch (widens, drops) and springs back
function squash(o,k){const s=Math.min(1.4,k)*.1;o.scale.set(1+s*.8,1-s,1+s*.8);}
const _EL=new Float32Array(NP),_EA=new Float32Array(NP),_EF=new Float32Array(NP);
function animEnemy(e,dt,spd){
  if(e.type==='wolf')return animWolf(e,dt,spd);if(e.type==='spirit')return animSpirit(e,dt,spd);
  const R=e.rig,PS=e.type==='troll'?TP:GP;let base=PS.base;if(e.type==='archer'&&!e.atk)base=GP.archerIdle;
  fwdV(e.yaw,_v1);const vf=e.dead?0:e.av.x*_v1.x+e.av.z*_v1.z,vs=e.dead?0:e.av.x*-_v1.z+e.av.z*_v1.x,troll=e.type==='troll';
  const ev=gaitIK(_EL,base,e.gait,troll?TROLL_D:GOB_D,e.sc||1,vf,vs,dt,{arm:troll?.55:.9,armR:e.atk?0:troll?.5:.75,elbow:.6});
  if(ev&&spd>.5&&!e.dead){if(troll){sfx('stepBig',e.pos,.7);if(e.dist<14)CAM.trauma=Math.min(1,CAM.trauma+.06);}else if(e.dist<16&&spd>2)sfx('step',e.pos,.45);}
  if(R.inner){const lt=e.dead||e.atk?0:clamp(e.yawRate*spd*.03,-.22,.22);R.inner.rotation.z=damp(R.inner.rotation.z,lt,8,dt);}
  let w=0;
  if(e.dead){if(!e.dpose){e.dpose=new Float32Array(_EF);}mixPose(_EA,e.dpose,PS.dead,eOut2(Math.min(1,e.deadT/.9)));w=1;}
  else if(e.down>0){const el=CFG.combat.downT-e.down,k=el<.28?eOut(el/.28):e.down<.55?eIO(e.down/.55):1;mixPose(_EA,base,PS.dead,k);w=1;}
  else if(e.stun>0){_EA.set(PS.stun);_EA[6]+=Math.sin(G.t*6)*.12;_EA[4]+=Math.sin(G.t*4.3)*.06;w=1;}
  else if(e.stag>0){_EA.set(PS.stag);w=1;}
  else if(e.atk){const a=e.atk,ww=a.w*(e.phase>1?.82:1)+e.wxt,W=PS[a.W]||base,S=PS[a.S]||base;if(a.k==='charge'){_EA.set(_EL);for(let i=0;i<NP;i++)_EA[i]+=(TP.charge[i]-TP.base[i]);_EA[0]=_EL[0];}
      else if(e.t<ww)mixPose(_EA,base,W,eOut2(e.t/ww));else if(e.t<ww+a.a)mixPose(_EA,W,S,eIn2((e.t-ww)/a.a));else mixPose(_EA,S,base,eIO(Math.min(1,(e.t-ww-a.a)/a.r)));w=1;
      if(e.type==='archer'&&e.bow&&e.bow.userData.string)e.bow.userData.string.scale.y=1;}
  else if(e.evadeT>0&&e.type==='goblin'){const k=Math.sin(PI*(1-e.evadeT/.34));mixPose(_EA,base,GP.lgW,k*.85);_EA[0]+=k*.06;w=1;}
  else if(e.taunt>0&&e.type==='goblin'){const k=Math.sin(PI*(1-e.taunt/.9));mixPose(_EA,base,GP.chopW,k*.75);w=k;}
  else if(e.state==='sleep'){_EA.set(e.type==='troll'?TP.sleep:GP.sit);w=1;}
  else if(e.state==='sit'){_EA.set(GP.sit);w=1;}
  e.aw=damp(e.aw,w,w?14:8,dt);mixPose(_EF,_EL,_EA,e.aw);
  if(e.atk&&e.atk.k!=='charge'||e.stun>0||e.stag>0||e.dead||e.state==='sleep'||e.state==='sit')for(const i of[20,21,22,23,24,25,26,27,28,29])if(!e.dead&&!e.stun&&!(e.down>0)&&!(e.state==='sleep'||e.state==='sit')&&!(e.atk&&(e.atk.k==='stomp'||e.atk.k==='lunge'||e.atk.k==='chop')))_EF[i]=lerp(_EF[i],_EL[i],.6);
  _EF[4]+=e.flinch*.5;_EF[7]+=e.flinch*.4;_EF[6]+=e.flinchZ*.45;
  R.apply(_EF);R.root.position.copy(e.pos);squash(R.root,e.sq);if(e.dead&&e.deadT>6)R.root.position.y-=(e.deadT-6)*.5;R.root.rotation.y=e.yaw;
  tintEnemy(e);}
function tintEnemy(e){const m=e.mats;if(!m)return;let glow=0,red=0;
  if(e.atk&&!e.dead){const ww=e.atk.w*(e.phase>1?.82:1)+(e.wxt||0);if(e.t<ww){glow=e.t/ww;if(e.atk.red)red=glow;}}
  if(m.b&&m.b.emissive){if(e.flash>0)m.b.emissive.setRGB(.55,.5,.45);else if(red>0){const pu=.05+.04*Math.sin(G.t*24);m.b.emissive.setRGB(pu*red,.004*red,0);}else if(e.stun>0)m.b.emissive.setRGB(.25+.2*Math.sin(G.t*14),.2+.15*Math.sin(G.t*14),0);else if(e.type!=='spirit')m.b.emissive.setRGB(0,0,0);}
  if(m.eye&&e.eyeC){const k=e.dead?Math.max(0,1-e.deadT*1.5):1+glow*1.8;m.eye.color.copy(e.eyeC).multiplyScalar(k);}}
function animWolf(e,dt,spd){const W=e.rig.P,T=G.t;e.ph+=dt*TAU*spd/(1.05+spd*.1);const amp=Math.min(1,spd/3.5),gal=spd>5.5;const s=Math.sin(e.ph),c=Math.cos(e.ph);
  let bodyY=.72,bodyX=0,neckX=0,jaw=0,tail=Math.sin(T*7+e.ph)*.25,rootY=0,rootZ=0;
  const legs=[['fl',0,1],['fr',PI,1],['bl',gal?PI*.25:PI,-1],['br',gal?PI*1.25:0,-1]];
  for(const[n,off,fr]of legs){const ss=Math.sin(e.ph+off),cc=Math.cos(e.ph+off);W[n].rotation.x=ss*amp*(gal?.85:.6);W[n+'2'].rotation.x=fr>0?-Math.max(0,cc)*amp*1.1:Math.max(0,-cc)*amp*1.0;}
  bodyY+=Math.abs(s)*.05*amp;bodyX=gal?s*.08:0;neckX=-.1+c*.05*amp;if(spd>3)tail=-.3+s*.12;
  if(e.dead){const k=eOut2(Math.min(1,e.deadT/.6));rootZ=k*PI/2*(e.fall||1);bodyY=lerp(.72,.35,k);for(const[n]of legs){W[n].rotation.x*=1-k;W[n].rotation.z=k*.4;}jaw=.3;tail=0;}
  else if(e.down>0){const el=CFG.combat.downT-e.down,k=el<.25?eOut(el/.25):e.down<.45?eIO(e.down/.45):1;rootZ=k*PI/2*(e.fall||1);bodyY=lerp(.72,.38,k);neckX=.3*k;jaw=.25*k;for(const[n]of legs){W[n].rotation.x*=1-k;W[n].rotation.z=k*.35;}}
  else if(e.stun>0){neckX=.5+Math.sin(T*5)*.15;bodyY=.6;jaw=.15;}
  else if(e.stag>0){neckX=-.3;bodyX=-.2;}
  else if(e.atk){const a=e.atk,ww=a.w+e.wxt;if(e.t<ww){const k=e.t/ww;bodyY=.72-k*.14;neckX=.35*k;bodyX=.12*k;jaw=k*.25;}
    else if(e.t<ww+a.a){const k=(e.t-ww)/a.a;jaw=.7;neckX=-.25;bodyX=-.15;if(a.jump)rootY=Math.sin(k*PI)*1.0;}else{jaw=.2*(1-(e.t-ww-a.a)/a.r);}}
  else if(e.aggro){jaw=.12+Math.sin(T*9)*.05;neckX=.12;}
  W.body.position.y=bodyY;W.body.rotation.x=bodyX;W.neck.rotation.x=neckX-e.flinch*.4;W.jaw.rotation.x=jaw;W.tail.rotation.x=tail;W.tail.rotation.y=Math.sin(T*6+e.ph)*.3*(spd<1?1:.3);
  const R=e.rig.root;R.position.set(e.pos.x,e.pos.y+rootY-(e.dead&&e.deadT>6?(e.deadT-6)*.4:0),e.pos.z);R.rotation.set(0,e.yaw,rootZ,'YXZ');squash(R,e.sq);tintEnemy(e);}
function animSpirit(e,dt,spd){const S=e.sp,T=G.t;S.b.position.y=1.35+Math.sin(T*2.3+e.orbit)*.12;S.arms[0].rotation.set(Math.sin(T*2.1)*.3+.2,0,-.25);S.arms[1].rotation.set(Math.sin(T*2.1+1)*.3+.2,0,.25);
  S.b.rotation.x=Math.min(.4,spd*.05);S.core.rotation.y+=dt*3;
  if(e.atk){const ww=e.atk.w;if(e.t<ww){const k=e.t/ww;S.arms[0].rotation.x=-1.8*k;S.arms[1].rotation.x=-1.8*k;S.core.scale.setScalar(1+k);}else S.core.scale.setScalar(1);}
  if(e.dead){const k=Math.min(1,e.deadT/1.2);S.robeM.opacity=.92*(1-k);S.root.scale.setScalar(1+k*.5);S.b.position.y+=k*1.5;if(e.deadT>1.2)S.root.visible=false;}
  if(e.stun>0)S.b.rotation.z=Math.sin(T*8)*.2;else S.b.rotation.z=0;
  S.robeM.emissive.setRGB(.24+e.flash*2,.12+e.flash*2,.6+e.flash*2);
  S.root.position.set(e.pos.x,e.pos.y+e.fly-1,e.pos.z);S.root.rotation.y=e.yaw;if(!e.dead)squash(S.root,e.sq);
  if(Math.random()<.4&&!e.dead)FXA.emit(e.pos.x+rr(-.3,.3),e.pos.y+e.fly+rr(-.4,.6),e.pos.z+rr(-.3,.3),rr(-.2,.2),rr(.2,.6),rr(-.2,.2),.8,.12,.02,.9,.5,2.2,.8,-.3,.5,1);}
