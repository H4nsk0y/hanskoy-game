import {biteAttack} from './enemy-animation.js';
import {surfaceTexture} from './surface-textures.js';
import {statusStep} from './combat-rules.js';
import {steer} from './navigation.js';
import {CURSED_FIRE} from './boss-combat.js';
import {packActor,restoreActor} from './actor-state.js';
import {persistence} from './persistence.js';
import {lakeEncounter} from './lake-encounter.js';
import {maximum} from './player-stats.js';
import {deepForest} from './deep-forest.js';
import {chapter} from './chapter.js';
import * as T from './vendor/three.module.js';
import {texture,views,actor} from './assets.js';
import {modelActor} from './models.js';
import {stepVitals,wolfMode,hurt} from './mechanics.js';
const humans=[[.005,.035,.36,.93],[.40,.035,.20,.93],[.625,.035,.37,.93]];
const beasts=[[.53,.15,.22,.65],[.005,.15,.525,.65],[.78,.15,.21,.65]];
const [forestMap,lakeMap,fireMap]=await Promise.all([texture('Фон_лес.png'),texture('озеро.png'),texture('огонь.png')]);
const guardViews=[],smithViews=[],diggerViews=[],womanViews=[],wolfViews=[],ravenViews=[],hareViews=[];
const scene=new T.Scene();scene.background=new T.Color(0x030c28);scene.fog=new T.FogExp2(0x062235,.018);
const camera=new T.PerspectiveCamera(72,innerWidth/innerHeight,.1,500);camera.position.set(0,1.7,8);if(new URLSearchParams(location.search).has('village'))camera.position.set(0,1.7,-85);if(new URLSearchParams(location.search).has('wolf'))camera.position.set(7,1.7,-42);camera.rotation.order='YXZ';
const renderer=new T.WebGLRenderer({antialias:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1));renderer.setSize(innerWidth*.8,innerHeight*.8,false);renderer.domElement.style.width='100vw';renderer.domElement.style.height='100vh';renderer.outputColorSpace=T.SRGBColorSpace;document.body.prepend(renderer.domElement);
scene.add(new T.HemisphereLight(0x387cff,0x153828,2));const moonlight=new T.DirectionalLight(0x3676ff,3);moonlight.position.set(-25,40,-30);scene.add(moonlight);
let seed=19;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}const mat=(c,extra={})=>new T.MeshStandardMaterial({color:c,roughness:.68,flatShading:true,...extra});
const bark=mat(0x182e32),stone=mat(0x34444c),roof=mat(0x142a37),wood=mat(0x233b36),glow=mat(0x66ffbd,{emissive:0x38ff91,emissiveIntensity:3});
function mesh(g,m,x=0,y=0,z=0,parent=scene){const a=new T.Mesh(g,m);a.position.set(x,y,z);parent.add(a);return a}
function box(x,y,z,w,h,d,m,parent=scene){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,parent)}
function branch(a,b,r1,r2,parent=scene){const av=new T.Vector3(...a),bv=new T.Vector3(...b),dir=bv.clone().sub(av);const o=mesh(new T.CylinderGeometry(r2,r1,dir.length(),5),bark,0,0,0,parent);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());return o}
const texCanvas=document.createElement('canvas');texCanvas.width=texCanvas.height=128;const ctx=texCanvas.getContext('2d');for(let y=0;y<128;y++)for(let x=0;x<128;x++){let v=20+rand()*35;ctx.fillStyle=`rgb(${v*.65},${v},${v*.95})`;ctx.fillRect(x,y,1,1)}const tex=new T.CanvasTexture(texCanvas);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(35,35);tex.magFilter=T.NearestFilter;
const groundTex=surfaceTexture('earth',45,55),pathTex=surfaceTexture('path',1,1),deepGroundTex=surfaceTexture('earth',37.5,45),wallTex=surfaceTexture('wood',2,2);
const floor=mesh(new T.PlaneGeometry(180,220),mat(0xb6bfae,{map:groundTex}),0,-.06,-60);floor.rotation.x=-Math.PI/2;
function pathX(z){return Math.sin((z-8)*.065)*2.8}
for(let z=14;z>-108;z-=2){const p=box(pathX(z),-.015,z,4.1,.05,2.3,mat(0xb5aa91,{map:pathTex}));p.rotation.y=Math.cos((z-8)*.065)*.18}
const blockers=[],eyes=[],forestTrees=[];
function tree(x,z,h,watch=false){const g=new T.Group();g.position.set(x,0,z);scene.add(g);const bend=(rand()-.5)*1.8;branch([0,0,0],[bend,h*.6,0],.65,.32,g);branch([bend,h*.6,0],[bend+.7,h,0],.32,.04,g);for(let i=0;i<5;i++){const s=i%2?1:-1,y=h*(.35+i*.1),out=s*(1.7+rand()*1.5);branch([bend*.6,y,0],[out,y+1,rand()-.5],.24,.1,g);branch([out,y+1,0],[out+s*.7,y+2.4,-.3],.1,.02,g)}for(let i=0;i<4;i++){let a=i*Math.PI/2;branch([0,.4,0],[Math.cos(a)*1.2,0,Math.sin(a)*1.2],.3,.05,g)}const collider={x,z,r:.8};blockers.push(collider);forestTrees.push({g,x,z,collider});if(watch){const face=new T.Group();face.position.set(bend*2.5/(h*.6),2.5,.39);const knot=mesh(new T.SphereGeometry(1,10,8),bark,face.position.x,2.5,.25,g);knot.scale.set(.64,.52,.40);g.add(face);for(const side of [-1,1]){
const shape=new T.Shape();shape.moveTo(-.19,.065);shape.lineTo(.17,-.025);shape.quadraticCurveTo(.09,-.14,-.1,-.10);shape.closePath();
const eye=mesh(new T.ShapeGeometry(shape),glow,side*.23,0,.26,face);eye.scale.x=-side;
const pupil=mesh(new T.SphereGeometry(1,8,6),mat(0x00150c),side*.23,-.035,.28,face);pupil.scale.set(.017,.065,.018);
const brow=box(side*.23,.09,.24,.43,.13,.13,bark,face);brow.rotation.z=side*.28;
}eyes.push({g,face,phase:rand()*10});}}
for(let i=0;i<145;i++){const z=12-rand()*120,x=(rand()<.5?-1:1)*(5+rand()*30)+pathX(z);if(z< -78&&Math.abs(x)<20||x>15&&Math.abs(z+100)<3)continue;tree(x,z,5+rand()*6,false)}tree(pathX(-7)-5,-7,8,true);tree(pathX(-44)+5,-44,10,true);
for(let i=0;i<75;i++){let z=8-rand()*110,x=pathX(z)+(rand()<.5?-1:1)*(3+rand()*15);if(x>15&&Math.abs(z+100)<3)continue;const r=mesh(new T.DodecahedronGeometry(.3+rand()*.8,0),stone,x,.25,z);r.scale.y=.5+rand();}
const waterCanvas=document.createElement('canvas');waterCanvas.width=waterCanvas.height=128;const wc=waterCanvas.getContext('2d');wc.fillStyle='#063338';wc.fillRect(0,0,128,128);for(let i=0;i<260;i++){wc.strokeStyle=`rgba(50,160,169,${rand()*.35})`;wc.beginPath();let x=rand()*128,y=rand()*128;wc.ellipse(x,y,3+rand()*12,.5,0,0,Math.PI*2);wc.stroke()}const waterTex=lakeMap;waterTex.wrapS=waterTex.wrapT=T.RepeatWrapping;waterTex.repeat.set(3,3);
const water=mat(0x8bced1,{map:waterTex,metalness:.35,roughness:.25});
const ponds=[{x:-15,z:-23,r:3},{x:16,z:-49,r:3.6},{x:-18,z:-69,r:4}];
for(const t of forestTrees)if(ponds.some(p=>Math.hypot((t.x-p.x)/1.3,t.z-p.z)<p.r+1.2)){scene.remove(t.g);blockers.splice(blockers.indexOf(t.collider),1)}
for(const p of ponds){const disk=mesh(new T.CircleGeometry(p.r,24),water,p.x,.015,p.z);disk.rotation.x=-Math.PI/2;disk.scale.x=1.3;}
const wisps=[];for(let i=0;i<28;i++){const w=mesh(new T.SphereGeometry(.055,6,6),glow,(rand()-.5)*28,1+rand()*2,-rand()*105);wisps.push({w,y:w.position.y,p:rand()*7});}
const warm=mat(0xffbc62,{emissive:0xff8a28,emissiveIntensity:2});const flames=[];
function lantern(x,z,cursed=false){box(x,1.4,z,.13,2.8,.13,wood);box(x,2.65,z,.32,.45,.32,cursed?mat(0x65ff65,{emissive:0x26ff55,emissiveIntensity:2}):warm);const l=new T.PointLight(cursed?0x42ff68:0xffa450,24,12,2);l.position.set(x,2.7,z);scene.add(l);flames.push(l)}
const plankCanvas=document.createElement('canvas');plankCanvas.width=plankCanvas.height=128;const pc=plankCanvas.getContext('2d');pc.fillStyle='#533a27';pc.fillRect(0,0,128,128);for(let y=0;y<128;y++){pc.fillStyle=`rgba(15,8,3,${rand()*.3})`;pc.fillRect(0,y,128,1)}for(let y=0;y<128;y+=16){pc.fillStyle='#1a140e';pc.fillRect(0,y,128,2);for(let x=5;x<128;x+=40){pc.fillStyle='#151516';pc.fillRect(x,y+5,2,2)}}const planks=new T.CanvasTexture(plankCanvas);planks.magFilter=T.NearestFilter;const timber=mat(0xb59b72,{map:wallTex});
const buildings=[];function house(x,z,angle,cursed=false){const oldChildren=new Set(scene.children);box(x,1.6,z,4.7,3.2,5.5,timber);for(const dx of [-2.3,2.3])box(x+dx,1.6,z+2.8,.16,3.3,.18,wood);const r=mesh(new T.ConeGeometry(4.4,2.8,4),roof,x,4.5,z);r.rotation.y=Math.PI/4;box(x,.95,z+2.8,1.1,1.9,.16,wood);for(const dx of [-1.5,1.5]){box(x+dx,2,z+2.81,.7,.85,.1,cursed?mat(0x65ff65,{emissive:0x26ff55,emissiveIntensity:2}):warm);box(x+dx,2,z+2.88,.07,.85,.08,wood);box(x+dx,2,z+2.88,.7,.07,.08,wood)}box(x+1.3,4.8,z-1,.65,2,.65,stone);buildings.push({x,z,angle,door:new T.Vector3(x+Math.sin(angle)*4,1.7,z+Math.cos(angle)*4)});blockers.push({x,z,r:3.3});lantern(x+2.1,z+3.6,cursed);const group=new T.Group();for(const child of [...scene.children])if(!oldChildren.has(child)){child.position.x-=x;child.position.z-=z;group.add(child)}group.position.set(x,0,z);group.rotation.y=angle;scene.add(group)}
// Irregular seeded placement, with clearance around the square and gate.
for(const [x,z,a] of [[-9,-90,.75],[9,-94,-1.05],[-10,-103,1.4],[10,-112,-2.3],[-7,-114,.3],[1,-114,2.9]])house(x+(rand()-.5)*.6,z+(rand()-.5)*.6,a+(rand()-.5)*.2);
const fence=[];function stake(x,z){let h=2.7+rand()*.35;mesh(new T.CylinderGeometry(.16,.23,h,5),timber,x,h/2,z);mesh(new T.ConeGeometry(.19,.55,5),timber,x,h+.25,z);fence.push({x,z});}
for(let x=-17;x<=17;x+=.48){if(Math.abs(x)>3)stake(x,-83);stake(x,-121)}for(let z=-120.5;z< -83;z+=.48){stake(-17,z);if(Math.abs(z+100)>2.5)stake(17,z)}
box(-9.9,1.4,-82.8,14,.2,.22,wood);box(9.9,1.4,-82.8,14,.2,.22,wood);box(0,1.4,-120.8,34,.2,.22,wood);box(-16.8,1.4,-102,.22,.2,38,wood);box(16.8,1.4,-110.75,.22,.2,17.5,wood);box(16.8,1.4,-90.75,.22,.2,13.5,wood);
lantern(-3.4,-82);lantern(3.4,-82);
// A shared hearth and market props give the village a lived-in centre.
for(let i=0;i<9;i++){let a=i/9*Math.PI*2;mesh(new T.DodecahedronGeometry(.25),stone,Math.cos(a)*1.1,.18,-101+Math.sin(a)*1.1)}
fireMap.repeat.set(.25,.25);const fire=new T.Sprite(new T.SpriteMaterial({map:fireMap,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));fire.position.set(0,1.05,-101);fire.scale.set(2,2,1);scene.add(fire);for(let i=0;i<3;i++){const log=mesh(new T.CylinderGeometry(.12,.15,1.6,7),wood,0,.2,-101);log.rotation.z=Math.PI/2;log.rotation.y=i*1.05;}const fireLight=new T.PointLight(0xff8a30,45,17,2);fireLight.position.set(0,2,-101);scene.add(fireLight);flames.push(fireLight);blockers.push({x:0,z:-101,r:1.1});
for(const [x,z] of [[-4,-94],[5,-106],[-5,-114]]){box(x,.45,z,1,.9,1,timber);mesh(new T.CylinderGeometry(.4,.4,.85,9),timber,x+1,.43,z)}
const moon=mesh(new T.SphereGeometry(3,20,16),new T.MeshBasicMaterial({color:0x8bc9ff}),-28,35,-100);
const guard=modelActor(scene,guardViews,1.5,-89,1.85);const residents=[modelActor(scene,smithViews,-4,-96,1.85,false,"smith"),modelActor(scene,diggerViews,4,-106,1.8,false,"digger"),modelActor(scene,womanViews,-3,-109,1.72,false,"woman")];
const wolfHome={x:9,z:-43,radius:10};const wolf=modelActor(scene,wolfViews,9,-43,1.15,true);wolf.mode='return';wolf.cooldown=0;for(let i=0;i<30&&!free(wolf.g.position.x,wolf.g.position.z);i++)wolf.g.position.set(wolfHome.x+(rand()-.5)*5,0,wolfHome.z+(rand()-.5)*5);
const wildlife=[modelActor(scene,hareViews,-5,-18,.55,"hare"),modelActor(scene,hareViews,6,-66,.5,"hare"),modelActor(scene,ravenViews,-6,-30,.6,"raven")];for(const n of [...wildlife,...residents]){n.target=new T.Vector3(n.x,0,n.z);n.timer=0;}
// Painted low-resolution silhouettes on several planes extend the real geometry.
const backdrop=document.createElement('canvas');backdrop.width=1024;backdrop.height=512;const bc=backdrop.getContext('2d');
for(let i=0;i<95;i++){const x=rand()*1024,h=100+rand()*360,y=512;bc.strokeStyle=i%2?'#12315a':'#10284c';bc.lineWidth=4+rand()*9;bc.beginPath();bc.moveTo(x,y);bc.lineTo(x-15,y-h*.55);bc.lineTo(x+8,y-h);bc.stroke();for(let j=0;j<5;j++){let yy=y-h*.3-j*h*.12,sg=j%2?1:-1;bc.lineWidth=2;bc.beginPath();bc.moveTo(x-7,yy);bc.lineTo(x+sg*30,yy-23);bc.lineTo(x+sg*44,yy-70);bc.stroke()}}
const backdropTex=forestMap;const backMat=new T.MeshBasicMaterial({map:backdropTex,color:0x9cafc9,transparent:true,depthWrite:false,side:T.DoubleSide,fog:false});
forestMap.wrapS=T.RepeatWrapping;forestMap.repeat.x=2;
backMat.side=T.BackSide;backMat.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.a *= smoothstep(0.0,0.12,vMapUv.y) * (1.0-smoothstep(0.68,1.0,vMapUv.y));');};
mesh(new T.CylinderGeometry(135,135,80,64,1,true),backMat,0,28,-50);
const skyCanvas=document.createElement('canvas');skyCanvas.width=1024;skyCanvas.height=512;const sc=skyCanvas.getContext('2d');let skyGrad=sc.createLinearGradient(0,0,0,512);skyGrad.addColorStop(0,'#02051a');skyGrad.addColorStop(.55,'#09216a');skyGrad.addColorStop(1,'#123844');sc.fillStyle=skyGrad;sc.fillRect(0,0,1024,512);for(let i=0;i<180;i++){let x=rand()*1024,y=rand()*300;sc.fillStyle=`rgba(134,176,237,${.1+rand()*.35})`;sc.fillRect(x,y,1.5,1.5)}for(let i=0;i<70;i++){sc.fillStyle='rgba(39,69,135,.045)';sc.beginPath();sc.ellipse(rand()*1024,120+rand()*260,40+rand()*120,8+rand()*20,-.1,0,Math.PI*2);sc.fill()}const skyTex=new T.CanvasTexture(skyCanvas);mesh(new T.SphereGeometry(160,32,16),new T.MeshBasicMaterial({map:skyTex,color:0x7087b0,side:T.BackSide,fog:false,depthWrite:false}),0,0,-50);

// A side gate leads to the forest crossing; the second map has its own ground and skyline.
for(let x=13;x<=35;x+=2)box(x,-.015,-100,2.3,.05,4.1,mat(0xb5aa91,{map:pathTex}));
const deepFloor=mesh(new T.PlaneGeometry(150,180),mat(0xb6bfae,{map:deepGroundTex}),240,-.06,-120);deepFloor.rotation.x=-Math.PI/2;
mesh(new T.CylinderGeometry(145,145,85,64,1,true),backMat,240,28,-120);
mesh(new T.SphereGeometry(180,32,16),new T.MeshBasicMaterial({map:skyTex,color:0x7087b0,side:T.BackSide,fog:false,depthWrite:false}),240,0,-120);
const clearings=[[211,-69],[265,-69],[191,-98],[236,-91],[285,-98],[207,-123],[259,-125],[191,-154],[236,-160],[274,-159]];
for(let i=0;i<360;i++){const x=182+rand()*116,z=-42-rand()*154;if(Math.hypot(x-280,z+177)<3.5||Math.hypot(x-188,z+185)<7||Math.hypot(x-240,z+120)<6||Math.abs(x-240)<3&&z> -67||clearings.some(([cx,cz])=>Math.hypot(x-cx,z-cz)<5)||Math.hypot(x-292,z+184)<8)continue;tree(x,z,6+rand()*7,i%95===0)}
for(let z=-42;z> -70;z-=2)box(240,-.015,z,3.5,.05,2.3,mat(0xb5aa91,{map:pathTex}));
// The remote hut exists now; its owner remains hidden until the future witch quest.
house(292,-184,Math.PI*.8,true);

const campfires=[new T.Vector3(0,1.7,-101),new T.Vector3(240,1.7,-120)];
const forestFire=new T.Sprite(fire.material);forestFire.position.set(240,1.05,-120);forestFire.scale.copy(fire.scale);scene.add(forestFire);
for(let i=0;i<9;i++){const a=i/9*Math.PI*2;mesh(new T.DodecahedronGeometry(.25),stone,240+Math.cos(a)*1.1,.18,-120+Math.sin(a)*1.1)}
for(let i=0;i<3;i++){const log=mesh(new T.CylinderGeometry(.12,.15,1.6,7),wood,240,.2,-120);log.rotation.z=Math.PI/2;log.rotation.y=i*1.05}
const forestFireLight=new T.PointLight(0xff8a30,45,17,2);forestFireLight.position.set(240,2,-120);scene.add(forestFireLight);flames.push(forestFireLight);blockers.push({x:240,z:-120,r:1.1});
// Cursed hearth and a translucent green aurora above the witch's hut.
const curseFire=new T.Sprite(new T.SpriteMaterial({map:fireMap,color:0x5cff64,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));curseFire.position.set(CURSED_FIRE.x,1.05,CURSED_FIRE.z);curseFire.scale.set(2.8,2.8,1);scene.add(curseFire);
for(let i=0;i<9;i++){const a=i/9*Math.PI*2;mesh(new T.DodecahedronGeometry(.25),stone,CURSED_FIRE.x+Math.cos(a)*1.1,.18,CURSED_FIRE.z+Math.sin(a)*1.1)}
for(let i=0;i<3;i++){const log=mesh(new T.CylinderGeometry(.12,.15,1.6,7),wood,CURSED_FIRE.x,.2,CURSED_FIRE.z);log.rotation.z=Math.PI/2;log.rotation.y=i*1.05}
const curseLight=new T.PointLight(0x42ff55,55,22,2);curseLight.position.copy(curseFire.position);scene.add(curseLight);flames.push(curseLight);
const beaconCanvas=document.createElement('canvas');beaconCanvas.width=64;beaconCanvas.height=256;const beaconContext=beaconCanvas.getContext('2d'),beaconGradient=beaconContext.createLinearGradient(0,256,0,0);beaconGradient.addColorStop(0,'rgba(60,255,100,.55)');beaconGradient.addColorStop(.5,'rgba(40,220,100,.2)');beaconGradient.addColorStop(1,'rgba(40,220,100,0)');beaconContext.fillStyle=beaconGradient;beaconContext.fillRect(0,0,64,256);const beaconMaterial=new T.MeshBasicMaterial({map:new T.CanvasTexture(beaconCanvas),transparent:true,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending,fog:false});const beacon=mesh(new T.CylinderGeometry(4,1.2,38,24,1,true),beaconMaterial,292,22,-184);
// A separate room is entered through the existing guard-house doorway.
const interiorBefore=new Set(scene.children);const roomFloor=box(65,-.06,-95,10,.1,10,timber);for(const [x,z,w,d] of [[60,-95,.2,10],[70,-95,.2,10],[65,-100,10,.2],[65,-90,10,.2]])box(x,1.8,z,w,3.6,d,timber);
box(65,3.6,-95,10,.2,10,wood);const homeLight=new T.PointLight(0xffbd72,35,15,2);homeLight.position.set(65,2.8,-95);scene.add(homeLight);box(65,1,-90.15,1.4,2,.12,wood);box(66,.45,-98,1.6,.9,.9,timber);box(66,.94,-98,1.7,.12,1,wood);box(66,.55,-97.52,.15,.22,.05,warm);box(62,.35,-98,1.6,.7,2.7,wood);box(62,.76,-98,1.5,.15,2.6,mat(0x81705d));
const homeInterior=new T.Group();for(const child of [...scene.children])if(!interiorBefore.has(child))homeInterior.add(child);scene.add(homeInterior);homeInterior.visible=false;
const home={inside:()=>camera.position.x>59&&camera.position.x<71,door:buildings[0].door,chest:new T.Vector3(66,1.7,-98),exit:new T.Vector3(65,1.7,-91),enter(){camera.position.set(65,1.7,-93);yaw=0;pitch=0;keys.clear();vitals.height=vitals.velocity=0;document.querySelector('#location').textContent='Дом Альфреда'},leave(){camera.position.copy(this.door);keys.clear();document.querySelector('#location').textContent='Темнолесье'}};
// Merge static bark in spatial cells while leaving animated eye groups independent.
scene.updateMatrixWorld(true);const treeBatches=new Map();scene.traverse(n=>{if(!n.isMesh||n.material!==bark||eyes.some(e=>n.parent===e.face))return;const pos=new T.Vector3();n.getWorldPosition(pos);const key=Math.floor(pos.x/20)+','+Math.floor(pos.z/20);if(!treeBatches.has(key))treeBatches.set(key,[]);treeBatches.get(key).push(n)});
for(const nodes of treeBatches.values()){const positions=[],normals=[],uvs=[];for(const n of nodes){const geo=(n.geometry.index?n.geometry.toNonIndexed():n.geometry.clone()).applyMatrix4(n.matrixWorld);positions.push(...geo.attributes.position.array);normals.push(...geo.attributes.normal.array);uvs.push(...geo.attributes.uv.array);geo.dispose();n.parent.remove(n);n.geometry.dispose()}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.computeBoundingSphere();scene.add(new T.Mesh(geo,bark))}
const keys=new Set(),menu=document.querySelector('#menu'),caption=document.querySelector('#text'),quest=document.querySelector('#quest');let active=false,dragging=false;let yaw=0,pitch=0,started=false,arrived=false,talked=false,elapsed=0,audio,muted=false;let messageUntil=0;const vitals={hp:100,stamina:100,mana:100,height:0,velocity:0};let jumpQueued=false,exhausted=false,dead=false;const threat=document.querySelector('#threat');
function say(s,d=7){caption.textContent=s;messageUntil=elapsed+d}
const music=new Audio('./assets/Hanskoy.mp3');music.loop=true;music.volume=.35;let nextCall=7,callCount=0;
const soundLabel=document.querySelector('#sound');function soundStatus(){soundLabel.textContent=muted?'Включить звук':'Отключить звук';soundLabel.title='N — переключить звук'}
function sound(){if(!audio){audio=new AudioContext();audio.master=audio.createGain();audio.master.gain.value=.6;audio.master.connect(audio.destination)}audio.resume();music.play().then(soundStatus).catch(()=>{soundLabel.textContent='Музыка недоступна · N — повторить'});soundStatus()}
// Synthesized animal calls; independent voices with their own envelopes.
function animalCall(wolf=false){if(!audio||muted)return;const now=audio.currentTime;const pan=audio.createStereoPanner();pan.pan.value=wolf?-.65:.7;pan.connect(audio.master);const count=wolf?1:3;for(let i=0;i<count;i++){const t=now+i*.7,d=wolf?3.8:.48,o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(wolf?280:440,t);o.frequency.exponentialRampToValueAtTime(wolf?510:350,t+d*.3);o.frequency.exponentialRampToValueAtTime(wolf?240:300,t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(wolf?.12:.18,t+.12);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(pan);o.start(t);o.stop(t+d+.1);o.onended=()=>{o.disconnect();g.disconnect()}}}
let saves;
document.querySelector('#start').onclick=()=>{if(dead){world.reset();vitals.mana=maximum(vitals,'mana');vitals.hp=maximum(vitals,'hp');vitals.stamina=maximum(vitals,'stamina');vitals.height=0;vitals.velocity=0;camera.position.set(0,1.7,8);wolf.g.position.set(wolfHome.x,0,wolfHome.z);dead=false;wolf.cooldown=1;arrived=false;talked=false;quest.textContent='Найдите безопасное место';say('Ты снова очнулся на лесной тропе.',6);}active=true;menu.style.display="none";try{renderer.domElement.requestPointerLock()?.catch(()=>{});}catch{}sound();if(!started){started=true;campaign.start()}document.querySelector('#start').textContent='ПРОДОЛЖИТЬ';saves?.save()};
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement){active=true;menu.style.display='none'}keys.clear();document.querySelector('#start').textContent=dead?'ОЧНУТЬСЯ СНОВА':started||saves?.loaded?'ПРОДОЛЖИТЬ':'ОЧНУТЬСЯ'});
document.addEventListener('mousemove',e=>{if(active&&(document.pointerLockElement||dragging)){yaw-=e.movementX*.002;pitch=T.MathUtils.clamp(pitch-e.movementY*.002,-1.35,1.35)}});
document.addEventListener('keydown',e=>{if(['KeyW','KeyA','KeyS','KeyD','ShiftLeft','KeyE','Space'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.code==='Space'&&active&&!e.repeat){const f=Number(keys.has('KeyW'))-Number(keys.has('KeyS')),s=Number(keys.has('KeyD'))-Number(keys.has('KeyA'));if(f||s)campaign.queueRoll(f,s,yaw);else jumpQueued=true;}if(e.code==='Escape'){saves?.save();music.pause();audio?.suspend();active=false;menu.style.display='flex';keys.clear()} if(e.code==='KeyN'&&audio){if(!e.repeat){muted=!muted;audio.master.gain.value=muted?0:.6;music.muted=muted;if(!muted&&music.paused)music.play().catch(()=>{});soundStatus()}}});
document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());
const world=deepForest({scene,camera,free,rand,resetMotion:()=>{vitals.height=0;vitals.velocity=0;keys.clear();yaw=0;pitch=0;wolf.mode='return'}});
const encounter=lakeEncounter({scene,camera,free,rand});
const campaign=chapter({mapData:{blockers,buildings,ponds},home,encounter,campfires,world,scene,camera,guard,residents,wolf,wildlife,vitals,keys,active:()=>active,started:()=>started,time:()=>elapsed,audio:()=>audio,muted:()=>muted,pause:()=>{active=false;keys.clear()},resume:()=>{if(!dead){active=true;try{renderer.domElement.requestPointerLock()?.catch(()=>{})}catch{}}},blocked:p=>!free(p.x,p.z,.05)});
if(new URLSearchParams(location.search).has('depths')){world.travel(campaign.p);campaign.p.stage='carcasses'}
soundLabel.onclick=()=>{muted=!muted;music.muted=muted;if(audio)audio.master.gain.value=muted?0:.6;soundStatus()};
const mainActors=[guard,...residents,wolf,...wildlife];
function snapshot(){return {chapter:campaign.snapshot(),player:{position:camera.position.toArray(),yaw,pitch,vitals:{...vitals,maxHp:maximum(vitals,'hp'),maxStamina:maximum(vitals,'stamina'),maxMana:maximum(vitals,'mana')}},world:world.snapshot(),encounter:encounter.snapshot(),actors:mainActors.map(packActor),seed,elapsed,muted}}
function restore(state){active=false;dragging=false;keys.clear();document.exitPointerLock?.();campaign.restore(state.chapter);world.restore(state.world);encounter.restore(state.encounter);state.actors.forEach((a,i)=>restoreActor(mainActors[i],a));Object.assign(vitals,state.player.vitals);camera.position.fromArray(state.player.position);if(home.inside())document.querySelector('#location').textContent='Дом Альфреда';yaw=state.player.yaw;pitch=state.player.pitch;camera.rotation.set(pitch,yaw,0);seed=state.seed;elapsed=state.elapsed;nextCall=elapsed+15;muted=state.muted;music.muted=muted;if(audio)audio.master.gain.value=muted?0:.6;dead=vitals.hp<=0;jumpQueued=false;exhausted=false;menu.style.display='flex';soundStatus();document.querySelector('#start').textContent=dead?'ОЧНУТЬСЯ СНОВА':'ПРОДОЛЖИТЬ'}
saves=persistence({snapshot,restore,isStarted:()=>started,onReset:()=>{started=false;active=false;music.pause();audio?.suspend()},disabled:location.pathname.includes('/tests/')||['village','wolf','depths'].some(k=>new URLSearchParams(location.search).has(k))});
document.querySelector('#start').disabled=false;
const clock=new T.Clock();function update(){requestAnimationFrame(update);const dt=Math.min(clock.getDelta(),.05);if(active){elapsed+=dt;if(typeof curseFire!=='undefined'){curseFire.scale.set(2.8+Math.sin(elapsed*8)*.15,2.8,1);beacon.rotation.y=elapsed*.06}if(elapsed>nextCall){animalCall(callCount++%2===1);nextCall=elapsed+18+rand()*14;}let f=Number(keys.has('KeyW'))-Number(keys.has('KeyS')),s=Number(keys.has('KeyD'))-Number(keys.has('KeyA'));if(vitals.stamina<1)exhausted=true;if(vitals.stamina>22)exhausted=false;const motion=campaign.motion(dt),running=keys.has('ShiftLeft')&&!!(f||s)&&!exhausted&&!motion.rolling&&motion.speed>.6;stepVitals(vitals,dt,{running,jump:jumpQueued&&!motion.rolling,jumpMultiplier:motion.jump,regenMultiplier:(world.cursed()?.25:1)*motion.regen});jumpQueued=false;const len=Math.hypot(f,s)||1,speed=(running?5:2.8)*motion.speed*(vitals.height>0&&campaign.p.classId==='bow'?Math.sqrt(1.12)/1.15:1);const dx=motion.rolling?motion.dx:(Math.cos(yaw)*s-Math.sin(yaw)*f)/len*speed*dt,dz=motion.rolling?motion.dz:(-Math.sin(yaw)*s-Math.cos(yaw)*f)/len*speed*dt;const can=(x,z)=>(home.inside()?(x>60.4&&x<69.6&&z> -99.6&&z< -90.4):world.can(x,z))&&!blockers.some(b=>Math.hypot(x-b.x,z-b.z)<b.r+.25)&&!fence.some(b=>Math.hypot(x-b.x,z-b.z)<.43);if(can(camera.position.x+dx,camera.position.z))camera.position.x+=dx;if(can(camera.position.x,camera.position.z+dz))camera.position.z+=dz;camera.position.y=1.7+vitals.height-motion.dip+(f||s?Math.sin(elapsed*9)*.035:0);if(!world.inside&&!home.inside())updateCreatures(dt);camera.rotation.set(pitch,yaw,motion.tilt);if(elapsed>messageUntil)caption.textContent='';}
campaign.tick(dt);saves.tick(dt);if(vitals.hp<=0&&!dead){dead=true;active=false;keys.clear();music.pause();audio?.suspend();document.exitPointerLock?.();menu.style.display='flex';document.querySelector('#start').textContent='ОЧНУТЬСЯ СНОВА';say('Лес поглотил тебя. Можно начать снова.',100)}
for(const e of eyes){const dist=camera.position.distanceTo(e.g.position);const blink=Math.pow(Math.max(0,Math.sin(elapsed*.7+e.phase)),35);e.face.scale.y=dist<3? .015:Math.max(.02,1-blink);}
for(const a of wisps){a.w.position.y=a.y+Math.sin(elapsed+a.p)*.2;a.w.scale.setScalar(.7+Math.sin(elapsed*1.4+a.p)*.3)}waterTex.offset.x=elapsed*.008;for(let i=0;i<flames.length;i++)flames[i].intensity=(flames[i]===fireLight||flames[i]===forestFireLight?45:24)*(1+Math.sin(elapsed*7+i)*.07);const frame=Math.floor(elapsed*10)%16;fireMap.offset.set((frame%4)/4,1-(Math.floor(frame/4)+1)/4);
for(const n of [guard,...residents,wolf,...wildlife])if(!(n.stun>0))n.update(camera);if(active)for(const n of [guard,...residents,wolf,...wildlife,...world.mobs,world.hunter,...encounter.mobs])if(n.g.visible)n.animate?.(dt);
for(const [id,value] of [['hp',vitals.hp],['stamina',vitals.stamina],['mana',vitals.mana]]){document.querySelector('#'+id+' .fill').style.width=(value/maximum(vitals,id)*100)+'%';document.querySelector('#'+id+' span').textContent=Math.ceil(value)+' / '+maximum(vitals,id);}
homeInterior.visible=home.inside();renderer.render(scene,camera)}update();window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth*.8,innerHeight*.8,false)});

