export const MUSIC_TRACKS={standard:'Hanskoy.mp3',cemetery:'music-cemetery.mp3',order:'music-order.mp3',dungeons:'music-dungeons.mp3',dragon:'music-dragon-boss.mp3',city:'music-city.mp3'};
export function musicTrack(zone,{dungeon=false}={}){
 if(zone==='c3_aerie')return 'dragon';
 if(dungeon||['dungeon','lich','admin','trial','c3_quarry'].includes(zone))return 'dungeons';
 if(zone==='cemetery')return 'cemetery';
 if(zone==='c3_fortress')return 'order';
 if(zone==='c2_city')return 'city';
 return 'standard';
}
// Only the current track and, briefly, its fading predecessor are loaded.
export function locationMusic({makeAudio=url=>new Audio(url),onError=()=>{}}={}){
 let key='standard',current=null,previous=null,fade=1,playing=false,muted=false,volume=.35;
 function create(){const a=makeAudio(new URL('./assets/'+MUSIC_TRACKS[key],import.meta.url).href);a.preload='none';a.loop=true;a.muted=muted;a.volume=volume;return a}
 function release(a){if(!a)return;a.pause();a.removeAttribute?.('src');a.load?.()}
 function levels(){if(current)current.volume=volume*fade;if(previous)previous.volume=volume*(1-fade)}
 function play(){playing=true;current??=create();return Promise.resolve(current.play())}
 return {play,pause(){playing=false;current?.pause();release(previous);previous=null;fade=1;levels()},get paused(){return !playing||!!current?.paused},get muted(){return muted},set muted(value){muted=!!value;if(current)current.muted=muted;if(previous)previous.muted=muted},get volume(){return volume},set volume(value){volume=Math.max(0,Math.min(1,value));levels()},get track(){return key},update(zone,options){const next=musicTrack(zone,options);if(next===key)return;key=next;release(previous);previous=null;if(!current)return;if(!playing){release(current);current=null;fade=1;return}previous=current;current=create();fade=0;levels();Promise.resolve(current.play()).catch(onError)},tick(dt){if(fade>=1)return;fade=Math.min(1,fade+Math.max(0,dt)/1.2);levels();if(fade===1){release(previous);previous=null}}};
}
