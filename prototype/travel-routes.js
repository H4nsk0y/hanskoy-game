// Arrival is chosen by the edge travelled, never by the current quest stage.
const arrivals={'c3_fortress>c3_highroad':[6400,-28,0],'c3_highroad>c3_fortress':[4028,-38,Math.PI/2],'c3_highroad>c3_stonehaven':[6800,-28,0],'c3_stonehaven>c3_highroad':[6400,-279,Math.PI],'c3_stonehaven>c3_underworks':[7200,-28,0],'c3_underworks>c3_stonehaven':[6800,-249,Math.PI],
 'c2_road>c2_city':[2400,-28,0],'c2_city>c2_road':[2000,-226,Math.PI],
 'c2_city>c2_inn':[2800,-28,0],'c2_inn>c2_city':[2400,-215,Math.PI],
 'c2_inn>c2_manor':[3200,-27,0],
 'c2_manor>c2_inn':[2800,-173,Math.PI],
 'c2_city>c3_pass':[3600,-28,0],'c3_pass>c2_city':[2425,-206,Math.PI],
 'c3_pass>c3_fortress':[4000,-28,0],'c3_fortress>c3_pass':[3600,-250,Math.PI],
 'c3_fortress>c3_quarry':[4400,-34,0],'c3_quarry>c3_fortress':[4000,-198,Math.PI],
 'c3_fortress>c3_siege':[4800,-28,0],'c3_siege>c3_fortress':[3972,-38,-Math.PI/2],
 'c3_fortress>c3_marsh':[5200,-28,0],'c3_marsh>c3_fortress':[4070,-164,Math.PI/2],
 'c3_marsh>c3_abbey':[5600,-28,0],'c3_abbey>c3_marsh':[5200,-294,Math.PI],
 'c3_abbey>c3_aerie':[6000,-28,0],'c3_aerie>c3_abbey':[5600,-268,Math.PI]
};
export function travelPose(from,to){const a=arrivals[from+'>'+to];return a?{position:[a[0],1.7,a[1]],yaw:a[2],pitch:0}:undefined}
