import {Vector3} from './vendor/three.module.js';
export function raidEnemies(world){return (world?.raidEnemies||world?.mobs||[]).filter(n=>n.group==='raid'&&n.hp>0&&n.g?.visible!==false)}
export function renderRaidHud(document,world,camera){
 const label=document?.querySelector('#raid-count'),radar=document?.querySelector('#raid-minimap'),enemies=raidEnemies(world),active=!!world?.raidActive&&enemies.length>0;
 if(label){label.hidden=!active;label.textContent=active?'Налёт на Вальден · осталось врагов: '+enemies.length:''}
 if(!radar)return;radar.hidden=!active;if(!active){radar.innerHTML='';return}
 const x=v=>12+(v-2288)/224*176,z=v=>12+(v+244)/244*176,px=x(camera.position.x),pz=z(camera.position.z),direction=camera.getWorldDirection(new Vector3());
 const yaw=Math.atan2(direction.x,-direction.z)*180/Math.PI;
 radar.innerHTML='<strong>Налёт · красные точки — враги</strong><svg viewBox="0 0 200 200" role="img" aria-label="Карта оставшихся врагов рейда"><rect x="12" y="12" width="176" height="176" rx="3" fill="#17272c" stroke="#657579"/><path d="M100 22V180M22 101H178M57 45V158M143 45V158" stroke="#7b775c" stroke-width="5"/>'+enemies.map(n=>'<circle class="raid-dot" cx="'+x(n.g.position.x).toFixed(2)+'" cy="'+z(n.g.position.z).toFixed(2)+'" r="4" fill="#ff4545" stroke="#ffe0c0" stroke-width=".8"/>').join('')+'<path d="M0 -7L5 5L0 3L-5 5Z" fill="#83eaff" stroke="#e4fcff" transform="translate('+px+' '+pz+') rotate('+yaw+')"/></svg>';
}
