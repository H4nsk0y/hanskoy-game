import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {chapterThreeWorld} from '../chapter-three-world.js';
import {chapterFiveQuest} from '../chapter-five-quest.js';
import {createProgress,reward} from '../progress.js';
import {createInventory,addItem,countItem} from '../inventory.js';
import {c5CartPosition} from '../chapter-five-scenery.js';
import {validateChapterThree} from '../chapter-three-save.js';
import {chapterThreeQuest} from '../chapter-three-quest.js';
import {validMapPin,waypointDirection} from '../map-atlas.js';
T.TextureLoader.prototype.loadAsync=async()=>new T.Texture();globalThis.document={querySelector:()=>({append(){}}),createElement:()=>({style:{},children:[],append(...n){this.children.push(...n)},remove(){}})};
const finite=(n,min=-1e9,max=1e9)=>Number.isFinite(n)&&n>=min&&n<=max,vector=a=>Array.isArray(a)&&a.length===3&&a.every(Number.isFinite);
for(const route of ['escort','assault'])for(const approach of ['quiet','fight']){
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(),p={...createProgress(),stage:'chapter_four',classId:'mage',level:30,rewards:['c4-final','c3-arrival','c3-scout']},slots=createInventory();let choices=[];
 const world=chapterThreeWorld({scene,camera,rand:()=>.99,setPose:pose=>{camera.position.fromArray(pose.position);camera.rotation.set(pose.pitch,pose.yaw,0)}}),show=(n,text,c=[])=>choices=c;
 const q=chapterFiveQuest({p,slots,world,camera,show,close(){},sync(){},sound(){},reward,shop(){},lootMenu(){}});
 const select=text=>{const choice=choices.find(([label])=>label===text);assert(choice,text);choice[1]()},talk=id=>{const n=world.citizens.find(n=>n.id==='c3-'+id);assert(n,id);camera.position.copy(n.home).setY(1.7);assert(q.interact());};
 assert(q.begin());assert.equal(p.stage,'chapter_five');world.enter('fortress');camera.position.set(4034,1.7,-38);assert(q.interact());assert.equal(world.mode,'highroad');talk('c5-caravan');select(route==='escort'?'Проведу обоз':'Выбью заставу силой');
 if(route==='escort'){let paused=false;for(let i=0;i<400&&q.state.stage==='escort';i++){const point=c5CartPosition(q.state.cart);camera.position.fromArray(point).setY(1.7);if(world.groupAlive('c5-escort')){const before=q.state.cart;q.tick(.2);assert.equal(q.state.cart,before);paused=true;for(const n of [...world.mobs].filter(n=>n.group==='c5-escort')){n.hp=0;world.killed(n)}}q.tick(.5)}assert(paused);assert.equal(q.state.waves,2)}else{for(const n of [...world.mobs].filter(n=>n.group==='c5-road')){n.hp=0;world.killed(n)}q.tick(0)}
 assert(q.state.roadOpen);camera.position.set(6400,1.7,-288);q.interact();assert.equal(world.mode,'stonehaven');assert.equal(world.mobs.length,0,'new town is safe');talk('c5-mayor');assert.equal(q.state.stage,'investigate');
 camera.position.set(6839,1.7,-180);q.interact();talk('c5-witness');talk('c5-engineer');q.tick(0);assert.equal(q.state.stage,'accuse');talk('c5-clerk');select('Книга поддельная, работников запирают. Где они?');assert(q.state.permit);
 camera.position.set(6800,1.7,-258);q.interact();assert.equal(world.mode,'underworks');assert(!world.free(7200,-100,.4));camera.position.set(7210,1.7,-52);q.interact();assert.equal(q.state.valve,0);for(let i=0;i<3;i++){camera.position.set(7190+i*10,1.7,-52);q.interact()}assert.equal(q.state.stage,'rescue');assert(world.free(7200,-100,.4));
 camera.position.set(7262,1.7,-193);q.interact();select(approach==='quiet'?'Открою сброс пара, уходите':'Сначала разберусь с Морканом');assert(q.state.freed);
 if(approach==='quiet'){camera.position.set(7108,1.7,-217);q.interact();assert(q.state.diverted);assert(world.mobs.some(n=>n.stun===45))}else{const boss=world.findActor('c5_overseer');assert(boss.g.visible);boss.hp=0;world.killed(boss);q.tick(0);assert.equal(q.state.stage,'boss_loot');assert(addItem(slots,'c5_seal'));q.tick(0);assert.equal(q.state.stage,'escape')}
 camera.position.set(7200,1.7,-20);q.interact();q.tick(0);assert.equal(world.mode,'stonehaven');assert.equal(q.state.stage,'return');talk('c5-mayor');assert.equal(q.state.stage,'report');if(approach==='fight')assert.equal(countItem(slots,'mage_warden'),1);
 camera.position.set(6800,1.7,-20);q.interact();camera.position.set(6400,1.7,-20);q.interact();assert.equal(world.mode,'fortress');talk('commander');assert.equal(q.state.stage,'done');assert(p.rewards.includes('c5-report'));const gold=p.gold;talk('commander');assert.equal(p.gold,gold);
 const snapshot=world.snapshot(),copy=chapterThreeWorld({scene:new T.Scene(),camera,rand:()=>.99,setPose(){}});copy.restore(snapshot);assert.deepEqual(copy.snapshot(),snapshot,'full new-world roundtrip');
 const full={world:{inside:false},chapter:{p,chapterThree:{stage:'done',signalWave:2,defenseWave:2,workers:[0,1,2],powder:[0,1,2],side:'freed',prepared:true,fifth:q.snapshot()}},chapterThree:snapshot,player:{position:camera.position.toArray()}};
 validateChapterThree(full,(value)=>assert(value,'new chapter save field'),finite,vector,a=>{assert(vector(a.position));assert(finite(a.hp))});
 assert(validMapPin({zone:'c3_stonehaven',x:6800,z:-100}));assert(waypointDirection('forest',{zone:'c3_underworks',x:7200,z:-150},p));
 console.log('PASS chapter5 '+route+' / '+approach+': gated permanent travel, hostile escort pauses, evidence, valves, rescue, optional boss, unique rewards, safe town, maps and full save roundtrip');
}

// Enter through the actual chapter4 dialogue, not only the chapter5 constructor.
{const camera=new T.PerspectiveCamera(),p={...createProgress(),stage:'chapter_four',classId:'mage',level:30,rewards:['c4-final','c3-scout']},slots=createInventory();let choices=[];const world=chapterThreeWorld({scene:new T.Scene(),camera,rand:()=>.99,setPose:pose=>camera.position.fromArray(pose.position)}),q=chapterThreeQuest({p,slots,world,camera,show:(n,t,c=[])=>choices=c,close(){},sync(){},sound(){},reward,shop(){},lootMenu(){}});q.restore({stage:'done',signalWave:2,defenseWave:2,workers:[0,1,2],powder:[0,1,2],side:'freed',prepared:true,fourth:{stage:'c4_done',chains:[0,1,2],braziers:[0,1,2],egg:'purify',side:'done'}});world.enter('fortress');camera.position.copy(world.citizens.find(n=>n.id==='c3-commander').home).setY(1.7);assert(q.interact());const next=choices.find(([s])=>s==='Отправиться к Рудному Броду');assert(next);next[1]();assert.equal(p.stage,'chapter_five');assert(q.objective().includes('Боргой'));assert.equal(q.snapshot().fifth.stage,'road');}
console.log('PASS real chapter4 completion dialogue unlocks chapter5 without losing earlier progress');
