import * as T from './vendor/three.module.js';
let horizons;
export function horizon(root,x,zone){
 const m=new T.MeshBasicMaterial({color:0x8399a7,side:T.BackSide,depthWrite:false,fog:false,transparent:true});
 m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n#ifdef USE_MAP\nfloat band=fract(vMapUv.y*4.0); diffuseColor.a*=smoothstep(0.0,0.08,band)*(1.0-smoothstep(0.84,1.0,band));\n#endif')};
 const ring=new T.Mesh(new T.CylinderGeometry(240,240,120,64,1,true),m);ring.position.set(x,40,-120);ring.renderOrder=-999;root.add(ring);
 horizons??=new T.TextureLoader().loadAsync('./assets/chapter2-horizons.webp').catch(()=>null);
 horizons.then(base=>{if(!base)return;const t=base.clone();t.colorSpace=T.SRGBColorSpace;t.repeat.set(1,.25);t.offset.y=1-(['road','city','inn','manor'].indexOf(zone)+1)/4;m.map=t;m.color.setHex(0xffffff);m.needsUpdate=true});
}
export function distantDragon({scene,rand=Math.random}){
 const g=new T.Group(),mat=new T.MeshStandardMaterial({color:0x182333,roughness:1});scene.add(g);g.visible=false;
 const part=(geo,x,y,z)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m};part(new T.CapsuleGeometry(.3,1.3,3,7),0,0,0).rotation.x=Math.PI/2;part(new T.SphereGeometry(.3,8,6),0,.15,1);part(new T.ConeGeometry(.22,1.7,7),0,-.1,-1.4).rotation.x=-Math.PI/2;
 const wings=[];for(const side of [-1,1]){const p=new T.Group();p.position.x=side*.25;g.add(p);const geo=new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3(side*2.4,.05,-.3),new T.Vector3(side*1.3,0,-1.1),new T.Vector3()]);geo.setIndex([0,1,2]);geo.computeVertexNormals();const wing=new T.Mesh(geo,new T.MeshStandardMaterial({color:0x243140,side:T.DoubleSide}));p.add(wing);wings.push(p)}let timer=45+rand()*35,age=0,flight=false,startX=0;
 return {tick(dt,zone,x,sound){timer-=dt;if(!flight&&timer<=0){timer=65+rand()*110;if(rand()<.55){flight=true;age=0;startX=x;sound('dragon-flight')}}if(!flight){g.visible=false;return}age+=dt;g.visible=true;g.position.set(startX-100+age*6,32+Math.sin(age*.3)*3,-130-Math.sin(age*.1)*35);g.rotation.y=Math.PI/2;g.scale.setScalar(2);wings.forEach((w,i)=>w.rotation.z=Math.sin(age*3)*(i?-.55:.55));if(age>34||Math.abs(startX-x)>200){flight=false;g.visible=false}},hide(){flight=false;g.visible=false}};
}
