/* ============================== shared game state ============================== */
const G={state:'loading',t:0,hitstop:0,slow:0,slowS:1,cine:0,playTime:0,kills:0,fp:!!SET.fp,firstRun:true};
const E=[],PROJ=[];
const IN={mx:0,mz:0,lookX:0,lookY:0,atk:false,atkP:false,atkHeld:0,hvy:false,hvyP:false,blk:false,blkP:false,dodgeP:false,flaskP:false,lockP:false,actP:false,sprint:false,viewP:false,pauseP:false,lockSwitch:0};
function clearPresses(){IN.hvyP=IN.atkP=IN.blkP=IN.dodgeP=IN.flaskP=IN.lockP=IN.actP=IN.viewP=IN.pauseP=false;IN.lookX=IN.lookY=0;IN.lockSwitch=0;}
const fwdV=(y,o)=>o.set(-Math.sin(y),0,-Math.cos(y));

/* ============================== hero animation library ============================== */
const HP={},HT={};
function initHeroPoses(){
  HP.idle=pose({y:-.012,spi:[5,0,0],head:[2,0,0],shL:[4,0,-7],elL:14,shR:[16,10,8],elR:30,wrR:[-70,0,0],hipL:[2,0,-2],hipR:[2,0,2],knL:-4,knR:-4});
  HP.guard=pose({y:-.07,pel:[0,-14,0],spi:[9,-4,0],head:[-6,16,0],shL:[24,-12,-16],elL:56,shR:[36,30,18],elR:72,wrR:[6,0,-8],hipL:[16,0,-5],knL:-24,hipR:[-6,0,6],knR:-16,ftL:8,ftR:9});
  const g=HP.guard;
  HP.block=pose({y:-.09,spi:[10,16,0],head:[-6,-8,0],shR:[84,58,4],elR:94,wrR:[24,0,0],shL:[58,-34,-8],elL:86,hipL:[18,0,-5],knL:-26,hipR:[-8,0,6],knR:-20},g);
  HP.charge=pose({y:-.12,pel:[0,-32,0],spi:[10,-56,0],head:[-6,40,0],shR:[24,-112,44],elR:22,wrR:[-84,0,0],shL:[40,30,-30],elL:60,hipL:[26,0,-6],knL:-38,hipR:[-14,0,8],knR:-28},g);
  HP.tuck=pose({y:-.5,spi:[52,0,0],head:[34,0,0],shL:[70,0,-10],elL:110,shR:[70,0,10],elR:100,wrR:[-60,0,0],hipL:[100,0,-6],knL:-125,hipR:[100,0,6],knR:-125},g);
  HP.kneel=pose({y:-.47,spi:[18,0,0],head:[16,0,0],hipL:[92,0,-6],knL:-92,hipR:[-6,0,6],knR:-118,ftR:30,shR:[60,0,10],elR:22,wrR:[-128,0,0],shL:[46,0,-10],elL:40},g);
  // time-scale a key list so the swing shape stays but lands sooner
  const TS=(keys,f)=>keys.map(k=>[k[0]*f,k[1],k[2]]);
  HT.light1=track(g,TS([[0,g],[.13,{pel:[0,-26,0],spi:[6,-40,4],shR:[62,-72,34],elR:30,wrR:[-72,0,10],shL:[30,10,-22],elL:62}],
    [.23,{pel:[0,4,0],spi:[10,6,0],shR:[84,8,12],elR:8,wrR:[-88,0,0],hipR:[20,0,4],knR:-14,hipL:[-12,0,-4]},eOut2],
    [.34,{pel:[0,22,0],spi:[10,42,-4],shR:[70,94,4],elR:20,wrR:[-80,0,-10],hipR:[28,0,4],knR:-24,hipL:[-16,0,-4],knL:-10},eOut2],[.72,g]],.69));
  HT.light2=track(g,TS([[0,HT.light1[3].p],[.12,{pel:[0,26,0],spi:[8,46,0],shR:[98,98,0],elR:72,wrR:[-60,0,0],hipR:[24,0,4],knR:-20}],
    [.23,{pel:[0,0,0],spi:[10,0,0],shR:[82,0,18],elR:10,wrR:[-88,0,0]},eOut2],
    [.34,{pel:[0,-22,0],spi:[8,-42,0],shR:[58,-90,42],elR:22,wrR:[-76,0,0],hipL:[26,0,-4],knL:-22,hipR:[-14,0,4]},eOut2],[.72,g]],.69));
  // third hit: a straight thrust that reaches further
  HT.light3=track(g,[[0,HT.light2[3].p],[.09,{pel:[0,-22,0],spi:[4,-30,0],shR:[30,-18,32],elR:112,wrR:[-92,0,0],shL:[40,20,-20],elL:60,hipR:[-12,0,4],knR:-16,hipL:[14,0,-4],knL:-18}],
    [.16,{y:-.1,pel:[0,10,0],spi:[18,10,0],shR:[88,2,6],elR:2,wrR:[-92,0,0],shL:[30,-30,-34],elL:40,hipR:[46,0,4],knR:-48,hipL:[-24,0,-4],knL:-18,head:[-6,-8,0]},eOut2],
    [.3,{y:-.1,pel:[0,12,0],spi:[18,16,0],shR:[84,10,6],elR:10,wrR:[-92,0,6],shL:[30,-30,-34],elL:40,hipR:[46,0,4],knR:-48,hipL:[-24,0,-4],knL:-18}],[.56,g]]);
  // finisher: overhead slam
  HT.light4=track(g,[[0,HT.light3[3].p],[.19,{y:.02,spi:[-16,-8,0],shR:[170,12,10],elR:66,wrR:[30,0,0],shL:[142,-20,-6],elL:72,head:[-12,0,0],hipR:[8,0,0]}],
    [.27,{y:-.16,pel:[14,0,0],spi:[34,0,0],shR:[52,4,6],elR:4,wrR:[-74,0,0],shL:[42,-10,-10],elL:30,hipR:[48,0,4],knR:-56,hipL:[-24,0,-4],knL:-20,head:[-22,0,0]},eIn2],
    [.48,{y:-.16,pel:[14,0,0],spi:[34,0,0],shR:[48,4,6],elR:6,wrR:[-78,0,0],shL:[42,-10,-10],elL:30,hipR:[48,0,4],knR:-56,hipL:[-24,0,-4],knL:-20,head:[-22,0,0]}],[.8,g]]);
  // heavy: two-handed diagonal cleave from high over the right shoulder
  HT.heavy=track(g,[[0,g],[.27,{y:.02,pel:[0,-30,0],spi:[-10,-48,6],head:[-8,30,0],shR:[158,-46,40],elR:84,wrR:[14,0,0],shL:[124,-6,-12],elL:84,hipR:[-8,0,4],knR:-10,hipL:[12,0,-6],knL:-16}],
    [.37,{y:-.15,pel:[8,30,0],spi:[30,40,-6],head:[-14,-20,0],shR:[50,62,10],elR:6,wrR:[-80,0,0],shL:[54,12,-30],elL:32,hipR:[46,0,4],knR:-52,hipL:[-22,0,-4],knL:-18},eIn2],
    [.6,{y:-.15,pel:[8,32,0],spi:[28,44,-6],head:[-14,-20,0],shR:[46,66,10],elR:10,wrR:[-82,0,0],shL:[52,14,-30],elL:34,hipR:[46,0,4],knR:-52,hipL:[-22,0,-4],knL:-18}],[.88,g]]);
  HT.runatk=track(g,[[0,g],[.12,{y:.04,spi:[-6,-30,0],shR:[120,-40,30],elR:50,wrR:[-40,0,0],hipL:[40,0,0],knL:-60}],
    [.26,{y:-.12,pel:[10,10,0],spi:[30,20,0],shR:[60,60,10],elR:8,wrR:[-85,0,0],hipR:[44,0,4],knR:-50,hipL:[-20,0,-4]},eOut2],[.46,{y:-.12,pel:[10,10,0],spi:[26,30,0],shR:[54,78,8],elR:14,wrR:[-80,0,0],hipR:[44,0,4],knR:-50,hipL:[-20,0,-4]}],[.74,g]]);
  HT.spin=track(g,[[0,HP.charge],[.12,{y:-.08,spi:[8,14,0],shR:[86,-26,30],elR:6,wrR:[-88,0,0],shL:[60,20,-50],elL:20,hipL:[10,0,-8],hipR:[10,0,8],knL:-22,knR:-22}],
    [.46,{y:-.08,spi:[8,30,0],shR:[86,-10,26],elR:6,wrR:[-88,0,0],shL:[60,20,-50],elL:20,hipL:[10,0,-8],hipR:[10,0,8],knL:-22,knR:-22}],[.66,g]]);
  HT.parry=track(g,[[0,g],[.06,{spi:[4,26,0],shR:[110,66,10],elR:88,wrR:[36,0,0],shL:[30,-10,-12]},eOut2],[.34,HP.block]]);
  HT.riposte=track(g,[[0,g],[.18,{pel:[0,-28,0],spi:[6,-36,0],shR:[56,-14,24],elR:114,wrR:[-92,0,0],shL:[40,20,-20],elL:60,hipR:[-12,0,4],knR:-14}],
    [.32,{y:-.12,pel:[0,6,0],spi:[18,8,0],shR:[86,2,6],elR:2,wrR:[-92,0,0],shL:[30,-30,-30],elL:40,hipR:[46,0,4],knR:-48,hipL:[-24,0,-4],knL:-18},eIn2],
    [.66,{y:-.12,pel:[0,10,0],spi:[18,22,0],shR:[80,20,6],elR:12,wrR:[-92,0,10],shL:[30,-30,-30],elL:40,hipR:[46,0,4],knR:-48,hipL:[-24,0,-4],knL:-18}],[1.05,g]]);
  HT.drink=track(g,[[0,g],[.3,{shL:[150,-38,-12],elL:134,head:[-30,0,0],spi:[-6,0,0]}],[.85,{shL:[150,-38,-12],elL:134,head:[-30,0,0],spi:[-6,0,0]}],[1.2,g]]);
  HT.hurt=track(g,[[0,g],[.08,{y:-.08,spi:[-18,12,0],head:[-22,0,0],shL:[40,0,-40],elL:30,shR:[30,10,40],elR:40}],[.38,g]]);
  HT.stagger=track(g,[[0,g],[.12,{y:-.1,spi:[-26,14,0],head:[-26,0,0],shL:[44,0,-56],elL:30,shR:[30,10,52],elR:30,hipL:[-16,0,0],hipR:[24,0,0],knR:-34}],[.5,{y:-.12,spi:[20,-6,0],head:[10,0,0],hipL:[20,0,0],knL:-40}],[.9,g]]);
  HT.knock=track(g,[[0,g],[.25,{y:-.6,pel:[60,0,0],spi:[-10,0,0],head:[-10,0,0],shL:[120,0,-50],shR:[100,0,50],hipL:[-40,0,0],hipR:[-30,0,0],knL:-20,knR:-30}],
    [.45,{y:-.8,pel:[84,0,0],spi:[4,0,0],head:[6,10,0],shL:[150,0,-30],elL:20,shR:[130,0,40],elR:30,hipL:[0,0,-10],hipR:[10,0,10],knL:-10,knR:-25}],[.95,{y:-.8,pel:[84,0,0],spi:[4,0,0],head:[6,10,0],shL:[150,0,-30],elL:20,shR:[130,0,40],elR:30,hipL:[0,0,-10],hipR:[10,0,10],knL:-10,knR:-25}],
    [1.25,HP.kneel],[1.6,g]]);
  HT.death=track(g,[[0,g],[.3,{y:-.22,spi:[-22,0,0],head:[-26,0,0],knL:-44,knR:-54,hipL:[34,0,0],hipR:[44,0,0],shL:[30,0,-40],shR:[20,0,40]}],
    [1.0,{y:-.8,pel:[84,0,0],spi:[6,0,0],head:[10,24,0],shL:[150,0,-32],elL:20,shR:[124,0,42],elR:30,hipL:[0,0,-10],hipR:[10,0,10],knL:-10,knR:-26},eIn2]]);
  HT.rest=track(g,[[0,g],[.6,HP.kneel],[1.9,HP.kneel],[2.4,g]]);
}
/* ============================== player ============================== */
const PA=CFG.moves;
const ATTACKS=new Set(['light1','light2','light3','light4','heavy','runatk','spin','riposte']);
const MOVE_ACTS=new Set(['block','charge','drink','parry']);
const P={pos:V3(0,0,4),vel:V3(),av:V3(),yaw:0,hp:100,maxHp:100,st:100,maxSt:100,chip:100,stats:{vig:1,end:1,str:1},lvl:1,braci:0,drop:null,safe:{x:0,z:4},safeT:0,hero:'m',quests:{},flags:{},sword:0,flasks:3,flaskMax:3,dmgMul:1,
  act:null,blendT:0,buf:null,blockPress:-9,iframe:0,stDelay:0,dead:false,lock:null,sprinting:false,spinYaw:0,combatK:0,lastAtk:null,heal:0,shrine:0,inWard:false,lastHit:-9,flinch:0,flinchV:0,kills:0,hyperT:0,
  cleared:CAMPS.map(()=>false),chests:CAMPS.map(()=>false),
  amx:0,amz:0,gait:{ph:0,w:0,seed:1.3},roll:0,pitchL:0,fo:0,yawRate:0,wade:0,accF:0,lastVF:0,stepSide:0};
