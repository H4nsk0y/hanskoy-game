import * as T from './vendor/three.module.js';
import {steer} from './navigation.js';
import {terrainHeight} from './terrain-height.js';
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
export function meleeProfile(n){const kind=n.species||n.role||'',beast=/wolf|hound|bear/.test(kind),heavy=/troll|brute|golem|sentinel/.test(kind);return {beast,heavy,reach:heavy?3.15:beast?2.65:2.9,windup:heavy?.62:beast?.38:.46,strike:heavy?.26:.2,recover:heavy?.72:beast?.42:.52,lunge:heavy?5.5:beast?7:4.5,double:!/zombie/.test(kind),speed:heavy?3:beast?4.1:3.25}}
export function startMelee(n,target,pattern='single',profile=meleeProfile(n)){
 const previous=n.melee||{};n.melee={...previous,phase:'windup',elapsed:0,duration:pattern==='lunge'?.7:pattern==='double'?.65:profile.windup,pattern,angle:Math.atan2(target.x-n.g.position.x,target.z-n.g.position.z),hit:false,chain:0,index:(previous.index||0)+1,chase:0};n.heading=n.melee.angle;n.attackWindup=n.melee.duration;
}
function advance(n,metres,free,radius){if(n.root>0||metres<=0)return;const a=n.melee.angle,p=n.g.position,steps=Math.max(1,Math.ceil(metres/.12));for(let i=0;i<steps;i++){const x=p.x+Math.sin(a)*metres/steps,z=p.z+Math.cos(a)*metres/steps;if(!free(x,z,radius))break;p.x=x;p.z=z;p.y=n.groundY??terrainHeight(x,z)}}
function clearPath(p,target,free,radius){const steps=Math.max(1,Math.ceil(Math.hypot(target.x-p.x,target.z-p.z)/.15));for(let i=1;i<=steps;i++){const t=i/steps;if(!free(p.x+(target.x-p.x)*t,p.z+(target.z-p.z)*t,radius))return false}return true}
export function meleeCombat(n,dt,{camera,free,bounds=()=>true,route=(_n,t)=>t,onHit=()=>{},onSound=()=>{},damage=20,speed,profile=meleeProfile(n),canHit=()=>true,cooldown=1.4}={}){
 if(n.hp<=0)return;const s=n.melee??={phase:'ready',elapsed:0,duration:0,index:0,chase:0,burst:0,burstReady:0};const p=n.g.position,d=Math.hypot(camera.position.x-p.x,camera.position.z-p.z);const outsideBounds=!bounds(p.x,p.z),valid=(x,z,r)=>(outsideBounds||bounds(x,z))&&free(x,z,r);s.burstReady=Math.max(0,(s.burstReady||0)-dt);s.burst=Math.max(0,(s.burst||0)-dt);
 if(!n.aggro){s.phase='ready';s.chase=0;n.attackWindup=0;return}
 if(n.stun>0){n.attackWindup=0;s.phase='ready';return}
 if(s.phase!=='ready'){
  n.heading=s.angle;const step=Math.min(dt,Math.max(0,s.duration-s.elapsed));s.elapsed+=step;
  if(s.phase==='windup'&&s.pattern!=='lunge')advance(n,Math.min(1.1*step,Math.max(0,d-(profile.heavy?2.2:1.7))),valid,profile.heavy?.65:.4);
  if(s.phase==='strike'){
   const motion=(s.pattern==='lunge'?profile.lunge/.28:profile.heavy?5.5:6.5)*step;advance(n,Math.min(motion,Math.max(0,d-(profile.heavy?2.2:profile.beast?1.65:1.7))),valid,profile.heavy?.65:.4);
   if(!s.hit&&s.elapsed>=s.duration*.4){s.hit=true;const dx=camera.position.x-p.x,dz=camera.position.z-p.z,range=Math.hypot(dx,dz),dot=range<.01?1:(dx*Math.sin(s.angle)+dz*Math.cos(s.angle))/range;
    if(range<profile.reach&&dot>Math.cos(.85)&&Math.abs(camera.position.y-(p.y+1.3))<1.8&&canHit()&&[.25,.5,.75].every(t=>valid(p.x+dx*t,p.z+dz*t,profile.heavy?.65:.4)))onHit(damage*(s.pattern==='double'?.72:s.pattern==='lunge'?1.12:1),'physical',n.id,p);
    onSound(profile.beast?'wolf-attack':'sword');
   }
  }
  n.attackWindup=s.phase==='windup'?Math.max(0,s.duration-s.elapsed):0;
  if(s.elapsed>=s.duration-1e-8){s.elapsed=0;if(s.phase==='windup'||s.phase==='between'){s.phase='strike';s.duration=s.pattern==='lunge'?.28:profile.strike;s.hit=false}
   else if(s.phase==='strike'&&s.pattern==='double'&&!s.chain){s.phase='between';s.duration=.32;s.chain=1}
   else if(s.phase==='strike'){s.phase='recover';s.duration=profile.recover+(s.pattern==='lunge'?.3:0);n.cooldown=Math.max(n.cooldown||0,cooldown-profile.windup-profile.strike)}
   else{s.phase='ready';s.duration=0}}
  return;
 }
 n.heading=Math.atan2(camera.position.x-p.x,camera.position.z-p.z);s.chase=(s.chase||0)+dt;
 if(!s.burstReady&&d>profile.reach+.8){s.burst=.7;s.burstReady=3.8}
 const attackRange=profile.reach-.5,lungeReady=s.chase>1.2&&d>attackRange&&d<profile.lunge+profile.reach-1&&!n.root;
 if(!(n.cooldown>0)&&(d<attackRange||lungeReady)&&canHit()&&clearPath(p,camera.position,valid,profile.heavy?.65:.4)){
  const pattern=lungeReady?'lunge':profile.double&&(s.index||0)%3===2?'double':'single';startMelee(n,camera.position,pattern,profile);return;
 }
 if(d>profile.reach-.6||!canHit()||!clearPath(p,camera.position,valid,profile.heavy?.65:.4))steer(n,route(n,camera.position),(speed??profile.speed)*(s.burst>0?1.22:1),dt,valid,bounds,profile.heavy?.65:.4);
}
// Called after the rig's walking pose, so telegraphs and damage share the same phase.
export function meleePose(n){const s=n?.melee,g=n?.g;if(!s||!g)return;const rig=g.userData.meleeRig||g.userData.hitRig||g,arms=g.userData.arms||[],head=g.userData.meleeHead,jaw=g.userData.meleeJaw;const t=s.duration?s.elapsed/s.duration:0;
 rig.rotation.x=0;rig.rotation.z=0;if(s.phase==='ready'){if(g.userData.meleeWeapon)g.userData.meleeWeapon.rotation.x=0;if(g.userData.meleeTell)g.userData.meleeTell.visible=false;return}
 const wind=s.phase==='windup',strike=s.phase==='strike',double=s.pattern==='double',dash=s.pattern==='lunge';let swing=0;
 if(wind)swing=-2.2*smooth(t);else if(strike)swing=-2.2+1.85*smooth(t);else if(s.phase==='between')swing=-.35-1.85*smooth(t);else swing=-.35*(1-smooth(t));if(dash){if(strike)swing=-.9-.5*Math.sin(t*Math.PI);else if(s.phase==='recover')swing=-.9*(1-smooth(t))}
 if(arms.length){if(double){for(let i=0;i<arms.length;i++){arms[i].rotation.x=wind?-2.05*smooth(t):s.phase==='between'?(i===0?-1.1-1.1*smooth(t):-.35-.75*smooth(t)):s.phase==='recover'?(i===0?-.35:-1.1)*(1-smooth(t)):i===(s.chain?0:1)?swing:s.chain?-1.1:-2.05+.95*smooth(t);arms[i].rotation.z=(i?-.4:.4)*(wind?smooth(t):s.phase==='recover'?.5*(1-smooth(t)):.5)}}else{if(arms[1]){arms[1].rotation.x=dash&&wind?-.9*smooth(t):swing;arms[1].rotation.z=wind?-.35*smooth(t):.1}if(arms[0])arms[0].rotation.x=dash?(wind?-.9*smooth(t):swing):s.phase==='recover'?-.5*(1-smooth(t)):-.5}}
 rig.rotation.x=dash&&wind?.2*smooth(t):strike?-.13*Math.sin(t*Math.PI):s.phase==='recover'?-.08*(1-t):0;
 rig.rotation.z=double?(s.chain?-.13:.13)*(wind?smooth(t):Math.sin(t*Math.PI)):wind?-.08*smooth(t):strike?.12*Math.sin(t*Math.PI):0;
 const legs=g.userData.meleeLegs||[];if(legs.length===2){const plant=wind?smooth(t):strike?1-smooth(t):s.phase==='between'?.6:1-smooth(t);legs[0].rotation.x=-.3*plant;legs[1].rotation.x=.2*plant}
 const weapon=g.userData.meleeWeapon;if(weapon&&arms[1])weapon.rotation.x=-arms[1].rotation.x+(wind?-.25:strike?2*smooth(t):s.phase==='between'?.25:0);
 if(head)head.rotation.x=wind?(dash?.22:-.24)*smooth(t):strike?.35*Math.sin(t*Math.PI):0;if(jaw)jaw.rotation.x=wind?.35*smooth(t):strike?.65*Math.sin(t*Math.PI):0;
 if(!g.userData.meleeTell){const tell=new T.Mesh(new T.RingGeometry(.55,.61,24),new T.MeshBasicMaterial({color:0xf5b34f,side:T.DoubleSide,transparent:true,opacity:.65,depthWrite:false}));tell.rotation.x=-Math.PI/2;tell.position.y=.06;g.add(tell);g.userData.meleeTell=tell}
 const tell=g.userData.meleeTell;tell.visible=wind&&(dash||double);tell.material.color.setHex(dash?0xf2b759:0xff775e);tell.scale.setScalar(1+.25*smooth(t));
}
export function clearMelee(n){delete n.melee;n.attackWindup=0;const g=n.g;if(g?.userData.meleeTell)g.userData.meleeTell.visible=false;if(g?.userData.meleeWeapon)g.userData.meleeWeapon.rotation.x=0;if(g?.userData.meleeHead)g.userData.meleeHead.rotation.x=0;if(g?.userData.meleeJaw)g.userData.meleeJaw.rotation.x=0;const rig=g?.userData.meleeRig||g?.userData.hitRig||g;if(rig){rig.rotation.x=rig.rotation.z=0}}
export function validateMelee(s){return s===undefined||s===null||s&&['ready','windup','strike','between','recover'].includes(s.phase)&&['single','double','lunge',undefined].includes(s.pattern)&&Number.isFinite(s.elapsed)&&s.elapsed>=0&&s.elapsed<=2&&Number.isFinite(s.duration)&&s.duration>=0&&s.duration<=2&&['angle','index','chase','burst','burstReady','chain'].every(k=>s[k]===undefined||Number.isFinite(s[k])&&Math.abs(s[k])<1e8)&&(!s.hit||typeof s.hit==='boolean')}

export function meleeActor(n){for(const key of ['update','animate'])if(typeof n[key]==='function'){const old=n[key];n[key]=function(...args){const result=old.apply(this||n,args);meleePose(this||n);return result}}return n}
