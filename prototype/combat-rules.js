// Shared combat rules: durations are simulation seconds, unaffected by menus.
export const ROLL={duration:.5,start:.08,end:.38,cost:20,cooldown:.8,speed:8};
export const SKILLS={sword:{name:'Удар щитом',icon:'🛡',cost:25,cooldown:15,resource:'stamina',description:'15 урона, оглушение на 3 с. Дальность меча.'},bow:{name:'Залп',icon:'➶',cost:40,cooldown:17,resource:'stamina',description:'Три прямые стрелы, расход одной. Скорость +30%, дальность 156 м.'},mage:{name:'Ледяная стрела',icon:'❄',cost:20,cooldown:12,resource:'mana',description:'Урон огненного шара +10%. Движение и атаки цели −50% на 7 с.'}};
export function skillPoints(level,rank=0){return Math.max(0,Math.floor((level-1)/3)-rank)}
export function scaledDamage(base,level){return base*(1+.05*(level-1))}
export function criticalDamage(amount,roll=Math.random()){return amount*(roll<.1?2:1)}
export function blockHit(amount,type,v,guard){if(type==='hazard'||!guard.held||guard.broken)return amount;const enough=v.stamina>=15,reduction=enough?(type==='magic'?.33:.6):Math.min(v.stamina/100,1);v.stamina=Math.max(0,v.stamina-15);if(!enough)guard.broken=true;return amount*(1-reduction)}
export function statusStep(n,dt){const stunned=Math.min(dt,n.stun||0);n.stun=Math.max(0,(n.stun||0)-dt);const available=dt-stunned,slowed=Math.min(available,Math.max(0,(n.slow||0)-stunned));n.slow=Math.max(0,(n.slow||0)-dt);return available-slowed*.5}
