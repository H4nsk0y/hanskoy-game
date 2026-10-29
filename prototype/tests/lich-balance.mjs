import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {lichDungeon} from '../lich-dungeon.js';
globalThis.document={querySelector:()=>({})};const camera=new T.PerspectiveCamera();let roll=.9;
const d=lichDungeon({scene:new T.Scene(),camera,vitals:{hp:100,maxHp:100},rand:()=>roll,setPose:p=>camera.position.fromArray(p.position)});d.enter('lich');camera.position.set(700,1.7,-115);
const events={onDamage(){},onSound(){},onSlow(){}};
function ready(hp,windup=0){const s=d.snapshot();s.mobs=[];s.shots=[];s.boss.hp=hp;s.boss.position=[700,0,-140];s.boss.aggro=camera.position.toArray();s.boss.cooldown=0;s.boss.attackWindup=windup;s.summonReady=40;s.teleportReady=20;s.armorReady=20;s.armorLeft=0;d.restore(s)}
ready(570);d.tick(.01,events);assert.equal(d.boss.cooldown,1.5);ready(285);d.tick(.01,events);assert.equal(d.boss.cooldown,1.5,'phase begins below half');ready(284);d.tick(.01,events);assert.equal(d.boss.cooldown,1.25,'20 percent faster attack frequency');
ready(570,.01);d.tick(.01,events);let shots=d.snapshot().shots;assert.equal(shots.length,3);assert(shots.every(s=>s.damage===30&&!s.ice));assert(shots[0].velocity[0]*shots[2].velocity[0]<0,'opposing fan directions');assert(Math.abs(shots[1].velocity[0])<.001);const save=d.snapshot();d.restore(save);assert.deepEqual(d.snapshot().shots,save.shots);
roll=.1;ready(284,.01);d.tick(.01,events);shots=d.snapshot().shots;assert.equal(shots.length,1,'ice remains single projectile');assert(shots[0].ice);
const s=d.snapshot();s.armorReady=0;d.restore(s);d.tick(.01,events);assert.equal(d.snapshot().armorReady,35);assert.equal(d.snapshot().armorLeft,10);assert.equal(d.receive(d.boss,100,'magic'),70);const old=d.snapshot();old.armorReady=55;d.restore(old);assert.equal(d.snapshot().armorReady,35,'old saves adopt new maximum cooldown');
console.log('PASS Lich fan, unchanged ice, phase threshold/attack rate, armor cooldown and save roundtrip');
let phases=0;ready(284);const phaseStart=d.snapshot();phaseStart.phaseAnnounced=false;d.restore(phaseStart);d.tick(.01,{...events,onPhase:()=>phases++});assert.equal(phases,1);const phaseSave=d.snapshot();d.restore(phaseSave);d.tick(.01,{...events,onPhase:()=>phases++});assert.equal(phases,1,'phase dialogue not repeated after loading');
