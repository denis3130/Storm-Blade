/* ============================== geometry helpers ============================== */
const IDM=new THREE.Matrix4(),WHITE=new THREE.Color(1,1,1);
function M4(x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=sx,sz=sx,order='XYZ'){_e.set(rx,ry,rz,order);_q.setFromEuler(_e);return new THREE.Matrix4().compose(V3(x,y,z),_q.clone(),V3(sx,sy,sz));}
const _up=V3(0,1,0);
function segM(ax,ay,az,bx,by,bz,r){const d=V3(bx-ax,by-ay,bz-az),L=d.length();const q=new THREE.Quaternion().setFromUnitVectors(_up,d.clone().normalize());
  return new THREE.Matrix4().compose(V3((ax+bx)/2,(ay+by)/2,(az+bz)/2),q,V3(r,L,r));}
function mergeParts(parts){
  let nv=0,ni=0;for(const p of parts){const g=p.g;nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count;}
  const P=new Float32Array(nv*3),N=new Float32Array(nv*3),UV=new Float32Array(nv*2),C=new Float32Array(nv*3),I=nv>65535?new Uint32Array(ni):new Uint16Array(ni);
  const nm=new THREE.Matrix3(),v=V3(),n=V3(),cc=new THREE.Color();let vo=0,io=0;
  for(const p of parts){const g=p.g,pa=g.attributes.position,na=g.attributes.normal,ua=g.attributes.uv,ca=g.attributes.color,m=p.m||IDM;nm.getNormalMatrix(m);
    const us=p.us||1,vs=p.vs||1;
    for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i);const lx=v.x,ly=v.y,lz=v.z;v.applyMatrix4(m);const k=(vo+i)*3;P[k]=v.x;P[k+1]=v.y;P[k+2]=v.z;
      if(na){n.fromBufferAttribute(na,i).applyMatrix3(nm).normalize();N[k]=n.x;N[k+1]=n.y;N[k+2]=n.z;}
      if(ua){UV[(vo+i)*2]=ua.getX(i)*us;UV[(vo+i)*2+1]=ua.getY(i)*vs;}
      cc.copy(p.c||WHITE);if(ca){cc.r*=ca.getX(i);cc.g*=ca.getY(i);cc.b*=ca.getZ(i);}if(p.cf)p.cf(lx,ly,lz,cc,v);
      C[k]=cc.r;C[k+1]=cc.g;C[k+2]=cc.b;}
    if(g.index){const ia=g.index;for(let i=0;i<ia.count;i++)I[io+i]=ia.getX(i)+vo;io+=ia.count;}else{for(let i=0;i<pa.count;i++)I[io+i]=vo+i;io+=pa.count;}
    vo+=pa.count;}
  const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.BufferAttribute(P,3));out.setAttribute('normal',new THREE.BufferAttribute(N,3));
  out.setAttribute('uv',new THREE.BufferAttribute(UV,2));out.setAttribute('color',new THREE.BufferAttribute(C,3));out.setIndex(new THREE.BufferAttribute(I,1));out.computeBoundingSphere();return out;}
function weld(g,tol=1e-4){g=g.index?g.toNonIndexed():g;const pa=g.attributes.position,ua=g.attributes.uv;const map=new Map(),P=[],UV=[],I=[];
  for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i),k=Math.round(x/tol)+'_'+Math.round(y/tol)+'_'+Math.round(z/tol);let id=map.get(k);
    if(id===undefined){id=P.length/3;map.set(k,id);P.push(x,y,z);UV.push(ua?ua.getX(i):0,ua?ua.getY(i):0);}I.push(id);}
  const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(P,3));o.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));o.setIndex(I);o.computeVertexNormals();return o;}
function flipGeo(g){const ia=g.index;for(let i=0;i<ia.count;i+=3){const a=ia.getX(i+1);ia.setX(i+1,ia.getX(i+2));ia.setX(i+2,a);}const na=g.attributes.normal;for(let i=0;i<na.count;i++)na.setXYZ(i,-na.getX(i),-na.getY(i),-na.getZ(i));return g;}
function gLathe(prof,seg=12){return new THREE.LatheGeometry(prof.map(p=>new THREE.Vector2(Math.max(.001,p[0]),p[1])),seg);}
function gCaps(r1,r2,len,seg=10,rings=4){const pr=[];for(let i=0;i<=rings;i++){const a=-PI/2+i/rings*PI/2;pr.push([Math.cos(a)*r1,-len+Math.sin(a)*r1]);}
  for(let i=0;i<=rings;i++){const a=i/rings*PI/2;pr.push([Math.cos(a)*r2,Math.sin(a)*r2]);}return gLathe(pr,seg);}
