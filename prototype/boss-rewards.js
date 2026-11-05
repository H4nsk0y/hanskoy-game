import * as T from './vendor/three.module.js';
import {ITEMS} from './inventory.js';
import {isBoss} from './boss-hud.js';
import {lootModel,disposeLoot} from './loot-visuals.js';
export const BOSS_DAY=24*60*60*1000;
export function bossLoot(n,classId,random=Math.random){
 classId=classId||'sword';const level=n.level||n.fixedLevel||4,loot=[{id:'gold',count:8+level*2+Math.floor(random()*12)}];
 if(random()<.65)loot.push({id:random()<.5?'health_potion':classId==='mage'?'mana_potion':'stamina_potion',count:1+Math.floor(random()*2)});
 if(random()<.2)loot.push({id:(random()<.5?'trophy_':'trophy_ring_')+classId+'_'+(['lich','baron','abbess','ashwing','c5_overseer'].includes(n.species)?'greater':'lesser'),count:1});
 return loot;
}
// Real time, including time with the game closed; repeat victories never grant rewards.
export function bossRewards({scene,camera,p,zone,actors,revive,finish,pickup,random=Math.random,clock=Date.now}){
 let history={},drops=[];
 const key=n=>zone()+':'+n.id;
 function killed(n){if(n.rewardless){n.g.visible=false;return true}if(!isBoss(n)||n.species==='dark-self')return false;const id=key(n),old=history[id];
  if(n.repeatEncounter||old){n.bossDefeatedAt=clock();history[id]={id:n.id,zone:zone(),...old,at:clock(),active:false};n.repeatEncounter=true;finish(n);return true}
  n.bossDefeatedAt=clock();history[id]={at:clock(),active:false,id:n.id,zone:zone()};
  for(const item of bossLoot(n,p.classId,random)){const g=lootModel(scene,item.id,item.count);const a=random()*Math.PI*2;g.position.copy(n.g.position).add(new T.Vector3(Math.cos(a)*.8,.45,Math.sin(a)*.8));drops.push({...item,zone:zone(),g,baseY:g.position.y})}return false;
 }
 function tick(dt){const current=zone(),population=actors();const repeatActive=Object.values(history).some(r=>r.zone===current&&r.active);if(repeatActive)for(const n of population)if(n.id?.startsWith('summon-')||['boss-add','baron-add','c4-add','c5-add'].includes(n.group))n.rewardless=true;for(const n of population){const id=current+':'+n.id;let record=history[id];if(!record&&n.hp<=0&&n.hit&&isBoss(n)&&n.species!=='dark-self')record=history[id]={at:clock(),active:false,id:n.id,zone:current};if(!record)continue;
   if(record.active){n.repeatEncounter=true;continue}
   if(n.hp<=0&&clock()-record.at>=BOSS_DAY){revive(n);n.repeatEncounter=true;n.hp=n.maxHp;n.g.visible=true;n.g.position.copy(n.home||n.g.position);n.target?.copy(n.g.position);n.aggro=null;n.hit=false;n.cooldown=1;n.generation=(n.generation||0)+1;for(const k of ['root','stun','slow','windup','attackWindup','bleedLeft','markLeft'])n[k]=0;record.active=true}
  }
  for(let i=drops.length-1;i>=0;i--){const d=drops[i];d.g.visible=d.zone===current;if(!d.g.visible)continue;d.g.rotation.y+=dt*1.8;d.g.position.y=d.baseY+Math.sin(d.g.rotation.y*2)*.07;if(Math.hypot(camera.position.x-d.g.position.x,camera.position.z-d.g.position.z)<1.3&&pickup(d.id,d.count)){disposeLoot(d.g);drops.splice(i,1)}}
 }
 return {killed,tick,snapshot:()=>({history:JSON.parse(JSON.stringify(history)),drops:drops.map(({g,...d})=>({...d,position:g.position.toArray()}))}),restore(s){for(const d of drops)disposeLoot(d.g);drops=[];history=JSON.parse(JSON.stringify(s?.history||{}));for(const d of s?.drops||[]){const g=lootModel(scene,d.id,d.count);g.position.fromArray(d.position);drops.push({...d,g})}}};
}
export function validateBossRewards(s,require,finite,vector){if(s===undefined)return;require(s&&s.history&&typeof s.history==='object'&&!Array.isArray(s.history)&&Object.keys(s.history).length<=200&&Array.isArray(s.drops)&&s.drops.length<=2000);for(const [key,r] of Object.entries(s.history))require(key.length<180&&typeof r.id==='string'&&typeof r.zone==='string'&&finite(r.at,0)&&typeof r.active==='boolean');for(const d of s.drops)require(ITEMS[d.id]||d.id==='gold'),require(typeof d.zone==='string'&&vector(d.position)&&finite(d.baseY)&&Number.isInteger(d.count)&&d.count>0&&d.count<1000)}
