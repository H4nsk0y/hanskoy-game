import assert from 'node:assert/strict';
import {stat} from 'node:fs/promises';
import {SOUND_IDS,soundEffects} from '../sound-effects.js';
let muted=false;const clones=[];const makeAudio=url=>({url,cloneNode(){const a={url,paused:false,play(){return Promise.resolve()},pause(){this.paused=true}};clones.push(a);return a}});const fx=soundEffects({muted:()=>muted,makeAudio});
for(const id of SOUND_IDS)assert((await stat(new URL('../assets/sfx-'+id+'.mp3',import.meta.url))).size>1000);
fx.play('sword');fx.play('witch-kill');fx.stop();assert(clones[0].paused);assert(!clones[1].paused,'victory survives menu pause');muted=true;fx.syncMute();assert(clones[1].muted);const count=clones.length;fx.play('bow');assert.equal(clones.length,count,'mute blocks new sounds');muted=false;fx.syncMute();assert(!clones[1].muted);fx.stop(true);assert(clones[1].paused,'loading stops old victory');for(let i=0;i<5;i++)fx.play('fireball');assert(clones[2].paused,'bounded polyphony');
console.log('PASS nine MP3 assets, mute/unmute, bounded voices, victory through pause and cleanup on loading');
