import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {MAX_SKILL_RANK,rankDamage,shieldStun,executeThreshold,bastionReduction} from '../skill-balance.js';
import {createInventory,restoredInventory,INVENTORY_VERSION,ITEMS,moveItem,isBagSlot,countItem} from '../inventory.js';
import {gearBonus,armorFactor} from '../equipment.js';
import {comparison} from '../equipment-view.js';
import {deathMarkers} from '../minimap.js';
import {journey} from '../journey.js';
import {mapLinks} from '../map-atlas.js';
import {transferStack} from '../storage.js';

assert.equal(MAX_SKILL_RANK,10);assert.equal(rankDamage(1),1);assert.equal(rankDamage(100),rankDamage(10));assert(Math.abs(rankDamage(10)-1.72)<1e-9);
assert.equal(shieldStun(1),3);assert.equal(shieldStun(2),4);assert.equal(shieldStun(4),5);assert.equal(shieldStun(6),6);assert.equal(shieldStun(10),6);assert.equal(executeThreshold(10),.18);assert.equal(bastionReduction(10),.48);

const old=Array(38).fill(null);old[0]={id:'mage',count:1};old[18]={id:'ring_mage',count:1};old[20]={id:'mana_potion',count:4};old[37]={id:'bone',count:8};
const migrated=restoredInventory({slots:old},3);assert.equal(migrated.length,39);assert.equal(migrated[20],null);assert.equal(migrated[21].count,4);assert.equal(migrated[38].count,8);assert.deepEqual(migrated[18],old[18]);assert.deepEqual(restoredInventory({inventoryVersion:INVENTORY_VERSION,slots:migrated},3),migrated);
assert.equal(migrated.filter((_,i)=>isBagSlot(i)).length,30);assert(!moveItem(migrated,21,20),'potions cannot occupy cloak equipment');
ITEMS.test_cloak={name:'Test',slot:'cloak',bonus:{mana:10}};migrated[22]={id:'test_cloak',count:1};assert(moveItem(migrated,22,20));assert.equal(gearBonus(migrated).mana,10);delete ITEMS.test_cloak;
const basic=createInventory();for(const [i,id] of [[2,'cloth_hood'],[3,'cloth_chest'],[4,'cloth_legs'],[5,'cloth_boots']])basic[i]={id,count:1};const armor=gearBonus(basic);assert.equal(armor.armor,20);assert(armorFactor(armor,2)<1);assert(armorFactor(armor,80)>armorFactor(armor,2),'low-tier armor falls behind high-level threats');assert(comparison('mage_bone',basic,{classId:'mage',level:10}).includes('Урон: 29.4'));

const p={gold:0,xp:100,lastDeathAt:null},slots=createInventory(),camera=new T.PerspectiveCamera();camera.position.set(2,1.7,-5);
const j=journey({scene:new T.Scene(),camera,p,slots,zone:()=> 'forest',time:()=>10,site:()=>({zone:'forest',position:[2,0,-5]}),travel:()=>true});
j.restore({nextId:2,bags:[{id:1,zone:'forest',position:[2,0,-5],gold:15,items:[{id:'return_bone',count:5},{id:'fang',count:3}]}]});
const b=j.near();assert.equal(deathMarkers(j.bags,'forest').length,1);assert.equal(deathMarkers(j.bags,'deep').length,0);assert(j.take(b,0));assert.equal(countItem(slots,'return_bone'),5,'death pickup respects current five-bone cap');assert(j.take(b,0));j.collectGold(b);j.finish(b);assert.equal(p.gold,15);assert.equal(deathMarkers(j.bags,'forest').length,0);
const chest=Array(18).fill(null);chest[0]={id:'return_bone',count:2};assert(!transferStack(chest,0,slots,6));assert.equal(chest[0].count,2,'storage cannot bypass consumable limits');
const before=mapLinks('c2_city',{stage:'chapter_two'}),after=mapLinks('c2_city',{stage:'chapter_four',manorShortcut:true});assert.deepEqual(before,after);assert.equal(new Set(before.map(i=>i.x+','+i.z)).size,before.length);assert.deepEqual(before.map(i=>i.to),['c2_road','c2_inn','c2_manor','c3_pass']);
console.log('PASS bounded skill growth, cloak/equipment migration with full expansion, armor and real weapon comparison, death-map marker lifecycle/current pickup caps, safe bulk storage and permanent separate city gates');
