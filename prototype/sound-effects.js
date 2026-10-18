export const SOUND_IDS=['sword','fireball','bow','volley','ice','witch-laugh','witch-pool','witch-kill','troll-aggro'];
// Separate media voices let the witch's victory line finish while Web Audio is suspended.
export function soundEffects({muted=()=>false,makeAudio=url=>new Audio(url)}={}){
 const templates=new Map(SOUND_IDS.map(id=>{const a=makeAudio(new URL('./assets/sfx-'+id+'.mp3',import.meta.url).href);a.preload='auto';return [id,a]})),voices=new Set();
 function stop(includeVictory=false){for(const v of [...voices])if(includeVictory||v.id!=='witch-kill'){v.audio.pause();voices.delete(v)}}
 function play(id){if(muted()||!templates.has(id))return;const voiceOnly=['witch-laugh','witch-pool','witch-kill'].includes(id);if(voiceOnly)for(const v of [...voices])if(v.id.startsWith('witch-')){v.audio.pause();voices.delete(v)}
 const matching=[...voices].filter(v=>v.id===id);if(matching.length>=4){matching[0].audio.pause();voices.delete(matching[0])}
 const audio=templates.get(id).cloneNode(),v={id,audio};audio.volume=id.startsWith('witch-')?.9:.75;audio.muted=muted();voices.add(v);const clean=()=>voices.delete(v);audio.onended=clean;audio.onerror=clean;try{const result=audio.play();result?.catch(clean)}catch{clean()}}
 return {play,stop,syncMute(){for(const v of voices)v.audio.muted=muted()}};
}
