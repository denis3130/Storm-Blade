(async()=>{
 try{
 const t0=performance.now();
 makeTextures();makeMaterials();buildPaths();setupFlats();buildTerrain();buildMountains();buildWater();const n=buildForest();initGrass();
 ENV_CALM=makeEnv(SKYC.calm,0);scene.environment=ENV_CALM;
 window.__info={trees:n,ms:Math.round(performance.now()-t0),cells:CELLS.size,hdr:HDR,gl2:isGL2};
 $('loading').hidden=true;
 window.__cam=(x,y,z,lx,ly,lz)=>{camera.position.set(x,y+gH(x,z),z);camera.lookAt(lx,ly+gH(lx,lz),lz);U.player.value.set(x,gH(x,z),z);updGrass(true);};
 window.__cam(6,2.2,12,0,1.5,-14);
 function loop(){requestAnimationFrame(loop);U.time.value+=1/60;camera.updateMatrixWorld();updGrass();updCells(1);updMountains();sky.position.copy(camera.position);
   sun.position.copy(camera.position).addScaledVector(SUN_DIR,120);sun.target.position.copy(camera.position);updLights(U.time.value);Post.render(1);}
 loop();
 }catch(e){console.error('INITERR',e.message,e.stack);}
})();
