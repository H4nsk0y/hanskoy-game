import {biteAttack} from './enemy-animation.js';
import {statusStep,canSense} from './combat-rules.js';
import {steer} from './navigation.js';
import {packActor,restoreActor} from './actor-state.js';
import * as T from './vendor/three.module.js';
import {modelActor} from './models.js';
export function lakeEncounter({scene,camera,free,rand}){
const mobs=[];let started=false;
function start(){if(started)return false;const points=[];for(let j=0;j<3;j++){let found;for(let i=0;i<180;i++){const a=j*Math.PI*2/3+i*.43,r=5.5+Math.floor(i/24)*1.2,x=camera.position.x+Math.cos(a)*r,z=camera.position.z+Math.sin(a)*r;if(Math.abs(x)<37&&z> -80&&z<12&&free(x,z,.7)&&points.every(p=>Math.hypot(p.x-x,p.z-z)>2.5)){found=new T.Vector3(x,0,z);break}}if(!found)return false;points.push(found)}started=true;for(const [i,pos] of points.entries()){const n=modelActor(scene,[],pos.x,pos.z,1.15,true);Object.assign(n,{species:'wolf',id:'lake-wolf-'+i,hp:35,maxHp:35,home:pos.clone(),aggro:camera.position.clone(),cooldown:1});mobs.push(n)}return true}
function move(n,target,dt){steer(n,target,n.attackWindup?4.2:3.8,dt,free,(x,z)=>Math.abs(x)<38&&z>=-81&&z<14)}
function tick(dt,onDamage,inside,onSound=()=>{}){const frameDt=dt;const village=camera.position.z< -83&&Math.abs(camera.position.x)<17;for(const n of mobs){if(n.hp<=0)continue;const dt=statusStep(n,frameDt);if(dt<=0)continue;if(inside){n.aggro=null;n.attackWindup=0;continue}const d=Math.hypot(camera.position.x-n.g.position.x,camera.position.z-n.g.position.z);n.cooldown=Math.max(0,n.cooldown-dt);const sensed=canSense(n,camera,d,8);if(village||(n.aggro&&camera.position.distanceTo(n.aggro)>24))n.aggro=null;else if(!n.aggro&&sensed)n.aggro=camera.position.clone();if(!n.aggro)n.attackWindup=0;if(!n.aggro||d>1.75)move(n,n.aggro?camera.position:n.home,dt);biteAttack(n,dt,n.aggro&&d<2.2&&camera.position.y<2.6&&[.25,.5,.75].every(t=>free(n.g.position.x+(camera.position.x-n.g.position.x)*t,n.g.position.z+(camera.position.z-n.g.position.z)*t,.05)),()=>onDamage(14),1.3,onSound);n.update()}}
function snapshot(){return {started,mobs:mobs.map(packActor)}}
function restore(state){for(const n of mobs){scene.remove(n.g);n.g.traverse(part=>{if(part.isMesh){part.geometry.dispose();for(const m of Array.isArray(part.material)?part.material:[part.material])m.dispose()}})}mobs.length=0;started=state.started;for(const data of state.mobs){const n=modelActor(scene,[],data.position[0],data.position[2],1.15,true);Object.assign(n,{species:'wolf',id:data.id});restoreActor(n,data);mobs.push(n)}}
return {mobs,start,tick,snapshot,restore,get defeated(){return started&&mobs.length===3&&mobs.every(n=>n.hp<=0)}};
}
