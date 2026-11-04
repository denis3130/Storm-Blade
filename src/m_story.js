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
  dlgShow('start');storyEvent('talk',{who:gtxt(d.start.who||''),id});return true;}
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
/* ---------- story actions: 'flag:<name>' sets a flag, 'braci:<n>' gives braci, 'quest:<id>' starts a quest ---------- */
function storyAct(a){const s=String(a),i=s.indexOf(':'),k=i<0?s:s.slice(0,i),v=i<0?'':s.slice(i+1);
  if(k==='flag'&&v)P.flags[v]=true;
  else if(k==='braci'&&+v>0)addBraci(Math.round(+v));
  else if(k==='quest'&&QUESTS[v])questStart(v);
  else console.warn('storyAct: unknown action "'+s+'"');}
/* ---------- quests: steps advance on story events; P.quests[id] = {step, n, done} is saved with the game ---------- */
const QUESTS={},QORDER=[];
function defineQuest(q){if(!QUESTS[q.id])QORDER.push(q.id);QUESTS[q.id]=q;}
function questStart(id){const d=QUESTS[id];if(!d||P.quests[id])return;P.quests[id]={step:0,n:0,done:false};toast('Nuova missione: <em>'+gtxt(d.title)+'</em>');}
function questStep(id){const q=P.quests[id];return q?(q.done?QUESTS[id].steps.length:q.step):-1;}
function questIsDone(id){const q=P.quests[id];return!!(q&&q.done);}
function questAdvance(id){const d=QUESTS[id],q=P.quests[id];if(!d||!q||q.done)return;q.step++;q.n=0;
  if(q.step>=d.steps.length){q.done=true;toast('Missione completata: <em>'+gtxt(d.title)+'</em>');sfx('level');if(d.done)storyAct(d.done);}
  save();}
// an event advances every active quest whose current step listens to it: same type and every other key of `on` equal in data
function storyEvent(type,data={}){for(const id of QORDER){const d=QUESTS[id],q=P.quests[id];if(!q||q.done)continue;const st=d.steps[q.step],on=st&&st.on;
    if(!on||on.type!==type)continue;let ok=true;for(const k in on)if(k!=='type'&&on[k]!==data[k]){ok=false;break;}if(!ok)continue;
    if(st.count){q.n++;if(q.n>=st.count)questAdvance(id);}else questAdvance(id);}}
function questHint(id){const d=QUESTS[id],q=P.quests[id];if(!d||!q||q.done)return'';const st=d.steps[q.step];return st?gtxt(st.hint).replace('{n}',q.n):'';}
function mainHint(){for(const id of QORDER)if(QUESTS[id].kind==='main'&&P.quests[id]&&!P.quests[id].done)return questHint(id);return'';}
/* ---------- journal: active quests first, then the completed ones ---------- */
let journalBack='play';
function openJournal(from){journalBack=from==='pause'||G.state==='pause'?'pause':'play';G.state='journal';showScreen('journal');
  const list=$('jList'),act=[],fin=[];list.innerHTML='';for(const id of QORDER){const q=P.quests[id];if(q)(q.done?fin:act).push(id);}
  for(const id of act.concat(fin)){const d=QUESTS[id],q=P.quests[id],el=document.createElement('div');el.className='jq'+(q.done?' done':'')+(d.kind==='main'?' main':'');
    const k=document.createElement('small');k.textContent=(d.kind==='main'?'Principale':'Secondaria')+(q.done?' · completata':'');
    const t=document.createElement('b');t.textContent=gtxt(d.title);el.append(k,t);
    if(!q.done){const h=document.createElement('p');h.textContent=questHint(id);el.append(h);}list.appendChild(el);}
  if(!list.children.length){const e=document.createElement('p');e.className='jempty';e.textContent='Nessuna missione per ora.';list.appendChild(e);}
  if(document.pointerLockElement)document.exitPointerLock();menuFocus($('jClose'));}
function closeJournal(){if(G.state!=='journal')return;if(journalBack==='pause'){G.state='pause';showScreen('pause');menuFocus($('pJournal'));}else resume();}
/* ============================== stage 1 content ============================== */
defineQuest({id:'valle',title:'La Valle di Cenere',kind:'main',
  steps:[{hint:"Libera la valle: distruggi un accampamento goblin e apri il forziere del suo capo ({n}/4).",on:{type:'chest'},count:4}]});
defineQuest({id:'selin',title:'La voce del santuario',kind:'side',
  steps:[{hint:'Riposa a un santuario: avvicinati al cristallo blu.',on:{type:'rest'}}]});
defineDialogue('selin1',{
  start:{who:'Selin',text:"Un'altra fiamma nella tempesta… Sei stanc{o|a}, erede, ma ancora viv{o|a}.",next:'b'},
  b:{who:'Selin',text:'Le braci dei caduti restano su di te. Qui puoi spenderle per diventare più forte.',next:'c'},
  c:{who:'Selin',text:'Ma se cadi, resteranno dove sei cadut{o|a}. Torna a prenderle prima di cadere ancora.',
    choices:[{t:'Chi sei?',next:'who'},{t:'Andrò avanti.',next:'end'}]},
  who:{who:'Selin',text:'Sono Selin. Ero la voce dei Custodi, quando i Custodi avevano ancora una voce.',next:'end'},
  end:{who:'Selin',text:"Va', stranier{o|a}. Il diario ricorderà quello che dimentichi.",act:'flag:selinMet'}});
