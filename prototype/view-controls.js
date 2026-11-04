import * as T from './vendor/three.module.js';
export function updateZoom(camera,held,dt){const target=held?36:72,next=camera.fov+(target-camera.fov)*(1-Math.exp(-Math.max(0,dt)*14));const fov=Math.abs(next-target)<.02?target:next;if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix()}camera.userData.handScale=Math.tan(fov*Math.PI/360)/Math.tan(72*Math.PI/360);return fov}

// Skill relocation preserves held movement keys; area transitions reset them separately.
export function relocatePlayer(camera,vitals,position){camera.position.copy(position);vitals.height=vitals.velocity=0}

export const WAKE_DURATION=7.7;
const ease=(age,start,end)=>{const t=Math.min(1,Math.max(0,(age-start)/(end-start)));return t*t*(3-2*t)};
// Zero velocity and acceleration at each turn: softer head reversals without pauses.
const headEase=(age,start,end)=>{const t=Math.min(1,Math.max(0,(age-start)/(end-start)));return t*t*t*(t*(t*6-15)+10)};
export const canLookAround=camera=>!(camera.userData.wakeRemaining>0);
export function awakeningPose(remaining){const age=WAKE_DURATION-Math.max(0,remaining),rise=ease(age,.9,2.8),right=headEase(age,2.8,3.6),left=headEase(age,3.6,4.95),center=headEase(age,4.95,5.6),inspect=ease(age,5.6,6.2),finish=ease(age,6.85,WAKE_DURATION);
 return {height:-1.35*(1-rise),pitch:1.12*(1-rise)-.7*inspect*(1-finish),yaw:-.68*right+1.36*left-.68*center,roll:.28*(1-rise),hands:inspect*(1-finish),veil:Math.max(0,1-age/.9)};
}
export function firstPersonHand({side=1,open=true}={}){
 const hand=new T.Group();hand.name=open?'open-player-hand':'punching-hand';const skin=new T.MeshStandardMaterial({color:0xb89a85,roughness:.9,emissive:0x49372b,emissiveIntensity:.22}),cloth=new T.MeshStandardMaterial({color:0x514d43,roughness:1});
 const add=(geo,material,x,y,z)=>{const mesh=new T.Mesh(geo,material);mesh.position.set(x,y,z);mesh.frustumCulled=false;hand.add(mesh);return mesh};
 const arm=add(new T.CapsuleGeometry(.058,.30,4,8),cloth,0,-.25,.06);arm.rotation.x=-.3;add(new T.CapsuleGeometry(.048,.075,4,8),skin,0,-.035,0);const palm=add(new T.SphereGeometry(1,10,8),skin,0,.045,0);palm.scale.set(.07,.085,open?.028:.05);
 for(let i=0;i<4;i++){const finger=add(new T.CapsuleGeometry(.013,open?.06+(i===1?.025:i===2?.015:0):.035,3,6),skin,(i-1.5)*.033,open?.14+(i===1?.015:0):.095,open?-.006:-.045);finger.rotation.set(open?0:-1.15,0,open?-(i-1.5)*.08:0)}const thumb=add(new T.CapsuleGeometry(.018,.065,3,6),skin,open?side*-.083:side*-.05,open?.025:.025,open?.012:-.055);thumb.rotation.z=open?side*.65:side*1.05;
 return hand;
}
function wakingHands(camera){
 const g=new T.Group();g.name='awakening-hands';camera.add(g);
 for(const side of [-1,1]){const hand=firstPersonHand({side});hand.name=side<0?'awakening-left-hand':'awakening-right-hand';hand.position.set(side*.20,-.16,-.50);hand.rotation.set(-.22,side*.25,side*-.15);g.add(hand)}
 camera.userData.wakeHands=g;return g;
}
// Apply to the fresh camera pose each frame, never to accumulated offsets.
export function cameraFeedback(camera,dt,time){
 const data=camera.userData;if(data.wakeRemaining>0){data.wakeRemaining=Math.max(0,data.wakeRemaining-dt);const pose=awakeningPose(data.wakeRemaining);camera.position.y+=pose.height;camera.rotation.x+=pose.pitch;camera.rotation.y+=pose.yaw;camera.rotation.z+=pose.roll;
  if(pose.hands>0||data.wakeHands){const hands=data.wakeHands||wakingHands(camera);hands.visible=pose.hands>0;hands.position.set(0,-.65*(1-pose.hands),.08*pose.hands);hands.rotation.set(0,0,Math.sin(time*3)*.015*pose.hands)}return pose.veil;
 }
 if(data.wakeHands)data.wakeHands.visible=false;
 if(data.shakeRemaining>0){data.shakeRemaining=Math.max(0,data.shakeRemaining-dt);const strength=Math.min(1,data.shakeRemaining/.12);camera.rotation.x+=Math.sin(time*91)*.019*strength;camera.rotation.z+=Math.sin(time*73)*.025*strength}return 0;
}
