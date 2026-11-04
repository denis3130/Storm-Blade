/* ============================== orientation: phones play in landscape only ==============================
   A touch device held upright gets the whole game container (#app) rotated 90° with CSS; touches are mapped back into game space.
   Layout reads the GAME size, not the window: --vw/--vh and the size classes w1000 / w640 / h460 on #app stand in for
   vw/vh units and size media queries, so the HUD and menus lay out the same whether the page is rotated or not. */
var ROT=false;   // var on purpose: a_core.js sizes the renderer through viewW()/viewH() before this file has run
function wantRot(){return isTouch&&innerHeight>innerWidth;}
function viewW(){return ROT?innerHeight:innerWidth;}
function viewH(){return ROT?innerWidth:innerHeight;}
// pointer position in game space: in the rotated layout the game's x runs down the screen and its y runs right-to-left
function touchXY(e){return ROT?{x:e.clientY,y:innerWidth-e.clientX}:{x:e.clientX,y:e.clientY};}
function applyOrient(){ROT=wantRot();const app=$('app');
  if(app){app.classList.toggle('rot90',ROT);const W=viewW(),H=viewH();
    app.classList.toggle('w1000',W<=1000);app.classList.toggle('w640',W<=640);app.classList.toggle('h460',H<=460);
    const s=document.documentElement.style;s.setProperty('--vw',W/100+'px');s.setProperty('--vh',H/100+'px');}
  onResize();}
// on the first tap of "Nuova partita" / "Continua": full screen and the browser's landscape lock where allowed (Android); the CSS rotation covers the rest
async function lockLandscape(){if(!isTouch)return;
  try{const d=document.documentElement;if(!document.fullscreenElement&&d.requestFullscreen)await d.requestFullscreen({navigationUI:'hide'});}catch(_){}
  try{if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock('landscape');}catch(_){}
  applyOrient();}
addEventListener('resize',applyOrient);
addEventListener('orientationchange',()=>setTimeout(applyOrient,60));
