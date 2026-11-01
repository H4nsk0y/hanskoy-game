import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {createInventory,isBagSlot,countItem,addItem,inventoryError} from '../inventory.js';
import {buy,STOCK} from '../commerce.js';
import {transferStack,transferLoot,receiveLoot} from '../storage.js';
import {chapterThreeWorld} from '../chapter-three-world.js';
T.TextureLoader.prototype.loadAsync=async()=>new T.Texture();globalThis.document={querySelector:()=>({}),createElement:()=>({})};
const p={classId:'mage',stage:'chapter_three',gold:10000,rewards:[],bagTier:0},slots=createInventory();assert.equal(buy(p,slots,'city_leather',STOCK.city_leather.findIndex(o=>o.id==='backpack_3')),'');assert.equal(slots.length,38);
for(let i=6;i<18;i++)slots[i]={id:'fang',count:1};const storage=Array(18).fill(null);storage[0]={id:'health_potion',count:2};assert(transferStack(storage,0,slots,6));assert.equal(slots[20].id,'health_potion');assert.equal(storage[0],null);slots[20]=null;
const camera=new T.PerspectiveCamera(),w=chapterThreeWorld({scene:new T.Scene(),camera,setPose:p=>camera.position.fromArray(p.position)});w.enter('quarry');camera.position.set(4467,1.7,-115);const c=w.openChest(w.action().chest);assert(c);
const take=index=>{let result;const ok=w.takeChestItem(c,index,item=>{result=receiveLoot(p,slots,item);return result.amount});return {ok,...result}};
assert(addItem(slots,'order_tonic',4));assert.equal(countItem(slots,'order_tonic'),4);const tonicIndex=c.contents.findIndex(i=>i.id==='order_tonic');let r=take(tonicIndex);assert(r.ok);assert.equal(r.amount,1);assert.equal(countItem(slots,'order_tonic'),5);assert.equal(c.contents[tonicIndex].count,1);assert(r.error.includes('5 боевых настоек'));assert(!r.error.includes('свободных'));r=take(tonicIndex);assert(!r.ok);assert.equal(c.contents[tonicIndex].count,1);
// An uncapped potion goes into the last expansion slot even with every other bag cell full.
for(let i=6;i<slots.length;i++)if(isBagSlot(i))slots[i]={id:'fang',count:1};slots[37]=null;c.contents.push({id:'mana_potion',count:3});r=take(c.contents.length-1);assert(r.ok);assert.equal(slots[37].id,'mana_potion');assert.equal(slots[37].count,3);assert.equal(slots[18],null);assert.equal(slots[19],null);
c.contents.push({id:'health_potion',count:2});const before=JSON.stringify(c.contents);r=take(c.contents.length-1);assert(!r.ok);assert(r.error.includes('свободных ячеек'));assert.equal(JSON.stringify(c.contents),before);const gold=p.gold;c.contents.push({id:'gold',count:25});assert(take(c.contents.length-1).ok);assert.equal(p.gold,gold+25);
const saved=w.snapshot(),restored=chapterThreeWorld({scene:new T.Scene(),camera:new T.PerspectiveCamera(),setPose(){}});restored.restore(saved);assert.deepEqual(restored.snapshot().chests,saved.chests,'leftover is saved');
const simple={contents:[{id:'fang',count:3}]};assert(!transferLoot(simple,0,()=>false));assert.equal(simple.contents[0].count,3);assert(transferLoot(simple,0,()=>true));assert.equal(simple.contents.length,0);
console.log('PASS purchased largest bag: home and mine chest expanded slots including last slot; partial capped tonic pickup, correct limit/full messages, full-bag gold, no lost/duplicated loot and saved leftovers');
