/* ============================== story: gendered text, dialogue ==============================
   Text data carries masculine/feminine variants as {m|f}; gtxt resolves them for the chosen body BEFORE the text starts typing.
   A dialogue is a graph of nodes {who, text, next?, choices?:[{t, next?, act?}], act?} that starts at 'start'.
   While a dialogue is open G.state is 'dialogue': the world is frozen like in pause, only the text and the HUD move. */
function gtxt(s,hero){const f=(hero===undefined?P.hero:hero)==='f';return String(s).replace(/\{([^{}|]*)\|([^{}|]*)\}/g,(m,a,b)=>f?b:a);}
const DLG={defs:{},cur:null};
function defineDialogue(id,nodes){DLG.defs[id]=nodes;}
function dlgActive(){return !!DLG.cur;}
// opt.onEnd runs when the dialogue closes (e.g. open the shrine menu after Selin has spoken)
function dlgStart(id,opt){const d=DLG.defs[id];if(!d||!d.start||G.state!=='play'||DLG.cur)return false;
  if(E.some(e=>!e.dead&&e.aggro&&Math.hypot(e.pos.x-P.pos.x,e.pos.z-P.pos.z)<14))return false;
  DLG.cur={id,d,onEnd:opt&&opt.onEnd};G.state='dialogue';IN.atk=IN.blk=IN.hvy=false;
  $('dialog').hidden=false;$('touch').hidden=true;$('prompt').hidden=true;if(document.pointerLockElement)document.exitPointerLock();
  dlgShow('start');return true;}
function dlgShow(key){const c=DLG.cur,n=c.d[key];if(!n){dlgEnd();return;}
  Object.assign(c,{key,n,full:gtxt(n.text||''),shown:0,typing:true});
  $('dlgWho').textContent=gtxt(n.who||'');$('dlgText').textContent='';$('dlgChoices').innerHTML='';$('dlgChoices').hidden=true;$('dlgMore').hidden=true;
  if(n.act)storyAct(n.act);}
// typewriter: CFG.ui.typeSpeed characters per second, on real time (the world clock is stopped)
function dlgTick(rdt){const c=DLG.cur;if(!c||!c.typing)return;c.shown=Math.min(c.full.length,c.shown+rdt*CFG.ui.typeSpeed);
  $('dlgText').textContent=c.full.slice(0,Math.floor(c.shown));if(c.shown>=c.full.length)dlgDone();}
function dlgDone(){const c=DLG.cur;c.typing=false;$('dlgText').textContent=c.full;const ch=c.n.choices;
  if(ch&&ch.length){const box=$('dlgChoices');
    ch.forEach((o,i)=>{const b=document.createElement('button');b.type='button';b.className='dlgC';const k=document.createElement('kbd');k.textContent=i+1;b.appendChild(k);
      b.appendChild(document.createTextNode(gtxt(o.t)));b.onclick=e=>{e.stopPropagation();dlgChoose(i);};box.appendChild(b);});
    box.hidden=false;menuFocus(box.firstChild);}
  else $('dlgMore').hidden=false;}
function dlgButtons(){return[...$('dlgChoices').querySelectorAll('button')];}
// advance: finish the typing first, then go to the next node or close; a node with choices waits for one
function dlgNext(){const c=DLG.cur;if(!c)return;if(c.typing){dlgDone();return;}if(c.n.choices&&c.n.choices.length)return;
  sfx('ui');if(c.n.next)dlgShow(c.n.next);else dlgEnd();}
function dlgChoose(i){const c=DLG.cur;if(!c)return;if(c.typing)dlgDone();const o=c.n.choices&&c.n.choices[i];if(!o)return;
  sfx('ui');if(o.act)storyAct(o.act);if(o.next)dlgShow(o.next);else dlgEnd();}
function dlgEnd(){const c=DLG.cur;DLG.cur=null;$('dialog').hidden=true;$('touch').hidden=!isTouch;if(G.state==='dialogue')G.state='play';if(c&&c.onEnd)c.onEnd();}
// keyboard during a dialogue: E / Space / Enter advance, 1-3 choose, arrows move between choices; Esc is ignored
function dlgKey(e){const k=e.code;
  if(k==='Digit1'||k==='Digit2'||k==='Digit3'||k==='Numpad1'||k==='Numpad2'||k==='Numpad3'){dlgChoose(+k.slice(-1)-1);return;}
  const B=dlgButtons();
  if(B.length&&(k==='ArrowDown'||k==='ArrowUp'||k==='ArrowLeft'||k==='ArrowRight')){e.preventDefault();let i=B.indexOf(document.activeElement);
    i=i<0?0:(i+(k==='ArrowDown'||k==='ArrowRight'?1:-1)+B.length)%B.length;menuFocus(B[i]);return;}
  if(k==='KeyE'||k==='Space'||k==='Enter'||k==='NumpadEnter'){e.preventDefault();
    if(B.length){const a=document.activeElement;(B.includes(a)?a:B[0]).click();}else dlgNext();}}
// controller during a dialogue: A advances (or takes the highlighted choice), d-pad/stick moves between choices; Start is ignored
function padDialogue(pr,lx,ly){const B=dlgButtons(),yv=ly<-.5?-1:ly>.5?1:0;
  if(B.length){let d=0;if(pr(12)||(yv<0&&PAD.my!==-1))d=-1;else if(pr(13)||(yv>0&&PAD.my!==1))d=1;PAD.my=yv;
    if(d){let i=B.indexOf(document.activeElement);i=i<0?0:(i+d+B.length)%B.length;menuFocus(B[i]);}
    if(pr(0)){const a=document.activeElement;(B.includes(a)?a:B[0]).click();}}
  else if(pr(0))dlgNext();}
/* ---------- story actions: 'flag:<name>' sets a flag, 'braci:<n>' gives braci ---------- */
function storyAct(a){const s=String(a),i=s.indexOf(':'),k=i<0?s:s.slice(0,i),v=i<0?'':s.slice(i+1);
  if(k==='flag'&&v)P.flags[v]=true;
  else if(k==='braci'&&+v>0)addBraci(Math.round(+v));
  else console.warn('storyAct: unknown action "'+s+'"');}
