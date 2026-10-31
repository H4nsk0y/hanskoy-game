import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {lichDungeon} from '../lich-dungeon.js';
import {ritualWorld} from '../ritual-world.js';
import {lootModel,disposeLoot} from '../loot-visuals.js';
import {offhandModel,disposeEquipment} from '../item-models.js';
import {createInventory,addItem,moveItem} from '../inventory.js';
import {hitVolumes} from '../combat-rules.js';
import {updateZoom} from '../view-controls.js';
globalThis.document={querySelector:()=>({})};const camera=new T.PerspectiveCamera(72),scene=new T.Scene(),vitals={hp:100,maxHp:100,mana:100,stamina:100};
const hut=ritualWorld({scene,camera,getPose:()=>({position:[240,1.7,-170],yaw:0,pitch:0}),setPose:p=>camera.position.fromArray(p.position)});hut.enter('hut');const door=scene.getObjectByName('witch-inner-door');assert(door&&door.children.length>10);camera.position.set(120,1.7,-95.5);assert(hut.prompt().includes('Выйти'));hut.leave();
const d=lichDungeon({scene,camera,vitals,rand:()=>.1,setPose:p=>camera.position.fromArray(p.position)});d.enter();camera.position.set(480,1.7,-102);d.ogre.aggro=camera.position.clone();assert.equal(d.ogre.g.scale.x,.8);assert.equal(hitVolumes(d.ogre)[1][1],3.02*.8);for(let i=0;i<600;i++){d.tick(.05,{onDamage(){},onSound(){},onSlow(){}});assert(d.can(d.ogre.g.position.x,d.ogre.g.position.z,.64),'ogre stays inside corridor')}assert(Math.hypot(d.ogre.g.position.x-480,d.ogre.g.position.z+102)<3,'ogre navigates multiple corners');
d.ogre.hp=0;d.killed(d.ogre,{classId:'mage'});const loot=d.snapshot().drops;assert.deepEqual(loot.map(i=>i.id),['gold','grimoire']);for(const id of ['gold','grimoire','shield_fine','quiver']){const g=lootModel(scene,id,2);assert(g.children.length>1);if(id!=='gold')assert(g.getObjectByName(id+'-model'));disposeLoot(g)}const saved=d.snapshot();d.restore(saved);assert.deepEqual(d.snapshot().drops,saved.drops);
const slots=createInventory();addItem(slots,'torch');assert(moveItem(slots,6,1));assert.equal(slots[1].id,'torch');assert(moveItem(slots,1,0));assert(moveItem(slots,0,1));assert(!moveItem(slots,1,2));for(const id of ['grimoire','torch']){const hand=offhandModel(camera,id);hand.userData.animate(5);assert(hand.position.x<0&&hand.position.y<0);assert(hand.children.some(o=>o.geometry?.type==='CapsuleGeometry'),'visible hand/arm');disposeEquipment(hand);assert(!camera.children.includes(hand))}
for(let i=0;i<50;i++)updateZoom(camera,true,.02);assert.equal(camera.fov,36);camera.far=3;updateZoom(camera,true,.05);assert.equal(camera.far,3,'zoom does not bypass fear');for(let i=0;i<50;i++)updateZoom(camera,false,.02);assert.equal(camera.fov,72);
console.log('PASS hut interior door/exit, smaller ogre corner navigation/scaled head hitbox, rare loot models/save, torch either hand, visible offhand book/arm and reversible zoom');
