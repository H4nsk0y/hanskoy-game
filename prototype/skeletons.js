import * as T from './vendor/three.module.js';
// Articulated bones, hollow eye sockets and distinct weapons; no image downloads.
export function skeletonModel(parent,kind,x,z){
 const g=new T.Group();g.position.set(x,0,z);parent.add(g);
 const bone=new T.MeshStandardMaterial({color:0xc3c4a9,roughness:.88}),iron=new T.MeshStandardMaterial({color:0x56606b,metalness:.6}),dark=new T.MeshStandardMaterial({color:0x07121b}),wood=new T.MeshStandardMaterial({color:0x544735});
 function mesh(geometry,material,x,y,z,p=g){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);p.add(m);return m}
 function shaft(p,x,y,z,length,r=.045){return mesh(new T.CapsuleGeometry(r,length,3,6),bone,x,y,z,p)}
 shaft(g,0,1.22,0,.55,.055);
 for(let i=0;i<5;i++){const rib=mesh(new T.TorusGeometry(.23-i*.012,.025,4,12),bone,0,1.18+i*.1,.01);rib.rotation.x=Math.PI/2;rib.scale.y=.7}
 const pelvis=mesh(new T.TorusGeometry(.15,.045,5,12),bone,0,.91,0);pelvis.scale.y=.55;
 const head=mesh(new T.SphereGeometry(.19,12,10),bone,0,1.89,.01);head.scale.set(.85,1,.85);
 for(const side of [-1,1]){mesh(new T.SphereGeometry(.062,8,6),dark,side*.075,1.91,.147);mesh(new T.SphereGeometry(.018,6,5),new T.MeshBasicMaterial({color:kind==='mage'?0x6dffb0:0x74bfff}),side*.075,1.91,.197)}
 mesh(new T.ConeGeometry(.035,.07,3),dark,0,1.83,.17);mesh(new T.BoxGeometry(.19,.06,.12),bone,0,1.74,.035);
 for(let i=0;i<5;i++)mesh(new T.BoxGeometry(.021,.05,.024),bone,-.064+i*.032,1.78,.12);
 const legs=[],arms=[];
 for(const side of [-1,1]){const leg=new T.Group();leg.position.set(side*.13,.87,0);g.add(leg);shaft(leg,0,-.20,0,.29,.045);mesh(new T.SphereGeometry(.065,6,6),bone,0,-.4,0,leg);shaft(leg,0,-.59,0,.29,.035);mesh(new T.BoxGeometry(.12,.07,.23),bone,0,-.81,.07,leg);legs.push(leg);const arm=new T.Group();arm.position.set(side*.27,1.57,0);g.add(arm);shaft(arm,0,-.16,0,.25,.04);mesh(new T.SphereGeometry(.055,6,6),bone,0,-.33,0,arm);shaft(arm,0,-.5,0,.25,.03);mesh(new T.SphereGeometry(.065,6,6),bone,0,-.69,0,arm);arms.push(arm)}
 const hand=new T.Group();hand.position.set(0,-.69,0);arms[1].add(hand);
 if(kind==='sword'){mesh(new T.BoxGeometry(.065,.65,.025),iron,0,.35,.08,hand);mesh(new T.BoxGeometry(.22,.035,.045),iron,0,.02,.08,hand);const shieldPivot=new T.Group();shieldPivot.position.set(0,-.62,.08);arms[0].add(shieldPivot);const shield=mesh(new T.CylinderGeometry(.22,.22,.06,8),wood,0,0,0,shieldPivot);shield.rotation.x=Math.PI/2;g.userData.shield=shieldPivot;mesh(new T.ConeGeometry(.2,.17,8),iron,0,2.03,0)}
 else if(kind==='bow'){const curve=new T.QuadraticBezierCurve3(new T.Vector3(0,-.4,0),new T.Vector3(0,0,.22),new T.Vector3(0,.4,0));mesh(new T.TubeGeometry(curve,14,.022,5,false),wood,0,0,.08,hand);const string=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0,-.4,.08),new T.Vector3(0,.4,.08)]),new T.LineBasicMaterial({color:0xc9c6ac}));hand.add(string)}
 else{mesh(new T.CylinderGeometry(.026,.033,1.5,6),wood,0,.2,.05,hand);mesh(new T.OctahedronGeometry(.14),new T.MeshBasicMaterial({color:0x64ffab}),0,1.02,.05,hand);mesh(new T.ConeGeometry(.24,.38,8),new T.MeshStandardMaterial({color:0x333653}),0,2.13,0)}
 g.userData.arms=arms;
 // Merge fixed bones per joint/material; the articulated joints remain animated.
 const joints=[];g.traverse(o=>{if(o.isGroup)joints.push(o)});for(const joint of joints){const groups=new Map();for(const child of joint.children)if(child.isMesh){if(!groups.has(child.material))groups.set(child.material,[]);groups.get(child.material).push(child)}for(const [material,parts] of groups){if(parts.length<2)continue;const arrays={position:[],normal:[],uv:[]};for(const m of parts){m.updateMatrix();const geo=(m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone()).applyMatrix4(m.matrix);for(const key of Object.keys(arrays))arrays[key].push(...geo.attributes[key].array);geo.dispose();joint.remove(m);m.geometry.dispose()}const geo=new T.BufferGeometry();for(const [key,values] of Object.entries(arrays))geo.setAttribute(key,new T.Float32BufferAttribute(values,key==='uv'?2:3));geo.computeBoundingSphere();joint.add(new T.Mesh(geo,material))}}
 let time=0,attack=0,attackLength=.6,last=g.position.clone();
 return {g,heading:0,cueAttack(_kind,duration=.6){attack=attackLength=duration},update(dt=.05){time+=dt;const moving=last.distanceToSquared(g.position)>.00001;last.copy(g.position);g.rotation.y=this.heading;legs.forEach((l,i)=>l.rotation.x=moving?Math.sin(time*7+i*Math.PI)*.45:0);arms.forEach((a,i)=>{a.rotation.x=moving?Math.sin(time*7+i*Math.PI)*-.3:0});if(g.userData.shield)g.userData.shield.rotation.x=0;attack=Math.max(0,attack-dt);if(attack>0){const pulse=Math.sin((1-attack/attackLength)*Math.PI);arms[1].rotation.x=kind==='sword'?-2.3*pulse:-1.5*pulse;arms[0].rotation.x=kind==='bow'?-1.45*pulse:-.4*pulse;g.rotation.z=kind==='sword'?.12*pulse:0}else g.rotation.z=0}};
}
