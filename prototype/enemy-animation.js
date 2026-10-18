// Damage is resolved at the end of the readable bite wind-up, not its beginning.
export function biteAttack(n,dt,canHit,onHit,cooldown=1.3){if(n.hp<=0)return;if(n.attackWindup>0){n.attackWindup=Math.max(0,n.attackWindup-dt);if(n.attackWindup===0&&canHit)onHit();return}if(dt>0&&canHit&&n.cooldown===0){n.cooldown=cooldown;n.attackWindup=.18;n.cueAttack?.('bite',.45)}}
