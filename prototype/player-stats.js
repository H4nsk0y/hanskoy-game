export function maximum(v,key){return v[{hp:'maxHp',stamina:'maxStamina',mana:'maxMana'}[key]]||100}
export function upgradeStat(p,v,key){if(!['hp','stamina','mana'].includes(key)||!(p.pendingLevels>0))return false;const field={hp:'maxHp',stamina:'maxStamina',mana:'maxMana'}[key];v[field]=maximum(v,key)+10;v[key]=Math.min(v[field],v[key]+10);p.pendingLevels--;return true}
export function regenerate(v,dt,{campfire=false,multiplier=1}={}){const hpRate=(campfire?2*1.15:.5)*multiplier;v.hp=Math.min(maximum(v,'hp'),v.hp+hpRate*dt);v.mana=Math.min(maximum(v,'mana'),v.mana+hpRate*1.2*dt)}
export function drinkAle(v){v.hp=Math.min(maximum(v,'hp'),v.hp+45);v.stamina=maximum(v,'stamina');v.mana=Math.min(maximum(v,'mana'),v.mana+maximum(v,'mana')*.5)}
