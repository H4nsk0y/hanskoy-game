import {CHAPEL} from './flooded-chapel.js';
import * as T from './vendor/three.module.js';
export function storyDirection(p,ctx,camera){
 const at=n=>n?.g?[n.g.position.x,n.g.position.z]:null,stage=p.stage;
 if(stage==='kingdom_road')return [0,-118];
 let zone='forest',point=null;
 if(['safe','offer','armed','report','delivery','hunter_return','witch_return','kingdom_letter'].includes(stage))point=at(ctx.guard);
 else if(stage==='smith')point=at(ctx.residents?.[0]);
 else if(['complete','mary_offer','water_return'].includes(stage))point=at(ctx.residents?.[2]);
 else if(['bones_talk','bones_return','page_return','trial_ready','trial_return','lich_return','grave_return','chapel_return','chapel_witness'].includes(stage))point=at(ctx.residents?.[1]);
 else if(stage==='water')point=[-18,-69];else if(stage==='ambush')point=at(ctx.encounter?.mobs?.find(n=>n.hp>0))||[-18,-69];else if(stage==='wolf')point=at(ctx.wolf);
 else if(['forest','carcasses','hunter_travel','hunter_search','hunter_talk','witch','page_search'].includes(stage)){zone='deep';point=stage.startsWith('hunter')?at(ctx.world?.hunter):stage==='witch'||stage==='page_search'?at(ctx.world?.witch):at(ctx.world?.mobs?.find(n=>n.species==='hare'&&n.hp>0));point??=[240,-95]}
 else if(stage==='bones_collect'){zone='cemetery';point=at(ctx.cemetery?.mobs?.find(n=>n.hp>0))||[-330,-110]}
 else if(stage==='lich_relic'){zone='lich';point=at(ctx.dungeon?.boss)||[700,-140]}
 else if(stage==='grave_search'){zone='cemetery';point=[-330,-174]}
 else if(['chapel_travel','chapel_echoes','chapel_choice','chapel_ghost','chapel_ectoplasm'].includes(stage)){zone='chapel';point=stage==='chapel_ghost'?at(ctx.chapel?.mobs?.find(n=>n.species==='ghost'))||[1000,-87]:stage==='chapel_ectoplasm'?[1000,-87]:stage==='chapel_echoes'?(()=>{const p=CHAPEL.echoes.find((_,i)=>!ctx.chapel?.found?.[i])||CHAPEL.bell;return [p[0],p[2]]})():[1000,-158]}
 if(!point)return null;const here=ctx.currentZone?.()||'forest';if(here===zone)return point;if(here==='deep')return [240,-45];if(here==='cemetery')return zone==='chapel'?[-330,-189]:zone==='dungeon'||zone==='lich'?[-330,-109]:[-330,-43];if(here==='chapel')return [1000,-71];if(here==='home')return [65,-90.5];if(here==='hut')return stage==='page_search'?[118,-103]:[120,-95];if(here==='dungeon')return zone==='lich'?[480,-156]:[480,-60];if(here==='lich')return [700,-96];return zone==='deep'?[35,-100]:zone==='cemetery'||zone==='chapel'||zone==='dungeon'||zone==='lich'?[-35,-100]:point;
}
export function questDirection(camera,{color=0xffdc88,labelId='#quest-distance',name='quest-indicator'}={}){
 // A separate orthographic pass keeps the indicator independent of the world,
 // camera pitch, fog, occlusion and first-person weapon rendering.
 const hud=new T.Scene(),view=new T.OrthographicCamera(-640,640,360,-360,.1,100);view.position.z=10;
 const shape=new T.Shape();shape.moveTo(0,.7);shape.lineTo(.48,.12);shape.lineTo(.17,.12);shape.lineTo(.17,-.6);shape.lineTo(-.17,-.6);shape.lineTo(-.17,.12);shape.lineTo(-.48,.12);shape.closePath();
 const materials=[color,color===0xffdc88?0x846239:0x234d7c].map(color=>new T.MeshBasicMaterial({color,depthTest:false,depthWrite:false,fog:false,side:T.DoubleSide}));
 const mesh=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.15,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.04,bevelThickness:.025}),materials);mesh.name=name;mesh.frustumCulled=false;mesh.visible=false;mesh.userData.questIndicator=true;hud.add(mesh);
 return {tick(target,shift=0){const rect=globalThis.document?.querySelector('#quest')?.getBoundingClientRect?.(),label=globalThis.document?.querySelector(labelId);mesh.visible=!!target&&!!rect;if(label)label.hidden=!mesh.visible;if(!mesh.visible)return;
 const dx=target[0]-camera.position.x,dz=target[1]-camera.position.z,forward=camera.getWorldDirection(new T.Vector3()),bearing=Math.atan2(dx,-dz)-Math.atan2(forward.x,-forward.z),width=globalThis.innerWidth||1280,height=globalThis.innerHeight||720;
 view.left=-width/2;view.right=width/2;view.top=height/2;view.bottom=-height/2;view.updateProjectionMatrix();const px=Math.max(24,Math.min(width-24,rect.right-25+shift)),py=Math.min(height-70,rect.bottom+28);
 mesh.position.set(px-width/2,height/2-py,0);mesh.scale.setScalar(23);mesh.rotation.set(-.35,0,-bearing);mesh.userData.distance=Math.round(Math.hypot(dx,dz));if(label){label.textContent=mesh.userData.distance+' м';label.style.left=px+'px';label.style.top=(py+22)+'px'}
 },render(renderer){if(!mesh.visible)return;const previous=renderer.autoClear;renderer.autoClear=false;try{renderer.clearDepth();renderer.render(hud,view)}finally{renderer.autoClear=previous}}};
}
