import * as T from './vendor/three.module.js';
import {lichDungeon} from './lich-dungeon.js';
import {bossCombat} from './boss-combat.js';
import {modelActor,witchMaterial} from './models.js';
import {trollEncounter} from './troll.js';
import {packActor,restoreActor} from './actor-state.js';
import {maximum} from './player-stats.js';
export const ADMIN_ENTRY=[700,1.7,-97],ADMIN_FIRE=[718,1.7,-98];
export function adminArena({scene,camera,vitals,fireMap,stoneMap,rand=Math.random,setPose}){
 let enabled=false,activeBoss=null,built=false,arena,baseline,combat,hunter,witch,dummy,root;const controls=[];
 const fill=()=>{for(const k of ['hp','stamina','mana'])vitals[k]=maximum(vitals,k)};
 function build(){if(built)return;built=true;root=new T.Group();scene.add(root);
  arena=lichDungeon({scene:root,camera,vitals,fireMap,stoneMap,rand,setPose});arena.enter('lich');baseline=arena.snapshot();arena.boss.g.visible=false;
  function actor(id,x,z,hp){const n=modelActor(root,[],x,z,1.85,false,id);Object.assign(n,{id:'admin-'+id,species:id,name:id==='hunter'?'Охотник — испытание':'Ведьма — испытание',hp,maxHp:hp,home:new T.Vector3(x,0,z),target:new T.Vector3(x,0,z),cooldown:1,heading:0,hit:false});n.g.visible=false;return n}
  hunter=actor('hunter',700,-130,75);witch=actor('witch',700,-130,200);const hat=new T.Mesh(new T.ConeGeometry(.4,.65,7),witchMaterial('шляпа'));hat.position.y=1.95;witch.g.add(hat);
  combat=bossCombat({scene:root,camera,hunter,witch,free:(x,z,r)=>arena.can(x,z,r),rand,arenaBounds:[676,724,-148,-93]});
  const ogre=trollEncounter({scene:root,camera,rand,free:()=>true});ogre.spawnAt(700,-113);dummy=ogre.n;dummy.id='admin-target';dummy.name='Огр — бессмертная мишень';dummy.g.rotation.y=0;dummy.hit=false;
  const mat=new T.MeshStandardMaterial({map:stoneMap||null,color:0x677278});
  for(const [i,id] of ['hunter','witch','lich'].entries()){const g=new T.Group();g.position.set(693+i*4,0,-94);root.add(g);const base=new T.Mesh(new T.BoxGeometry(1.5,1.1,.6),mat);base.position.y=.55;g.add(base);const gem=new T.Mesh(new T.OctahedronGeometry(.23),new T.MeshBasicMaterial({color:[0xffd782,0x7cff76,0x74c6ff][i]}));gem.position.y=1.35;g.add(gem);controls.push({id,g})}
  const fire=new T.Sprite(new T.SpriteMaterial({map:fireMap||null,color:0xffb36a,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));fire.position.set(718,1.1,-98);fire.scale.set(2.2,2.2,1);root.add(fire);const light=new T.PointLight(0xffa558,50,18,2);light.position.set(718,2,-98);root.add(light);
 }
 function resetActors(){combat.resetFight();for(const n of [hunter,witch,dummy]){n.hp=n.maxHp;n.hit=false;n.aggro=null;n.stun=n.slow=n.bleedLeft=n.markLeft=n.attackWindup=0;n.cooldown=1;n.g.position.copy(n.home);n.g.visible=n===dummy}arena.restore(structuredClone(baseline));arena.boss.g.visible=false}
 function label(){document.querySelector('#location').textContent=activeBoss?'Испытание — '+({hunter:'Охотник',witch:'Ведьма',lich:'Лич'}[activeBoss]):'Тестовая арена · ресурсы ∞ · КД 0'}
 function start(id){if(!enabled||activeBoss||!['hunter','witch','lich'].includes(id))return false;resetActors();activeBoss=id;dummy.g.visible=false;fill();if(id==='lich'){arena.boss.g.visible=true;arena.boss.aggro=camera.position.clone();arena.boss.hit=true}else{const n=id==='hunter'?hunter:witch;n.g.visible=true;n.aggro=camera.position.clone();n.hit=true}label();return true}
 function finish(){activeBoss=null;resetActors();fill();label()}
 function hit(n){if(!enabled||!mobs().includes(n))return false;if(n===dummy){n.aggro=null;if(n.hp<=0){n.hp=n.maxHp;n.stun=n.slow=n.root=n.bleedLeft=n.markLeft=0}return true}if(n.hp<=0){n.g.visible=false;if(n===arena.boss||n===hunter||n===witch)finish();else arena.killed(n,{classId:null})}return true}
 function mobs(){return !enabled?[]:activeBoss==='lich'?arena.mobs:activeBoss?[activeBoss==='hunter'?hunter:witch]:[dummy]}
 function nearControl(){return controls.find(c=>camera.position.distanceTo(c.g.position)<3)}
 function prompt(){if(!enabled)return '';if(activeBoss)return '';if(camera.position.z> -104)return 'E — Испытания: Охотник · Ведьма · Лич';const c=nearControl();return c?'E — '+({hunter:'Охотник',witch:'Ведьма',lich:'Лич'}[c.id]):'Мишень: ресурсы ∞, перезарядки отключены'}
 function interact(){const c=nearControl();return !!c&&start(c.id)}
 function tick(dt,h){if(!enabled)return;if(!activeBoss){fill();dummy.aggro=null;dummy.g.position.copy(dummy.home);dummy.g.rotation.y=0;return}if(activeBoss==='lich')arena.tick(dt,{...h,onPhase:()=>{},pickup:()=>false});else{combat.tick(dt,h.onDamage,h.onSound);for(const n of [hunter,witch])if(n.g.visible){n.update?.(camera);n.animate?.(dt)}}}
 function restore(s){enabled=!!s?.enabled;activeBoss=null;if(!enabled){if(root)root.visible=false;return}const pose=camera.position.clone();build();root.visible=true;resetActors();if(s.activeBoss)start(s.activeBoss);if(s.arena)arena.restore(s.arena);if(s.combat)combat.restore(s.combat);if(s.hunter)restoreActor(hunter,s.hunter);if(s.witch)restoreActor(witch,s.witch);if(s.dummy)restoreActor(dummy,s.dummy);arena.boss.g.visible=activeBoss==='lich';dummy.g.visible=!activeBoss;hunter.g.visible=activeBoss==='hunter';witch.g.visible=activeBoss==='witch';camera.position.copy(pose);label()}
 return {get inside(){return enabled},get training(){return enabled&&!activeBoss},get activeBoss(){return activeBoss},get mobs(){return mobs()},start,finish,hit,tick,prompt,interact,fill,can:(x,z,r)=>!!enabled&&arena.can(x,z,r),blocked:p=>!enabled||arena.blocked(p),receive:(n,v,t)=>activeBoss==='lich'?arena.receive(n,v,t):v,map:()=>arena.map(),get campfire(){return new T.Vector3(...ADMIN_FIRE)},snapshot:()=>enabled?{enabled:true,activeBoss,arena:arena.snapshot(),hunter:packActor(hunter),witch:packActor(witch),dummy:packActor(dummy),combat:combat.snapshot()}:{enabled:false},restore,respawn(){finish();setPose({position:ADMIN_ENTRY,yaw:0,pitch:0})}};
}