let PL=null;
// _B: pose a new move blends in from; _F0: this frame's pose before the flinch and the computed layers (what _B copies)
const _L=new Float32Array(NP),_A=new Float32Array(NP),_F=new Float32Array(NP),_B=new Float32Array(NP),_F0=new Float32Array(NP);
// rotate a toward b: exponential response capped at maxW rad/s
const turnYaw=(a,b,k,maxW,dt)=>{const d=angD(a,b);let s=d*(1-Math.exp(-k*dt));const m=maxW*dt;if(s>m)s=m;else if(s<-m)s=-m;return a+s;};
function recalcStats(){const hpr=P.hp/P.maxHp;P.maxHp=CFG.hp.base+(P.stats.vig-1)*CFG.hp.perVig;P.maxSt=CFG.stam.base+(P.stats.end-1)*CFG.stam.perEnd;P.dmgMul=1+(P.stats.str-1)*CFG.str.per;
  P.lvl=P.stats.vig+P.stats.end+P.stats.str-2;P.hp=Math.min(P.maxHp,Math.max(1,hpr*P.maxHp));}
function createPlayer(hero){const F=hero==='f';
  const mats=heroMats();const rig=buildHuman({d:F?HEROINE_D:HERO_D,mats,build:F?(a,d)=>heroBuild(a,d,{f:1}):heroBuild});scene.add(rig.root);
  const flask=new THREE.Group();const fb=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),new THREE.MeshStandardMaterial({color:col(0x6a1410),emissive:new THREE.Color(.9,.12,.05),roughness:.2,metalness:.1,transparent:true,opacity:.92}));
  const fn=new THREE.Mesh(new THREE.CylinderGeometry(.015,.02,.06,6),new THREE.MeshStandardMaterial({color:col(0x8a7a5a),roughness:.6}));fn.position.y=.06;flask.add(fb,fn);flask.position.set(0,-.08,-.02);flask.visible=false;rig.P.wrL.add(flask);
  PL={rig,mats,cape:new Cape(rig),trail:new Trail(30),flask,sw:null,hero:F?'f':'m',lastAct:null};
  setSword(0);}
