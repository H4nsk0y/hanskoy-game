import assert from 'node:assert/strict';
import {createInventory,addItem,countItem,removeItem,moveItem} from '../inventory.js';
import {dropFor,respawnCandidates} from '../ecology.js';
import {CLASSES} from '../progress.js';
const slots=createInventory();slots[0]={id:'bow',count:1};assert(addItem(slots,'arrow',50));assert(moveItem(slots,0,7));assert.equal(slots[0],null);assert(moveItem(slots,7,0));assert(!moveItem(slots,6,0));assert(!moveItem(slots,0,1));assert(addItem(slots,'carcass',3));assert.equal(countItem(slots,'carcass'),3);assert(removeItem(slots,'carcass',3));assert(!removeItem(slots,'carcass'));assert.equal(countItem(slots,'carcass'),0);assert(moveItem(slots,6,17));assert.equal(countItem(slots,'arrow'),50);
for(let i=6;i<18;i++)slots[i]={id:'fang',count:1};assert(!addItem(slots,'carcass'));assert(addItem(slots,'fang'));
assert.equal(dropFor('hare',.59999),'carcass');assert.equal(dropFor('hare',.6),null);assert.equal(dropFor('wolf',.14999),'fang');assert.equal(dropFor('wolf',.15),null);assert.equal(dropFor('raven',0),null);
const mobs=Array.from({length:10},(_,i)=>({species:'hare',hp:i<6?0:10}));mobs.push({species:'wolf',hp:0});assert.equal(respawnCandidates(mobs,mobs[5]).length,0);mobs[6].hp=0;const raised=respawnCandidates(mobs,mobs[6]);assert.equal(raised.length,6);assert(!raised.includes(mobs[6]));assert(raised.every(n=>n.species==='hare'));assert.deepEqual(Object.values(CLASSES).map(c=>c.damage),[9.75,8.5,14]);console.log('PASS inventory restrictions, stacks/full bag, exact drop thresholds, independent 70% respawn, excluded last kill, damage reduction');
