import {addItem,ITEMS} from './inventory.js';
export const STOCK={smith:[{id:'sword_fine',count:1,price:30},{id:'bow_fine',count:1,price:30},{id:'mage_fine',count:1,price:30},{id:'arrow',count:10,price:3}],mary:[{id:'mary_ale',count:1,price:5}]};
export const SELL={fang:5,carcass:3};
export function buy(p,slots,merchant,index){const offer=STOCK[merchant]?.[index];if(!p.rewards.includes('rabbit-quest')||!offer)return 'Магазин пока закрыт.';if((p.gold||0)<offer.price)return 'Недостаточно золота.';const copy=slots.map(i=>i?{...i}:null);if(!addItem(copy,offer.id,offer.count))return 'Освободите место в сумке.';slots.splice(0,slots.length,...copy);p.gold=(p.gold||0)-offer.price;return ''}
export function sell(p,slots,index){const item=slots[index],price=SELL[item?.id];if(!p.rewards.includes('rabbit-quest')||index<6||!price)return 'Этот предмет не продаётся.';item.count--;if(!item.count)slots[index]=null;p.gold=(p.gold||0)+price;return ''}
export const weaponClass=id=>ITEMS[id]?.weaponClass||(['sword','bow','mage'].includes(id)?id:null);
export const weaponMultiplier=id=>ITEMS[id]?.damageMultiplier||1;
