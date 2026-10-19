import {ITEMS} from './inventory.js';
import {maximum} from './player-stats.js';
export const HELMETS={sword:'chain_helmet',bow:'leather_helmet',mage:'cloth_hood'};
export function gearBonus(slots){const result={};for(const item of [...slots.slice(0,6),...slots.slice(18,20)]){for(const [key,value] of Object.entries(ITEMS[item?.id]?.bonus||{})){result[key]=['hp','stamina','mana'].includes(key)?(result[key]||0)+value:(result[key]||1)*value}}return result}
export function applyGear(v,before,after){for(const [key,field] of [['hp','maxHp'],['stamina','maxStamina'],['mana','maxMana']]){const oldFactor=key==='hp'?(before.hpMultiplier||1):1,newFactor=key==='hp'?(after.hpMultiplier||1):1;v[field]=((v[field]||100)/oldFactor-(before[key]||0)+(after[key]||0))*newFactor;v[key]=Math.min(v[key],maximum(v,key))}}