function rawGeo(P,N,UV,C,I){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
  if(UV)g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));if(C)g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeBoundingSphere();return g;}
const GEO={};
function geo(k,f){return GEO[k]||(GEO[k]=f());}
function shareGeo(g,center,radius){const o=new THREE.BufferGeometry();for(const k in g.attributes)o.setAttribute(k,g.attributes[k]);o.setIndex(g.index);o.boundingSphere=new THREE.Sphere(center.clone(),radius);
  o.boundingBox=new THREE.Box3(center.clone().subScalar(radius),center.clone().addScalar(radius));return o;}

/* ============================== materials ============================== */
const WIND_VS=`
  float hh=max(transformed.y,0.0);
  #ifdef USE_INSTANCING
  vec3 iO=vec3(instanceMatrix[3][0],instanceMatrix[3][1],instanceMatrix[3][2]);
  #else
  vec3 iO=vec3(0.0);
  #endif
  float wph=uTime*(0.85+uWind*0.3)+iO.x*0.17+iO.z*0.13;
  float wsw=(sin(wph)*0.65+sin(wph*2.3+1.7)*0.25)*uWind;
  transformed.x+=wsw*hh*hh*0.0042*uWK;
  transformed.z+=cos(wph*0.8+0.5)*hh*hh*0.0026*uWind*uWK;
  transformed+=normal*sin(uTime*(5.0+uWind)+position.x*3.1+position.z*2.3+iO.x)*0.035*uWind*uFl;`;
function windMat(opts,wk=1,fl=0,noFlip=false){
  const m=new THREE.MeshStandardMaterial(opts);
  m.onBeforeCompile=sh=>{sh.uniforms.uTime=U.time;sh.uniforms.uWind=U.wind;sh.uniforms.uWK={value:wk};sh.uniforms.uFl={value:fl};
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;\nuniform float uWind;\nuniform float uWK;\nuniform float uFl;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\n'+WIND_VS);
    if(noFlip)sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','float faceDirection=1.0;\nvec3 normal=normalize(vNormal);\nvec3 geometryNormal=normal;')
      .replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nfloat camD=length(vViewPosition);if(camD<2.6){float dth=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);if(dth>(camD-0.7)/1.9)discard;}');
  };
  return m;}
function stoneMat(hex,moss=.65,rough=.92,sc=.36,tex=null){const S=sc.toFixed(3);
  const m=new THREE.MeshStandardMaterial({color:col(hex),roughness:rough,metalness:0,vertexColors:true});
  m.onBeforeCompile=sh=>{sh.uniforms.tR={value:tex||TEX.rock};sh.uniforms.tM={value:TEX.moss};sh.uniforms.uWet=U.wet;sh.uniforms.uMoss={value:moss};
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vSW;\nvarying vec3 vSN;')
      .replace('#include <begin_vertex>',`#include <begin_vertex>
        vec4 sw4=vec4(transformed,1.0);vec3 sn3=objectNormal;
        #ifdef USE_INSTANCING
        sw4=instanceMatrix*sw4;sn3=mat3(instanceMatrix)*sn3;
        #endif
        sw4=modelMatrix*sw4;vSW=sw4.xyz;vSN=normalize(mat3(modelMatrix)*sn3);`);
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D tR;\nuniform sampler2D tM;\nuniform float uWet;\nuniform float uMoss;\nvarying vec3 vSW;\nvarying vec3 vSN;')
      .replace('#include <map_fragment>',`
        vec3 an=abs(vSN);an=pow(an,vec3(4.0));an/=(an.x+an.y+an.z);
        vec3 rk=texture2D(tR,vSW.zy*${S}).rgb*an.x+texture2D(tR,vSW.xz*${S}).rgb*an.y+texture2D(tR,vSW.xy*${S}).rgb*an.z;
        rk=pow(rk,vec3(2.2))*1.3;
        vec3 ms=pow(texture2D(tM,vSW.xz*0.23).rgb,vec3(2.2))*1.2;
        float mk=smoothstep(0.5,0.85,vSN.y+(texture2D(tM,vSW.xz*0.05).g-0.45)*0.7)*uMoss;
        diffuseColor.rgb*=mix(rk,ms,mk)*(1.0-uWet*0.3);
        float wetK=uWet*(1.0-mk*0.6);`)
      .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.3,wetK);');
  };
  return m;}
