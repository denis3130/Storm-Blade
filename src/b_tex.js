/* ============================== procedural textures ============================== */
const TS=isTouch?256:512;
function tn2(x,y,Px,Py,so){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const x0=((xi%Px)+Px)%Px,x1=(x0+1)%Px,y0=((yi%Py)+Py)%Py,y1=(y0+1)%Py;
  const a=hash2(x0+so,y0),b=hash2(x1+so,y0),c=hash2(x0+so,y1),d=hash2(x1+so,y1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function mkC(w,h){const c=document.createElement('canvas');c.width=w;c.height=h||w;return c;}
function toTex(c,{srgb=true,rep=true}={}){const t=new THREE.CanvasTexture(c);if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;}t.anisotropy=MAXANI;if(srgb)t.encoding=THREE.sRGBEncoding;return t;}
function pxFill(c,fn){const W=c.width,H=c.height,x=c.getContext('2d'),id=x.createImageData(W,H),d=id.data,o=[0,0,0,255];
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){o[3]=255;fn(i/W,j/H,o);const k=(j*W+i)*4;d[k]=o[0];d[k+1]=o[1];d[k+2]=o[2];d[k+3]=o[3];}
  x.putImageData(id,0,0);return x;}
function wrapDraw(S,X,Y,r,f){f(X,Y);if(X<r)f(X+S,Y);if(X>S-r)f(X-S,Y);if(Y<r)f(X,Y+S);if(Y>S-r)f(X,Y-S);}
const rgba=(r,g,b,a)=>`rgba(${r|0},${g|0},${b|0},${a})`;

function genGrassG(){const c=mkC(TS),S=TS;
  const x=pxFill(c,(u,v,o)=>{const n=tfbm(u,v,4,4,1),n2=tfbm(u,v,32,2,7),d=tfbm(u,v,3,3,19),dry=sstep(.55,.75,d);
    o[0]=lerp(30,62,n)+n2*16+dry*30;o[1]=lerp(40,72,n)+n2*18+dry*15;o[2]=lerp(20,34,n)+n2*6+dry*2;});
  x.lineCap='round';
  for(let i=0;i<S*9;i++){const X=Math.random()*S,Y=Math.random()*S,a=Math.random()*TAU,l=S*rr(.006,.018),dk=Math.random()<.5;
    x.strokeStyle=dk?rgba(18+rr(0,14),30+rr(0,14),12+rr(0,8),.55):rgba(68+rr(0,40),82+rr(0,34),34+rr(0,16),.5);x.lineWidth=S*rr(.0012,.0028);
    wrapDraw(S,X,Y,l,(a2,b2)=>{x.beginPath();x.moveTo(a2,b2);x.lineTo(a2+Math.cos(a)*l,b2+Math.sin(a)*l);x.stroke();});}
  return c;}
function genMossG(){const c=mkC(TS),S=TS;
  const x=pxFill(c,(u,v,o)=>{const n=tfbm(u,v,5,4,3),m=tfbm(u,v,2,3,29),n2=tfbm(u,v,40,1,13);
    o[0]=lerp(26,54,n)+n2*10;o[1]=lerp(30,58,n)*(.75+m*.5)+n2*10;o[2]=lerp(16,30,n)+n2*5;});
  x.lineCap='round';
  for(let i=0;i<S*6;i++){const X=Math.random()*S,Y=Math.random()*S,a=Math.random()*TAU,l=S*rr(.008,.022);
    x.strokeStyle=rgba(70+rr(0,40),44+rr(0,22),22+rr(0,10),rr(.35,.7));x.lineWidth=S*rr(.0012,.0022);
    wrapDraw(S,X,Y,l,(a2,b2)=>{x.beginPath();x.moveTo(a2,b2);x.lineTo(a2+Math.cos(a)*l,b2+Math.sin(a)*l);x.stroke();});}
  for(let i=0;i<S*.9;i++){const X=Math.random()*S,Y=Math.random()*S,r=S*rr(.004,.009),a=Math.random()*PI;
    x.fillStyle=rgba(60+rr(0,40),40+rr(0,25),20+rr(0,10),rr(.5,.85));
    wrapDraw(S,X,Y,r*2,(a2,b2)=>{x.beginPath();x.ellipse(a2,b2,r,r*.5,a,0,TAU);x.fill();});}
  return c;}
