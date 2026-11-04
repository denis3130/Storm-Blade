/* ============================== CFG — every balance number in one place ==============================
   Speeds in m/s, times in seconds, angles in radians unless noted. Change values here, not in the systems. */
const CFG={
  ver:4,                       // save-data version
  // player animation
  // eye adaptation (demo): the mean scene brightness the exposure aims at, how far it may darken or brighten, how fast it adapts (1/s)
  light:{key:.085, min:.5, max:2.3, speed:1.6},
  anim:{reach:.985, footMaxDrop:.15, footMaxRise:.25, dropDown:45, dropRate:14, reachFrom:.15,   // feet on the terrain: leg share before the pelvis drops; terrain offset limits (m); pelvis drop down / back up (1/s); stance share before the drop counts
    clavFrom:60, clavGain:.3, clavMax:22, toeGain:.9, toeMax:35,   // clavicles rise with the arm above clavFrom° (gain, max °); toes bend at push-off (gain of the foot angle, max °)
    blend:.08,   // seconds over which a new move blends in from the pose it interrupts
    clipGain:1,   // walk/run clips on the upper body (0 = the computed gait of before)
    breathHz:.28, breathChest:1.2, breathClav:.8, swayHz:.07, swayRoll:1.2},   // standing still: breaths per second, chest ±°, clavicle rise °; pelvis sway per second, ±°
  move:{
    walk:1.9, jog:5.4, sprint:8.1,       // free movement (analog: walk below 60% stick)
    lock:4.3, lockBack:3.3,              // locked-on strafe / backpedal
    guard:2.0, charge:1.5, drink:1.9, parry:1.4,
    acc:38, accSprint:20, brake:46, actFric:30,   // m/s² — reach jog in ~0.15s, stop in ~0.12s
    turn:16, turnSprint:7.5, turnLock:15, turnMax:13,  // yaw response (exp. rate) and max rad/s
    radius:.38, mass:1,
    slopeSlow:.42, slopeBlock:1.05,      // tan(slope) where uphill starts to slow / is blocked (≈23° / 46°)
    wade:.42, wadeDeep:.9,               // max slow in shallow water, depth that becomes a wall
    sprintSt:16, sprintDelay:.45,
    leanTurn:.034, leanTurnMax:.26, leanAcc:.011, leanAccMax:.12,
  },
  cam:{dist:4.4, distLock:4.9, distSprint:.5, distTroll:1.4, shoulder:.5, lookAhead:.1,
    follow:.85, followTouch:1.6, followDelay:.9},   // auto-follow behind the player (rad/s) after no look input
  st:{regen:40, regenPerEnd:2.5, guardRegen:10, delay:.7},
  hp:{base:100, perVig:14}, stam:{base:100, perEnd:9}, str:{per:.09},
  flask:{heal:.5, start:3, max:7},
  prog:{chestBraci:90},                // braci from a camp chest = chestBraci × (camp index + 1)
  // braci (the souls of this world): level cost = lvlBase + lvlLin·(lvl−1) + lvlQuad·(lvl−1)²; pickR = pick-up radius of the pile left at death
  braci:{lvlBase:60, lvlLin:30, lvlQuad:4, pickR:1.3},
  ui:{typeSpeed:48},                   // dialogue typewriter, characters per second
  swordDmg:[16,24,34,46,62],
  parry:{window:.28, guardTap:.25},
  block:{stMul:1.3, chip:.12, breakDmg:.6},
  ai:{tokens:2, tokensBoss:1, strikeGap:.42},   // max simultaneous melee attackers; min time between two foes' blows landing
  storm:{calm:125, warn:26, storm:52, clear:12},
  // player moves: dur = total, cancel = earliest chain, dodge = earliest dodge-cancel, hit = active window,
  // lunge = [t0,t1,max metres] (shortened automatically to stop at sword reach), aim = time spent turning onto the target
  moves:{
    light1:{dur:.5,cancel:.26,dodge:.17,hit:[.075,.2],range:2.15,mul:1,poise:12,lunge:[0,.16,1.5],next:'light2',trail:[.03,.24],st:11,snd:'swing',aim:.09},
    light2:{dur:.5,cancel:.27,dodge:.17,hit:[.075,.2],range:2.15,mul:1.05,poise:12,lunge:[0,.16,1.4],next:'light3',trail:[.03,.24],st:11,snd:'swing',aim:.09},
    light3:{dur:.56,cancel:.31,dodge:.2,hit:[.095,.21],range:2.45,mul:1.15,poise:16,lunge:[.02,.18,2.0],next:'light4',trail:[.05,.24],st:12,snd:'swing',aim:.1},
    light4:{dur:.8,cancel:.5,dodge:.34,hit:[.2,.31],range:2.3,mul:1.75,poise:34,lunge:[.1,.29,1.8],trail:[.13,.35],st:16,snd:'swingH',heavy:true,finisher:true,aim:.16,down:true},
    heavy:{dur:.88,cancel:.56,dodge:.4,hit:[.3,.41],range:2.45,mul:2.0,poise:40,lunge:[.16,.38,2.2],trail:[.22,.44],st:20,snd:'swingH',heavy:true,aim:.22,down:true},
    runatk:{dur:.7,cancel:.44,dodge:.3,hit:[.13,.28],range:2.3,mul:1.35,poise:22,lunge:[0,.3,4.4],trail:[.08,.32],st:15,snd:'swing',aim:.1},
    spin:{dur:.66,cancel:.5,dodge:.4,hit:[.08,.44],range:2.95,mul:1.9,poise:44,lunge:[.05,.4,1.4],trail:[.05,.48],st:0,snd:'swingH',heavy:true,spin:true,down:true},
    riposte:{dur:1.05,cancel:.86,dodge:.7,hit:[.3,.36],range:3.0,mul:3.6,poise:200,lunge:[.18,.32,1.2],trail:[.2,.4],st:0,snd:'swingH',heavy:true,rip:true,aim:.2},
    dodge:{dur:.6,cancel:.44,iframe:[.03,.4],dist:5.3,st:20},back:{dur:.42,cancel:.3,iframe:[.02,.26],dist:2.6,st:14},
    parry:{dur:.34,cancel:.12},drink:{dur:1.2,cancel:1.2},hurt:{dur:.38,cancel:.3},stagger:{dur:.9,cancel:.86},knock:{dur:1.6,cancel:1.45,iframe:[0,1.3]},
    rest:{dur:2.4,cancel:2.4},charge:{dur:99,cancel:0},block:{dur:99,cancel:0},death:{dur:99,cancel:99}},
  combat:{
    hitstop:{light:.045,heavy:.08,rip:.16},   // short freezes: felt, but they never stretch a fight
    tol:.36,                 // blade-vs-body tolerance (m)
    shockR:2.5, shockMul:.55, shockPoise:20,   // the finisher's slam also hits everyone around the impact
    aimRange:5, aimCos:.3,   // auto-target cone when not locked on
    chargeMin:.22, chargeFull:.9, chargeSt:8,
    interruptCD:2.2,         // a small foe can be knocked out of a wind-up once every 2.2 s
    downT:1.5, downMul:1.25, // knock-down time and bonus damage on a grounded foe
    perfectWin:.2, perfectSlow:.45, perfectBonus:1.4, perfectSt:15,
    glintLead:.26,           // parry cue appears this long before an enemy blow lands (inside the parry window)
  },
  // enemy stats (r = body radius, mass for pushing, sight = alert distance, braci = reward before tier scaling)
  enemy:{
    goblin:{hp:58,dmg:13,spd:4.5,r:.42,mass:.8,poise:22,braci:22,h:1.25,sight:17},
    archer:{hp:42,dmg:11,spd:4.0,r:.42,mass:.7,poise:16,braci:26,h:1.25,sight:28},
    wolf:{hp:46,dmg:10,spd:7.4,r:.55,mass:.9,poise:14,braci:18,h:1.0,sight:20},
    troll:{hp:300,dmg:30,spd:2.8,r:1.2,mass:9,poise:140,braci:260,h:3.6,sight:16},
    spirit:{hp:34,dmg:12,spd:5.2,r:.5,mass:.5,poise:10,braci:30,h:1.9,sight:999}},
  // enemy attacks: w = wind-up (telegraph), a = active, r = recovery
  eatk:{
    goblin:[{k:'chop',w:.62,a:.12,r:.55,range:1.95,cos:.35,dmg:1,parry:true,W:'chopW',S:'chopS',lunge:1.4},
      {k:'swipe',w:.45,a:.14,r:.5,range:1.85,cos:.05,dmg:.85,parry:true,W:'swW',S:'swS',lunge:1},
      {k:'lunge',w:.55,a:.22,r:.65,range:3.6,cos:.45,dmg:1.15,parry:true,W:'lgW',S:'lgS',lunge:6,minD:2.4}],
    archer:[{k:'shoot',w:.9,a:.1,r:.65,ranged:'arrow',W:'drawW',S:'drawS'}],
    wolf:[{k:'bite',w:.42,a:.14,r:.5,range:1.85,cos:.35,dmg:1,parry:true,lunge:2.6},{k:'pounce',w:.6,a:.42,r:.7,range:6,cos:.4,dmg:1.3,parry:true,lunge:9.5,minD:3.2,jump:true}],
    troll:[{k:'slam',w:1.05,a:.14,r:1.0,aoe:3.9,fwd:2.1,dmg:1.25,unblock:true,red:true,W:'slamW',S:'slamS',knock:true},
      {k:'sweep',w:.85,a:.2,r:.85,range:3.8,cos:-.25,dmg:1,parry:true,W:'swW',S:'swS'},
      {k:'stomp',w:.62,a:.12,r:.75,aoe:3.4,fwd:.4,dmg:.7,unblock:true,red:true,W:'stW',S:'stS',knock:true},
      {k:'charge',w:.8,a:1.5,r:.9,range:2.6,dmg:1.1,charge:true,knock:true,W:'charge',S:'charge'},
      {k:'roar',w:.45,a:.9,r:.4,roar:true,W:'roar',S:'roar'}],
    spirit:[{k:'orb',w:.75,a:.1,r:.55,ranged:'orb'},{k:'claw',w:.45,a:.16,r:.55,range:1.8,cos:.3,dmg:1,parry:true,lunge:3.2}]},
};
