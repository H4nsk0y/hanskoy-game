export const EARLY_BOSS_HP={hunter:120,witch:330,lich:820,ghost:240};
export function rebalanceBoss(n){const hp=EARLY_BOSS_HP[n?.species];if(hp&&n.maxHp!==hp){n.hp=Math.max(0,Math.min(1,n.hp/n.maxHp))*hp;n.maxHp=hp}}
