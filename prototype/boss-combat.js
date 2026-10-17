import * as T from './vendor/three.module.js';
import {statusStep} from './combat-rules.js';
import {steer} from './navigation.js';
export const CURSED_FIRE={x:280,z:-177,radius:8};
export const ARROW_SPEED=30;
const bounds=(x,z)=>x>181&&x<299&&z< -40&&z> -197;
export function bossCombat({scene,camera,hunter,witch,free,rand}){
  const shots=[],pools=[];let time=0,healUsed=false,healLeft=0;
  const aura=new T.Mesh(new T.SphereGeometry(1.2,12,10),new T.MeshBasicMaterial({color:0x50ff65,transparent:true,opacity:.2,wireframe:true,depthWrite:false}));aura.position.y=1;witch.g.add(aura);aura.visible=false;
  const sight=n=>{const dx=camera.position.x-n.g.position.x,dz=camera.position.z-n.g.position.z,steps=Math.ceil(Math.hypot(dx,dz)/.4);for(let i=1;i<steps;i++)if(!free(n.g.position.x+dx*i/steps,n.g.position.z+dz*i/steps,.05))return false;return true};
  function move(n,engaged,dt){if(dt<=0)return;
    n.timer=(n.timer||0)-dt;
    const dx=camera.position.x-n.g.position.x,dz=camera.position.z-n.g.position.z,d=Math.hypot(dx,dz)||1;
    if(n.timer<=0||!n.target){n.timer=engaged?1.2+rand():2+rand()*2;const side=rand()<.5?-1:1;
      if(engaged){const radial=d<8?-5:d>18?6:0;n.target=new T.Vector3(n.g.position.x+dx/d*radial+dz/d*side*5,0,n.g.position.z+dz/d*radial-dx/d*side*5)}
      else{const a=rand()*Math.PI*2;n.target=n.home.clone().add(new T.Vector3(Math.sin(a)*5,0,Math.cos(a)*5))}
      n.target.x=T.MathUtils.clamp(n.target.x,182,298);n.target.z=T.MathUtils.clamp(n.target.z,-196,-41);
    }
    if(n.g.position.distanceTo(n.home)>48)n.target.copy(n.home);
    steer(n,n.target,engaged?(n===hunter?1.25:2.4):1.1,dt,free,bounds);if(engaged)n.heading=Math.atan2(dx,dz);n.update();
  }
  function spawnShot({position,velocity,damage=14,arrow=false,large=false,falling=false,delay=0,age=0}){
    const m=new T.Mesh(arrow?new T.CylinderGeometry(.012,.012,.55,5):new T.SphereGeometry(falling?.45:large?.28:.12,10,8),new T.MeshBasicMaterial({color:arrow?0xb8a47d:large?0x73ff2f:0xff732c}));m.position.fromArray(position);m.visible=delay<=0;scene.add(m);shots.push({m,v:new T.Vector3().fromArray(velocity),damage,arrow,large,falling,delay,age});
  }
  function arrow(yaw=0,delay=.22){const pos=hunter.g.position.clone().add(new T.Vector3(0,1.45,0)),aim=camera.position.clone().sub(pos),d=Math.max(.01,Math.hypot(aim.x,aim.z)),v2=ARROW_SPEED**2,disc=v2*v2-9.8*(9.8*d*d+2*aim.y*v2),angle=Math.atan((v2-Math.sqrt(Math.max(0,disc)))/(9.8*d));aim.set(aim.x/d*Math.cos(angle),Math.sin(angle),aim.z/d*Math.cos(angle)).applyAxisAngle(new T.Vector3(0,1,0),yaw).multiplyScalar(ARROW_SPEED);pos.addScaledVector(aim,.5/ARROW_SPEED);spawnShot({position:pos.toArray(),velocity:aim.toArray(),arrow:true,delay})}
  function pool(position,age=0,exposure=0){const g=new T.Group();g.position.fromArray(position);g.position.y=.04;const m=new T.Mesh(new T.CircleGeometry(2.4,32),new T.MeshBasicMaterial({color:0xff5b17,transparent:true,opacity:.6,side:T.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;g.add(m);const ring=new T.Mesh(new T.TorusGeometry(2.3,.06,5,32),new T.MeshBasicMaterial({color:0xffb02d}));ring.rotation.x=Math.PI/2;g.add(ring);scene.add(g);pools.push({g,age,exposure})}
  function dispose(n){scene.remove(n);n.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose()}})}
  function clear(){for(const b of shots)dispose(b.m);shots.length=0;for(const p of pools)dispose(p.g);pools.length=0}
  function tick(dt,onDamage){time+=dt;const frameDt=dt;
    if(hunter.g.visible&&hunter.hp>0){const dt=statusStep(hunter,frameDt);const d=camera.position.distanceTo(hunter.g.position),engaged=d<22;move(hunter,engaged,dt);hunter.cooldown=Math.max(0,hunter.cooldown-dt);
      if(engaged){for(const a of hunter.g.userData.arms||[])a.rotation.x=-1.15;const attr=hunter.g.userData.string?.geometry.attributes.position;if(attr){attr.setXYZ(1,0,0,-.18*Math.min(1,1-hunter.cooldown/.9));attr.needsUpdate=true}
        if((dt>0||frameDt===0&&!hunter.stun)&&hunter.cooldown===0&&sight(hunter)){hunter.cooldown=1.5;const special=rand(),fan=special<.15,burst=special>=.15&&special<.30;const angles=fan?[-.13,0,.13]:[0];for(const angle of angles)arrow(angle);if(burst){arrow(0,.47);arrow(0,.72)}}}
    }
    if(witch.g.visible&&witch.hp>0){const dt=statusStep(witch,frameDt);const d=camera.position.distanceTo(witch.g.position),engaged=d<80;move(witch,engaged,dt);witch.cooldown=Math.max(0,witch.cooldown-dt);
      if(!healUsed&&witch.hp<60){healUsed=true;healLeft=10}if(healLeft>0){const step=Math.min(dt,healLeft);witch.hp=Math.min(200,witch.hp+5*step);healLeft-=step}aura.visible=healLeft>0;aura.rotation.y=time*2;aura.scale.setScalar(1+Math.sin(time*5)*.12);
      if((dt>0||frameDt===0&&!witch.stun)&&engaged&&witch.cooldown===0&&sight(witch)){witch.cooldown=1.8+rand()*.6;if(rand()<.35){spawnShot({position:[camera.position.x,9,camera.position.z],velocity:[0,-12,0],falling:true,damage:0})}
        else{const large=rand()<.15,pos=witch.g.position.clone().add(new T.Vector3(0,1.4,0)),v=camera.position.clone().sub(pos).normalize().multiplyScalar(large?19:25);spawnShot({position:pos.toArray(),velocity:v.toArray(),large,damage:large?25:15})}}
    }else{aura.visible=false;healLeft=0}
    for(let i=shots.length-1;i>=0;i--){const b=shots[i];if(b.arrow&&hunter.hp<=0){dispose(b.m);shots.splice(i,1);continue}if(b.delay>0){if(b.arrow&&hunter.stun>0)continue;b.delay-=dt;if(b.delay>0)continue;b.m.visible=true}const old=b.m.position.clone();if(b.arrow)b.v.y-=9.8*dt;b.m.position.addScaledVector(b.v,dt);b.m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.v.clone().normalize());b.age+=dt;
      if(b.falling){if(b.m.position.y<=.05){pool([b.m.position.x,0,b.m.position.z]);dispose(b.m);shots.splice(i,1)}continue}
      const delta=b.m.position.clone().sub(old),steps=Math.max(1,Math.ceil(delta.length()/.15));let remove=b.age>(b.arrow?4:5)||b.m.position.y<0;
      for(let j=1;j<=steps&&!remove;j++){const point=old.clone().addScaledVector(delta,j/steps);if(!free(point.x,point.z,.05)){remove=true;break}if(point.distanceTo(camera.position)<.5){onDamage(b.damage,b.arrow?'physical':'magic');remove=true}}
      if(remove){dispose(b.m);shots.splice(i,1)}
    }
    for(let i=pools.length-1;i>=0;i--){const p=pools[i],step=Math.min(dt,10-p.age);p.age+=dt;p.g.children[0].material.opacity=.5+Math.sin(time*9)*.12;const touching=Math.hypot(camera.position.x-p.g.position.x,camera.position.z-p.g.position.z)<2.4&&camera.position.y<2.7;if(touching){const old=p.exposure;p.exposure+=step;const burning=Math.max(0,p.exposure-.5)-Math.max(0,old-.5);if(burning>0)onDamage(15*burning,'hazard')}else p.exposure=0;if(p.age>=10){dispose(p.g);pools.splice(i,1)}}
  }
  function snapshot(){return {time,healUsed,healLeft,shots:shots.map(b=>({position:b.m.position.toArray(),velocity:b.v.toArray(),damage:b.damage,arrow:b.arrow,large:b.large,falling:b.falling,delay:Math.max(0,b.delay),age:b.age})),pools:pools.map(p=>({position:p.g.position.toArray(),age:p.age,exposure:p.exposure}))}}
  function restore(s){clear();time=s?.time||0;healUsed=s?.healUsed||false;healLeft=s?.healLeft||0;aura.visible=healLeft>0;for(const b of s?.shots||[])spawnShot(b);for(const p of s?.pools||[])pool(p.position,p.age,p.exposure)}
  return {tick,snapshot,restore,clear,pools,shots};
}
