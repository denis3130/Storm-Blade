/* ============================== demo map: "La Valle delle Lanterne" ==============================
   Only in the demo page (demo.html); the game has src/w_main.js (DEMO=null) and keeps its own world.
   The scene of Denis's picture, seen from the bonfire looking north (-z): a terrace with a ruined Gothic arch, stone stairs
   down to a village of wooden houses, a gorge on the right crossed by a stone bridge to a gate in the cliff, a waterfall,
   zig-zag stairs up the cliff to a pavilion, the palace on top, karst peaks in a sea of mist. Heights in metres. */
const DEMO=(()=>{
  const sm=t=>{t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
  // signed distance to a rounded box (centre, half sizes, corner radius): negative inside
  const box=(x,z,cx,cz,hx,hz,r)=>{const dx=Math.abs(x-cx)-hx+r,dz=Math.abs(z-cz)-hz+r;
    return Math.hypot(Math.max(dx,0),Math.max(dz,0))+Math.min(Math.max(dx,dz),0)-r;};
  // distance from (x,z) to the segment a-b (S.d) and the share along it (S.t)
  const S={d:0,t:0};
  const seg=(x,z,ax,az,bx,bz)=>{const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz;let t=((x-ax)*dx+(z-az)*dz)/l2;t=t<0?0:t>1?1:t;
    S.t=t;S.d=Math.hypot(ax+dx*t-x,az+dz*t-z);return S;};
  // plateaus: centre x, z, half sizes, corner radius, height, side slope (m down per m out), rock on the side (0..1), paved
  const PLAT=[
    [-5.8,-3.75,5.2,10.75,.5,20,8,1,1], // terrace, west half: the bonfire's floor up to the parapet under the arch (paved)
    [4.2,-1.45,4.8,8.45,.5,20,2.2,1,1], // terrace, east half: the head of the stairs (paved)
    [-4,22,24,8,6,24,.9,1],         // rocky hill behind the terrace
    [-14,-56,31,27,10,8,.5,.5],     // village floor
    [-60,-50,22,46,12,15,.45,.8],   // hills west of the village
    [-46,-88,15,12,8,10.5,.8,.6],   // cathedral mound
    [-33,-73,7,5,2,8,.6,.5],        // floor of the first ruined church
    [-7,-112,11,7,4,14,.9,.7,0,1],  // hill of the second ruined church, over the mist behind the village (kept above the break-off)
    [53,-71,14,6,2,8.3,2.5,1],      // ledge behind the gate, foot of the zig-zag stairs and of the falls, on to the cave
    [70,-67,9,7,2,8.7,2.2,1],       // ledge in front of the cave, under the cliff
    [81.7,-83.4,12,10,6,32,5,1],    // rock of the cave, rising just behind its mouth
    [60,-90,10,8,3,28,6,1],         // terrace of the pavilion, top of the zig-zag stairs (a sheer face over the ledge)
    [90,-100,12,24,6,36,2.4,1],     // high cliff east of the palace
    [61,-121,25,15,4,33,3,.3,1],    // palace plateau (paved)
    [60,-152,40,14,10,46,2,1],      // rock behind the palace
    [10,26,48,10,8,15,.6,1]];       // southern rim
  // ground ramps: from (ax, az) at ya to (bx, bz) at yb, half width, side slope
  const RAMP=[[.9,-9.9,20,.9,-17,17,1.5,1.5],  // stone steps from the terrace (walked on a strip floor over the boxes)
    [62,-94,28,62,-107.5,33,4.3,2.4],       // palace stairs from the pavilion's terrace to the plaza
    [57,-70.5,8.3,63,-69,8.7,2,2],          // the ledge rises a little to the cave
    [.9,-17,17,0,-45,8.5,1.7,1.2]];         // the cobbled road from the steps down to the village
  // the gorge: centre line, half width of the floor, floor height, wall slope
  const GORGE=[[31,60],[30,-10],[30,-60],[28,-100],[24,-150],[20,-260]],GW=3,GB=-34,GS=8;
  // zig-zag stairs up the cliff, walkable strips: from (ax, az) at ya to (bx, bz) at yb, half width; legs and landings
  const ZIG=[[46,-75,8.3,58,-77,15,1.5],[59.6,-75.8,15,59.6,-81.7,15,1.6],[58,-80.5,15,46,-82.5,22,1.5],
    [44.4,-81.3,22,44.4,-86.7,22,1.6],[46,-85.5,22,54,-92.5,28,1.5]];
  function gorge(x,z){let d=1e9;for(let i=0;i<GORGE.length-1;i++){const a=GORGE[i],b=GORGE[i+1];d=Math.min(d,seg(x,z,a[0],a[1],b[0],b[1]).d);}
    const w=GW+Math.max(0,-z-60)*.06;return GB+GS*Math.max(0,d-w);}
  function h0(x,z){let h=-44,side=0,flat=1;
    const plat=(p)=>{const d=box(x,z,p[0],p[1],p[2],p[3],p[4]),v=p[5]-p[6]*Math.max(0,d);if(v>h){h=v;side=Math.min(1,Math.max(0,d)*.35)*p[7];flat=p[8]?0:1;}};
    for(const p of PLAT)if(!p[9])plat(p);
    // stairs are paved: no unevenness on them
    // the main stairs' steps are boxes over the ground: there the ground sinks half a metre and a strip floor carries the walk
    for(const r of RAMP){const q=seg(x,z,r[0],r[1],r[3],r[4]),v=r[2]+(r[5]-r[2])*q.t-r[7]*Math.max(0,q.d-r[6])-(r===RAMP[0]&&q.d<r[6]-.1?.5:0);if(v>h){h=v;side=Math.min(1,Math.max(0,q.d-r[6])*.35);flat=side>0?1:0;}}
    // east of the steps and the road the ground drops away into the gorge: a rough cliff right under the parapet
    {const st=z>-17,q=st?seg(x,z,.9,-10,.9,-17):seg(x,z,.9,-17,0,-45),y=st?20-3*q.t:17-8.5*q.t,ex=x-(st?.9:.9-.9*q.t);
      if(ex>3.4&&ex<40){const k=sm((-z-10.6)/3.4)*(st?1:1-sm((q.t-.7)/.28)),v=y-(ex-3.4)*2.6;if(k>0&&v<h){h+=(v-h)*k;side=Math.min(1,(ex-3.4)*.4)*k;flat=1;}}}
    // north of the village the ground breaks off into the sea of mist
    if(z<-84&&x<20)h-=sm((-z-84)/26)*sm((20-x)/8)*Math.max(0,h+40)*(x<-30?.5:1);
    for(const p of PLAT)if(p[9])plat(p);
    const g=gorge(x,z);if(g<h){h=g;side=1;}
    // rock relief on cliffs and slopes, a little unevenness on the open ground; paved places stay flat
    h+=(fbm(x*.09+7,z*.09-3,3)-.5)*5*side+(fbm(x*.31,z*.31,2)-.5)*.5*side+(vnoise(x*.15,z*.15)-.5)*.25*(1-side)*flat;
    // the rock stays under the zig-zag stairs (after the relief, which would push it through the steps)
    for(const r of ZIG){const q=seg(x,z,r[0],r[1],r[3],r[4]);if(q.d<r[6]+2.2&&q.t>.02){const y=r[2]+(r[5]-r[2])*q.t-.35;if(h>y)h=y;}}
    return h;}
  return {
    tsz:320,wr:150,h0,box,seg,PLAT,RAMP,GORGE,ZIG,
    // the way through the gate and up the zig-zag stairs (tests/demo.test.js walks it)
    zigRoute:[[43,-70.6],[45,-73.6],[46.3,-75.05],[58,-77],[59.6,-78.8],[58,-80.5],[46,-82.5],[44.4,-84],[46,-85.5],[54,-92.5],[57,-94]],
    // the bonfire is the shrine (id 0); the start is just south-east of it, looking north down the stairs
    shrines:[{x:-6.4,z:-12.5,name:"Falò dell'Arco"}],arch:{x:-6.95,z:-14.45,yaw:0},
    start:{x:-4,z:-9.2,yaw:-.5},
    camps:[{x:-8,z:-54,name:'Villaggio delle Lanterne',boss:'Gorrak lo Sfregiato',tier:0},
      {x:61.2,z:-112.2,name:'Palazzo della Rupe',boss:'Il Custode Velato',tier:2}],
    // the pool at the foot of the waterfall; the bridge from the village (a) to the gate (b), deck height, half width
    lake:{x:34,z:-56,r:5},bridge:{ax:13,az:-50,bx:39.4,bz:-68.4,y:8.3,hw:2.2},gate:{x:39.4,z:-68.4},
    // chest of each camp (x, z, yaw) and the enemies: type, x, z, camp (-1 = none), options for spawnEnemy
    chests:[[-5,-49,.4],[58.1,-112.8,-.5]],
    enemies:[['goblin',-5,-44,0],['goblin',-14,-56,0,{sit:true}],['goblin',1,-55,0],['goblin',-22,-47,0,{sit:true}],['archer',12,-46,0],
      ['wolf',-30,-66,0],['wolf',-34,-64,0],['troll',-9,-59,0,{boss:true,sleep:true,name:'Gorrak lo Sfregiato',scale:1}],
      ['goblin',47,-70,1],['goblin',56,-88,1],['goblin',58,-95,1],['archer',57,-111,1],['archer',70,-110,1],
      ['troll',61.7,-113.1,1,{boss:true,sleep:true,name:'Il Custode Velato',king:true,scale:1.16}]],
    // village: x, z, yaw (front faces +z turned by yaw), width, depth, storeys, options; fences (from, to); lantern posts
    houses:[[-21,-40,1.35,9,7,2,{}],[-11,-50,.45,6,5,1,{stall:1}],[8,-63,0,11,8,2,{red:1,boards:1}],[3,-76,.1,10,7,2,{boards:1}],[-30,-56,1.45,11,8,2,{boards:1}],
      [-24,-68,1.2,7,6,2,{}],[-38,-46,1.5,7,6,1,{lant:false}],[-15,-78,.3,9,7,1,{}],[6,-42,-.7,5,4,1,{stall:1,red:1}],[17,-62,-.35,7,6,1,{boards:1}],
      [-19,-58,1.3,6,5,1,{boards:1,lant:false}],[-4,-84,.15,9,6,1,{boards:1}],[16,-77,-.2,7,6,2,{boards:1,lant:false}]],
    fences:[[-28,-30,-14,-31],[-42,-40,-42,-60],[-12,-87,4,-88],[2,-47,10,-49.5],[3,-52,11,-54.5],[-2,-62,-2,-70]],
    villageLanterns:[[-3,-37],[3,-37],[-6,-46],[6,-50],[14,-55],[-14,-50]],
    // the palace (centre of the hall's plaza), the pavilion over the gorge, the waterfall (lip x, z, yaw, top and bottom height, width, push out, foot)
    palace:{x:66,z:-121,yaw:-.5,y:33},pavilion:{x:66,z:-87},cave:{x:67.4,z:-71.2,yaw:-.79},
    // ruined churches: x, z, facing, length, width, height
    ruins:[[-33,-73,.5,14,8,15],[-7,-112,-.1,18,10,16]],
    // the falls: down the cliff between the zig-zag stairs and the cave onto the ledge, then from the ledge's lip into the gorge
    // (lip x, z, facing, top and bottom height, width at top and bottom, push out, spray at bx, by, bz); the stream between them
    falls:[{x:65,z:-81.7,yaw:0,y0:27.6,y1:8,w0:3.2,w1:5.2,out:2.4,bx:65,by:8.6,bz:-77.5},
      {x:53,z:-64.6,yaw:-.62,y0:8.4,y1:-30,w0:3.6,w1:7,out:3.5,bx:46,by:-14,bz:-56}],
    stream:{ax:64.6,az:-77.6,bx:53.6,bz:-65.4,y:8.36,w:3},
    // trees: maples (x, z, size, colour), pine and fir areas (centre, radius, how many), pampas lines (from, to, clumps), fallen leaves (centre, half sizes, count)
    maples:[[-6,-68,1.75],[-30,-40,.8],[-20,-64,.9,'a'],[-14,8,1.0,'a'],[14,-66,1.05],[-44,-82,.9,'a'],[-40,-58,.9]],
    pineAreas:[[74,-62,6,3],[60,-62,4,2],[-38,-82,8,4],[-7,-119,12,6],[40,-112,8,5],[90,-114,10,6],[-20,-104,10,3],[13,6,6,3],[-52,-80,14,5],[78,-58,12,6],[88,-98,12,8],[60,-150,30,12],[-30,-28,10,4],[-62,-40,18,8],[46,-104,6,2],[8,-92,8,3]],
    firAreas:[[-70,-60,30,14],[-60,20,20,8],[10,30,20,6],[95,-60,14,6]],
    pampas:[[-10.3,-13.8,-9.6,-11.5,4,.4],[-10.4,-8,-10.4,5,6,.4],[8.4,-8,8.4,6,6],[-1.45,-11.8,-1.45,-13.9,2,.2],[-1.9,-20,-2.6,-38,8],[3.9,-15,3.4,-36,7],[-10,10,10,10,8],[3.6,-9.35,8.2,-9.35,5,.25],[-6.2,-9.7,-4.2,-9.25,4,.3]],
    leaves:[[-5.8,-8,4.8,5.8,180],[4,-2,4.5,6,70],[.9,-13.4,1.3,3.4,30],[.5,-31,1.4,13,60],[0,-20,3,12,60],[-6,-50,10,8,90]],
    // title screen: the picture's view from the terrace
    title:{p:[1,24.8,-3.5],t:[2.71,15.26,-52.55]},
    fog:[.0042,.62],wet:.32,light:[1.0,1.15],cloud:.12,paths:[[[.9,-6],[.9,-17],[0,-45],[-8,-54],[13,-50]],[[0,-45],[13,-50]],[[-8,-54],[-30,-62],[-44,-82]],[[-8,-54],[-14,-34]]],
    // sun low in front of the bonfire view (backlight through a break in the clouds), overcast sky, blue-grey mist
    sun:[.33,.265,-.906],
    sky:{hor:0x939ca5,zen:0x22282f,cloud:0x4a5158,sun:[1.0,.82,.62],fog:0x86909b,hemiS:0xa4b0bf,hemiG:0x56524a}};
})();