// change body (character select, "Continua"): rebuild rig, cape, trail, flask and sword; the Meshy model only dresses the hero
function setHero(h){h=h==='f'?'f':'m';P.hero=h;if(PL&&PL.hero===h)return;
  if(PL){meshyDetach();scene.remove(PL.rig.root);for(const m of PL.rig.meshes)m.geometry.dispose();for(const k in PL.mats)PL.mats[k].dispose();
    scene.remove(PL.cape.mesh);PL.cape.mesh.geometry.dispose();PL.cape.mat.dispose();scene.remove(PL.trail.mesh);PL.trail.mesh.geometry.dispose();PL.trail.mesh.material.dispose();}
  createPlayer(h);if(h==='m')meshyAttach();setSword(P.sword||0);setView(G.fp);resetBlend();}
// no blend carried across a respawn, a teleport or a new body: the pose starts clean (and the action weight at its target)
function resetBlend(){P.blendT=0;if(PL)PL.lastAct=P.act;P.aw=P.act?1:0;}
function setSword(t){if(PL.sw&&PL.sw.g.parent)PL.sw.g.parent.remove(PL.sw.g);PL.sw=buildSword(t);PL.sw.g.position.set(0,-.072,-.004);(MESHY.on?MESHY.proxR:PL.rig.P.wrR).add(PL.sw.g);
  const gl=SWORDS[t].glow;PL.trail.u.uC.value.copy(gl?new THREE.Color(gl[0],gl[1],gl[2]).multiplyScalar(.8):new THREE.Color(1.9,1.75,1.45));$('swordName').textContent=SWORDS[t].name;}
function setView(fp){G.fp=fp;PL.rig.P.head.scale.setScalar(fp?.001:1);PL.cape.mesh.visible=!fp;$('fpCross').hidden=!fp||G.state!=='play';camera.near=fp?.05:.08;camera.updateProjectionMatrix();}
function useSt(n){P.st=Math.max(-12,P.st-n);P.stDelay=CFG.st.delay;}
function stFlash(){const b=$('stBar');b.classList.add('empty');setTimeout(()=>b.classList.remove('empty'),300);}
function nearestEnemyFront(maxD,cosMin){let best=null,bs=-1e9;fwdV(CAM.yaw,_v3);for(const e of E){if(e.dead||!e.active)continue;const dx=e.pos.x-P.pos.x,dz=e.pos.z-P.pos.z,d=Math.hypot(dx,dz);if(d>maxD||d<.01)continue;
  const c=(dx*_v3.x+dz*_v3.z)/d;if(c<cosMin)continue;const sc=c*2-d/maxD*1.5;if(sc>bs){bs=sc;best=e;}}return best;}
// best foe to swing at: the lock-on target, else whoever sits nearest the stick direction (or facing)
function attackTarget(){if(P.lock&&!P.lock.dead)return P.lock;const C=CFG.combat;let dx,dz;
  if(P.moveLen>.25){dx=P.moveX/P.moveLen;dz=P.moveZ/P.moveLen;}else{fwdV(G.fp?CAM.yaw:P.yaw,_v3);dx=_v3.x;dz=_v3.z;}
  let best=null,bs=-1e9;for(const e of E){if(e.dead||!e.active)continue;const ex=e.pos.x-P.pos.x,ez=e.pos.z-P.pos.z,d=Math.hypot(ex,ez);if(d>C.aimRange+e.r||d<.01)continue;
    if(Math.abs((e.pos.y+(e.fly||0))-P.pos.y)>3)continue;const c=(ex*dx+ez*dz)/d;if(c<C.aimCos&&d>1.6)continue;const sc=c*2.2-d/C.aimRange*1.6;if(sc>bs){bs=sc;best=e;}}return best;}
function startAct(k,o){const D=PA[k];P.act=Object.assign({k,t:0,hit:new Set(),snd:false},o||{});if(D.st)useSt(D.st);
  if(ATTACKS.has(k)&&!P.act.tgt){P.act.tgt=attackTarget();if(!P.act.tgt){if(G.fp)P.act.aimYaw=CAM.yaw;else if(P.moveLen>.2)P.act.aimYaw=yawTo(P.moveX,P.moveZ);}}
  return P.act;}
function startDodge(dx,dz){const back=dx===null;const k=back?'back':'dodge';if(P.st<=0){stFlash();}startAct(k);
  if(back){fwdV(P.yaw,_v1);P.act.dx=-_v1.x;P.act.dz=-_v1.z;}else{P.act.dx=dx;P.act.dz=dz;if(!(P.lock&&!P.lock.dead))P.yaw=yawTo(dx,dz);else{P.act.rollYaw=yawTo(dx,dz);}}
  // keep the momentum that points along the roll, drop the rest
  const vd=P.vel.x*P.act.dx+P.vel.z*P.act.dz;P.vel.set(P.act.dx*Math.max(0,vd)*.4,0,P.act.dz*Math.max(0,vd)*.4);
  sfx('roll',P.pos);}
