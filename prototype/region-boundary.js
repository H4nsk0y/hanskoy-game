import {landMaterial} from './land-materials.js';
import * as T from './vendor/three.module.js';
// Visual extensions of the existing movement bounds. No lights or extra physics.
// New outdoor regions get a boundary by default; gates can keep an opening.
export function regionBoundary(parent,bounds,{kind='forest',gaps=[],bare=false,exclusions=[]}={}){
 const [x,z,w,h]=bounds,g=new T.Group();g.name='region-boundary';parent.add(g);
 const rock=landMaterial('rock',kind==='shore'?0x718a89:0x889386),bark=landMaterial('bark',0x766d5a),leaves=landMaterial('soil',0x294737);
 const stripMaterial=new T.MeshStandardMaterial({color:kind==='shore'?0x193f43:kind==='city'?0x3b4445:0x293b35,roughness:1,side:T.DoubleSide});
 for(const [cx,cz,sw,sh] of [[x+w/2,z-11,w+44,24],[x+w/2,z+h+11,w+44,24],[x-11,z+h/2,24,h],[x+w+11,z+h/2,24,h]]){const m=new T.Mesh(new T.PlaneGeometry(sw,sh),stripMaterial);m.rotation.x=-Math.PI/2;m.position.set(cx,-.12,cz);g.add(m)}
 const points=[];for(let i=0;i<=Math.ceil(w/7);i++){const px=x+w*i/Math.ceil(w/7);points.push([px,z,0,-1],[px,z+h,0,1])}for(let i=1;i<Math.ceil(h/7);i++){const pz=z+h*i/Math.ceil(h/7);points.push([x,pz,-1,0],[x+w,pz,1,0])}
 const rocks=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),rock,points.length*3),trees=new T.InstancedMesh(new T.CylinderGeometry(.35,.8,1,5),bark,points.length*3),crowns=new T.InstancedMesh(new T.IcosahedronGeometry(1,2),leaves,points.length*3),o=new T.Object3D();let nr=0,nt=0;const deadPositions=[];
 for(let i=0;i<points.length;i++){const [px,pz,nx,nz]=points[i];if(gaps.some(([gx,gz])=>Math.hypot(px-gx,pz-gz)<8))continue;
  for(let row=0;row<(kind==='forest'?3:2);row++){const offset=5+row*8,xx=px+nx*offset+(nz?Math.sin(i*2.4)*1.6:0),zz=pz+nz*offset+(nx?Math.cos(i*2.4)*1.6:0),height=(kind==='rock'||kind==='cave'?8:kind==='city'?5:4)+((i*7+row*3)%5);if(exclusions.some(([ex,ez,ew,eh])=>xx>ex-5&&xx<ex+ew+5&&zz>ez-5&&zz<ez+eh+5))continue;
   o.position.set(xx,height*.42,zz);o.scale.set(5+row,height*.65,4.8);o.rotation.set(0,i*1.7,.1*Math.sin(i));o.updateMatrix();if(kind!=='forest')rocks.setMatrixAt(nr++,o.matrix);
   if(kind==='forest'||kind==='shore'){const th=8+i%4;if(bare){deadPositions.push([xx,zz,th]);continue}o.position.set(xx,th/2,zz);o.scale.set(.8,th,.8);o.rotation.set(0,i,0);o.updateMatrix();trees.setMatrixAt(nt,o.matrix);o.position.y=th*.72;o.scale.set(5.4,th*.55,5.1);o.updateMatrix();crowns.setMatrixAt(nt++,o.matrix)}
  }
 }
 rocks.count=nr;g.add(rocks);if(bare)addDeadTrees(g,deadPositions,bark);if(nt){trees.count=crowns.count=nt;g.add(trees,crowns)}else{trees.geometry.dispose();crowns.geometry.dispose();if(!bare)bark.dispose();leaves.dispose()}
 return g;
}

export function addDeadTrees(parent,positions,bark=landMaterial('bark',0x766d5a)){
 const mesh=new T.InstancedMesh(new T.CylinderGeometry(.12,.45,1,6),bark,positions.length*7),o=new T.Object3D();let index=0;
 for(const [i,[x,z,h]] of positions.entries()){o.position.set(x,h/2,z);o.rotation.set(.03*Math.sin(i),i,.05*Math.cos(i));o.scale.set(1,h,1);o.updateMatrix();mesh.setMatrixAt(index++,o.matrix);for(let j=0;j<6;j++){const angle=i*2.4+j*2.2,length=h*(.25+(j%3)*.04),base=new T.Vector3(x,h*(.38+j*.075),z),tip=base.clone().add(new T.Vector3(Math.cos(angle)*length*.7,length*.7,Math.sin(angle)*length*.7));o.position.copy(base).lerp(tip,.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),tip.clone().sub(base).normalize());o.scale.set(.38-j*.025,base.distanceTo(tip),.38-j*.025);o.updateMatrix();mesh.setMatrixAt(index++,o.matrix)}}
 mesh.name='bare-boundary-trees';parent.add(mesh);return mesh;
}
