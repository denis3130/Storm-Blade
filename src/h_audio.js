/* ============================== audio ============================== */
const AU={c:null,right:V3(1,0,0)};
const mf=m=>440*Math.pow(2,(m-69)/12);
function audioInit(){
  if(AU.c){if(AU.c.state==='suspended')AU.c.resume();return;}
  try{const C=new(window.AudioContext||window.webkitAudioContext)();AU.c=C;
    const comp=C.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=12;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.2;comp.connect(C.destination);
    AU.master=C.createGain();AU.master.gain.value=.95;AU.master.connect(comp);
    AU.mus=C.createGain();AU.mus.gain.value=SET.music*.5;AU.mus.connect(AU.master);
    AU.fx=C.createGain();AU.fx.gain.value=SET.sfx;AU.fx.connect(AU.master);
    const len=Math.floor(C.sampleRate*2.8),ir=C.createBuffer(2,len,C.sampleRate);
    for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)*(i<C.sampleRate*.01?i/(C.sampleRate*.01):1);}
    AU.verb=C.createConvolver();AU.verb.buffer=ir;const vg=C.createGain();vg.gain.value=.42;AU.verb.connect(vg);vg.connect(AU.master);
    AU.verbFx=C.createGain();AU.verbFx.gain.value=.5;AU.verbFx.connect(AU.verb);AU.fx.connect(AU.verbFx);
    AU.verbMus=C.createGain();AU.verbMus.gain.value=.8;AU.verbMus.connect(AU.verb);AU.mus.connect(AU.verbMus);
    const n=C.sampleRate*2;AU.noise=C.createBuffer(1,n,C.sampleRate);const nd=AU.noise.getChannelData(0);for(let i=0;i<n;i++)nd[i]=Math.random()*2-1;
    const pink=C.createBuffer(1,n,C.sampleRate),pd=pink.getChannelData(0);let b0=0,b1=0,b2=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;b0=.997*b0+w*.03;b1=.985*b1+w*.06;b2=.95*b2+w*.12;pd[i]=(b0+b1+b2)*.6;}AU.pink=pink;
    const amb=(buf,type,f,q,g)=>{const s=C.createBufferSource();s.buffer=buf;s.loop=true;const fl=C.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const gn=C.createGain();gn.gain.value=g;s.connect(fl);fl.connect(gn);gn.connect(AU.fx);s.start();return{fl,gn};};
    AU.wind=amb(AU.pink,'bandpass',420,.7,.0);AU.rain=amb(AU.noise,'highpass',1400,.4,0);AU.rainLo=amb(AU.pink,'lowpass',500,.5,0);
    MUS.next=C.currentTime+.3;
  }catch(e){AU.c=null;}
}
function setVolumes(){if(!AU.c)return;AU.mus.gain.setTargetAtTime(SET.music*.5,AU.c.currentTime,.1);AU.fx.gain.setTargetAtTime(SET.sfx,AU.c.currentTime,.1);}
function out(pos,vol=1,verb=0){const C=AU.c,g=C.createGain();let v=vol;
  if(pos){const dx=pos.x-camera.position.x,dy=pos.y-camera.position.y,dz=pos.z-camera.position.z,d=Math.sqrt(dx*dx+dy*dy+dz*dz);v=vol/(1+d*.07+d*d*.0035);
    if(C.createStereoPanner){const p=C.createStereoPanner();p.pan.value=d>.5?clamp((dx*AU.right.x+dz*AU.right.z)/d,-1,1)*.75:0;g.connect(p);p.connect(AU.fx);}else g.connect(AU.fx);}
  else g.connect(AU.fx);
  if(verb>0){const vs=C.createGain();vs.gain.value=verb;g.connect(vs);vs.connect(AU.verb);}
  g.gain.value=v;return g;}
function envG(g,t,a,pk,d){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,pk),t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d);}
function nz(o,dur,type,f0,f1,q,pk,a=.004,delay=0,buf){const C=AU.c,t=C.currentTime+delay,s=C.createBufferSource();s.buffer=buf||AU.noise;const f=C.createBiquadFilter();f.type=type;
  f.frequency.setValueAtTime(f0,t);if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+a+dur);f.Q.value=q;const g=C.createGain();envG(g,t,a,pk,dur);s.connect(f);f.connect(g);g.connect(o);s.start(t,Math.random()*1.5);s.stop(t+a+dur+.05);}
