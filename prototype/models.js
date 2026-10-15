import * as T from './vendor/three.module.js';
const loader=new T.TextureLoader();
const names=['стражник_лицо', 'стражник_кольчуга', 'стражник_рукава', 'стражник_кожа', 'кузнец_лицо', 'кузнец_фартук', 'кузнец_рубаха', 'кузнец_штаны', 'могильщик_лицо', 'могильщик_жилет', 'могильщик_плащ', 'могильщик_штаны', 'женщина_лицо', 'женщина_платье', 'женщина_фартук', 'женщина_платок', 'человек_кожа', 'волосы', 'волк_шерсть', 'волк_морда', 'волк_лапы', 'заяц_шерсть', 'заяц_морда', 'заяц_уши', 'ворон_перья', 'ворон_крыло', 'ворон_голова'];
const textures=Object.fromEntries(await Promise.all(names.map(async n=>{const t=await loader.loadAsync('./assets/'+n+'.png');const c=document.createElement('canvas');c.width=c.height=512;c.getContext('2d').drawImage(t.image,0,0,512,512);const optimized=new T.CanvasTexture(c);optimized.colorSpace=T.SRGBColorSpace;t.dispose();return [n,optimized]})));
const witchAtlas=await loader.loadAsync('./assets/ведьма_атлас.png');witchAtlas.colorSpace=T.SRGBColorSpace;
for(const [name,x,y] of [['ведьма_лицо',0,.5],['ведьма_роба',.5,.5],['ведьма_кожа',0,0],['ведьма_шляпа',.5,0]]){const t=witchAtlas.clone();t.repeat.set(.5,.5);t.offset.set(x,y);textures[name]=t}
export function witchMaterial(name){return material('ведьма_'+name)}
const sets={witch:['ведьма_роба','ведьма_лицо','ведьма_кожа','ведьма_роба'],guard:['стражник_кольчуга','стражник_лицо','стражник_кожа','стражник_рукава'],smith:['кузнец_фартук','кузнец_лицо','кузнец_штаны','кузнец_рубаха'],digger:['могильщик_жилет','могильщик_лицо','могильщик_штаны','могильщик_плащ'],woman:['женщина_платье','женщина_лицо','женщина_платье','женщина_платье'],wolf:['волк_шерсть','волк_морда','волк_лапы','волк_шерсть'],hare:['заяц_шерсть','заяц_морда','заяц_шерсть','заяц_шерсть'],raven:['ворон_перья','ворон_голова','ворон_перья','ворон_крыло']};
function material(name){return new T.MeshStandardMaterial({map:textures[name],roughness:.9,flatShading:true})}

export function modelActor(scene,maps,x,z,height,animal=false,role="guard"){
const g=new T.Group();g.position.set(x,0,z);scene.add(g);const limbs=[];
const selected=sets[animal===true?'wolf':animal||role];const body=material(selected[0]),face=material(selected[1]),legs=material(selected[2]),sleeves=material(selected[3]),skin=material(animal?selected[0]:'человек_кожа'),hair=material('волосы');
const headMaterials=[skin,skin,animal?skin:hair,skin,face,animal?skin:hair];
function part(parent,w,h,d,px,py,pz,material){const m=new T.Mesh(new T.BoxGeometry(w,h,d),material);m.position.set(px,py,pz);parent.add(m);return m}
function limb(px,py,pz,w,h,d,cover=legs){const joint=new T.Group();joint.position.set(px,py,pz);g.add(joint);part(joint,w,h,d,0,-h/2,0,cover);limbs.push(joint)}
if(!animal){part(g,.46,.64,.28,0,1.05,0,body);part(g,.31,.35,.30,0,1.57,.015,headMaterials);part(g,.13,.14,.13,0,1.36,0,skin);for(const s of [-1,1]){limb(s*.14,.76,0,.19,.72,.22);limb(s*.34,1.34,0,.15,.62,.18,sleeves)}
if(role==='witch'){part(g,.48,.72,.34,0,.58,0,body)}if(role==='woman'){part(g,.45,.58,.31,0,.68,.02,body);part(g,.34,.52,.02,0,.76,.19,material('женщина_фартук'));part(g,.34,.12,.32,0,1.77,.01,material('женщина_платок'));}if(role==='digger')part(g,.54,.75,.06,0,1.04,-.18,material('могильщик_плащ'));
}else if(animal==='raven'){part(g,.34,.48,.48,0,.52,0,body);part(g,.24,.25,.28,0,.88,.16,[face,face,body,body,body,body]);const beak=new T.Mesh(new T.ConeGeometry(.10,.30,4),new T.MeshStandardMaterial({color:0x252a30}));beak.rotation.x=Math.PI/2;beak.position.set(0,.88,.42);g.add(beak);for(const side of [-1,1]){limb(side*.10,.33,0,.05,.30,.06);part(g,.08,.35,.45,side*.20,.56,0,sleeves);}}else{part(g,.42,.43,.94,0,.67,0,body);part(g,.32,.35,.38,0,.88,.52,headMaterials);part(g,.22,.17,.29,0,.81,.79,body);for(const side of [-1,1]){const ear=new T.Mesh(new T.ConeGeometry(.10,animal==="hare"?.65:.24,4),animal==="hare"?material("заяц_уши"):skin);ear.position.set(side*.12,1.15,.53);g.add(ear);for(const z of [-.32,.32])limb(side*.18,.58,z,.12,.53,.14)}const tail=part(g,.12,.12,.53,0,.65,-.67,body);tail.rotation.x=-.45;}
const scale=height/(animal?1.25:1.78);g.scale.setScalar(scale);let last=new T.Vector3(x,0,z),phase=0;
return {g,x,z,heading:0,height,update(){const speed=g.position.distanceTo(last);last.copy(g.position);if(speed>.0001)phase+=Math.min(.5,speed*8);limbs.forEach((l,i)=>l.rotation.x=speed>.0001?Math.sin(phase+(animal?(i%2):[0,1,1,0][i])*Math.PI)*(!animal&&i%2===1?.35:.55):0);g.rotation.y=this.heading;}};
}

