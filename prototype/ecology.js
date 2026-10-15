export const DROP_CHANCES={hare:.6,wolf:.15};
export function dropFor(species,roll=Math.random()){return roll<(DROP_CHANCES[species]||0)?(species==='hare'?'carcass':'fang'):null}
export function respawnCandidates(mobs,last){const population=mobs.filter(n=>n.species===last.species);const dead=population.filter(n=>n.hp<=0);return dead.length>=Math.ceil(population.length*.7)?dead.filter(n=>n!==last):[]}
