// Isolated UI fixtures, never imported by the normal game entry point.
import {campaign as c,camera,residents,vitals,world} from '../game.js';
import {addItem} from '../inventory.js';
const scenario=new URLSearchParams(location.search).get('scenario');
if(scenario==='mary'){c.p.stage='mary_offer';camera.position.copy(residents[2].g.position);camera.position.z+=2;camera.position.y=1.7}
if(scenario==='lake'){c.p.stage='water';addItem(c.slots,'jug_empty');camera.position.set(-18,1.7,-63.5)}
if(scenario==='reward'){c.p.stage='water_return';addItem(c.slots,'jug_water');camera.position.copy(residents[2].g.position);camera.position.z+=2;camera.position.y=1.7;vitals.hp=40;vitals.stamina=20;vitals.mana=20}
if(scenario==='level'){c.p.level=2;c.p.pendingLevels=1;camera.position.set(0,1.7,-85)}
if(scenario==='campfire'){world.travel(c.p);camera.position.set(240,1.7,-115);vitals.hp=30;vitals.mana=30}
