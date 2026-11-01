import {nightSky} from './night-sky.js';
import * as T from './vendor/three.module.js';
let horizons;
export function horizon(root,x,zone){nightSky(root,x,-120);
 const m=new T.MeshBasicMaterial({color:0x8399a7,side:T.BackSide,depthWrite:false,fog:false,transparent:true});
 m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n#ifdef USE_MAP\nfloat band=fract(vMapUv.y*4.0); diffuseColor.a*=smoothstep(0.0,0.08,band)*(1.0-smoothstep(0.84,1.0,band))*smoothstep(0.0,0.07,vMapUv.x)*(1.0-smoothstep(0.93,1.0,vMapUv.x));\n#endif')};
 const ring=new T.Mesh(new T.CylinderGeometry(240,240,120,64,1,true),m);ring.position.set(x,40,-120);ring.renderOrder=-999;root.add(ring);
 horizons??=new T.TextureLoader().loadAsync('./assets/chapter2-horizons.webp').catch(()=>null);
 horizons.then(base=>{if(!base)return;const t=base.clone();t.colorSpace=T.SRGBColorSpace;t.repeat.set(1,.25);t.offset.y=1-(['road','city','inn','manor'].indexOf(zone)+1)/4;m.map=t;m.color.setHex(0x6a7a91);m.needsUpdate=true});
}
// Fully modelled flying reptile: articulated bat wings, a curved neck,
// horned head, folded legs and a tapered, flexible tail.
export function dragonModel(){
 const g=new T.Group();g.name='distant-dragon';const scales=new T.MeshStandardMaterial({color:0x283a46,roughness:.72,metalness:.12}),belly=new T.MeshStandardMaterial({color:0x69716d,roughness:.9}),horn=new T.MeshStandardMaterial({color:0xa6a692,roughness:.8}),membrane=new T.MeshStandardMaterial({color:0x503b48,roughness:.9,side:T.DoubleSide}),eye=new T.MeshBasicMaterial({color:0xffb554});
 function part(parent,geo,mat,pos,scale){const m=new T.Mesh(geo,mat);m.position.fromArray(pos);if(scale)m.scale.fromArray(scale);parent.add(m);return m}
 function bone(parent,a,b,r1,r2=r1,mat=scales){const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start),m=part(parent,new T.CylinderGeometry(r2,r1,delta.length(),8),mat,start.clone().add(end).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m}
 const torso=part(g,new T.SphereGeometry(1,16,12),scales,[0,0,0],[.58,.64,1.48]);torso.name='dragon-body';part(g,new T.SphereGeometry(1,12,10),belly,[0,-.27,.25],[.43,.39,1.15]);
 const neck=new T.Group();neck.name='dragon-neck';g.add(neck);bone(neck,[0,.15,1],[0,.65,1.95],.4,.29);bone(neck,[0,.65,1.95],[0,.88,2.65],.29,.23);part(neck,new T.SphereGeometry(1,12,8),scales,[0,.82,2.88],[.35,.32,.53]);part(neck,new T.SphereGeometry(1,10,8),scales,[0,.69,3.32],[.26,.18,.52]);part(neck,new T.SphereGeometry(1,10,8),belly,[0,.49,3.22],[.24,.08,.43]);
 for(const side of [-1,1]){bone(neck,[side*.22,1.02,2.7],[side*.43,1.45,2.15],.13,.015,horn);bone(neck,[side*.25,.89,2.9],[side*.4,.98,3.25],.09,.01);part(neck,new T.SphereGeometry(.065,8,6),eye,[side*.305,.87,3.03]);const brow=part(neck,new T.SphereGeometry(1,8,6),scales,[side*.29,.97,3.02],[.13,.07,.23]);brow.rotation.z=side*.25;for(let j=0;j<3;j++)bone(neck,[side*.2,.61,3.13+j*.14],[side*.18,.51,3.13+j*.14],.035,.004,horn)}
 for(let j=0;j<9;j++){const zz=1.7-j*.42;bone(g,[0,.53,zz],[0,1.02-Math.abs(j-3)*.035,zz-.2],.12,.005,horn)}
 const tail=[],tailRoot=new T.Group();tailRoot.position.set(0,-.05,-1.1);g.add(tailRoot);let parent=tailRoot;for(let j=0;j<7;j++){const joint=new T.Group();joint.position.z=j?-.61:0;parent.add(joint);bone(joint,[0,0,0],[0,-.035,-.65],.29*(1-j/7),.29*(1-(j+1)/7));if(j%2===0)bone(joint,[0,.1,-.25],[0,.35,-.42],.08,.002,horn);tail.push(joint);parent=joint}
 for(const side of [-1,1])for(const rear of [false,true]){const z=rear?-.9:.85,leg=new T.Group();leg.position.set(side*.42,-.25,z);g.add(leg);bone(leg,[0,0,0],[side*.18,-.53,-.25],rear?.22:.15,rear?.15:.1);bone(leg,[side*.18,-.53,-.25],[side*.12,-.63,.2],.11,.065);for(let j=0;j<3;j++)bone(leg,[side*.12+(j-1)*.09,-.63,.2],[side*.12+(j-1)*.12,-.7,.43],.045,.003,horn)}
 const wings=[];for(const side of [-1,1]){const wing=new T.Group();wing.position.set(side*.4,.36,.45);wing.name=side<0?'dragon-wing-left':'dragon-wing-right';g.add(wing);
 const wrist=[side*1.6,.27,.55],tip=[side*4.7,.12,-.2],fingers=[[side*3.65,-.12,-1.25],[side*2.5,-.23,-1.9],[side*1.2,-.2,-1.8],[side*.15,-.16,-1.1]];
 bone(wing,[0,0,0],[side*.8,.48,.1],.19,.14);bone(wing,[side*.8,.48,.1],wrist,.14,.1);bone(wing,wrist,tip,.095,.008);
 let previous=tip;for(const end of fingers){bone(wing,wrist,end,.065,.009);const inset=[(previous[0]+end[0])*.5,(previous[1]+end[1])*.5+.12,(previous[2]+end[2])*.5+.26],geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([...wrist,...previous,...inset,...end],3));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();part(wing,geo,membrane,[0,0,0]);previous=end}bone(wing,wrist,[side*1.65,.63,.8],.075,.005,horn);wings.push(wing)}
 return {g,animate(time){wings.forEach((w,i)=>{const side=i?1:-1;w.rotation.z=side*(.12+Math.sin(time*2.6)*.43);w.rotation.x=Math.sin(time*2.6-.5)*.09});tail.forEach((j,i)=>{j.rotation.y=Math.sin(time*1.8-i*.45)*.08;j.rotation.x=.035+Math.sin(time*.9-i*.3)*.025});neck.rotation.y=Math.sin(time*.7)*.045}};
}
export function distantDragon({scene,rand=Math.random}){
 const model=dragonModel(),g=model.g;scene.add(g);g.visible=false;let timer=35+rand()*30,age=0,wingCue=0,flight=false,startX=0;
 return {tick(dt,zone,x,sound){timer-=dt;if(!flight&&timer<=0){timer=50+rand()*85;if(rand()<.75){flight=true;age=0;wingCue=2.3;startX=x;sound('dragon-flight');sound('dragon-wings')}}if(!flight){g.visible=false;return}age+=dt;wingCue-=dt;if(wingCue<=0){wingCue=2.3;sound('dragon-wings')}g.visible=true;g.position.set(startX-100+age*6,32+Math.sin(age*.3)*3,-130-Math.sin(age*.1)*35);g.rotation.set(Math.sin(age*.35)*.04,Math.PI/2,.05+Math.sin(age*.27)*.08);g.scale.setScalar(2);model.animate(age);if(age>34||Math.abs(startX-x)>200){flight=false;g.visible=false}},hide(){flight=false;g.visible=false}};
}
