export function updateZoom(camera,held,dt){const target=held?36:72,next=camera.fov+(target-camera.fov)*(1-Math.exp(-Math.max(0,dt)*14));const fov=Math.abs(next-target)<.02?target:next;if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix()}camera.userData.handScale=Math.tan(fov*Math.PI/360)/Math.tan(72*Math.PI/360);return fov}

// Skill relocation preserves held movement keys; area transitions reset them separately.
export function relocatePlayer(camera,vitals,position){camera.position.copy(position);vitals.height=vitals.velocity=0}

// Apply to the fresh camera pose each frame, never to accumulated offsets.
export function cameraFeedback(camera,dt,time){
 const data=camera.userData;if(data.wakeRemaining>0){data.wakeRemaining=Math.max(0,data.wakeRemaining-dt);const age=3.6-data.wakeRemaining,t=Math.min(1,Math.max(0,(age-1.1)/2.5)),ease=t*t*(3-2*t);camera.position.y-=1.35*(1-ease);camera.rotation.x+=1.12*(1-ease);camera.rotation.z+=.28*(1-ease);return Math.max(0,1-age/.9)}
 if(data.shakeRemaining>0){data.shakeRemaining=Math.max(0,data.shakeRemaining-dt);const strength=Math.min(1,data.shakeRemaining/.12);camera.rotation.x+=Math.sin(time*91)*.019*strength;camera.rotation.z+=Math.sin(time*73)*.025*strength}return 0;
}
