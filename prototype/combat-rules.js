export const NORMAL_ARROW_RANGE=40;
export const MAGIC_PROJECTILE_RANGE=35;
import * as T from './vendor/three.module.js';
// Shared combat rules: durations are simulation seconds, unaffected by menus.
export const ROLL={duration:.5,start:.08,end:.38,cost:20,cooldown:.8,speed:8};
export const SKILLS={sword:{name:'Удар щитом',icon:'🛡',cost:25,cooldown:15,resource:'stamina',description:'140% урона оружия, оглушение от 3 до 6 с. Дальность меча.'},bow:{name:'Залп',icon:'➶',cost:40,cooldown:17,resource:'stamina',description:'Три прямые стрелы, расход одной. Скорость +30%, дальность 156 м.'},mage:{name:'Ледяная стрела',icon:'❄',cost:20,cooldown:12,resource:'mana',description:'Урон огненного шара +10%. Движение и атаки цели −50% на 7 с.'}};
export function skillIcon(id){const art={sword:'<path d="M14 10H48V31Q44 47 31 55Q18 47 14 31Z" fill="#8b683c" stroke="#e6c57d" stroke-width="3"/><path d="M31 12V49M17 27H45" stroke="#b5c6d1" stroke-width="4"/><path d="M49 15L57 9M51 27H61M49 39L58 44" stroke="#ffe5aa" stroke-width="3"/>',bow:'<path d="M10 48L42 16M21 53L53 21M6 34L34 6M42 16L32 18M42 16L40 27M53 21L43 23M53 21L51 32M34 6L24 8M34 6L32 17" stroke="#f4d799" stroke-width="3" fill="none"/>',mage:'<path d="M9 51L40 20" stroke="#59c7ff" stroke-width="8"/><path d="M34 22L51 7L57 13L42 30Z" fill="#d3ffff" stroke="#6dcfff" stroke-width="2"/><path d="M14 12V28M6 20H22M9 15L19 25M9 25L19 15" stroke="#b7f5ff" stroke-width="2"/>'};return '<svg viewBox="0 0 64 64" aria-hidden="true">'+(art[id]||'')+'</svg>'}
export const BOW_DRAW_SECONDS=1.5;
export function bowDrawPower(seconds){return Math.min(1,Math.max(0,seconds/BOW_DRAW_SECONDS))}
export function bowShotSpeed(seconds){return 30*(.6+.8*bowDrawPower(seconds))}
export function bowShotDamageMultiplier(seconds){return (80+40*bowDrawPower(seconds))/100}
export function skillPoints(level,rank=0){return Math.max(0,Math.floor(Math.min(100,level)/2)-rank)}
export function scaledDamage(base,level){return base*(1+.05*(level-1))}
export function criticalDamage(amount,roll=Math.random(),chance=.1){return amount*(roll<chance?2:1)}
export function blockHit(amount,type,v,guard,improved=false,{front=true,levelGap=0}={}){if(type==='hazard'||!front||!guard.held||guard.broken)return amount;const cost=(v.maxStamina||100)*(improved?.20:.25),available=Math.max(0,v.stamina),enough=available>=cost;let reduction=levelGap>=3?(type==='magic'?(improved?.40:.33):(improved?.70:.6)):(type==='magic'?(improved?.70:.6):1);if(!enough)reduction=Math.min(reduction,available/100);v.stamina=Math.max(0,available-cost);if(v.stamina===0){guard.broken=true;v.staminaDelay=1.5}return amount*(1-reduction)}

export function statusStep(n,dt){const stunned=Math.min(dt,n.stun||0);n.stun=Math.max(0,(n.stun||0)-dt);const available=dt-stunned,slowed=Math.min(available,Math.max(0,(n.slow||0)-stunned));n.slow=Math.max(0,(n.slow||0)-dt);return available-slowed*.5}

export function canSense(n,camera,distance,radius){const hiddenDistance=n.g?.position?Math.hypot(camera.position.x-n.g.position.x,camera.position.z-n.g.position.z):distance;if(camera.userData?.invisible&&hiddenDistance>.5){n.aggro=null;n.attackWindup=0;if(n.mode==='attack')n.mode='return';return false}return (camera.userData?.invisible?hiddenDistance:distance)<radius}

// Body and head volumes are shared by ordinary and skill projectiles.
export function hitVolumes(n){if(n.species==='c5_brute')return [[0,1.2,0,.85],[0,2.25,0,.48]];if(n.species==='c5_overseer')return [[0,1.35,0,.8],[0,2.25,0,.43]];if(['wolf','hare','raven'].includes(n.species)){const points=n.species==='raven'?[[0,.52,0,.32],[0,.88,.18,.21]]:n.species==='hare'?[[0,.49,-.12,.34],[0,.72,.28,.22],[0,1.1,.23,.18]]:[[0,.67,-.25,.40],[0,.67,.25,.40],[0,.88,.62,.29]];n.g.updateWorldMatrix(true,true);const rig=n.g.userData.hitRig||n.g,scale=n.g.getWorldScale(new T.Vector3()).x;return points.map(([x,y,z,r])=>{const q=new T.Vector3(x,y,z).applyMatrix4(rig.matrixWorld).sub(n.g.position);return [q.x,q.y,q.z,r*scale]})}if(['ashwing','whelp'].includes(n.species)){const scale=n.g.scale.x,angle=n.heading||0,offset=(z,y,r)=>[Math.sin(angle)*z*scale,y*scale,Math.cos(angle)*z*scale,r*scale];return [offset(0,.15,1),offset(1.7,.65,.7),offset(3.1,.8,.55)]}if(n.species==='harpy')return [[0,1.55,0,.8],[0,2.5,0,.35]];if(n.species==='baron')return [[0,1.45,0,.9],[0,2.3,0,.45]];if(n.species==='gargoyle')return [[0,1.2,0,.75],[0,1.8,0,.35]];if(n.species==='bloodhound')return [[0,.8,0,.7],[0,1.2,.7,.4]];if(n.species==='werewolf')return [[0,1.3,0,.8],[0,2.2,.1,.4]];if(n.species==='bear')return [[0,1,0,1.05],[0,1.4,.9,.55]];if(n.species==='vampire')return [[0,1.2,0,.8],[0,2,0,.4]];if(n.species==='ghost')return [[0,1.0,0,.7],[0,1.65,0,.35]];if(n.species==='troll'){const a=n.g.rotation?.y??n.heading??0;const scale=n.g.scale?.x||1;return [[0,1.6*scale,0,1.05*scale],[Math.sin(a)*.2*scale,3.02*scale,Math.cos(a)*.2*scale,.66*scale]]};return [[0,n.species==='player'?0:n.species==='lich'?2:n.species==='wolf'?.65:n.species==='hare'?.3:['witch','hunter','dark-self'].includes(n.species)?1:1.2,0,n.species==='player'?.5:n.species==='lich'?1.65:n.species==='hare'?.35:n.species==='wolf'?.6:.65]]}

// Magic projectiles have constant velocity. Age preserves range across every existing save format.
export function clipMagicProjectile(shot,old,dt,range=MAGIC_PROJECTILE_RANGE){
 if(shot.arrow||shot.falling||range===Infinity)return false;
 const speed=shot.v.length(),remaining=Math.max(0,range-Math.max(0,shot.age-dt)*speed),distance=old.distanceTo(shot.m.position);
 if(distance>remaining)shot.m.position.lerpVectors(old,shot.m.position,remaining/distance);
 return shot.age*speed>=range;
}