function tn(o,type,f0,f1,dur,pk,delay=0,a=.004){const C=AU.c,t=C.currentTime+delay,s=C.createOscillator();s.type=type;s.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)s.frequency.exponentialRampToValueAtTime(f1,t+a+dur);
  const g=C.createGain();envG(g,t,a,pk,dur);s.connect(g);g.connect(o);s.start(t);s.stop(t+a+dur+.05);return s;}
function dist(amount){const C=AU.c,ws=C.createWaveShaper(),n=1024,cur=new Float32Array(n);for(let i=0;i<n;i++){const x=i/n*2-1;cur[i]=Math.tanh(x*amount);}ws.curve=cur;return ws;}
function sfx(k,pos,p=1){if(!AU.c)return;try{let o;switch(k){
  case'swing':o=out(pos,.55*p,.1);nz(o,.16+.08*(p-1),'bandpass',3200,600,1.1,.5);nz(o,.12,'highpass',5000,0,.5,.12);break;
  case'swingH':o=out(pos,.7,.2);nz(o,.32,'bandpass',1800,300,1.4,.6,.02);tn(o,'sine',160,60,.3,.25);break;
  case'hit':o=out(pos,.8*p,.15);tn(o,'sine',150,48,.16,.7);nz(o,.09,'lowpass',2400,600,.8,.55);nz(o,.05,'bandpass',900,0,2,.35,0,.015);break;
  case'hitBig':o=out(pos,1,.3);tn(o,'sine',110,35,.32,.9);nz(o,.22,'lowpass',1600,300,.8,.6);break;
  case'clang':{o=out(pos,.8,.9);const b=rr(780,920);[[1,.5,.9],[2.76,.25,.55],[5.4,.12,.32],[8.93,.06,.2]].forEach(([r,pk,d])=>tn(o,'sine',b*r,b*r*.995,d,pk));nz(o,.04,'highpass',4000,0,.6,.5);break;}
  case'block':o=out(pos,.7,.2);tn(o,'triangle',520,430,.14,.25);nz(o,.07,'bandpass',1400,700,1.3,.4);tn(o,'sine',120,70,.1,.4);break;
  case'splash':o=out(pos,.3*p);nz(o,.16,'bandpass',rr(700,1300),2600,.7,.55,.006);nz(o,.12,'highpass',rr(3500,5000),0,.4,.22,.01,.03);break;
  case'glint':o=out(pos,.5*p,.35);tn(o,'sine',2600,3400,.16,.32);tn(o,'triangle',3900,4100,.1,.14,.02);break;
  case'perfect':o=out(null,.55,.4);nz(o,.35,'bandpass',600,3200,.8,.4,.01);tn(o,'sine',880,1320,.4,.18,.05);tn(o,'sine',1320,1760,.35,.12,.12);break;
  case'down':o=out(pos,.8*p,.15);tn(o,'sine',90,40,.25,.7);nz(o,.18,'lowpass',900,200,.7,.5);break;
  case'bossDie':o=out(null,1,.6);tn(o,'sine',70,28,1.6,.9);nz(o,1.2,'lowpass',1400,90,.6,.7,.01);tn(o,'triangle',220,110,1.2,.2,.1);tn(o,'sine',330,165,1.4,.14,.2);break;
  case'step':o=out(pos,.16*p);nz(o,.05,'lowpass',rr(500,900),200,.7,.5);nz(o,.07,'highpass',rr(2500,4200),0,.5,.12,.002,.01);break;
  case'stepBig':o=out(pos,.9);tn(o,'sine',70,32,.35,.8);nz(o,.2,'lowpass',300,80,.7,.5);break;
  case'roll':o=out(pos,.45);nz(o,.28,'lowpass',1400,300,.6,.5,.03);tn(o,'sine',90,50,.12,.35,.22);break;
  case'hurt':o=out(pos,.5);tn(o,'sawtooth',190,110,.18,.18);nz(o,.12,'bandpass',800,400,2,.2);break;
  case'gobAlert':o=out(pos,.6,.3);{const s=tn(o,'sawtooth',520,880,.12,.25);tn(o,'sawtooth',880,460,.22,.2,.12);nz(o,.25,'bandpass',1400,2200,4,.15);}break;
  case'gobHurt':o=out(pos,.55);tn(o,'sawtooth',620,330,.13,.22);nz(o,.1,'bandpass',1800,900,5,.15);break;
  case'gobDie':o=out(pos,.6,.3);tn(o,'sawtooth',520,110,.5,.22);nz(o,.4,'bandpass',1200,300,4,.12);break;
  case'gobAtk':o=out(pos,.45);tn(o,'sawtooth',300,520,.16,.18);break;
  case'growl':o=out(pos,.6,.2);{const C=AU.c,t=C.currentTime,s=C.createBufferSource();s.buffer=AU.noise;const f=C.createBiquadFilter();f.type='bandpass';f.frequency.value=260;f.Q.value=3;
    const am=C.createGain(),lfo=C.createOscillator();lfo.frequency.value=28;const lg=C.createGain();lg.gain.value=.5;lfo.connect(lg);lg.connect(am.gain);am.gain.value=.5;
    const g=C.createGain();envG(g,t,.05,.9,.55);s.connect(f);f.connect(am);am.connect(g);g.connect(o);s.start(t,Math.random());s.stop(t+.7);lfo.start(t);lfo.stop(t+.7);}break;
  case'howl':o=out(pos,.5,1);{const C=AU.c,t=C.currentTime,s=C.createOscillator();s.type='sine';s.frequency.setValueAtTime(340,t);s.frequency.linearRampToValueAtTime(620,t+.5);s.frequency.linearRampToValueAtTime(540,t+1.4);
    const v=C.createOscillator();v.frequency.value=5.5;const vg=C.createGain();vg.gain.value=9;v.connect(vg);vg.connect(s.frequency);const g=C.createGain();envG(g,t,.25,.35,1.3);s.connect(g);g.connect(o);s.start(t);s.stop(t+1.7);v.start(t);v.stop(t+1.7);}break;
  case'bite':o=out(pos,.5);nz(o,.12,'bandpass',1500,700,2,.4);tn(o,'sawtooth',240,140,.1,.15);break;
  case'roar':o=out(pos,1.1,.6);{const C=AU.c,ds=dist(3);ds.connect(o);tn(ds,'sawtooth',92,52,1.1,.5,0,.08);tn(ds,'sawtooth',138,70,1.0,.3,0,.08);nz(o,.9,'lowpass',520,160,.7,.6,.1);}break;
  case'slam':o=out(pos,1.2,.5);tn(o,'sine',75,26,.6,1);nz(o,.45,'lowpass',900,120,.7,.8);nz(o,.25,'bandpass',300,0,1,.4,0,.05);break;
  case'wail':o=out(pos,.4,1);{const C=AU.c,t=C.currentTime,s=C.createOscillator();s.type='triangle';s.frequency.setValueAtTime(rr(620,760),t);s.frequency.linearRampToValueAtTime(rr(380,480),t+.9);
    const v=C.createOscillator();v.frequency.value=7;const vg=C.createGain();vg.gain.value=14;v.connect(vg);vg.connect(s.frequency);const g=C.createGain();envG(g,t,.2,.25,.85);s.connect(g);g.connect(o);s.start(t);s.stop(t+1.2);v.start(t);v.stop(t+1.2);}break;
  case'orb':o=out(pos,.45,.5);tn(o,'sine',1300,360,.3,.3);nz(o,.25,'bandpass',2400,800,6,.12);break;
  case'orbHit':o=out(pos,.6,.5);tn(o,'sine',520,180,.25,.4);nz(o,.18,'highpass',2500,0,.8,.3);break;
  case'bow':o=out(pos,.5);nz(o,.08,'bandpass',1100,0,3,.4);tn(o,'triangle',220,180,.12,.15);break;
  case'arrow':o=out(pos,.35);nz(o,.18,'bandpass',4000,1500,3,.2,.01);break;
  case'thunder':{const d=pos?Math.hypot(pos.x-camera.position.x,pos.z-camera.position.z):60;const dl=Math.min(2.5,d/340);o=out(null,clamp(1.6-d/120,.35,1.4),.7);
    if(d<30)nz(o,.12,'highpass',2000,0,.5,.9,.002,dl);nz(o,2.6,'lowpass',d<30?900:420,70,.6,.9,.05,dl,AU.pink);tn(o,'sine',60,28,1.2,.5,dl);}break;
  case'crackle':o=out(pos,.4);for(let i=0;i<5;i++)nz(o,.03,'highpass',3500,0,.6,.35,.002,i*.12+rr(0,.06));break;
  case'level':o=out(null,.6,1);[62,65,69,74,77].forEach((m,i)=>tn(o,'triangle',mf(m),mf(m),.9,.18,i*.09,.01));tn(o,'sine',mf(50),mf(50),1.6,.2,0,.05);break;
  case'chest':o=out(pos,.7,.8);nz(o,.5,'bandpass',300,180,4,.2,.05);[69,74,78,81,86].forEach((m,i)=>tn(o,'triangle',mf(m),mf(m),1.1,.13,.35+i*.1,.01));break;
  case'drink':o=out(pos,.5);for(let i=0;i<3;i++)tn(o,'sine',320,170,.09,.3,i*.2);[81,84,88].forEach((m,i)=>tn(o,'sine',mf(m),mf(m),.6,.06,.62+i*.07,.02));break;
  case'rest':o=out(null,.55,1.2);[50,57,62,65,69].forEach((m,i)=>tn(o,'sine',mf(m),mf(m),2.6,.09,i*.18,.6));break;
  case'ui':o=out(null,.25);tn(o,'triangle',880,880,.06,.15);break;
  case'parryHit':o=out(pos,1,.8);{const b=rr(1150,1300);[[1,.6,1.3],[2.76,.3,.9],[5.4,.16,.6],[8.93,.08,.4]].forEach(([r,pk,d])=>tn(o,'sine',b*r,b*r*.996,d,pk));nz(o,.05,'highpass',5000,0,.6,.8);tn(o,'sine',90,40,.2,.6);}break;
  case'heart':o=out(null,.5);tn(o,'sine',62,40,.14,.7);tn(o,'sine',58,38,.14,.5,.22);break;
  case'death':o=out(null,.8,1);tn(o,'sawtooth',110,40,2.2,.25,0,.1);nz(o,2,'lowpass',600,80,.7,.3,.2,0,AU.pink);[50,49,45].forEach((m,i)=>tn(o,'sine',mf(m),mf(m),2.2,.12,i*.5,.3));break;
  case'banner':o=out(null,.55,1);tn(o,'sine',mf(38),mf(38),2.6,.35,0,.05);[62,69,74].forEach((m,i)=>tn(o,'triangle',mf(m),mf(m),1.6,.08,.05+i*.06,.05));break;
  case'warn':o=out(null,.6,1);[[74,0],[73,.35],[67,.7]].forEach(([m,d])=>tn(o,'sawtooth',mf(m),mf(m),.6,.06,d,.08));tn(o,'sine',mf(38),mf(37),2.4,.3,0,.4);break;
  case'tele':o=out(pos,.5,.3);for(let i=0;i<8;i++)nz(o,.04,'bandpass',rr(2500,5000),0,4,.35,.002,i*.11);tn(o,'sine',1800,2600,1.0,.04,0,.5);break;
}}catch(e){}}
/* ---------- generative score ---------- */
const MUS={next:0,step:0,combat:0,boss:0,storm:0,calm:1,chord:0};
const PROG=[[50,53,57],[46,50,53],[53,57,60],[48,52,55],[50,53,57],[43,46,50],[45,49,52],[50,53,57]];
const PENTA=[62,64,65,69,72,74,77,81];
function musicVoice(type,f,t,a,dur,pk,cut,dest){const C=AU.c,o=C.createOscillator();o.type=type;o.frequency.value=f;const fl=C.createBiquadFilter();fl.type='lowpass';fl.frequency.value=cut;fl.Q.value=.7;
  const g=C.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(pk,t+a);g.gain.setValueAtTime(pk,t+Math.max(a,dur-1.2));g.gain.linearRampToValueAtTime(.0001,t+dur);
  o.connect(fl);fl.connect(g);g.connect(dest||AU.mus);o.start(t);o.stop(t+dur+.1);return o;}
