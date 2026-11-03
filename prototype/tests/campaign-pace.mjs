import assert from 'node:assert/strict';
import {createProgress,reward} from '../progress.js';
import {killExperience} from '../leveling.js';
// Full mandatory populations plus quest rewards, without repeat farming or optional XP.
const p={...createProgress(),level:11,rewards:['witch-quest']};let serial=0;
function kills(count,level,species='soldier'){for(let i=0;i<count;i++)reward(p,'pace-'+serial++,'monster',killExperience(p,{species,level,chapterTwo:true}))}
const quest=(id,xp)=>reward(p,id,'quest',xp),levels=[];
kills(6,12);quest('c2-road',350);quest('c2-letter',300);kills(5,13);quest('c2-courier',450);kills(8,15);kills(1,16,'vampire');quest('c2-vampire',850);quest('c2-order',250);levels.push(p.level);assert(p.level>=14&&p.level<=16);
kills(12,18);kills(6,18);quest('c3-beacon',650);quest('c3-arrival',650);assert(p.level>=16&&p.level<=18);kills(1,20,'order-enemy-captain');quest('c3-scout',850);kills(11,19);quest('c3-workers',800);kills(20,22);kills(1,23,'baron');quest('c3-baron',1500);levels.push(p.level);assert(p.level>=20&&p.level<=23);
kills(15,24,'drowned');quest('c4-chains',1300);kills(12,26,'sentinel');kills(1,27,'abbess');quest('c4-elsa',1200);quest('c4-egg',700);kills(1,29,'ashwing');quest('c4-final',2400);levels.push(p.level);assert(p.level>=25&&p.level<=29);
assert.equal(killExperience(p,{species:'soldier',level:18,chapterTwo:true}),0,'early mobs cannot sustain overlevel farming');
console.log('PASS story-route XP without forced overlevel: chapter endings '+levels.join(' / ')+'; optional quests/farming remain available for harder fights');
