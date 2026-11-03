import {ITEMS,canEquip} from './inventory.js';
import {gearBonus,armorFactor} from './equipment.js';
import {CLASSES} from './progress.js';
import {weaponClass,weaponMultiplier} from './commerce.js';
import {scaledDamage} from './combat-rules.js';
export function equipmentStats(p,slots){const c=CLASSES[p.classId]||{damage:0,incoming:1,regen:1,stamina:1},g=gearBonus(slots);return {damage:weaponClass(slots[0]?.id)===p.classId&&p.classId?scaledDamage(c.damage,p.level)*weaponMultiplier(slots[0]?.id)*(g.attackDamage||1):0,physical:(1-c.incoming*(g.physical||1)*armorFactor(g,p.level))*100,magic:(1-(p.classId==='sword'?1.2:c.incoming)*(g.magic||1))*100,hp:.5*c.regen,mana:.5*c.regen*2.16*(g.manaRegen||1),stamina:13*c.stamina*(g.staminaRegen||1)}}
export function equipmentSummary(p,slots){const s=equipmentStats(p,slots);return `Броня: ${gearBonus(slots).armor||0} · Урон: ${s.damage.toFixed(1)} · крит: ${p.classId==='bow'?'10% / 25% стоя':'10%'} (×2)\nЗащита: физическая ${s.physical.toFixed(1)}%, магическая ${s.magic.toFixed(1)}% (отрицательная — уязвимость)\nВосстановление в секунду вне боя: HP ${s.hp.toFixed(2)} · магия ${s.mana.toFixed(2)} · выносливость ${s.stamina.toFixed(1)}. У костров быстрее; HP — через 3 с без урона.`}
export function comparison(id,slots,p){const item=ITEMS[id];if(item?.slot===undefined)return itemDetails(id,p,slots);const index=item.slot==='cloak'?20:item.slot==='ring'?(slots[18]?19:18):item.slot;if(!canEquip(id,index,p.classId))return 'Не подходит вашему классу.';const old=slots[index],base=equipmentStats(p,slots),copy=slots.map(i=>i?{...i}:null);copy[index]={id,count:1};const after=equipmentStats(p,copy),changes=[];for(const [k,label] of [['damage','Урон'],['physical','Физ. защита, п.п.'],['magic','Маг. защита, п.п.'],['mana','Магия/с'],['stamina','Выносливость/с']]){const delta=after[k]-base[k];if(Math.abs(delta)>.001)changes.push(label+': '+(delta>0?'+':'')+delta.toFixed(2))}return itemDetails(id,p,slots)+'\nСейчас надето: '+(old?ITEMS[old.id].name:'пустой ячейки')+(old?'\nСейчас: '+itemDetails(old.id,p,slots):'')+'\n'+(changes.join(' · ')||'Урон и защита не меняются; остальные свойства указаны выше.')}

export function itemDetails(id,p={},slots=[]){
 const item=ITEMS[id];if(!item)return 'Неизвестный предмет';
 const labels={attackDamage:'Наносимый урон',experience:'Опыт за убийства',hp:'Здоровье',stamina:'Выносливость',mana:'Магия',physical:'Получаемый физический урон',magic:'Получаемый магический урон',manaCost:'Расход магии',skillCost:'Стоимость способностей',skillCooldown:'Перезарядка способностей',manaRegen:'Восстановление магии',staminaRegen:'Восстановление выносливости',speed:'Скорость движения',attackSpeed:'Скорость атаки',hpMultiplier:'Максимум здоровья'};
 const lines=[];if(item.itemLevel)lines.push('Уровень предмета: '+item.itemLevel);
 const category={craft:'Предмет для крафта',quest:'Предмет для задания',sale:'Предмет для продажи'}[item.category];if(category)lines.push(category);
 const classId=weaponClass(id);if(classId)lines.push('Урон: '+(scaledDamage(CLASSES[classId].damage,p.level||1)*weaponMultiplier(id)*(gearBonus(slots).attackDamage||1)).toFixed(1));
 if(item.armor)lines.push('Броня: '+item.armor);
 for(const [key,value] of Object.entries(item.bonus||{})){const flat=['hp','mana','stamina'].includes(key),v=flat?value:Math.round((value-1)*100);lines.push((labels[key]||key)+': '+(v>0?'+':'')+v+(flat?'':'%'));}
 if(item.category==='quest'&&item.description)lines.push(item.description);if(item.hint)lines.push(item.hint);else if(!item.category&&!classId&&!item.bonus&&item.description)lines.push(item.description);
 if(item.category==='sale')lines.push('Можно продать торговцу.');
 return lines.join('\n');
}