function genDirtG(){const c=mkC(TS),S=TS;
  const x=pxFill(c,(u,v,o)=>{const n=tfbm(u,v,5,4,11),n2=tfbm(u,v,24,2,5),w=tfbm(u,v,2,2,91);
    o[0]=lerp(54,92,n)+n2*14-w*10;o[1]=lerp(47,80,n)+n2*12-w*8;o[2]=lerp(38,62,n)+n2*9-w*5;});
  for(let i=0;i<S*2.2;i++){const X=Math.random()*S,Y=Math.random()*S,r=S*rr(.002,.009),a=Math.random()*PI,l=rr(70,130);
    wrapDraw(S,X,Y,r*3,(a2,b2)=>{x.fillStyle=rgba(20,16,12,.45);x.beginPath();x.ellipse(a2+r*.3,b2+r*.4,r,r*.75,a,0,TAU);x.fill();
      x.fillStyle=rgba(l,l*.92,l*.82,.9);x.beginPath();x.ellipse(a2,b2,r,r*.75,a,0,TAU);x.fill();});}
  return c;}
function genRockG(){const c=mkC(TS);
  pxFill(c,(u,v,o)=>{const n=tfbm(u,v,4,5,41),cr=Math.abs(tfbm(u,v,6,3,57)-.5),crack=1-sstep(0,.028,cr),li=sstep(.6,.7,tfbm(u,v,10,3,77)),fine=tfbm(u,v,64,1,3);
    const l=lerp(72,128,n)+fine*16,k=1-crack*.34;o[0]=l*k+li*22;o[1]=l*k+li*28;o[2]=l*.95*k+li*4;});
  return c;}
function genBark(){const c=mkC(256);
  pxFill(c,(u,v,o)=>{const r=Math.abs(tn2(u*18,v*3,18,3,5)-.5)*2,r2=tn2(u*40,v*6,40,6,9),n=tn2(u*6,v*2,6,2,21);
    const g=sstep(.1,.5,r);const l=lerp(28,78,g)*(.75+n*.5)+r2*12;o[0]=l*1.05;o[1]=l*.88;o[2]=l*.72;});
  return c;}
function genWood(){const c=mkC(256);
  pxFill(c,(u,v,o)=>{const g=tn2(u*3,v*40,3,40,4),k=tn2(u*8,v*120,8,120,8),pl=Math.floor(u*4),seam=(u*4%1)<.03?.45:1;
    const l=lerp(60,104,g)*(.82+k*.3)*seam*(.9+hash2(pl,3)*.2);o[0]=l*1.08;o[1]=l*.86;o[2]=l*.62;});
  return c;}
function genHide(){const c=mkC(256),S=256;
  const x=pxFill(c,(u,v,o)=>{const n=tfbm(u,v,4,4,61),st=tfbm(u,v,2,2,62),p=tfbm(u,v,12,2,63);
    const l=lerp(92,140,n)*(1-sstep(.55,.8,st)*.35)+p*12;o[0]=l;o[1]=l*.8;o[2]=l*.6;});
  x.strokeStyle='rgba(40,28,18,.8)';x.lineWidth=2;x.setLineDash([5,4]);
  for(let i=0;i<5;i++){x.beginPath();const y=rr(20,236);x.moveTo(0,y);x.bezierCurveTo(80,y+rr(-30,30),170,y+rr(-30,30),256,y);x.stroke();}
  for(let i=0;i<4;i++){x.beginPath();const X=rr(20,236);x.moveTo(X,0);x.bezierCurveTo(X+rr(-30,30),90,X+rr(-30,30),170,X,256);x.stroke();}
  return c;}
