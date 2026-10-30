import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
T.TextureLoader.prototype.loadAsync=async()=>new T.Texture();
const {adminArena,ADMIN_ENTRY}=await import('../admin-arena.js');
globalThis.document={querySelector:()=>({})};
const camera=new T.PerspectiveCamera();camera.position.fromArray(ADMIN_ENTRY);const vitals={hp:100,stamina:100,mana:100,maxHp:100,maxStamina:100,maxMana:100};const w=adminArena({scene:new T.Scene(),camera,vitals,rand:()=>.5,setPose:p=>camera.position.fromArray(p.position)});
w.restore({enabled:true});assert(w.inside&&w.training);assert.equal(w.mobs.length,1);const target=w.mobs[0],pos=target.g.position.clone();target.hp=0;assert(w.hit(target));assert.equal(target.hp,400);target.stun=2;let hits=0;vitals.mana=0;for(let i=0;i<100;i++)w.tick(.05,{onDamage(){hits++}});assert.equal(hits,0);assert.equal(vitals.mana,100);assert.deepEqual(target.g.position,pos);assert(w.prompt().includes('Охотник'));
for(const id of ['hunter','witch','lich']){camera.position.set(700,1.7,-124);assert(w.start(id));assert(!w.training);assert(!target.g.visible);const boss=w.mobs.find(n=>n.species===id);assert(boss);assert.equal(boss.hp,id==='hunter'?75:id==='witch'?200:570);vitals.mana=10;for(let i=0;i<40;i++)w.tick(.05,{onDamage(){},onSound(){},onSlow(){}});assert.equal(vitals.mana,10,'normal finite resources while fighting');const s=w.snapshot();w.restore(s);assert.deepEqual(w.snapshot(),s,'active boss roundtrip');boss.hp=0;vitals.hp=12;w.hit(boss);assert(w.training);assert.equal(vitals.hp,100);assert.equal(w.mobs.length,1)}
w.respawn();assert.deepEqual(camera.position.toArray(),ADMIN_ENTRY);w.restore({enabled:false});assert(!w.inside);assert.equal(w.mobs.length,0);
console.log('PASS admin dummy/reset, no attacks, training resources, three actual bosses, normal fight resources, active save, victory restore and isolated respawn');
