import {Vector3} from './vendor/three.module.js';
import {MAP_REGIONS,mapDescription,mapLinks} from './map-atlas.js';
import {raidEnemies} from './raid-hud.js';

export function deathMarkers(bags,zone){return (bags||[]).filter(b=>b.zone===zone&&(b.gold>0||b.items?.length)).map(b=>({x:b.position[0],z:b.position[2]}))}

// A north-up schematic uses the same bounds and geometry as the full map.
// It reuses one SVG and updates at four Hz, without another WebGL context.
export function minimap({document,ctx,p,camera,bags,zone}){
 if(!document.body?.append)return {tick(){},refresh(){}};
 const root=document.createElement('aside');root.id='minimap';root.setAttribute('aria-label','Мини-карта');
 const title=document.createElement('strong'),image=document.createElement('div');
 root.hidden=true;root.append(title,image);document.body.append(root);
 let previous=null,data=null,wait=0;const direction=new Vector3();
 function tick(dt){wait-=dt;if(wait>0)return;wait=.25;const current=zone(),def=MAP_REGIONS[current];root.hidden=p.minimapVisible===false||!def||!!ctx.started&&!ctx.started();if(root.hidden)return;
  if(current!==previous){previous=current;data=mapDescription(ctx,current,current);title.textContent=def.name;}
  const [bx,bz,w,h]=def.bounds,scale=172/Math.max(w,h),ox=100-w*scale/2,oz=100-h*scale/2;
  const x=v=>(ox+(v-bx)*scale).toFixed(2),z=v=>(oz+(v-bz)*scale).toFixed(2);
  const rect=([px,pz,pw,ph],color)=>`<rect x="${x(px)}" y="${z(pz)}" width="${(pw*scale).toFixed(2)}" height="${(ph*scale).toFixed(2)}" fill="${color}"/>`;
  const dot=(px,pz,color,r=3)=>`<circle cx="${x(px)}" cy="${z(pz)}" r="${r}" fill="${color}" stroke="#18222b"/>`;
  camera.getWorldDirection(direction);const yaw=Math.atan2(direction.x,-direction.z)*180/Math.PI;
  const world=ctx.chapterTwo?.legacy||ctx.chapterTwo;
  image.innerHTML='<svg viewBox="0 0 200 200" role="img" aria-label="Карта местности"><rect x="2" y="2" width="196" height="196" rx="4" fill="#14222a" stroke="#7a8066"/>'+rect([bx,bz,w,h],'#263d3c')+
   (data.islands||[]).map(i=>`<circle cx="${x(i.x)}" cy="${z(i.z)}" r="${i.r*scale}" fill="#566a54"/>`).join('')+
   (data.floors||[]).map(r=>rect(r,'#837c5b')).join('')+(data.buildings||[]).map(r=>rect(r,'#a18e73')).join('')+
   mapLinks(current,p).map(i=>dot(i.x,i.z,'#c2a2ef')).join('')+
   (current==='c2_city'?raidEnemies(world):[]).map(n=>dot(n.g.position.x,n.g.position.z,'#ff4545',4)).join('')+
   deathMarkers(bags(),current).map(b=>`<path d="M0 -6L5 0L0 6L-5 0Z" fill="#ffd577" stroke="#fff2cb" transform="translate(${x(b.x)} ${z(b.z)})"/>`).join('')+
   (p.mapWaypoint?.zone===current?dot(p.mapWaypoint.x,p.mapWaypoint.z,'#65b4ff',4):'')+
   `<path d="M0 -7L5 5L0 3L-5 5Z" fill="#9af4ff" stroke="#e4fcff" transform="translate(${x(camera.position.x)} ${z(camera.position.z)}) rotate(${yaw})"/></svg>`;
 }
 return {tick,refresh(){previous=null;wait=0}};
}
