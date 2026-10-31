import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {cemetery} from '../cemetery.js';
import {maryBoneQuest} from '../mary-bone-quest.js';
import {ritualWorld} from '../ritual-world.js';
import {ritualQuest} from '../ritual-quest.js';
import {createProgress,reward} from '../progress.js';
import {createInventory,addItem,countItem,itemIcon} from '../inventory.js';
import {availableOffer,STOCK,buy} from '../commerce.js';
globalThis.document={querySelector:()=>({textContent:''})};
const camera=new T.PerspectiveCamera(),scene=new T.Scene();camera.position.set(-35,1.7,-100);
const world=cemetery({scene,camera,rand:()=>.1,resetMotion(){}}),p=createProgress(),slots=createInventory();let last,bags=[];
const q=maryBoneQuest({p,slots,world,bags:()=>bags,show:(name,text,choices=[])=>last={name,text,choices},close(){},sync(){q.tick()},sound(){},reward});
assert(!q.talk());assert(!availableOffer(p,STOCK.mary[1]));p.stage='bones_return';assert.equal(q.marker(),'!');q.talk();last.choices[0][1]();assert.equal(p.maryBoneQuest,'hunt');assert(q.objective().includes('правом'));world.travel();assert.equal(world.mobs.length,33);const keeper=world.mobs.find(n=>n.id==='bone-keeper');assert.equal(keeper.hp,320);assert(world.can(keeper.home.x,keeper.home.z));assert(keeper.g.children.some(o=>o.geometry?.type==='ConeGeometry'));
const saved=world.snapshot();const clone=cemetery({scene:new T.Scene(),camera,rand:()=>.1,resetMotion(){}});clone.setBoneQuest(true);clone.restore(saved);assert.deepEqual(clone.snapshot(),saved);
keeper.hp=0;world.killed(keeper);world.killed(keeper);assert.equal(world.drops.filter(d=>d.id==='great_bone').length,1);const drop=world.drops.find(d=>d.id==='great_bone');assert.equal(drop.g.scale.x,1.7);assert(itemIcon('great_bone').includes('#c2e2ff'));camera.position.copy(drop.g.position).setY(1.7);world.tick(.01,{onDamage(){},pickup:()=>false});assert.equal(world.drops.length,1);world.tick(.01,{onDamage(){},pickup:id=>addItem(slots,id)});q.tick();assert.equal(q.marker(),'?');assert(q.objective().includes('Отнесите'));assert.equal(p.stage,'bones_return','optional quest does not replace story');
q.talk();assert.equal(p.maryBoneQuest,'done');assert.equal(countItem(slots,'great_bone'),0);assert(availableOffer(p,STOCK.mary[1]));p.rewards.push('rabbit-quest');p.gold=100;assert.equal(buy(p,slots,'mary',1),'');assert.equal(countItem(slots,'return_bone'),1);const xp=p.xp;q.talk();assert.equal(p.xp,xp,'no repeat reward');
// Lost quest drop is recoverable, but a death bag must not duplicate it.
p.maryBoneQuest='hunt';bags=[{items:[{id:'great_bone',count:1}]}];q.tick();assert.equal(world.drops.length,0);bags=[];q.tick();assert.equal(world.drops.length,1);
const hut=ritualWorld({scene,camera,getPose:()=>({position:camera.position.toArray(),yaw:0,pitch:0}),setPose:v=>camera.position.fromArray(v.position)});hut.enter('hut');const torch=scene.getObjectByName('witch-green-torch');assert(torch);const bounds=new T.Box3().setFromObject(torch);assert(Math.abs(bounds.min.y)<.01,'torch grounded');assert(torch.children.some(o=>o.isPointLight&&o.color.g>o.color.r));assert(scene.children.some(g=>g.children.some(o=>o.geometry?.type==='BoxGeometry'&&o.position.y===6.1)),'ceiling');camera.position.set(124,1.7,-102);assert(hut.manaBurn());assert(!hut.warm());
// Leaving and reopening starts a fresh rune attempt; each accepted rune visibly advances.
const rp={...createProgress(),stage:'page_search'},rs=createInventory();let opened=0;const r=ritualQuest({p:rp,slots:rs,vitals:{hp:100,mana:100},world:{openChest(){opened++}},show:(name,text,choices=[])=>last={name,text,choices},close(){},sync(){},sound(){},reward});
r.chest();last.choices.find(c=>c[0]==='Луна')[1]();assert(last.name.includes('2 из 3'));assert(!last.choices.some(c=>c[0]==='Луна'));last.choices.find(c=>c[0]==='Отойти')[1]();r.chest();assert(last.name.includes('1 из 3'));for(const rune of ['Луна','Кость','Пламя'])last.choices.find(c=>c[0]===rune)[1]();assert.equal(opened,1);assert.equal(rp.stage,'page_return');assert.equal(countItem(rs,'ritual_page'),1);r.chest();assert.equal(countItem(rs,'ritual_page'),1);
console.log('PASS optional Mary quest/320HP keeper/unique bone/drop/save/full bag/lost item/shop gating; grounded green torch/ceiling; explicit rune progression/retry/one-time loot');
