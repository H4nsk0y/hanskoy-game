import assert from 'node:assert/strict';
import {chapterStory,cryptUnlocked} from '../chapter-story.js';
import {createProgress,reward,QUEST_GOLD,objective} from '../progress.js';
import {createInventory,countItem,itemIcon} from '../inventory.js';
import {comparison,equipmentStats} from '../equipment-view.js';
const p=createProgress(),slots=createInventory();p.classId='mage';let last,dialogCount=0;
const dungeon={mode:'lich',boss:{hp:0},nearRemains:()=>true},cemetery={nearStoryGrave:()=>true};
const q=chapterStory({p,slots,dungeon,cemetery,show:(name,text)=>{last={name,text};dialogCount++},sync(){},sound(){},reward});
assert(!cryptUnlocked(p));p.stage='ritual_done';reward(p,'ritual-purified','quest',75);assert(cryptUnlocked(p));assert.equal(p.gold,12);const xp=p.xp;reward(p,'ritual-purified','quest',75);assert.equal(p.gold,12);assert.equal(p.xp,xp);
q.tick();assert.equal(p.stage,'lich_relic');assert(last.text.includes('печать'));q.tick();assert.equal(dialogCount,1,'death scene once');for(let i=6;i<18;i++)slots[i]={id:'fang',count:1};q.claim();assert.equal(p.stage,'lich_relic');assert.equal(p.gold,12);slots[6]=null;q.claim();assert.equal(p.stage,'lich_return');assert.equal(countItem(slots,'memory_medallion'),1);assert.equal(p.gold,32);q.claim();assert.equal(p.gold,32);assert(itemIcon('memory_medallion').includes('ellipse'));
q.talk();assert.equal(p.stage,'grave_search');assert(q.prompt().includes('могилу'));q.grave();assert.equal(p.stage,'grave_return');q.talk();assert.equal(p.stage,'chapter_complete');assert.equal(p.gold,40);q.talk();assert.equal(p.gold,40);assert(objective(p).includes('Джоном'));
const old={...createProgress(),rewards:['witch-quest'],gold:0};assert.equal(reward(old,'witch-quest','quest'),false);assert.equal(old.gold,0,'no retroactive grant');for(const [id,gold] of Object.entries(QUEST_GOLD)){const fresh=createProgress();reward(fresh,id,'quest',0);assert.equal(fresh.gold,gold);reward(fresh,id,'quest');assert.equal(fresh.gold,gold)}
const bag=createInventory();bag[0]={id:'mage',count:1};const before=equipmentStats(p,bag).damage;assert(comparison('mage_fine',bag,p).includes('Урон: +'));bag[0]={id:'mage_fine',count:1};assert.equal(equipmentStats(p,bag).damage,before*1.25);assert(comparison('chain_helmet',bag,p).includes('Не подходит'));
console.log('PASS chapter finale, full-bag recovery, one-time quest gold, legacy rewards, medallion, grave and equipment comparisons');