function riposteTarget(){for(const e of E){if(e.dead||!(e.stun>0))continue;const dx=e.pos.x-P.pos.x,dz=e.pos.z-P.pos.z,d=Math.hypot(dx,dz);if(d<3.0){fwdV(P.yaw,_v1);if(P.lock===e||(dx*_v1.x+dz*_v1.z)/d>-.2||d<1.8)return e;}}return null;}
function handleInput(dt){
  if(P.dead)return;const a=P.act,k=a?a.k:null;if(k==='rest'||k==='death')return;const C=CFG.combat;
  if(IN.atkP)P.buf={k:'atk',t:.34};if(IN.hvyP)P.buf={k:'hvy',t:.34};if(IN.dodgeP)P.buf={k:'dodge',t:.3};if(IN.flaskP)P.buf={k:'flask',t:.3};if(IN.blkP)P.blockPress=G.t;
  if(P.buf){P.buf.t-=dt;if(P.buf.t<=0)P.buf=null;}
  // charging: let go to unleash the spin (stronger once fully charged)
  if(k==='charge'){if(!IN.hvy){const ch=a.t>=C.chargeFull;startAct('spin',{charged:ch});if(ch){magic(V3(P.pos.x,P.pos.y+1,P.pos.z),18,[2.4,1.8,.8],3,.5);}}return;}
  if(k==='heavy'&&IN.hvy&&a.t>=C.chargeMin&&a.t<PA.heavy.hit[0]-.05&&P.st>C.chargeSt){P.act={k:'charge',t:0,hit:new Set()};P.buf=null;return;}
  if(k==='block'&&!IN.blk)P.act=null;
  const D=P.act?PA[P.act.k]:null,t=P.act?P.act.t:0;
  const canAct=!P.act||t>=D.cancel,canDodge=!P.act||t>=(D.dodge!==undefined?D.dodge:D.cancel);
  const b=P.buf;
  if(b&&b.k==='dodge'&&canDodge&&!(P.act&&P.act.k==='dodge'&&t<.5)){P.buf=null;if(P.moveLen>.2)startDodge(P.moveX/P.moveLen,P.moveZ/P.moveLen);else startDodge(null,null);return;}
  if(!canAct)return;
  if(b){
    if(b.k==='atk'){P.buf=null;const rt=riposteTarget();if(rt){startRiposte(rt);return;}if(P.st<=0){stFlash();return;}
      const cur=P.act&&ATTACKS.has(P.act.k)?P.act.k:(P.lastAtk&&G.t-P.lastAtk.t<.3?P.lastAtk.k:null);
      if(cur&&PA[cur].next){startAct(PA[cur].next);return;}if(P.sprinting&&P.moveLen>.5){startAct('runatk');return;}startAct('light1');return;}
    if(b.k==='hvy'){P.buf=null;const rt=riposteTarget();if(rt){startRiposte(rt);return;}if(P.st<=0){stFlash();return;}startAct('heavy');return;}
    if(b.k==='flask'&&(!P.act||P.act.k==='block')){P.buf=null;if(P.flasks>0){startAct('drink');PL.flask.visible=true;}else toast('Fiaschette esaurite. Riposa a un santuario.');return;}}
  if(IN.blk&&k!=='block'&&k!=='parry'){if(G.t-P.blockPress<CFG.parry.guardTap){startAct('parry');}else P.act={k:'block',t:0,hit:new Set()};}
}
function startRiposte(e){startAct('riposte',{tgt:e});P.yaw=yawTo(e.pos.x-P.pos.x,e.pos.z-P.pos.z);e.ripT=1.2;e.stun=Math.max(e.stun,1.2);G.slow=.75;G.slowS=.4;G.cine=.9;}
/* ---------- blade-sweep hit detection: the hit lands when the steel actually reaches the body ---------- */
const _bA=V3(),_bB=V3(),_bA0=V3(),_bB0=V3(),_ta=V3(),_tb=V3(),_hp=V3();let bladeInit=false;
function testBlade(e,out){const tol=CFG.combat.tol,R=e.r+tol,R2=R*R,ex=e.pos.x,ez=e.pos.z,fy=e.fly||0,y0=e.pos.y+fy+.1-tol,y1=e.pos.y+fy+Math.max(e.h,1.75)+tol;
  for(let k=0;k<3;k++){const f=k/2;_ta.lerpVectors(_bA0,_bA,f);_tb.lerpVectors(_bB0,_bB,f);
    for(let j=0;j<6;j++){const u=.2+j*.18,px=_ta.x+(_tb.x-_ta.x)*u,py=_ta.y+(_tb.y-_ta.y)*u,pz=_ta.z+(_tb.z-_ta.z)*u;
      if(py<y0||py>y1)continue;const dx=px-ex,dz=pz-ez;if(dx*dx+dz*dz<R2){out.set(px,py,pz);return true;}}}return false;}
function bladeHits(){PL.sw.base.getWorldPosition(_bA);PL.sw.tip.getWorldPosition(_bB);if(!bladeInit){_bA0.copy(_bA);_bB0.copy(_bB);bladeInit=true;}
  const a=P.act;
  if(a&&ATTACKS.has(a.k)){const D=PA[a.k];
    if(a.t>=D.hit[0]&&a.t<=D.hit[1]+1e-4){for(const e of E){if(e.dead||!e.active||a.hit.has(e)||e.evadeT>.2)continue;if(D.rip&&e!==a.tgt)continue;
        if(testBlade(e,_hp)){a.hit.add(e);damageEnemy(e,a,D,e.pos.x-P.pos.x,e.pos.z-P.pos.z,_hp);}}}
    // safety net: the foe you aimed at still gets hit if the swing geometry just grazed past it
    if(!a.net&&a.t>D.hit[1]){a.net=true;const e=a.tgt;if(e&&!e.dead&&e.active&&!a.hit.has(e)){const dx=e.pos.x-P.pos.x,dz=e.pos.z-P.pos.z,d=Math.hypot(dx,dz)||.01;fwdV(P.yaw+(D.spin?P.spinYaw:0),_v1);
        if(d<D.range+e.r&&((dx*_v1.x+dz*_v1.z)/d>.25||d<e.r+.7||D.spin)&&Math.abs(e.pos.y+(e.fly||0)-P.pos.y)<2.8){a.hit.add(e);damageEnemy(e,a,D,dx,dz,null);}}}}
  _bA0.copy(_bA);_bB0.copy(_bB);}