const MAT={};
function makeMaterials(){
  MAT.stone=stoneMat(0xc9c4b8,.55);MAT.stoneDark=stoneMat(0x8f8b84,.7);MAT.rock=stoneMat(0xb5b0a6,.75);
  MAT.wood=new THREE.MeshStandardMaterial({map:TEX.bark,vertexColors:true,roughness:.92});
  MAT.plank=new THREE.MeshStandardMaterial({map:TEX.wood,vertexColors:true,roughness:.88});
  MAT.hide=new THREE.MeshStandardMaterial({map:TEX.hide,vertexColors:true,roughness:.95,side:THREE.DoubleSide});
  MAT.metal=new THREE.MeshStandardMaterial({color:col(0x6c6a66),vertexColors:true,roughness:.5,metalness:.75});
  MAT.bone=new THREE.MeshStandardMaterial({color:col(0xd8cfba),vertexColors:true,roughness:.75});
  MAT.plain=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9});
  MAT.treeBark=windMat({map:TEX.bark,vertexColors:true,roughness:.95},1,0);
  MAT.needles=windMat({map:TEX.needles,vertexColors:true,alphaTest:.42,side:THREE.DoubleSide,roughness:.82,emissive:col(0x050803)},1,.8,true);
  MAT.leaves=windMat({map:TEX.leaves,vertexColors:true,alphaTest:.42,side:THREE.DoubleSide,roughness:.8,emissive:col(0x060702)},1,1.2,true);
  MAT.fern=windMat({map:TEX.fern,vertexColors:true,alphaTest:.4,side:THREE.DoubleSide,roughness:.8},.0,1.6,true);
  MAT.bush=windMat({map:TEX.leaves,vertexColors:true,alphaTest:.42,side:THREE.DoubleSide,roughness:.8},.0,1.4,true);
  MAT.glowBlue=new THREE.MeshBasicMaterial({color:new THREE.Color(.5,1.9,3.2)});
  MAT.glowRed=new THREE.MeshBasicMaterial({color:new THREE.Color(4,.6,.2)});
  MAT.glowAmber=new THREE.MeshBasicMaterial({color:new THREE.Color(3.2,2.1,.4)});
  MAT.shroom=new THREE.MeshBasicMaterial({color:new THREE.Color(.25,1.05,1.55)});
  MAT.rune=new THREE.MeshBasicMaterial({map:TEX.rune,color:new THREE.Color(.4,1.3,2.4),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
  MAT.banner=windMat({map:TEX.banner,alphaTest:.5,side:THREE.DoubleSide,roughness:.9},0,0,false);
  MAT.banner.onBeforeCompile=(sh=>{sh.uniforms.uTime=U.time;sh.uniforms.uWind=U.wind;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;\nuniform float uWind;')
      .replace('#include <begin_vertex>',`#include <begin_vertex>
        float bw=1.0-uv.y;float bph=uTime*(2.2+uWind)+position.x*2.0+modelMatrix[3][0]*0.3;
        transformed.z+=sin(bph+bw*3.0)*bw*0.28*(0.6+uWind*0.5);transformed.x+=cos(bph*0.7)*bw*0.06*uWind;`);});
}
const FOLIAGE_DEPTH={};
function depthMatFor(tex){return FOLIAGE_DEPTH[tex.uuid]||(FOLIAGE_DEPTH[tex.uuid]=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:tex,alphaTest:.42,side:THREE.DoubleSide}));}
class Batch{constructor(){this.m=new Map();}
  add(mat,g,m,c,o){let a=this.m.get(mat);if(!a){a=[];this.m.set(mat,a);}a.push(Object.assign({g,m,c},o||{}));return this;}
  build(cast=true){const out=[];for(const[mat,parts]of this.m){const mesh=new THREE.Mesh(mergeParts(parts),mat);mesh.castShadow=cast;mesh.receiveShadow=true;
    if(mat.map&&mat.alphaTest>0)mesh.customDepthMaterial=depthMatFor(mat.map);scene.add(mesh);out.push(mesh);}return out;}}
