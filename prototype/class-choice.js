import {CLASSES} from './progress.js';
import {CLASS_BASES} from './player-stats.js';
import {ATTACK_COST,BOW_DRAW_SECONDS,bowShotDamageMultiplier} from './combat-rules.js';
const details={sword:{icon:'⚔',distance:'Ближняя',features:'Меч и щит. Блокирование — ПКМ. Сильнее защищён от физических атак, но уязвим к магии.'},bow:{icon:'➶',distance:'Дальняя',features:'Стреляет на ходу; натяжение замедляет движение. Скорость +15%, прыжок +12%. Получает 350 стрел.'},mage:{icon:'⚚',distance:'Средняя',features:'Посох с огненными шарами. Для обычного выстрела нужно остановиться. Навыки расходуют магию.'}};
const number=value=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(value);
const incoming=value=>{const percent=Math.round((value-1)*100);return percent===0?'0%':(percent>0?'+':'−')+Math.abs(percent)+'%'};
export function classChoiceData(id){const c=CLASSES[id],base=CLASS_BASES[id],info=details[id];if(!c||!base||!info)return null;return {id,name:c.name,icon:info.icon,distance:info.distance,rows:[
 ['Базовые характеристики','Здоровье: '+base.hp+' · Выносливость: '+base.stamina+' · Магия: '+base.mana],
 ['Базовый урон',number(c.damage)+(id==='bow'?' (от '+number(c.damage*bowShotDamageMultiplier(0))+' до '+number(c.damage*bowShotDamageMultiplier(BOW_DRAW_SECONDS))+' по силе натяжения)':'')],
 ['Цена обычной атаки',ATTACK_COST[id]+' '+(id==='mage'?'магии':'выносливости')+(id==='bow'?' и 1 стрела':'')],
 ['Входящий урон','физический '+incoming(c.incoming)+' · магический '+incoming(id==='sword'?1.2:c.incoming)],
 ['Восстановление в секунду','здоровье '+number(.5*c.regen*(c.healthRegen||1))+' · выносливость '+number(13*c.stamina)+' · магия '+number(.5*2.16*c.regen)],
 ['Особенности',info.features]
 ]}}
export function renderClassChoices(document,parent,onChoose){parent.classList?.add?.('class-picker');for(const id of ['sword','bow','mage']){const data=classChoiceData(id),button=document.createElement('button');button.type='button';button.className='class-choice';button.dataset.classId=id;button.textContent=data.icon+' '+data.name;const distance=document.createElement('span');distance.className='class-distance';distance.textContent='Дистанция: '+data.distance;button.append(distance);for(const [label,value] of data.rows){const row=document.createElement('p');row.className='class-attribute';row.textContent=label+': '+value;button.append(row)}button.onclick=()=>onChoose(id);parent.append(button)}}