// actions add their own motion (lunges, rolls, knock-back) to P.amx/P.amz; it goes through the same collision solver as walking
function runAction(a,D,dt){const k=a.k;
  if(ATTACKS.has(k)){const tg=a.tgt&&!a.tgt.dead?a.tgt:null;
    // turn onto the target over the first instants of the swing (fast, but you see it happen)
    if(a.t<=(D.aim||.08)+1e-4){const ty=tg?yawTo(tg.pos.x-P.pos.x,tg.pos.z-P.pos.z):a.aimYaw;if(ty!==undefined)P.yaw=turnYaw(P.yaw,ty,46,24,dt);}
    if(D.lunge&&a.t>=D.lunge[0]&&a.t<=D.lunge[1]){
      if(a.lungeL===undefined){a.lungeL=D.lunge[2]*.6;if(tg){const d=Math.hypot(tg.pos.x-P.pos.x,tg.pos.z-P.pos.z);a.lungeL=clamp(d-(tg.r+.95),0,D.lunge[2]*1.25);}}
      let blocked=false;for(const e of E){if(e.dead||!e.active)continue;const d=Math.hypot(e.pos.x-P.pos.x,e.pos.z-P.pos.z);if(d<e.r+.85){fwdV(P.yaw,_v1);if((e.pos.x-P.pos.x)*_v1.x+(e.pos.z-P.pos.z)*_v1.z>0){blocked=true;break;}}}
      if(!blocked){const T=D.lunge[1]-D.lunge[0],u=(a.t-D.lunge[0])/T,sp=a.lungeL/T*2*(1-u);fwdV(P.yaw,_v1);P.amx+=_v1.x*sp*dt;P.amz+=_v1.z*sp*dt;}}
    PL.trail.on=a.t>=D.trail[0]&&a.t<=D.trail[1];
    if(!a.snd&&a.t>=D.hit[0]-.04){a.snd=true;sfx(D.snd,P.pos,a.charged?1.3:1);}
    if(D.spin)P.spinYaw=-TAU*eIO(clamp((a.t-.06)/.42,0,1));else P.spinYaw=0;
    if(a.t>=D.dur)P.lastAtk={k,t:G.t};}
  else if(k==='dodge'||k==='back'){const T0=D.iframe[0],T1=D.iframe[1];P.iframe=a.t>=T0&&a.t<T1?.05:P.iframe;
    const f=a.t<.46?(1-a.t/.46):0;const sp=D.dist/.46*2*f;P.amx+=a.dx*sp*dt;P.amz+=a.dz*sp*dt;
    if(k==='dodge'&&a.t>.12&&!a.dust){a.dust=1;if(P.wade>.05)splash(P.pos,10,1.2);else dust(P.pos,6,.8);}if(k==='dodge'&&a.t>.4&&!a.dust2){a.dust2=1;if(P.wade>.05)splash(P.pos,6);else dust(P.pos,4,.7);}}
  else if(k==='knock'){P.iframe=a.t<1.3?.05:P.iframe;if(a.t<.35){const sp=(1-a.t/.35)*7;P.amx+=a.dx*sp*dt;P.amz+=a.dz*sp*dt;}}
  else if(k==='drink'){if(a.t>=.55&&!a.done){a.done=1;P.flasks--;P.heal+=P.maxHp*CFG.flask.heal;healFx(P.pos);sfx('drink',P.pos);}if(a.t>=1.1)PL.flask.visible=false;}
  else if(k==='rest'){if(a.t>=.9&&!a.done){a.done=1;restAtShrine(a.shrine);}}
  else if(k==='parry'){if(a.t>=D.dur&&IN.blk){P.act={k:'block',t:0,hit:new Set()};}}
  else if(k==='hurt'||k==='stagger'){if(a.t<.2){P.amx+=a.dx*2.5*dt;P.amz+=a.dz*2.5*dt;}}
}
// gradient of the terrain (rise per metre)
// the demo's bridge and cliff stairs are floors over steep rock: there the slope is the floor's
function slopeAt(x,z,o){const g=DEMO?gY:gH;o.x=(g(x+.35,z)-g(x-.35,z))/.7;o.z=(g(x,z+.35)-g(x,z-.35))/.7;return o;}
const _sl={x:0,z:0};
function updPlayer(dt){
  const M=CFG.move;
  // last safe ground (dry land) every 0.5 s: where the braci land if the player dies in deep water
  P.safeT-=dt;if(P.safeT<=0){P.safeT=.5;if(!P.dead&&wadeDepth(P.pos.x,P.pos.z)<.3){P.safe.x=P.pos.x;P.safe.z=P.pos.z;}}
  const cy=CAM.yaw,fx=-Math.sin(cy),fz=-Math.cos(cy),rx=Math.cos(cy),rz=-Math.sin(cy);
  let ix=IN.mx,iz=IN.mz,il=Math.hypot(ix,iz);if(il>1){ix/=il;iz/=il;il=1;}
  P.moveX=rx*ix+fx*iz;P.moveZ=rz*ix+fz*iz;P.moveLen=il;
  if(P.lock&&(P.lock.dead||!P.lock.active||P.lock.pos.distanceTo(P.pos)>30))P.lock=autoRelock(P.lock);
  P.iframe=Math.max(0,P.iframe-dt);P.stDelay-=dt;P.flinch+=P.flinchV*dt;P.flinchV+=(-P.flinch*220-P.flinchV*18)*dt;
  if(P.heal>0){const h=Math.min(P.heal,P.maxHp*.9*dt);P.heal-=h;P.hp=Math.min(P.maxHp,P.hp+h);}
  const a0=P.act,k0=a0?a0.k:null;
  if(P.stDelay<=0){const rate=(k0==='block'||k0==='charge')?CFG.st.guardRegen:(P.sprinting?0:CFG.st.regen+P.stats.end*CFG.st.regenPerEnd);P.st=Math.min(P.maxSt,P.st+rate*dt);}
  if(P.act){P.act.t+=dt;const D=PA[P.act.k];runAction(P.act,D,dt);if(P.act&&P.act.t>=D.dur&&D.dur<90)P.act=null;}
  if(!P.act||!ATTACKS.has(P.act.k)){PL.trail.on=false;P.spinYaw=0;}
  handleInput(dt);
  const a=P.act,k=a?a.k:null,lock=P.lock&&!P.lock.dead?P.lock:null;
  /* ---- target speed from stick / keys ---- */
  const dx=il>.01?P.moveX/il:0,dz=il>.01?P.moveZ/il:0;
  let spd=0;P.sprinting=false;
  if(!k&&!P.dead){
    if(IN.sprint&&il>.5&&P.st>0&&!lock){P.sprinting=true;spd=M.sprint;P.st-=M.sprintSt*dt;P.stDelay=M.sprintDelay;if(P.st<=0){P.st=0;stFlash();}}
    else{const top=lock?M.lock:M.jog;spd=il<.6?M.walk*il/.6:lerp(M.walk,top,(il-.6)/.4);
      if(lock){fwdV(P.yaw,_v1);const back=-(dx*_v1.x+dz*_v1.z);if(back>.3)spd=Math.min(spd,lerp(M.lock,M.lockBack,clamp((back-.3)/.7,0,1)));}}}
  else if(MOVE_ACTS.has(k))spd=(k==='block'?M.guard:k==='charge'?M.charge:k==='drink'?M.drink:M.parry)*il;
  // terrain: steep uphill slows you, shallow water drags at your legs
  slopeAt(P.pos.x,P.pos.z,_sl);
  if(spd>0){const up=_sl.x*dx+_sl.z*dz;if(up>M.slopeSlow)spd*=1-.6*clamp((up-M.slopeSlow)/(M.slopeBlock-M.slopeSlow),0,1);}
  P.wade=wadeDepth(P.pos.x,P.pos.z);if(P.wade>.04)spd*=1-M.wade*clamp(P.wade/M.wadeDeep,0,1);
  /* ---- accelerate toward it: quick to start, quicker to stop, heavier at sprint ---- */
  const tvx=dx*spd,tvz=dz*spd,cs=Math.hypot(P.vel.x,P.vel.z),moving=!k||MOVE_ACTS.has(k);
  const opposing=tvx*P.vel.x+tvz*P.vel.z<0;
  const acc=!moving?M.actFric:(spd<cs-.05||opposing?M.brake:(P.sprinting&&cs>M.jog*.92?M.accSprint:M.acc));
  {let ax=tvx-P.vel.x,az=tvz-P.vel.z;const al=Math.hypot(ax,az),am=acc*dt;if(al>am){ax*=am/al;az*=am/al;}P.vel.x+=ax;P.vel.z+=az;}
  /* ---- displacement = walking + action motion, resolved with sub-steps so walls slide ---- */
  let mx=P.vel.x*dt+P.amx,mz=P.vel.z*dt+P.amz;P.amx=P.amz=0;
  {const gl=Math.hypot(_sl.x,_sl.z);if(gl>M.slopeBlock){const nx=_sl.x/gl,nz=_sl.z/gl,u=mx*nx+mz*nz;if(u>0){mx-=nx*u;mz-=nz*u;}}}
  const ox=P.pos.x,oz=P.pos.z;
  moveBody(P.pos,mx,mz,M.radius,P.vel);
  // other bodies: mass-weighted soft push; a roll slips past anything smaller than a troll
  for(const e of E){if(e.dead||!e.active||e.type==='spirit')continue;const sx=P.pos.x-e.pos.x,sz=P.pos.z-e.pos.z,m=e.r+M.radius,d2=sx*sx+sz*sz;
    if(d2>=m*m||d2<1e-8)continue;if(P.iframe>0&&e.type!=='troll')continue;const d=Math.sqrt(d2),share=e.d.mass/(e.d.mass+M.mass),k2=(m-d)*share*Math.min(1,dt*24)/d;
    P.pos.x+=sx*k2;P.pos.z+=sz*k2;}
  collide(P.pos,M.radius);
  P.pos.y=gY(P.pos.x,P.pos.z);
  const idt=1/Math.max(dt,1e-4);P.av.set((P.pos.x-ox)*idt,0,(P.pos.z-oz)*idt);
  /* ---- facing ---- */
  const yaw0=P.yaw;
  if(G.fp&&!P.dead&&(!k||!['dodge','back','knock','riposte','rest','death'].includes(k)))P.yaw=CAM.yaw;
  else if(lock&&!P.dead&&k!=='dodge'&&k!=='knock'&&k!=='death'&&k!=='rest'){P.yaw=turnYaw(P.yaw,yawTo(lock.pos.x-P.pos.x,lock.pos.z-P.pos.z),k?7:M.turnLock,M.turnMax*1.2,dt);}
  else if((!k||MOVE_ACTS.has(k))&&il>.1){const r=P.sprinting?M.turnSprint:M.turn;P.yaw=turnYaw(P.yaw,yawTo(P.moveX,P.moveZ),k?r*.4:r,M.turnMax*(k?.45:1),dt);}
  P.yawRate=damp(P.yawRate,angD(yaw0,P.yaw)*idt,14,dt);
  fwdV(P.yaw,_v1);const vfN=P.av.x*_v1.x+P.av.z*_v1.z;P.accF=damp(P.accF,(vfN-P.lastVF)*idt,10,dt);P.lastVF=vfN;
  const near=E.some(e=>!e.dead&&e.active&&e.aggro&&e.pos.distanceToSquared(P.pos)<18*18);P.combatK=damp(P.combatK,(near||lock||G.t-P.lastHit<4||k==='block'||ATTACKS.has(k))?1:0,3,dt);
  U.player.value.copy(P.pos);
  P.inWard=false;for(const s of SHRINES){if(Math.hypot(P.pos.x-s.x,P.pos.z-s.z)<5.2){P.inWard=true;P.nearShrine=s;break;}}
  animPlayer(dt);bladeHits();
}
// ground under a foot for gaitIK: body position and facing of this frame (set in animPlayer), measures of the legs in use
let _gx=0,_gz=0,_gy=0,_gyaw=0,_gd=null;
function _gnd(i,fwd,right){const Fx=-Math.sin(_gyaw),Fz=-Math.cos(_gyaw),o=(i?1:-1)*_gd.hipW+right;return gY(_gx+Fx*fwd-Fz*o,_gz+Fz*fwd+Fx*o)-_gy;}
const _gopt={arm:1,armR:1,elbow:1,gnd:_gnd,clip:1};
// clavicles follow the arms: above clavFrom° of elevation (angle from hanging straight down) the shoulder rises with the arm.
// For Euler YXZ the hanging arm (0,-1,0) ends with y = -cos(x)·cos(z), so the elevation needs no objects.
function extrasLayer(p){const A=CFG.anim;for(let s=0;s<2;s++){const x=s?13:9,z=s?15:11,el=Math.acos(clamp(Math.cos(p[x])*Math.cos(p[z]),-1,1))/DEG;
  p[s?39:37]+=clamp((el-A.clavFrom)*A.clavGain,0,A.clavMax)*DEG;}}
