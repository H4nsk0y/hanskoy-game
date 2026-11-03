import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {chapterTwoCombat} from '../chapter-two-combat.js';
import {chapterThreeCombat} from '../chapter-three-combat.js';
import {MAGIC_PROJECTILE_RANGE,clipMagicProjectile} from '../combat-rules.js';
assert.equal(MAGIC_PROJECTILE_RANGE,35);
for(const factory of [chapterTwoCombat,chapterThreeCombat])for(const [distance,expected] of [[34,true],[38,false]]){
 const root=new T.Group(),camera=new T.PerspectiveCamera();camera.position.set(0,1.7,-distance);
 const combat=factory({root:()=>root,camera,free:()=>true,blocked:()=>false,rand:()=>.5});
 combat.restore({time:0,shots:[{position:[0,1.7,0],velocity:[0,0,-50],age:0,damage:20,arrow:false,owner:'mage',slow:0}]});
 let hit=false;combat.tick(1,[],{onDamage:()=>{hit=true}});assert.equal(hit,expected);assert.equal(combat.snapshot().shots.length,0);
 // Restored shots keep the distance already travelled, without a new save field.
 combat.restore({time:0,shots:[{position:[0,1.7,-34],velocity:[0,0,-50],age:34/50,damage:20,arrow:false,owner:'mage',slow:0}]});
 camera.position.z=-38;hit=false;combat.tick(.3,[],{onDamage:()=>{hit=true}});assert(!hit);assert.equal(combat.snapshot().shots.length,0);
}
const old=new T.Vector3(),shot={arrow:true,age:3,v:new T.Vector3(0,0,-34),m:{position:new T.Vector3(0,0,-102)}};assert.equal(clipMagicProjectile(shot,old,3),false);assert.equal(shot.m.position.z,-102,'arrows retain their own range');
console.log('PASS enemy magic hits within 35m, cannot hit beyond it even with a large step/load, and does not alter arrows');

for(const [factory,owner] of [[chapterTwoCombat,'c2-vampire'],[chapterThreeCombat,'c3-c5-overseer']]){const root=new T.Group(),camera=new T.PerspectiveCamera();camera.position.set(0,1.7,-60);const c=factory({root:()=>root,camera,free:()=>true,blocked:()=>false,rand:()=>.5});c.restore({time:0,shots:[{position:[0,1.7,0],velocity:[0,0,-34],age:0,damage:20,arrow:false,owner,slow:0}]});let hit=false;for(let i=0;i<20;i++)c.tick(.1,[],{onDamage:()=>hit=true});assert(hit,'boss can still hit at 60m: '+owner)}
console.log('PASS boss magic keeps long range');