renderer.domElement.addEventListener('mousedown',()=>dragging=true);document.addEventListener('mouseup',()=>dragging=false);




function free(x,z,r=.45){return !blockers.some(b=>Math.hypot(x-b.x,z-b.z)<b.r+r)}
function move(n,target,speed,dt){return steer(n,target,speed,dt,free,(x,z)=>n!==wolf||z>=-81)}
function updateCreatures(dt){const frameDt=dt;
for(const n of [...wildlife,...residents]){if(n.hp<=0)continue;const dt=statusStep(n,frameDt);if(dt<=0)continue;n.timer-=dt;if(n.timer<=0){n.timer=3+rand()*5;for(let i=0;i<12;i++){const x=n.x+(rand()-.5)*(residents.includes(n)?2:7),z=n.z+(rand()-.5)*(residents.includes(n)?2:7);if(free(x,z)){(n.target??=new T.Vector3()).set(x,0,z);break}}}if(move(n,n.target,residents.includes(n)?.45:n===wildlife[2]?.8:1.5,dt))n.g.position.y=Math.abs(Math.sin(elapsed*9))*(residents.includes(n)?.015:.12);}
if(wolf.hp<=0)return;dt=statusStep(wolf,frameDt);if(dt<=0)return;
const inVillage=home.inside()||camera.position.z< -83&&camera.position.z> -121&&Math.abs(camera.position.x)<17;
if(wolf.mode!=='attack'&&!inVillage&&wolfMode(camera.position,wolfHome)==='attack'){wolf.mode='attack';wolf.aggroOrigin=camera.position.clone();animalCall(true)}
if(wolf.mode==='attack'&&(inVillage||camera.position.distanceTo(wolf.aggroOrigin)>24)){wolf.mode='return';wolf.patrolTarget=null;}
const mode=wolf.mode;if(mode!=='attack')wolf.attackWindup=0;threat.textContent='';
wolf.cooldown=Math.max(0,wolf.cooldown-dt);
const distance=Math.hypot(camera.position.x-wolf.g.position.x,camera.position.z-wolf.g.position.z);
if(mode==='attack'){if(distance>1.2&&!wolf.attackWindup)move(wolf,camera.position,3.5,dt);biteAttack(wolf,dt,distance<1.7&&vitals.height<.9&&[.2,.4,.6,.8].every(t=>free(wolf.g.position.x+(camera.position.x-wolf.g.position.x)*t,wolf.g.position.z+(camera.position.z-wolf.g.position.z)*t,.05)),()=>campaign.onDamage(14),1.2);}else{if(!wolf.patrolTarget||wolf.g.position.distanceTo(wolf.patrolTarget)<.6){for(let i=0;i<20;i++){const a=rand()*Math.PI*2,r=rand()*7;const x=wolfHome.x+Math.cos(a)*r,z=wolfHome.z+Math.sin(a)*r;if(free(x,z)){wolf.patrolTarget=new T.Vector3(x,0,z);break}}}move(wolf,wolf.patrolTarget||wolfHome,1.25,dt)}
}




// Exports used by the isolated browser test fixture.
export {campaign,camera,residents,vitals,world,snapshot,restore};
