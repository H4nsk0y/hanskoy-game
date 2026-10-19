import * as T from './vendor/three.module.js';
export function torchModel(parent,{map=null,handheld=false}={}){
 const g=new T.Group();parent.add(g);const wood=new T.MeshStandardMaterial({color:0x67432a}),iron=new T.MeshStandardMaterial({color:0x48494a,metalness:.5,roughness:.6});
 const shaft=new T.Mesh(new T.CylinderGeometry(.045,.06,.75,7),wood);shaft.position.y=.25;g.add(shaft);
 const cup=new T.Mesh(new T.CylinderGeometry(.11,.06,.16,8),iron);cup.position.y=.65;g.add(cup);
 const flame=map?new T.Sprite(new T.SpriteMaterial({map,color:0xffb977,transparent:true,blending:T.AdditiveBlending,depthWrite:false})):new T.Mesh(new T.ConeGeometry(.09,.3,6),new T.MeshBasicMaterial({color:0xffa13d}));flame.position.y=map?.74:.95;if(map){flame.center.set(.5,0);flame.scale.set(.55,.75,1);}g.add(flame);
 const light=new T.PointLight(0xff963e,handheld?7:15,handheld?7:10,2);light.position.y=.95;g.add(light);
 g.userData.animate=t=>{flame.scale.y=(map?.75:1)*(1+Math.sin(t*13)*.09);light.intensity=(handheld?7:15)*(1+Math.sin(t*9)*.08)};return g;
}
