import {C3_REGIONS} from './chapter-three-scenery.js';
export function chapterWorldRouter(legacy,third){
 const current=()=>third.inside?third:legacy;
 return new Proxy({legacy,third,snapshot:()=>legacy.snapshot(),restore:s=>legacy.restore(s),setStory:s=>legacy.setStory(s),get zone(){return third.inside?'c3_'+third.mode:'c2_'+legacy.mode},enter(zone,pose){if(Object.hasOwn(C3_REGIONS,zone)){if(legacy.inside)legacy.leave();return third.enter(zone,pose)}if(third.inside)third.leave(false);return legacy.enter(zone,pose)},leave(back=true){return current().leave(back)}},{get(target,key,receiver){if(Reflect.has(target,key))return Reflect.get(target,key,receiver);const value=current()[key];return typeof value==='function'?value.bind(current()):value}});
}
