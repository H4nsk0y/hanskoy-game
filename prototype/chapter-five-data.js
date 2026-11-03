export const C5_REGIONS={
 highroad:{x:6400,w:260,h:310,name:'Каменный разъезд',entry:[6400,1.7,-28],boundary:'rock'},
 stonehaven:{x:6800,w:260,h:280,name:'Рудный Брод',entry:[6800,1.7,-28],boundary:'city'},
 underworks:{x:7200,w:240,h:320,name:'Нижняя плавильня',entry:[7200,1.7,-28],boundary:'cave'}
};
export const C5_STATS={c5_raider:{hp:420,damage:35,level:30},c5_slinger:{hp:370,damage:33,level:31},c5_shaman:{hp:410,damage:32,level:32},c5_brute:{hp:660,damage:42,level:33},c5_wraith:{hp:460,damage:37,level:33},c5_overseer:{hp:2600,damage:43,level:34}};
export const C5_COMBAT={c5_raider:'soldier',c5_slinger:'marksman',c5_shaman:'cantor',c5_brute:'knight',c5_wraith:'hag',c5_overseer:'baron'};
export const C5_STAGES=['idle','road','escort','assault','arrival','investigate','accuse','sluice','rescue','boss','boss_loot','escape','return','report','done'];
export const C5_LINKS={fortress:[[4034,-38,'highroad']],highroad:[[6400,-20,'fortress'],[6400,-288,'stonehaven']],stonehaven:[[6800,-20,'highroad'],[6800,-258,'underworks']],underworks:[[7200,-20,'stonehaven']]};
