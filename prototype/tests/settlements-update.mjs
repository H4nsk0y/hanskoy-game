import {hutUnlocked} from '../ritual-quest.js';
import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {travelPose} from '../travel-routes.js';
import {chapterThreeWorld} from '../chapter-three-world.js';
import {chapterThreeQuest} from '../chapter-three-quest.js';
import {chapterTwoWorld} from '../chapter-two-world.js';
import {orderErrand} from '../order-errand.js';
import {createProgress,reward} from '../progress.js';
import {createInventory,addItem,removeItem,countItem,ITEMS,itemIcon} from '../inventory.js';
import {STOCK,availableOffer,craftCloak} from '../commerce.js';
import {gearBonus} from '../equipment.js';
import {VALDEN_HOUSES} from '../valden-layout.js';
import {mapDescription} from '../map-atlas.js';
import {lootModel} from '../loot-visuals.js';

T.TextureLoader.prototype.loadAsync=async()=>new T.Texture();
globalThis.document={querySelector:()=>({}),createElement:()=>({})};
const camera=new T.PerspectiveCamera(),make=()=>chapterThreeWorld({scene:new T.Scene(),camera,rand:()=>.99,setPose:pose=>{camera.position.fromArray(pose.position);camera.rotation.set(pose.pitch,pose.yaw,0)}});
const world=make(),p={...createProgress(),stage:'chapter_three',classId:'mage',level:20,rewards:['c3-arrival','c3-scout']},slots=createInventory();
const q=chapterThreeQuest({p,slots,world,show(){},close(){},sync(){},sound(){},reward,shop(){}});
q.restore({stage:'quarry'});world.enter('fortress');camera.position.set(4000,1.7,-20);assert(q.interact());assert.equal(world.mode,'pass');assert.deepEqual(camera.position.toArray(),[3600,1.7,-250],'Order return uses the far pass gate');
world.lightBeacon();camera.position.set(3600,1.7,-258);assert(q.interact());assert.equal(world.mode,'fortress');assert.deepEqual(camera.position.toArray(),[4000,1.7,-28]);
p.stage='chapter_four';q.restore({stage:'done',fourth:{stage:'c4_crossing'}});camera.position.set(4000,1.7,-20);assert(q.interact());assert.equal(world.mode,'pass');assert.equal(camera.position.z,-250,'same correct arrival in chapter four');
for(const [a,b,z] of [['c3_quarry','c3_fortress',-198],['c3_abbey','c3_marsh',-294],['c3_aerie','c3_abbey',-268]])assert.equal(travelPose(a,b).position[2],z);

world.enter('fortress');assert(world.free(4050,-139,.4),'awarded house is walkable');assert(world.map('fortress').markers.some(m=>m[3]?.startsWith('Ваш дом')));camera.position.set(4046,1.7,-136);const action=world.action();assert.equal(action.type,'storage');action.chest.storage[0]={id:'mana_potion',count:3};
camera.position.set(4054,1.7,-143);assert.equal(world.action().type,'storage');world.action().chest.storage[0]={id:'bone',count:8};
const saved=world.snapshot(),copy=make();copy.restore(saved);assert.deepEqual(copy.snapshot().chests,saved.chests);assert.equal(copy.storedItems().filter(Boolean).length,2);copy.setStory({lodging:false});assert(!copy.free(4050,-139,.4),'house stays locked before rewards');

let choices=[];const errand=orderErrand({p,slots,show:(name,text,options=[])=>choices=options,close(){},sync(){},sound(){},reward,shop(){},changed(){}});assert(errand.talk('Бертольд'));choices.find(([label])=>label==='Собрать три свёртка')[1]();for(let i=0;i<3;i++)assert(errand.take(i));assert(!errand.take(0));assert.equal(countItem(slots,'order_parcel'),3);removeItem(slots,'order_parcel');errand.talk('Бертольд');assert(errand.take(2),'permanently lost parcel can be recovered');assert.equal(countItem(slots,'order_parcel'),3);errand.talk('Бертольд');choices.find(([label])=>label==='Отдать три свёртка')[1]();assert.equal(p.orderErrand,'done');assert.equal(countItem(slots,'order_parcel'),0);assert.equal(countItem(slots,'cloak_travel_mage'),1);assert(!errand.talk('Бертольд'));

for(const classId of ['sword','bow','mage']){const offers=STOCK.city_smith.filter(o=>ITEMS[o.id].setVariant&&availableOffer({...p,classId},o));assert(offers.length>=8);assert(offers.every(o=>ITEMS[o.id].classId===classId&&o.price>=65));assert(!STOCK.smith.some(o=>ITEMS[o.id].setVariant),'advanced sets are not sold cheaply by village smith');}
const crafter={...createProgress(),classId:'bow',gold:100},bag=createInventory();addItem(bag,'bear_hide',2);addItem(bag,'fang',4);assert.equal(craftCloak(crafter,bag),'');assert.equal(crafter.gold,92);assert.equal(countItem(bag,'cloak_travel_bow'),1);const before=JSON.stringify(bag);assert(craftCloak(crafter,bag));assert.equal(JSON.stringify(bag),before,'failed craft is atomic');
assert(gearBonus([{id:'set_pyromancer_helmet',count:1}]).attackDamage>1);

world.enter('marsh');for(const [role,item] of [['drowned','bog_iron'],['hag','witch_moss'],['harpy','harpy_feather']]){const n=world.mobs.find(n=>n.role===role);assert(n);n.hp=0;world.killed(n);assert(world.snapshot().drops.some(d=>d.id===item));assert(itemIcon(item).includes('<path'));assert(lootModel(new T.Group(),item).children.length>0);}
const cityScene=new T.Scene(),city=chapterTwoWorld({scene:cityScene,camera,rand:()=>.99,setPose:pose=>camera.position.fromArray(pose.position)});city.enter('city');camera.position.set(2425,1.7,-214);assert.equal(city.prompt(),'E — Чёрный перевал');camera.position.set(2316,1.7,-56);assert(!city.free(camera.position.x,camera.position.z,.35));assert(city.ensurePosition());assert(city.free(camera.position.x,camera.position.z,.35));const data=city.map('city');assert(data.buildings.length>=16);assert(VALDEN_HOUSES.filter(([x])=>x<0).some(([x,z])=>!VALDEN_HOUSES.some(([xx,zz])=>xx===-x&&zz===z)));assert(city.citizens.filter(n=>n.zone==='city').every(n=>city.free(n.home.x,n.home.z,.35)),'citizens relocated out of changed buildings');
assert(mapDescription({chapterTwo:city},'c2_city','c2_city').markers.some(m=>m[3]==='Северная дозорная башня'));
console.log('PASS real chapter3/4 return gates, bidirectional arrivals, walkable/locked house and two persistent stores, peaceful parcel quest/cloak, specialist class sets, atomic cloak craft, unique swamp drops/models and asymmetric accessible Valden');

assert(!hutUnlocked({stage:'witch',rewards:[]}));assert(hutUnlocked({stage:'page_search',rewards:[]}));assert(hutUnlocked({stage:'chapter_four',rewards:['bones-quest']}),'witch house stays accessible after advancing the story');

let cityLights=0;cityScene.traverseVisible(n=>{if(n.isPointLight)cityLights++});assert(cityLights<=11,'Valden stays within original ten-lantern plus campfire light budget');
