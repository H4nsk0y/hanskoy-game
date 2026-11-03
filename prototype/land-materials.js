import * as T from './vendor/three.module.js';
const textures=new Map();
export function landTexture(kind){
 if(textures.has(kind))return textures.get(kind);
 const canvas=globalThis.document?.createElement?.('canvas'),c=canvas?.getContext?.('2d');if(!c)return null;
 canvas.width=canvas.height=256;let seed=811;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 const base={rock:'#6b7773',soil:'#535844',bark:'#605447',path:'#8b806b',reed:'#657a60'}[kind]||'#626d65';c.fillStyle=base;c.fillRect(0,0,256,256);
 for(let i=0;i<6200;i++){const light=rnd()>.5;c.fillStyle=light?'#c9c6a22a':'#101e2540';const x=rnd()*256,y=rnd()*256;c.fillRect(x,y,1+rnd()*5,1+rnd()*3)}
 if(kind==='rock'){for(let j=0;j<22;j++){const y=rnd()*256;c.strokeStyle=j%3?'#263335aa':'#b8bda866';c.lineWidth=1+rnd()*2;c.beginPath();c.moveTo(-8,y);for(let x=0;x<=264;x+=12)c.lineTo(x,y+Math.sin(x*.024+j)*6+Math.sin(x*.073+j)*2);c.stroke()}for(let i=0;i<200;i++){c.fillStyle=i%2?'#475b3b88':'#78906455';c.fillRect(rnd()*256,rnd()*256,2+rnd()*10,1+rnd()*5)}}
 if(kind==='bark'){for(let x=0;x<256;x+=7){c.strokeStyle=x%3?'#252b23aa':'#b49d6855';c.beginPath();c.moveTo(x,0);for(let y=0;y<=256;y+=8)c.lineTo(x+Math.sin(y*.025+x)*3,y);c.stroke()}}
 if(kind==='path'){for(const x of [65,185]){c.strokeStyle='#393c3377';c.lineWidth=11;c.beginPath();c.moveTo(x,0);for(let y=0;y<=256;y+=8)c.lineTo(x+Math.sin(y*Math.PI/128)*4,y);c.stroke()}}
 const map=new T.CanvasTexture(canvas);map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(kind==='rock'?3:2,kind==='bark'?3:2);map.colorSpace=T.SRGBColorSpace;map.magFilter=T.NearestFilter;textures.set(kind,map);return map;
}
export function landMaterial(kind,color=0xffffff){const map=landTexture(kind);return new T.MeshStandardMaterial({color,map,bumpMap:map,bumpScale:kind==='rock'?.22:.08,roughness:.95})}
