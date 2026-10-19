import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {chapter} from '../chapter.js';
import {lichDungeon} from '../lich-dungeon.js';
class Element{constructor(){this.children=[];this.style={};this.dataset={};this.classList={add(){},remove(){}};this.hidden=false;this.textContent=''}set innerHTML(v){this.children=[]}append(...v){this.children.push(...v)}prepend(v){this.children.unshift(v)}addEventListener(){}}
function run(){const nodes={},events={};globalThis.innerWidth=1280;globalThis.innerHeight=720;globalThis.document={querySelector:s=>nodes[s]??=new Element(),createElement:()=>new Element(),addEventListener:(k,f)=>events[k]=f,exitPointerLock(){}};const scene=new T.Scene(),camera=new T.PerspectiveCamera();camera.position.set(0,1.7,0);const npc=(x,z)=>{const g=new T.Group();g.position.set(x,0,z);scene.add(g);return {g}};const guard=npc(0,0),residents=[npc(20,0),npc(30,0),npc(40,0)],wolf=npc(0,-1.8),wildlife=[npc(50,0),npc(60,0)];const vitals={hp:100,mana:100,stamina:50};let active=true,time=0;const keys=new Set();const dungeon=lichDungeon({scene,camera,vitals,setPose:p=>camera.position.fromArray(p.position)});dungeon.enter('lich');const c=chapter({dungeon,random:()=>.99,scene,camera,guard,residents,wolf,wildlife,vitals,keys,active:()=>active,started:()=>true,time:()=>time,audio:()=>null,muted:()=>true,pause:()=>active=false,resume:()=>active=true,blocked:()=>false});
c.p.classId='mage';c.slots[0]={id:'mage',count:1};
camera.position.set(700,1.7,-100);camera.lookAt(700,3,-140);camera.updateMatrixWorld(true);c.tick(.01);
assert.equal(nodes['#enemy'].hidden,false,'Lich health visible beyond 25 metres before first hit');
time=2;events.mousedown({button:0,target:{tagName:'CANVAS'}});for(let i=0;i<100;i++){time+=.02;c.tick(.02)}
assert(dungeon.boss.hp<570,'actual mage projectile aimed at visible Lich torso causes damage');assert(nodes['#enemy'].textContent.includes(String(Math.ceil(dungeon.boss.hp))));
console.log('PASS player projectile hits Lich torso at 40 metres and boss HP bar updates');}run();