// pose values the gait keeps during a moving action (guard, charge, drink): pelvis height and rotation, legs, toes
const _GAIT_LEGS=[0,1,2,3,20,21,22,23,24,25,26,27,28,29,41,42];
function animPlayer(dt){const R=PL.rig,a=P.act,k=a?a.k:null,M=CFG.move;
  // a move started or ended: remember the pose it interrupts, and blend the new one in from it
  if(a!==PL.lastAct){_B.set(_F0);P.blendT=CFG.anim.blend;PL.lastAct=a;}
  // root height and facing of this frame first: the feet ask the ground relative to them
  const fo=P.pos.y-gH(P.pos.x,P.pos.z);P.fo=Math.abs(fo-P.fo)>1.2?fo:damp(P.fo,fo,16,dt);
  let ry=P.yaw+P.spinYaw;if(a&&a.rollYaw!==undefined&&(k==='dodge'))ry=a.rollYaw;
  const legs=MESHY.on&&MESHY.legD?MESHY.legD:PL.rig.d;_gx=P.pos.x;_gz=P.pos.z;_gy=P.pos.y-fo+P.fo;_gyaw=ry;_gd=legs;
  const hs=Math.hypot(P.av.x,P.av.z);
  fwdV(P.yaw,_v1);const vf=P.av.x*_v1.x+P.av.z*_v1.z,vs=P.av.x*-_v1.z+P.av.z*_v1.x;
  mixPose(_A,HP.idle,HP.guard,P.combatK);
  // turning on the spot: small shuffle steps instead of feet skating round
  let gs=vs;if(hs<.7&&Math.abs(P.yawRate)>1.1&&(!k||MOVE_ACTS.has(k)))gs+=clamp(P.yawRate*.24,-1.1,1.1);
  // the Meshy model has shorter legs than the rig that drives it: plan the steps for the legs that are seen
  _gopt.vchest=MESHY.on;_gopt.arm=1-P.combatK*.35;_gopt.armR=1-P.combatK*.72;_gopt.elbow=1-P.combatK*.55;
  const ev=gaitIK(_L,_A,P.gait,legs,1,vf,gs,dt,_gopt);
  if(ev&&(!k||MOVE_ACTS.has(k))&&hs>.35){
    if(P.wade>.05){splash(P.pos,5+(P.sprinting?4:0),.8+P.wade);sfx('splash',P.pos,hs>3?1:.6);}
    else{sfx('step',P.pos,P.sprinting?1.5:hs<2.5?.55:1);if(P.sprinting&&Math.random()<.6)dust(P.pos,2,.4);}}
  let w=0;
  if(k){w=1;
    if(HT[k])evalTrack(HT[k],a.t,_A);
    else if(k==='block')_A.set(HP.block);
    else if(k==='charge'){mixPose(_A,HP.guard,HP.charge,eOut(Math.min(1,a.t/.3)));}
    else if(k==='dodge'||k==='back'){const t=clamp(a.t/(k==='dodge'?.5:.38),0,1);
      if(k==='dodge'){mixPose(_A,HP.guard,HP.tuck,Math.sin(t*PI));_A[1]-=TAU*eIO(t);_A[0]=lerp(HP.guard[0],-.5,Math.sin(t*PI));}
      else{_A.set(HP.guard);_A[0]+=Math.sin(t*PI)*.08;_A[4]+=12*DEG*Math.sin(t*PI);_A[20]-=20*DEG*Math.sin(t*PI);_A[24]+=14*DEG*Math.sin(t*PI);}}
    // moving guard / charge / drink: upper body from the action, legs keep their planted gait
    if(MOVE_ACTS.has(k)){for(let n=0;n<_GAIT_LEGS.length;n++)_A[_GAIT_LEGS[n]]=_L[_GAIT_LEGS[n]];}}
  P.aw=damp(P.aw||0,w,w?30:12,dt);
  mixPose(_F,_L,_A,P.aw);
  // linear: the gap to the new move is spread evenly over the frames, so no frame jumps more than the motion around it
  if(P.blendT>0){P.blendT=Math.max(0,P.blendT-dt);mixPose(_F,_B,_F,1-P.blendT/CFG.anim.blend);}
  // the flinch and the computed layers go on top, after the blend, and stay out of the pose the next blend starts from
  _F0.set(_F);_F[4]+=P.flinch*.5;_F[7]+=P.flinch*.6;_F[0]-=Math.abs(P.flinch)*.04;
  extrasLayer(_F);R.apply(_F);
  // whole-body lean: into turns, forward when accelerating, back when braking
  const free=!k||MOVE_ACTS.has(k);
  P.roll=damp(P.roll,free?clamp(P.yawRate*hs*M.leanTurn,-M.leanTurnMax,M.leanTurnMax):0,8,dt);
  P.pitchL=damp(P.pitchL,free?clamp(-P.accF*M.leanAcc,-M.leanAccMax,M.leanAccMax):0,7,dt);
  R.inner.rotation.set(P.pitchL,0,P.roll);
  // stepping onto a raised floor eases up instead of popping
  R.root.position.set(P.pos.x,_gy,P.pos.z);R.root.rotation.y=ry;R.root.updateMatrixWorld(true);meshySync();
  PL.sw.base.getWorldPosition(_v1);PL.sw.tip.getWorldPosition(_v2);if(G.fp)PL.trail.on=false;PL.trail.update(dt,_v1,_v2);PL.trail.mesh.visible=!G.fp;
  if(!G.fp)PL.cape.update(dt,U.wind.value*(.6+U.storm.value*1.4),_v3.set(.8,0,.5));
  const sw=SWORDS[P.sword];if(sw.glow){PL.sw.bm.emissiveIntensity=k==='charge'?1.6+Math.sin(G.t*30)*.4:1;}else{PL.sw.bm.emissive.setRGB(k==='charge'?Math.min(.6,a.t*.6):0,k==='charge'?Math.min(.35,a.t*.35):0,0);}
}
function playerHit(dmg,srcPos,o={}){
  if(P.dead||G.state!=='play')return'none';
  if(P.iframe>0){const ak=P.act&&P.act.k;if((ak==='dodge'||ak==='back')&&P.act.t<CFG.combat.perfectWin&&!P.act.perf){P.act.perf=1;perfectDodge(srcPos);}return'dodge';}
  const dx=srcPos.x-P.pos.x,dz=srcPos.z-P.pos.z,d=Math.hypot(dx,dz)||1;fwdV(P.yaw,_v1);const facing=(dx*_v1.x+dz*_v1.z)/d>.15;
  const k=P.act?P.act.k:null;
  if(facing&&(k==='block'||k==='parry')){
    if(o.parry&&G.t-P.blockPress<CFG.parry.window){P.st=Math.min(P.maxSt,P.st+10);return'parry';}
    if(!o.unblock){const cost=dmg*CFG.block.stMul;useSt(cost);sfx('block',P.pos);_v2.set(P.pos.x+_v1.x*.6,P.pos.y+1.25,P.pos.z+_v1.z*.6);sparks(_v2,_v1,8,2.6,2,1.2,4);
      P.amx-=dx/d*.25;P.amz-=dz/d*.25;
      if(P.st<=0){P.st=0;startAct('stagger',{dx:-dx/d,dz:-dz/d});num('Guardia rotta',P.pos,2.2,'info');applyDmg(dmg*CFG.block.breakDmg,dx,dz,d,o);}else{applyDmg(dmg*CFG.block.chip,dx,dz,d,o,true);}
      CAM.trauma=Math.min(1,CAM.trauma+.2);return'block';}}
  applyDmg(dmg,dx,dz,d,o);return'hit';}
