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
    [0,-1,9,8,3,20,2.2,1,1],        // bonfire terrace (paved)
    [-4,22,24,8,6,24,.9,1],         // rocky hill behind the terrace
    [-14,-56,31,27,10,8,.5,.5],     // village floor
    [-60,-50,22,46,12,15,.45,.8],   // hills west of the village
    [-46,-88,15,12,8,10.5,.8,.6],   // cathedral mound
    [53,-48,9,12,3,8.5,3.5,1],      // east ledge: the gate and the cave
    [52,-64,9,10,2,8.5,2,1],        // foot of the cliff under the zig-zag stairs
    [84,-52,14,16,5,26,2.4,1],      // rock wall east of the ledge (the cave)
    [54,-84,11,8,3,30,3,1],         // middle terrace: the pavilion over the gorge
    [90,-100,12,24,6,34,2.4,1],     // high cliff east, low enough to leave the palace in view
    [58,-132,17,12,4,52,3,.3,1],    // palace plateau (paved)
    [44,-112,3,6,2,50,4,1],         // the cliff the waterfall leaves
    [50,-152,42,14,10,58,2,1],      // rock behind the palace
    [10,26,48,10,8,15,.6,1]];       // southern rim
  // ground ramps: from (ax, az) at ya to (bx, bz) at yb, half width, side slope
  const RAMP=[[0,-8.4,20,0,-33,8,3.3,1.5],   // stone stairs from the terrace down to the village
    [55,-90,30,57,-119,52,4.3,2.4]];        // palace stairs (the top disc of the ramp joins the plateau)
  // the gorge: centre line, half width of the floor, floor height, wall slope
  const GORGE=[[31,60],[30,-10],[30,-60],[28,-100],[24,-150],[20,-260]],GW=3,GB=-34,GS=8;
  // zig-zag stairs up the cliff, walkable strips: from (ax, az) at ya to (bx, bz) at yb, half width; legs and landings
  const ZIG=[[46,-60,8.5,58,-62,15.5,1.5],[59.6,-60.8,15.5,59.6,-66.7,15.5,1.6],[58,-65.5,15.5,46,-67.5,22.5,1.5],
    [44.4,-66.3,22.5,44.4,-71.7,22.5,1.6],[46,-70.5,22.5,54,-77.5,30,1.5]];
  function gorge(x,z){let d=1e9;for(let i=0;i<GORGE.length-1;i++){const a=GORGE[i],b=GORGE[i+1];d=Math.min(d,seg(x,z,a[0],a[1],b[0],b[1]).d);}
    const w=GW+Math.max(0,-z-60)*.06;return GB+GS*Math.max(0,d-w);}
  function h0(x,z){let h=-44,side=0,flat=1;
    for(const p of PLAT){const d=box(x,z,p[0],p[1],p[2],p[3],p[4]),v=p[5]-p[6]*Math.max(0,d);if(v>h){h=v;side=Math.min(1,Math.max(0,d)*.35)*p[7];flat=p[8]?0:1;}}
    // stairs are paved: no unevenness on them
    for(const r of RAMP){const q=seg(x,z,r[0],r[1],r[3],r[4]),v=r[2]+(r[5]-r[2])*q.t-r[7]*Math.max(0,q.d-r[6]);if(v>h){h=v;side=Math.min(1,Math.max(0,q.d-r[6])*.35);flat=side>0?1:0;}}
    // north of the village the ground breaks off into the sea of mist
    if(z<-84&&x<20)h-=sm((-z-84)/26)*sm((20-x)/8)*Math.max(0,h+40)*(x<-30?.5:1);
    const g=gorge(x,z);if(g<h){h=g;side=1;}
    // the rock stays under the zig-zag stairs
    for(const r of ZIG){const q=seg(x,z,r[0],r[1],r[3],r[4]);if(q.d<r[6]+.8&&q.t>.02){const y=r[2]+(r[5]-r[2])*q.t-.35;if(h>y)h=y;}}
    // rock relief on cliffs and slopes, a little unevenness on the open ground; paved places stay flat
    h+=(fbm(x*.09+7,z*.09-3,3)-.5)*5*side+(fbm(x*.31,z*.31,2)-.5)*.5*side+(vnoise(x*.15,z*.15)-.5)*.25*(1-side)*flat;
    return h;}
  return {
    tsz:320,wr:120,h0,box,seg,PLAT,RAMP,GORGE,ZIG,
    // the way through the gate and up the zig-zag stairs (tests/demo.test.js walks it)
    zigRoute:[[49.5,-52],[49,-57.5],[44.6,-57.6],[44.6,-60],[46.3,-60.05],[58,-62],[59.6,-63.8],[58,-65.5],[46,-67.5],[44.4,-69],[46,-70.5],[54,-77.5],[54,-82]],
    // the bonfire is the shrine (id 0); the start is just south-east of it, looking north down the stairs
    shrines:[{x:-2.7,z:-5.4,name:"Falò dell'Arco"}],arch:{x:-6.4,z:-8.2,yaw:.42},
    start:{x:.9,z:-2.2,yaw:-.05},
    camps:[{x:-8,z:-54,name:'Villaggio delle Lanterne',boss:'Gorrak lo Sfregiato',tier:0},
      {x:58,z:-131,name:'Palazzo della Rupe',boss:'Il Custode Velato',tier:2}],
    lake:{x:29,z:-104,r:5},bridge:{x0:18,x1:44.5,z:-52,y:8.3,hw:2.2},gate:{x:44.5,z:-52},
    // chest of each camp (x, z, yaw) and the enemies: type, x, z, camp (-1 = none), options for spawnEnemy
    chests:[[-5,-49,.4],[58,-127,0]],
    enemies:[['goblin',-5,-44,0],['goblin',-14,-56,0,{sit:true}],['goblin',3,-59,0],['goblin',-22,-47,0,{sit:true}],['archer',12,-46,0],
      ['wolf',-30,-66,0],['wolf',-33,-61,0],['troll',-9,-59,0,{boss:true,sleep:true,name:'Gorrak lo Sfregiato',scale:1}],
      ['goblin',52,-53,1],['goblin',50,-82,1],['goblin',57,-86,1],['archer',54,-116,1],['archer',61,-116,1],
      ['troll',58,-133,1,{boss:true,sleep:true,name:'Il Custode Velato',king:true,scale:1.16}]],
    // village: x, z, yaw (front faces +z turned by yaw), width, depth, storeys, options; fences (from, to); lantern posts
    houses:[[-21,-40,1.35,9,7,2,{}],[-9,-41,.5,6,5,1,{stall:1}],[8,-63,0,11,8,2,{red:1}],[3,-75,.1,9,7,1,{}],[-30,-56,1.45,8,6,1,{}],
      [-26,-68,1.2,7,6,2,{}],[-38,-46,1.5,7,6,1,{lant:false}],[-17,-77,.3,8,6,1,{}],[12,-47,-.9,5,4,1,{stall:1,red:1}],[-36,-74,1.1,6,5,1,{lant:false}]],
    fences:[[-28,-30,-14,-31],[-42,-40,-42,-60],[14,-36,17,-44],[-12,-84,4,-84]],
    villageLanterns:[[-3,-37],[3,-37],[-6,-46],[6,-50],[14,-55],[-14,-50]],
    // the palace (centre of the hall's plaza), the pavilion over the gorge, the waterfall (lip x, z, yaw, top and bottom height, width, push out, foot)
    palace:{x:58,z:-130},pavilion:{x:46,z:-86},
    fall:{x:43.4,z:-112,yaw:-Math.PI/2,y0:49.5,y1:-30,w0:7,w1:15,out:4,bx:33,bz:-112},
    // trees: maples (x, z, size, colour), pine and fir areas (centre, radius, how many), pampas lines (from, to, clumps), fallen leaves (centre, half sizes, count)
    maples:[[-4,-50,1.55],[-30,-40,1.1],[-18,-63,1.0,'a'],[4,-40,.9],[-8,-14,1.1],[-14,8,1.0,'a'],[14,-66,1.05],[-44,-82,.9,'a'],[-40,-58,1.0]],
    pineAreas:[[-10,16,12,6],[13,6,6,3],[-52,-80,14,5],[66,-60,10,5],[78,-96,14,8],[60,-150,22,10],[46,-112,7,3],[-30,-28,10,4],[-62,-40,18,8]],
    firAreas:[[-70,-60,30,14],[-60,20,20,8],[10,30,20,6],[95,-60,14,6]],
    pampas:[[-8.6,-8,-8.6,6,9],[8.6,-8,8.6,6,6],[-4.5,-10,-4.5,-32,10],[4.5,-10,4.5,-32,10],[16,-46,16,-58,8],[-10,10,10,10,8],[44,-58,52,-58,4]],
    leaves:[[0,-1,8.5,7.5,140],[0,-20,3,12,60],[-6,-50,10,8,90]],
    // title screen: the picture's view from the terrace
    title:{p:[.9,24.6,-2.4],t:[3.2,15.9,-51]},
    fog:[.0042,.62],wet:.55,light:[.85,1.05],cloud:.12,paths:[[[0,-6],[0,-33],[-2,-46],[-8,-54],[18,-52]],[[-8,-54],[-30,-62],[-44,-82]],[[-8,-54],[-14,-34]]],
    // sun low in front of the bonfire view (backlight through a break in the clouds), overcast sky, blue-grey mist
    sun:[.12,.34,-.93],
    sky:{hor:0x8f989f,zen:0x2b333c,cloud:0x5e666e,sun:[1.0,.8,.58],fog:0x87919a,hemiS:0xa9b4be,hemiG:0x34302b}};
})();
