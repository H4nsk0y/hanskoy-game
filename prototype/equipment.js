import {ITEMS} from './inventory.js';
import {maximum} from './player-stats.js';
export const HELMETS={sword:'chain_helmet',bow:'leather_helmet',mage:'cloth_hood'};
export function gearBonus(slots){const result={};for(const item of [...slots.slice(0,6),...slots.slice(18,21)]){const def=ITEMS[item?.id];if(def?.armor)result.armor=(result.armor||0)+def.armor;for(const [key,value] of Object.entries(def?.bonus||{})){result[key]=['hp','stamina','mana'].includes(key)?(result[key]||0)+value:(result[key]||1)*value}}return result}
// Armor protects from physical hits. Its efficiency falls gradually as levels rise.
export function armorFactor(gear,level=1){const armor=Math.max(0,gear.armor||0);return 1-Math.min(.55,armor/(armor+340+12*Math.max(0,level-1)))}
export function applyGear(v,before,after){for(const [key,field] of [['hp','maxHp'],['stamina','maxStamina'],['mana','maxMana']]){const oldFactor=key==='hp'?(before.hpMultiplier||1):1,newFactor=key==='hp'?(after.hpMultiplier||1):1;v[field]=((v[field]||100)/oldFactor-(before[key]||0)+(after[key]||0))*newFactor;v[key]=Math.min(v[key],maximum(v,key))}}