function perfectDodge(src){const C=CFG.combat;G.slow=C.perfectSlow;G.slowS=.3;P.perfectT=G.t+1.4;P.st=Math.min(P.maxSt,P.st+C.perfectSt);
  sfx('perfect',P.pos);num('Schivata perfetta',P.pos,2.1,'parry');Post.u.flash.value=Math.min(.25,Post.u.flash.value+.06);
  for(let i=0;i<14;i++){const a=rr(0,TAU);FXA.emit(P.pos.x+Math.cos(a)*.5,P.pos.y+rr(.3,1.7),P.pos.z+Math.sin(a)*.5,Math.cos(a)*1.5,rr(-.2,.6),Math.sin(a)*1.5,rr(.3,.5),.09,.01,1.2,1.7,3,1,0,2,1);}
  if(!P.pdTip){P.pdTip=1;hint('Schivata perfetta: il prossimo colpo fa <b>più danno</b>',3.5);}}
function applyDmg(dmg,dx,dz,d,o,chip){dmg=Math.max(1,Math.round(dmg));P.hp-=dmg;P.lastHit=G.t;P.flinchV+=chip?2:7;
  if(!chip){P.chipT=.8;Post.u.hurt.value=Math.min(1,Post.u.hurt.value+.5+dmg/60);CAM.trauma=Math.min(1,CAM.trauma+.25+dmg/80);sfx('hurt',P.pos);
    _v2.set(P.pos.x,P.pos.y+1.2,P.pos.z);blood(_v2,_v1.set(-dx/d,0,-dz/d),8);G.hitstop=Math.max(G.hitstop,.05);
    const k=P.act?P.act.k:null;
    if(P.hp>0&&G.t>P.hyperT){if(o.knock||dmg>=P.maxHp*.28){startAct('knock',{dx:-dx/d,dz:-dz/d});PL.flask.visible=false;P.hyperT=G.t+1.9;}else if(!ATTACKS.has(k)||k==='light1'||k==='light2'){startAct('hurt',{dx:-dx/d,dz:-dz/d});PL.flask.visible=false;P.hyperT=G.t+.75;}}}
  if(P.hp<=0)playerDie();}
