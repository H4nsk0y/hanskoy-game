import * as T from './vendor/three.module.js';
// Old road-stones: a carved arch, iron lamps and a faint mist, without a neon ring.
export function waygate(parent,x,z,name='waygate'){
 const g=new T.Group();g.position.set(x,0,z);g.name=name;parent.add(g);
 const stone=new T.MeshStandardMaterial({color:0x535e61,roughness:.96}),iron=new T.MeshStandardMaterial({color:0x332e28,roughness:.85});
 const add=(geometry,material,px,py,pz)=>{const m=new T.Mesh(geometry,material);m.position.set(px,py,pz);g.add(m);return m};
 for(const side of [-1,1]){for(let i=0;i<5;i++){const m=add(new T.BoxGeometry(.72,.56,1),stone,side*2.2,.28+i*.55,0);m.rotation.y=side*(i%2?.035:-.025)}add(new T.BoxGeometry(1,.22,1.2),stone,side*2.2,.1,0);
  add(new T.BoxGeometry(.38,.6,.35),iron,side*2.65,2,-.1);add(new T.SphereGeometry(.13,7,6),new T.MeshBasicMaterial({color:0xffc680}),side*2.65,2.1,.12);
}
 for(let i=0;i<11;i++){const a=(i+.5)/11*Math.PI,m=add(new T.BoxGeometry(.65,.62,1.05),stone,Math.cos(a)*2.2,2.7+Math.sin(a)*2.2,0);m.rotation.z=a-Math.PI/2;}
 const shape=new T.Shape();shape.moveTo(-1.8,.15);shape.lineTo(1.8,.15);shape.lineTo(1.8,2.7);shape.absarc(0,2.7,1.8,0,Math.PI,false);shape.closePath();
 add(new T.ShapeGeometry(shape),new T.MeshBasicMaterial({color:0x76958b,transparent:true,opacity:.13,side:T.DoubleSide,depthWrite:false}),0,0,-.08);
 return g;
}
