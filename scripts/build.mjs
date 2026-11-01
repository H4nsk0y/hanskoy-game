import {mkdir,copyFile,readdir,writeFile,readFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),source=path.join(root,'prototype'),dest=path.join(root,'dist');
await mkdir(path.join(dest,'assets'),{recursive:true});await mkdir(path.join(dest,'vendor'),{recursive:true});
const files=['location-music.js','raid-hud.js','map-atlas.js','world-map.js','enemy-audio.js','index.html','game.js','chapter.js','models.js','assets.js','mechanics.js','progress.js','inventory.js','player-stats.js','ecology.js','deep-forest.js','lake-encounter.js','actor-state.js','save-game.js','persistence.js','equipment.js','navigation.js','storage.js','boss-combat.js','combat-rules.js','surface-textures.js','commerce.js','rounded-geometry.js','enemy-animation.js','troll.js','sound-effects.js','cemetery.js','skeletons.js','respawn.js','torches.js','ritual-world.js','ritual-quest.js','lich-dungeon.js','save-extensions.js','chapter-story.js','equipment-view.js','journey.js','flooded-chapel.js','chapel-quest.js','abilities.js','ability-state.js','admin-arena.js','chapel-ghost.js','loot-visuals.js','mary-bone-quest.js','item-models.js','view-controls.js','leveling.js','chapter-two-models.js','chapter-two-batching.js','chapter-two-combat.js','chapter-two-world.js','chapter-two-quest.js','chapter-two-save.js','chapter-two-atmosphere.js','chapter-two-wildlife.js','chapter-two-town.js','quest-direction.js','night-sky.js','inventory-discard.js','boss-hud.js','lightning-effect.js','chapter-four-scenery.js','chapter-four-models.js','chapter-four-quest.js','city-navigation.js','chapter-three-models.js','chapter-three-combat.js','chapter-three-scenery.js','chapter-three-world.js','chapter-three-quest.js','chapter-three-save.js','chapter-world-router.js'];
const contents=await Promise.all(files.map(file=>readFile(path.join(source,file),'utf8')));
const version=createHash('sha256').update(contents.join('\n')).digest('hex').slice(0,12);
for(let i=0;i<files.length;i++)await writeFile(path.join(dest,files[i]),contents[i].replace(/(['"])(\.\/[^'"\n]+\.js)\1/g,(_,quote,url)=>quote+url+'?v='+(url.includes('/vendor/')?'three-0.170.0':version)+quote));
const unused=new Set(['волк.png','ворон.png','заяц.png','кузнец.png','стражник.png','могильщик.png','деревенская_женщина_три_ракурса.png']);
const assetFiles=await readdir(path.join(source,'assets'));
for(const file of assetFiles){const skip=unused.has(file)||(file.endsWith('.png')&&assetFiles.includes(file.replace(/\.png$/,'.webp')));if(skip)await rm(path.join(dest,'assets',file),{force:true});else await copyFile(path.join(source,'assets',file),path.join(dest,'assets',file));}
for(const file of ['three.module.js','LICENSE'])await copyFile(path.join(source,'vendor',file),path.join(dest,'vendor',file));
await writeFile(path.join(dest,'.nojekyll'),'');console.log('Static game built in dist/');
