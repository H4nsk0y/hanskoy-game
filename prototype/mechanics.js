export const movementSpeed=(running,multiplier=1)=>(running?6.25:2.8)*multiplier;
export function stepVitals(v,dt,{running=false,jump=false,regenMultiplier=1,jumpMultiplier=1}={}){const recovering=Math.max(0,dt-(v.staminaDelay||0));v.staminaDelay=Math.max(0,(v.staminaDelay||0)-dt);if(jump&&v.stamina>=15&&v.height===0){v.velocity=5.8*Math.sqrt(jumpMultiplier);v.stamina-=15}v.stamina=Math.max(0,Math.min(v.maxStamina||100,v.stamina+(running?-22*dt:13*regenMultiplier*recovering)));v.velocity-=16*dt;v.height=Math.max(0,v.height+v.velocity*dt);if(v.height===0)v.velocity=0;return v}
export function wolfMode(player,home){return Math.hypot(player.x-home.x,player.z-home.z)<home.radius?'attack':'return'}
export function hurt(v,amount){v.hp=Math.max(0,v.hp-amount);return v.hp===0}
