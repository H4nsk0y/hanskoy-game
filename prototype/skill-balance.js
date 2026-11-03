// Fifty points over six skills: maxing every skill is deliberately impossible.
export const MAX_SKILL_RANK=10;
export const boundedRank=rank=>Math.max(1,Math.min(MAX_SKILL_RANK,rank||1));
export const rankDamage=rank=>1+.08*(boundedRank(rank)-1);
export const rankMilestones=rank=>Math.floor((boundedRank(rank)-1)/3);
export const shieldStun=rank=>Math.min(6,3+Math.floor(boundedRank(rank)/2));
export const executeThreshold=rank=>.10+.08*(boundedRank(rank)-1)/9;
export const invisibleDuration=rank=>60+6*(boundedRank(rank)-1);
export const bastionDuration=rank=>8+.5*rankMilestones(rank);
export const bastionReduction=rank=>Math.min(.48,.35+.015*(boundedRank(rank)-1));
export const skillCooldown=(spec,rank=1,multiplier=1)=>(spec.id==='blink'?Math.max(3.5,spec.cooldown*Math.pow(.9,boundedRank(rank)-1)):spec.cooldown*(1-.03*rankMilestones(rank)))*multiplier;
export const skillRange=rank=>13.5+2.7*(boundedRank(rank)-1);

export const whirlwindDuration=rank=>2.5+.1*(boundedRank(rank)-1);
export const whirlwindRadius=rank=>2.925*(1+.04*(boundedRank(rank)-1));
