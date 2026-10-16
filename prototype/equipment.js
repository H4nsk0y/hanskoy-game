import {maximum} from './player-stats.js';
export const HELMETS={sword:'chain_helmet',bow:'leather_helmet',mage:'cloth_hood'};
export function gearBonus(slots){return ({chain_helmet:{hp:15,physical:.92},leather_helmet:{stamina:15,staminaRegen:1.2},cloth_hood:{mana:10,manaCost:.95,manaRegen:1.05}})[slots[2]?.id]||{}}
export function applyGear(v,before,after){for(const [key,field] of [['hp','maxHp'],['stamina','maxStamina'],['mana','maxMana']]){v[field]=maximum(v,key)-(before[key]||0)+(after[key]||0);v[key]=Math.min(v[key],v[field])}}
