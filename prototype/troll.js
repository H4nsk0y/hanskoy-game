import * as T from './vendor/three.module.js';
import {steer} from './navigation.js';
import {statusStep} from './combat-rules.js';
import {packActor,restoreActor} from './actor-state.js';

// A visit rolls once. Loading, ticking and reopening menus never roll the event.
export function trollEncounter({scene,camera,free,rand}){
 const g=new T.Group();scene.add(g);g.visible=false;
 const skin=new T.MeshStandardMaterial({color:0x627749,roughness:.85}),hide=new T.MeshStandardMaterial({color:0x493b31}),bone=new T.MeshStandardMaterial({color:0xddd2a4});
 function part(geo,mat,x,y,z,parent=g){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m}
 part(new T.SphereGeometry(1,12,10),skin,0,1.9,0).scale.set(.85,1.12,.63);
 part(new T.SphereGeometry(.58,12,10),skin,0,2.96,.20);
 part(new T.SphereGeometry(.32,10,8),skin,0,2.74,.63).scale.set(1.3,.6,.75);
 for(const side of [-1,1]){
  part(new T.ConeGeometry(.09,.37,7),bone,side*.25,2.78,.78);
  const brow=part(new T.CapsuleGeometry(.08,.25,3,6),hide,side*.25,3.13,.69);brow.rotation.z=side*.9;
  part(new T.SphereGeometry(.055,8,6),new T.MeshBasicMaterial({color:0xe1b044}),side*.23,3.04,.72);
 }
 const legs=[],arms=[];
 for(const side of [-1,1]){const leg=new T.Group();leg.position.set(side*.4,1.15,0);g.add(leg);part(new T.CapsuleGeometry(.24,.65,4,8),skin,0,-.38,0,leg);part(new T.SphereGeometry(.29,10,8),hide,0,-.94,.16,leg).scale.set(1,.6,1.5);legs.push(leg);const arm=new T.Group();arm.position.set(side*.85,2.48,0);g.add(arm);part(new T.CapsuleGeometry(.25,.90,4,8),skin,side*.13,-.53,0,arm);part(new T.SphereGeometry(.29,10,8),skin,side*.16,-1.1,0,arm);arms.push(arm)}
 const club=part(new T.CylinderGeometry(.19,.08,1.3,8),hide,.18,-1.25,.43,arms[1]);club.rotation.x=1.1;
 const ring=part(new T.RingGeometry(3.8,4,48),new T.MeshBasicMaterial({color:0xffaa4d,transparent:true,opacity:.5,side:T.DoubleSide}),0,.04,0);ring.rotation.x=-Math.PI/2;ring.visible=false;
 const n={g,id:'troll',species:'troll',hp:0,maxHp:400,home:new T.Vector3(),target:new T.Vector3(),heading:0,generation:0,cooldown:1,timer:0,aggro:null,hit:false};let serial=0,windup=0,slam=false,slamReady=0,clock=0;
 function visit(){if(n.hp>0)return;if(rand()>=.05)return;for(let i=0;i<60;i++){const x=188+rand()*104,z=-65-rand()*122;if(!free(x,z,1.3)||!free(x+1,z,1)||!free(x-1,z,1))continue;n.g.position.set(x,0,z);n.home.copy(n.g.position);n.target.copy(n.home);n.hp=400;n.g.visible=true;n.hit=false;n.generation=++serial;n.aggro=null;n.cooldown=1;n.stun=n.slow=0;windup=0;slamReady=4;break}}
 function tick(dt,onDamage){if(!g.visible||n.hp<=0){ring.visible=false;return}const step=statusStep(n,dt);if(!step)return;clock+=step;slamReady=Math.max(0,slamReady-step);n.cooldown=Math.max(0,n.cooldown-step);const d=Math.hypot(g.position.x-camera.position.x,g.position.z-camera.position.z);if(!n.aggro&&d<14)n.aggro=camera.position.clone();if(n.aggro&&camera.position.distanceTo(n.aggro)>40){n.aggro=null;windup=0;ring.visible=false}
 const before=g.position.clone();
 if(windup>0){windup=Math.max(0,windup-step);arms[1].rotation.x=-2*Math.sin((slam?.9:.45)-windup+1);ring.visible=slam;if(windup===0){ring.visible=false;arms[1].rotation.x=0;const range=slam?4:2.9;if(d<range&&camera.position.y<(slam?2.4:3.5)&&[.25,.5,.75].every(t=>free(g.position.x+(camera.position.x-g.position.x)*t,g.position.z+(camera.position.z-g.position.z)*t,.05)))onDamage(slam?24:18,'physical')}}
 else if(n.aggro){n.heading=Math.atan2(camera.position.x-g.position.x,camera.position.z-g.position.z);g.rotation.y=n.heading;if(d>2.3)steer(n,camera.position,3.6,step,free,(x,z)=>x>182&&x<298&&z< -42&&z> -196,1);if(n.cooldown===0&&d<4){slam=slamReady===0;if(slam||d<2.8){windup=slam?.9:.45;n.cooldown=slam?2.5:1.65;if(slam)slamReady=8;ring.visible=slam}}}
 else{n.timer-=step;if(n.timer<=0){n.timer=3+rand()*3;n.target.copy(n.home).add(new T.Vector3((rand()-.5)*8,0,(rand()-.5)*8))}steer(n,n.target,1,step,free,(x,z)=>x>182&&x<298&&z< -42&&z> -196)}
 g.rotation.y=n.heading;const moving=before.distanceToSquared(g.position)>.00001;legs.forEach((leg,i)=>leg.rotation.x=moving?Math.sin(clock*6+i*Math.PI)*.3:0);if(!windup)arms.forEach((arm,i)=>arm.rotation.x=moving?Math.sin(clock*6+i*Math.PI)*-.2:0);
 }
 return {n,visit,tick,snapshot:()=>({actor:packActor(n),serial,windup,slam,slamReady,clock}),restore(s){if(!s){n.hp=0;g.visible=false;serial=0;windup=0;slamReady=0;clock=0;ring.visible=false;return}restoreActor(n,s.actor);serial=s.serial;windup=s.windup;slam=s.slam;slamReady=s.slamReady;clock=s.clock;ring.visible=windup>0&&slam}};
}