function drum(t,f0,f1,dur,pk,noiseAmt){const C=AU.c,o=C.createOscillator();o.type='sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);const g=C.createGain();envG(g,t,.004,pk,dur);o.connect(g);g.connect(AU.mus);o.start(t);o.stop(t+dur+.05);
  if(noiseAmt){const s=C.createBufferSource();s.buffer=AU.noise;const fl=C.createBiquadFilter();fl.type='lowpass';fl.frequency.value=900;const g2=C.createGain();envG(g2,t,.002,noiseAmt,dur*.6);s.connect(fl);fl.connect(g2);g2.connect(AU.mus);s.start(t,Math.random());s.stop(t+dur);}}
function musicTick(){if(!AU.c||AU.c.state!=='running')return;const C=AU.c;if(MUS.next<C.currentTime-.5)MUS.next=C.currentTime+.05;
  const bpm=lerp(64,92,Math.max(MUS.combat,MUS.boss)),q=60/bpm;
  while(MUS.next<C.currentTime+.3){const t=MUS.next,s=MUS.step;
    if(s%8===0){MUS.chord=(MUS.chord+1)%PROG.length;const ch=PROG[MUS.chord],dur=q*8+1.2,cut=700+MUS.combat*900+MUS.boss*600;
      ch.forEach((m,i)=>{musicVoice('sawtooth',mf(m)*(1+i*.0015),t,1.3,dur,.016*MUS.calm+.012,cut);musicVoice('triangle',mf(m+12),t,1.6,dur,.012,cut*1.5);});
      musicVoice('sine',mf(ch[0]-12),t,.8,dur,.05,400);
      if(MUS.storm>.2){[ch[0]+25,ch[1]+24,ch[0]+30].forEach(m=>{const o=musicVoice('sawtooth',mf(m),t,2,dur,.01*MUS.storm,2600);const l=C.createOscillator();l.frequency.value=7;const lg=C.createGain();lg.gain.value=mf(m)*.012;l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+dur);});}}
    if(s%2===0&&Math.random()<.38*MUS.calm+.1){const ch=PROG[MUS.chord],pool=PENTA.filter(m=>ch.some(c=>(m-c)%12===0)||Math.random()<.35),m=pick(pool.length?pool:PENTA);
      const o=C.createOscillator();o.type='triangle';o.frequency.value=mf(m);const g=C.createGain();envG(g,t,.005,.05,1.6);const fl=C.createBiquadFilter();fl.type='lowpass';fl.frequency.value=2400;o.connect(fl);fl.connect(g);g.connect(AU.mus);o.start(t);o.stop(t+1.8);}
    const cb=Math.max(MUS.combat,MUS.boss);
    if(cb>.05){const pat=[1,0,.4,0,.8,0,.45,.3];const v=pat[s%8];if(v)drum(t,lerp(90,60,MUS.boss),38,.32,.32*v*cb,.1*v*cb);
      if(s%2===1){const ch=PROG[MUS.chord];const m=ch[s%4===1?0:2]-12;musicVoice('sawtooth',mf(m),t,.01,q*.45,.022*cb,500+cb*700);}
      if(MUS.boss>.1&&s%8===0){drum(t,55,30,.9,.5*MUS.boss,.18*MUS.boss);const ch=PROG[MUS.chord];ch.forEach(m=>musicVoice('sawtooth',mf(m-12),t,.04,q*1.6,.03*MUS.boss,1200));}
      if(MUS.boss>.1&&s%4===2)drum(t+q*.5,140,80,.12,.12*MUS.boss,.12*MUS.boss);}
    MUS.next+=q/2*2*.5;MUS.step++;}}
function updAudio(dt,stormK,windK){if(!AU.c)return;const t=AU.c.currentTime;
  camera.matrixWorld.extractBasis(AU.right,_v1,_v2);
  AU.wind.gn.gain.setTargetAtTime(.05+stormK*.22+windK*.02,t,.4);AU.wind.fl.frequency.setTargetAtTime(380+stormK*500+Math.sin(t*.3)*120,t,.5);
  AU.rain.gn.gain.setTargetAtTime(stormK*.09,t,.5);AU.rainLo.gn.gain.setTargetAtTime(stormK*.2,t,.5);
  musicTick();}