function genBanner(){const c=mkC(128,256),x=c.getContext('2d');
  pxFill(c,(u,v,o)=>{const n=tfbm(u,v,4,3,71),w=(hash2((u*128)|0,(v*256)|0)*.12);const l=lerp(.75,1.05,n)-w;o[0]=104*l;o[1]=22*l;o[2]=16*l;
    const tear=v>.82?sstep(.82,1,v)*1.4-tn2(u*9,1,9,1,4)*.9:0;o[3]=tear>.35?0:255;});
  x.fillStyle='rgba(12,8,7,.92)';x.strokeStyle='rgba(12,8,7,.92)';x.lineWidth=7;
  x.beginPath();x.arc(64,96,30,PI*.85,PI*.15);x.lineTo(84,130);x.lineTo(44,130);x.closePath();x.fill();
  x.fillStyle='rgba(150,30,22,1)';x.beginPath();x.arc(52,96,8,0,TAU);x.arc(76,96,8,0,TAU);x.fill();
  x.fillStyle='rgba(12,8,7,.92)';x.beginPath();x.moveTo(38,70);x.lineTo(22,40);x.lineTo(48,66);x.fill();x.beginPath();x.moveTo(90,70);x.lineTo(106,40);x.lineTo(80,66);x.fill();
  x.beginPath();x.moveTo(30,150);x.lineTo(98,190);x.stroke();x.beginPath();x.moveTo(98,150);x.lineTo(30,190);x.stroke();
  return c;}
function genNeedles(){const W=256,H=128,c=mkC(W,H),x=c.getContext('2d');x.clearRect(0,0,W,H);x.lineCap='round';
  const twig=(x0,y0,ang,len,w,depth)=>{const steps=26;let px=x0,py=y0;
    for(let i=0;i<steps;i++){const t=i/steps,nx=px+Math.cos(ang)*len/steps,ny=py+Math.sin(ang)*len/steps+t*.6;
      const nl=(H*.30)*(1-t*.55)*(depth?.7:1);
      for(const s of[-1,1]){for(let k=0;k<2;k++){const a=ang+s*rr(.55,.95),l=nl*rr(.7,1.05);const g=rr(.6,1.15);
        x.strokeStyle=rgba(22*g,44*g+rr(0,10),24*g,1);x.lineWidth=rr(1.6,2.4);x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke();}}
      if(!depth&&i%6===3&&t<.75){twig(px,py,ang+(Math.random()<.5?-1:1)*rr(.5,.8),len*(1-t)*.45,w*.6,1);}
      x.strokeStyle=rgba(52,38,26,1);x.lineWidth=w*(1-t*.7);x.beginPath();x.moveTo(px,py);x.lineTo(nx,ny);x.stroke();px=nx;py=ny;}};
  twig(4,H*.5,0,W*.96,4,0);
  // tip highlights
  for(let i=0;i<220;i++){const X=rr(20,W-6),Y=H*.5+rr(-H*.34,H*.34)*(1-X/W*.5),a=rr(0,TAU),l=rr(4,9);
    x.strokeStyle=rgba(58,82,44,.9);x.lineWidth=1.4;x.beginPath();x.moveTo(X,Y);x.lineTo(X+Math.cos(a)*l,Y+Math.sin(a)*l);x.stroke();}
  return c;}
function genLeaves(){const S=256,c=mkC(S),x=c.getContext('2d');x.clearRect(0,0,S,S);
  for(let i=0;i<150;i++){const a=rr(0,TAU),r=Math.sqrt(Math.random())*S*.4,X=S/2+Math.cos(a)*r,Y=S/2+Math.sin(a)*r,l=rr(9,16),g=rr(.55,1.2)*(1-r/S*.6);
    x.fillStyle=rgba(38*g+rr(0,12),52*g,22*g,1);x.save();x.translate(X,Y);x.rotate(rr(0,TAU));x.beginPath();x.ellipse(0,0,l,l*.45,0,0,TAU);x.fill();
    x.strokeStyle=rgba(20*g,28*g,12*g,.8);x.lineWidth=1;x.beginPath();x.moveTo(-l,0);x.lineTo(l,0);x.stroke();x.restore();}
  return c;}
