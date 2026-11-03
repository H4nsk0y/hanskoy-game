import * as T from './vendor/three.module.js';
import {C5_REGIONS} from './chapter-five-data.js';
import {nightSky} from './night-sky.js';
import {waygate} from './waygate.js';
export function c5CartPosition(progress){const t=Math.max(0,Math.min(1,progress));return [6400+Math.sin(t*Math.PI*2)*9,0,-58-t*205]}
export function buildChapterFive(a){const {root,zone,palette,mesh,box,wall,npc,enemy,fire,chest,point,torch}=a,r=C5_REGIONS[zone],x=r.x,stone=palette.material(13,0x798581,{tile:4}),wood=palette.material(12,0x9b8060,{tile:3}),roof=palette.material(14,0x455861,{tile:4}),bronze=palette.material(8,0xb28a57),warm=new T.MeshBasicMaterial({color:0xffc987});
 const floor=mesh(root,new T.PlaneGeometry(r.w,r.h),zone==='highroad'?palette.material(15,0x6a7668,{tile:55}):stone,x,-.03,-r.h/2);floor.rotation.x=-Math.PI/2;if(zone!=='underworks')nightSky(root,x,-r.h/2);root.add(new T.HemisphereLight(0x8faaa9,0x283c38,.9));
 waygate(root,x,-20,'c5-return');if(zone!=='underworks')waygate(root,x,-r.h+22,'c5-next');
 const sign=(xx,z,text)=>{box(root,xx,1.4,z,.12,2.8,.12,wood);box(root,xx,2.4,z,4,.8,.2,wood);if(typeof document==='undefined')return;const c=document.createElement('canvas');if(!c.getContext)return;c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#332b22';ctx.fillRect(0,0,512,128);ctx.fillStyle='#e4d2a3';ctx.font='bold 30px Georgia';ctx.textAlign='center';ctx.fillText(text,256,80);mesh(root,new T.PlaneGeometry(3.9,.75),new T.MeshBasicMaterial({map:new T.CanvasTexture(c)}),xx,2.4,z+.11)};
 const paving=(xx,z,w,d,mat=wood)=>{const m=mesh(root,new T.PlaneGeometry(w,d),mat,xx,.005,z);m.rotation.x=-Math.PI/2};
 const buildings=[];const building=(xx,z,w,d,h=5)=>{buildings.push([xx-w/2,z-d/2,w,d]);box(root,xx,h/2,z,w,h,d,stone);wall(xx,z,w,d,h);const top=mesh(root,new T.ConeGeometry(Math.hypot(w,d)*.56,3,4),roof,xx,h+1.4,z);top.rotation.y=Math.PI/4;for(const side of [-1,1])box(root,xx+side*w*.3,2.4,z+d/2+.08,.85,1.1,.1,warm);box(root,xx,1.25,z+d/2+.08,1.6,2.5,.12,wood)};
 if(zone==='highroad'){fire(x-13,-40);npc('c5-caravan','Обозница Борга',x+6,-54,'merchant',{race:'dwarf',woman:true,cloth:5});const cart=new T.Group();cart.name='c5-cart';cart.userData.dynamic=true;root.add(cart);cart.position.fromArray(c5CartPosition(0));box(cart,0,.8,0,2.8,.3,4,wood);for(const side of [-1,1])for(const zz of [-1.2,1.2]){const wheel=mesh(cart,new T.TorusGeometry(.6,.1,7,12),bronze,side*1.5,.6,zz);wheel.rotation.y=Math.PI/2}for(let i=0;i<4;i++)box(cart,(i%2-.5)*.9,1.3,Math.floor(i/2)-.5,.8,.8,.8,wood);
  for(let i=0;i<12;i++){const z=-80-i*15,side=i%2?1:-1;const m=mesh(root,new T.DodecahedronGeometry(4+i%3,0),stone,x+side*(31+i%4*8),2,z);m.scale.y=1.8;wall(m.position.x,z,0,0,9,3.5);if(i%3===0)torch(x+side*13,z)}
  for(let i=0;i<7;i++)enemy('c5-road-'+i,i%3===0?'c5_slinger':i===6?'c5_brute':'c5_raider',x-36+i%3*8,-170-Math.floor(i/3)*12,'c5-road');
  for(let i=0;i<8;i++)enemy('c5-farm-road-'+i,i%4===0?'c5_brute':i%3===0?'c5_wraith':'c5_raider',x+(i%2?1:-1)*(65+i%3*9),-65-Math.floor(i/2)*47,'c5-farm');
  npc('c5-hermit','Смотритель Вед',x+32,-99,'elder',{race:'dwarf',cloth:5});
  point('c5-axle',x+58,-140);const axle=box(root,x+58,.25,-140,.18,.18,2.6,bronze);axle.rotation.y=.4;
  for(const [i,[xx,z]] of [[-48,-174],[75,-99],[-63,-223]].entries()){point('c5-herb-'+i,x+xx,z);const flower=new T.MeshBasicMaterial({color:0x9cd6c9});for(let j=0;j<6;j++)mesh(root,new T.ConeGeometry(.12,.45,5),flower,x+xx+Math.sin(j*2)*.4,.25,z+Math.cos(j*2)*.4)}
  sign(x+8,-28,'РУДНЫЙ БРОД');sign(x-25,-152,'ЗАСТАВА');chest('c5-road-cache',x+72,-135,[{id:'gold',count:40},{id:'greater_healing',count:1}]);
 }
 if(zone==='stonehaven'){
  paving(x,-143,10,236,palette.material(15,0x7e7965,{tile:38}));
  for(const [xx,z,width] of [[-35,-63,60],[24,-76,48],[-36,-116,64],[39,-142,76],[-25,-181,50],[22,-207,44]])paving(x+xx,z,width,4,stone);
  // Low workshops, stalls and market goods break up the broad central street.
  for(const [i,[xx,z]] of [[-16,-66],[18,-91],[-21,-118],[25,-161],[-18,-191],[19,-222]].entries()){
   const canvas=new T.MeshStandardMaterial({color:i%2?0x5b4145:0x42595b,roughness:1,side:T.DoubleSide});
   box(root,x+xx,1,z,4,.25,2.2,wood);for(const dx of [-1.8,1.8])for(const dz of [-.85,.85])box(root,x+xx+dx,1.45,z+dz,.14,2.9,.14,wood);
   const awning=mesh(root,new T.PlaneGeometry(4.5,2.8),canvas,x+xx,3,z);awning.rotation.x=-Math.PI/2+.12;
   for(let j=0;j<3;j++)box(root,x+xx-1.2+j*1.1,1.3,z,.7,.4,.7,i%2?bronze:stone);
   for(let j=0;j<2;j++){const barrel=mesh(root,new T.CylinderGeometry(.5,.46,1.15,10),wood,x+xx+2.8,.575,z+j*1.4);mesh(root,new T.TorusGeometry(.49,.045,4,10),bronze,barrel.position.x,.8,barrel.position.z).rotation.x=Math.PI/2}
  }
  for(const [xx,z,w,d,h] of [[-31,-38,10,9,4],[32,-126,11,10,4.5],[-32,-224,12,10,4]])building(x+xx,z,w,d,h);
  for(const [xx,z] of [[-40,-89],[45,-175]]){paving(x+xx,z,15,12,palette.material(15,0x2c4435,{tile:4}));for(let i=0;i<5;i++)mesh(root,new T.IcosahedronGeometry(.7,0),roof,x+xx-5+i*2.5,.5,z+3)}
  fire(x-13,-42);for(const side of [-1,1]){box(root,x+side*119,4,-140,2,8,250,stone);wall(x+side*119,-140,2,250,8);for(const z of [-16,-264]){box(root,x+side*64,4,z,112,8,2,stone);wall(x+side*64,z,112,2,8)}}
  for(const [xx,z,w,d,h] of [[-68,-63,20,17,5],[49,-76,17,22,6],[-72,-116,23,17,5],[78,-142,18,21,7],[-51,-181,20,16,6],[44,-207,24,18,6],[-86,-225,19,15,5]])building(x+xx,z,w,d,h);
  const forge=mesh(root,new T.CylinderGeometry(3.7,4.2,1.2,12),bronze,x,.6,-123);mesh(root,new T.IcosahedronGeometry(1,1),warm,x,1.4,-123);wall(x,-123,0,0,2,4);for(const [xx,z] of [[-20,-77],[25,-158],[-25,-211]])torch(x+xx,z);
  npc('c5-mayor','Староста Дурн',x+8,-58,'elder',{race:'dwarf',cloth:6});npc('c5-smith','Кузнец Руна',x-56,-103,'smith',{race:'dwarf',woman:true,cloth:5});npc('c5-healer','Травница Сиэль',x+60,-119,'merchant',{race:'dusk',woman:true,cloth:6});npc('c5-engineer','Механик Тар',x-29,-149,'smith',{race:'dwarf',cloth:7});npc('c5-clerk','Приказчик Эрн',x+30,-192,'merchant',{cloth:4});npc('c5-witness','Повариха Нара',x-40,-195,'cook',{race:'dusk',woman:true,cloth:5});
  point('c5-ledger',x+39,-180);box(root,x+39,.8,-180,2,.15,1.2,wood);for(const dx of [-.8,.8])for(const dz of [-.4,.4])box(root,x+39+dx,.36,-180+dz,.13,.72,.13,wood);box(root,x+39,.94,-180,.6,.08,.7,warm);
  for(let i=0;i<12;i++)npc('c5-town-'+i,['Стражник Орек','Ткачиха Лиара','Рудокоп Бром','Подмастерье Йенс','Купец Тальвин','Стражница Хельга','Плавильщик Торн','Ткачиха Нэви','Рудокоп Эйн','Подмастерье Лот','Купец Рем','Стражница Фрей'][i],x+(i%2?1:-1)*(13+i%3*7),-80-Math.floor(i/2)*22,i%6===0||i%6===5?'guard':'citizen',{race:i%3===1?'dusk':'dwarf',woman:[1,5,7,11].includes(i),cloth:3+i%4});
  for(const [i,[xx,z]] of [[47,-183],[-49,-143]].entries()){point('c5-lamp-'+i,x+xx,z);box(root,x+xx,1.1,z,.22,2.2,.22,bronze);const lamp=box(root,x+xx,2.4,z,.65,.65,.65,new T.MeshBasicMaterial({color:0x334e4b}));lamp.name='c5-repair-lamp-'+i;lamp.userData.dynamic=true}
  sign(x-55,-92,'КУЗНИЦА РУНЫ');sign(x+61,-107,'ТРАВНИЦА');sign(x-30,-139,'МЕХАНИК');sign(x+9,-239,'НИЖНЯЯ ПЛАВИЛЬНЯ');chest('c5-town-cache',x-88,-205,[{id:'gold',count:35},{id:'greater_healing',count:1}]);
 }
 if(zone==='underworks'){box(root,x,8,-160,r.w,.3,r.h,stone);for(const side of [-1,1]){box(root,x+side*119,4,-160,2,8,300,stone);wall(x+side*119,-160,2,300,8)}for(const [z,gap] of [[-80,0],[-162,42],[-241,-42]]){for(const [lo,hi] of [[-118,gap-7],[gap+7,118]]){box(root,x+(lo+hi)/2,3.5,z,hi-lo,7,1,stone);wall(x+(lo+hi)/2,z,hi-lo,1,7)}}
  fire(x-14,-38);for(const [i,xx] of [-10,0,10].entries()){point('c5-valve-'+i,x+xx,-52);const lever=box(root,x+xx,1.1,-52,.15,1.5,.15,bronze);lever.rotation.z=.4;box(root,x+xx,.4,-52,1.3,.8,.8,stone)}sign(x,-42,'ПАР / ВОДА / ТЯГА');
  const gate=box(root,x,3,-80,13,6,.2,bronze);gate.name='c5-sluice-door';gate.userData.dynamic=true;
  for(const [i,[xx,z,role]] of [[-24,-107,'c5_raider'],[18,-119,'c5_slinger'],[-44,-139,'c5_shaman'],[39,-186,'c5_brute'],[-27,-210,'c5_wraith'],[84,-130,'c5_brute'],[-79,-190,'c5_slinger'],[24,-232,'c5_shaman']].entries())enemy('c5-works-'+i,role,x+xx,z,'c5-works');
  for(const z of [-65,-122,-185,-230,-283])for(const side of [-1,1])torch(x+side*93,z);
  for(const side of [-1,1]){box(root,x+62+side*6,2,-204,.3,4,18,bronze);wall(x+62+side*6,-204,.3,18,4)}const cellDoor=new T.Group();cellDoor.name='c5-cell-door';cellDoor.userData.dynamic=true;root.add(cellDoor);for(let xx=-6;xx<=6;xx+=.55)box(cellDoor,x+62+xx,2,-196,.07,4,.1,bronze);
  npc('c5-prisoner','Рудокоп Горн',x+62,-197.8,'citizen',{race:'dwarf',cloth:5});npc('c5-dusk-prisoner','Ткач Мирен',x+65,-199,'citizen',{race:'dusk',cloth:6});point('c5-cell',x+62,-193);point('c5-diversion',x-92,-217);box(root,x-92,1,-217,1.2,2,1.2,bronze);sign(x-88,-210,'СБРОС ПАРА');
  enemy('c5-overseer','c5_overseer',x,-278,'c5-boss');chest('c5-works-cache',x-96,-135,[{id:'gold',count:65},{id:'greater_healing',count:2}]);chest('c5-secret-cache',x+93,-280,[{id:'gold',count:80},{id:'strength_potion',count:1}]);
 }
 return {buildings};
}