function playerDie(){if(P.dead)return;P.dead=true;P.hp=0;dropBraci();P.act={k:'death',t:0,hit:new Set()};P.lock=null;G.state='dying';G.slow=1.2;G.slowS=.35;sfx('death');setTimeout(()=>{if(G.state!=='dying')return;showScreen('death');if(document.pointerLockElement)document.exitPointerLock();},2300);}

/* ============================== camera ============================== */
const CAM={yaw:0,pitch:-.2,dist:4.5,cur:4.5,piv:V3(),trauma:0,fov:60,init:false,idle:0};
function camFov(){const a=camera.aspect;return a<1?74:a<1.5?66:58;}
function updCamera(rdt,dt){const C=CFG.cam;
  const tgt=P.lock&&!P.lock.dead?P.lock:null;
  if(G.state==='play'||G.state==='dying'){
    const sens=SET.sens,looking=Math.abs(IN.lookX)+Math.abs(IN.lookY)>1e-6;CAM.idle=looking?0:CAM.idle+rdt;
    if(!tgt||G.fp){CAM.yaw-=IN.lookX*sens;CAM.pitch-=IN.lookY*sens*(SET.invertY?-1:1);
      // gentle follow: while running without touching the camera it swings in behind the hero
      if(!G.fp&&!tgt&&CAM.idle>C.followDelay&&(!P.act||MOVE_ACTS.has(P.act.k))){const hs=Math.hypot(P.av.x,P.av.z);
        if(hs>2.2){const d=angD(CAM.yaw,P.yaw);if(Math.abs(d)<2.3){const k=(isTouch?C.followTouch:C.follow)*Math.min(1,(hs-2.2)/3);CAM.yaw+=clamp(d,-1,1)*k*Math.min(1,Math.abs(d)*2)*rdt;
          CAM.pitch=damp(CAM.pitch,-.2,.6*k,rdt);}}}}
    else{CAM.pitch-=IN.lookY*sens*.4;const dx=tgt.pos.x-P.pos.x,dz=tgt.pos.z-P.pos.z,d=Math.hypot(dx,dz);CAM.yaw=dampA(CAM.yaw,yawTo(dx,dz),6,rdt);
      const dy=(tgt.pos.y+(tgt.fly||0)+tgt.h*.55)-(P.pos.y+1.6);CAM.pitch=damp(CAM.pitch,clamp(Math.atan2(dy,Math.max(d,2))*.7-.18,-.6,.2),4,rdt);}
    CAM.pitch=G.fp?clamp(CAM.pitch,-1.35,1.3):clamp(CAM.pitch,-1.05,.5);}
  const cp=Math.cos(CAM.pitch),fx=-Math.sin(CAM.yaw)*cp,fy=Math.sin(CAM.pitch),fz=-Math.cos(CAM.yaw)*cp,rx=Math.cos(CAM.yaw),rz=-Math.sin(CAM.yaw);
  if(G.fp&&G.state!=='title'){PL.rig.P.head.getWorldPosition(_v1);camera.position.set(_v1.x+fx*.12,_v1.y+.06,_v1.z+fz*.12);}
  else{const ry=PL.rig.root.position.y,py=ry+(P.act&&P.act.k==='dodge'?1.25:1.58);
    const lx=P.pos.x+P.av.x*C.lookAhead,lz=P.pos.z+P.av.z*C.lookAhead;
    if(!CAM.init){CAM.piv.set(lx,py,lz);CAM.init=true;}
    CAM.piv.x=damp(CAM.piv.x,lx,14,rdt);CAM.piv.z=damp(CAM.piv.z,lz,14,rdt);CAM.piv.y=damp(CAM.piv.y,py,9,rdt);
    let want=(tgt?C.distLock:C.dist)+(P.sprinting?C.distSprint:0)+(tgt&&tgt.type==='troll'?C.distTroll:0)+(G.cine>0?-1.4:0);
    const sh=C.shoulder;const ex=CAM.piv.x-fx*want+rx*sh,ez=CAM.piv.z-fz*want+rz*sh;
    const t=rayCols(CAM.piv.x,CAM.piv.z,ex,ez,.3);if(t<1)want=Math.max(1.2,want*t-.3);
    for(let i=1;i<=6;i++){const s=i/6*want,x=CAM.piv.x-fx*s,z=CAM.piv.z-fz*s,y=CAM.piv.y-fy*s;if(gH(x,z)+.4>y){want=Math.max(1.0,s*.92);break;}}
    CAM.cur=want<CAM.cur?damp(CAM.cur,want,18,rdt):damp(CAM.cur,want,3,rdt);
    const k=CAM.cur/Math.max(want,1);camera.position.set(CAM.piv.x-fx*CAM.cur+rx*sh*Math.min(1,k),CAM.piv.y-fy*CAM.cur,CAM.piv.z-fz*CAM.cur+rz*sh*Math.min(1,k));
    const gh=gY(camera.position.x,camera.position.z)+.35;if(camera.position.y<gh)camera.position.y=gh;}
  camera.rotation.set(CAM.pitch,CAM.yaw,0);
  CAM.trauma=Math.max(0,CAM.trauma-rdt*1.5);const tr=CAM.trauma*CAM.trauma,T=U.time.value*31;
  if(tr>0){camera.position.x+=(vnoise(T,1)-.5)*tr*.5;camera.position.y+=(vnoise(T,7)-.5)*tr*.5;camera.rotation.z+=(vnoise(T,13)-.5)*tr*.08;}
  const fovT=camFov()+(P.sprinting?6:0)+(P.act&&P.act.k==='charge'?-4:0)+(G.cine>0?-8:0);CAM.fov=damp(CAM.fov,fovT,5,rdt);
  if(Math.abs(camera.fov-CAM.fov)>.01){camera.fov=CAM.fov;camera.updateProjectionMatrix();}
}
function autoRelock(prev){let best=null,bd=12;for(const e of E){if(e.dead||!e.active||e===prev)continue;const d=e.pos.distanceTo(P.pos);if(d<bd){bd=d;best=e;}}return best;}
function toggleLock(){if(P.lock){P.lock=null;return;}let best=null,bs=-1e9;fwdV(CAM.yaw,_v3);
  for(const e of E){if(e.dead||!e.active)continue;const dx=e.pos.x-P.pos.x,dz=e.pos.z-P.pos.z,d=Math.hypot(dx,dz);if(d>24)continue;const c=(dx*_v3.x+dz*_v3.z)/(d||1);if(c<.25&&d>4)continue;const s=c*3-d*.12;if(s>bs){bs=s;best=e;}}
  P.lock=best;if(!best)CAM.yaw=P.yaw;}
function switchLock(dir){if(!P.lock)return;const cur=P.lock;let best=null,ba=1e9;
  for(const e of E){if(e.dead||!e.active||e===cur)continue;const d=e.pos.distanceTo(P.pos);if(d>24)continue;const a=angD(CAM.yaw,yawTo(e.pos.x-P.pos.x,e.pos.z-P.pos.z));if(Math.sign(-a)!==dir)continue;if(Math.abs(a)<ba){ba=Math.abs(a);best=e;}}
  if(best)P.lock=best;}