function genFern(){const W=256,H=64,c=mkC(W,H),x=c.getContext('2d');x.clearRect(0,0,W,H);
  for(let i=0;i<46;i++){const t=i/46,X=6+t*(W-14),l=H*.46*Math.sin(Math.min(1,t*1.15)*PI*.95)+3;
    for(const s of[-1,1]){x.fillStyle=rgba(40+rr(0,18),62+rr(0,20),26,1);x.beginPath();x.moveTo(X,H/2);x.quadraticCurveTo(X+5,H/2+s*l*.6,X+9,H/2+s*l);x.quadraticCurveTo(X+2,H/2+s*l*.5,X,H/2);x.fill();}}
  x.strokeStyle=rgba(48,58,26,1);x.lineWidth=2.4;x.beginPath();x.moveTo(2,H/2);x.lineTo(W-4,H/2);x.stroke();
  return c;}
function genRune(){const S=256,c=mkC(S),x=c.getContext('2d');x.clearRect(0,0,S,S);x.strokeStyle='#fff';x.fillStyle='#fff';x.lineCap='round';
  x.lineWidth=3;x.beginPath();x.arc(128,128,118,0,TAU);x.stroke();x.lineWidth=1.5;x.beginPath();x.arc(128,128,104,0,TAU);x.stroke();
  x.lineWidth=2;x.beginPath();x.arc(128,128,58,0,TAU);x.stroke();
  for(let i=0;i<16;i++){const a=i/16*TAU;x.save();x.translate(128+Math.cos(a)*111,128+Math.sin(a)*111);x.rotate(a+PI/2);x.lineWidth=2.2;x.beginPath();
    const k=i%4;if(k===0){x.moveTo(-4,-5);x.lineTo(0,5);x.lineTo(4,-5);}else if(k===1){x.moveTo(0,-5);x.lineTo(0,5);x.moveTo(-4,0);x.lineTo(4,-4);}else if(k===2){x.moveTo(-4,5);x.lineTo(-4,-5);x.lineTo(4,0);}else{x.arc(0,0,4,0,PI*1.5);}
    x.stroke();x.restore();}
  for(let i=0;i<6;i++){const a=i/6*TAU;x.lineWidth=2.5;x.beginPath();x.moveTo(128+Math.cos(a)*58,128+Math.sin(a)*58);x.lineTo(128+Math.cos(a+PI*2/3)*58,128+Math.sin(a+PI*2/3)*58);x.stroke();}
  return c;}
function genDetail(){const c=mkC(128);pxFill(c,(u,v,o)=>{const n=tfbm(u,v,8,3,5),f=tfbm(u,v,32,2,9),fib=tn2(u*64,v*8,64,8,3);const l=196+n*34+f*18+fib*8;o[0]=o[1]=o[2]=l;});return c;}
function genFlame(){const W=64,H=128,c=mkC(W,H);
  pxFill(c,(u,v,o)=>{const y=1-v,cx=Math.abs(u-.5)*2;const w=(1-y)*.9+.1;const n=tn2(u*4,v*6,4,6,3);const s=sstep(w,w-.45,cx+n*.35*y)*sstep(0,.12,y)*(1-sstep(.75,1,y+n*.25));
    o[0]=255*s;o[1]=lerp(60,230,s*s)*s;o[2]=lerp(10,120,s*s*s)*s;o[3]=255*s;});
  return c;}

const TEX={};
function makeTextures(){
  TEX.grass=toTex(genGrassG(),{srgb:false});TEX.moss=toTex(genMossG(),{srgb:false});TEX.dirt=toTex(genDirtG(),{srgb:false});TEX.rock=toTex(genRockG(),{srgb:false});
  TEX.bark=toTex(genBark());TEX.wood=toTex(genWood());TEX.hide=toTex(genHide());TEX.banner=toTex(genBanner(),{rep:false});
  TEX.needles=toTex(genNeedles(),{rep:false});TEX.leaves=toTex(genLeaves(),{rep:false});TEX.fern=toTex(genFern(),{rep:false});
  TEX.rune=toTex(genRune(),{rep:false,srgb:false});TEX.detail=toTex(genDetail());TEX.flame=toTex(genFlame(),{rep:false,srgb:false});
  for(const k of['needles','leaves','fern','banner'])TEX[k].premultiplyAlpha=false;
}
