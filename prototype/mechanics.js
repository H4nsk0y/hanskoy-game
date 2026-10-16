export function stepVitals(v,dt,{running=false,jump=false,regenMultiplier=1}={}){if(jump&&v.stamina>=15&&v.height===0){v.velocity=5.8;v.stamina-=15}v.stamina=Math.max(0,Math.min(v.maxStamina||100,v.stamina+(running?-22:13*regenMultiplier)*dt));v.velocity-=16*dt;v.height=Math.max(0,v.height+v.velocity*dt);if(v.height===0)v.velocity=0;return v}
export function wolfMode(player,home){return Math.hypot(player.x-home.x,player.z-home.z)<home.radius?'attack':'return'}
export function hurt(v,amount){v.hp=Math.max(0,v.hp-amount);return v.hp===0}
