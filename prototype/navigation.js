// Local obstacle steering, with a persistent turn side to avoid oscillating at trunks.
export function steer(n,target,speed,dt,free,bounds=()=>true,radius=.38){
  if(!target||n.root>0)return false;
  const p=n.g.position,dx=target.x-p.x,dz=target.z-p.z,d=Math.hypot(dx,dz);
  if(d<.18||dt<=0)return false;
  const aim=Math.atan2(dx,dz),step=Math.min(speed*dt,d),probe=Math.max(.8,step);
  const clear=(angle,length)=>[.33,.66,1].every(t=>{const x=p.x+Math.sin(angle)*length*t,z=p.z+Math.cos(angle)*length*t;return bounds(x,z)&&free(x,z,radius)});
  let angle=aim;
  if(!clear(aim,probe)){
    const side=n.turnSide||1,offsets=[.55,1.05,1.55,2.05,2.65,Math.PI];let found=false;
    for(const sign of [side,-side]){for(const offset of offsets){const a=aim+offset*sign;if(clear(a,probe)){angle=a;n.turnSide=sign;found=true;break}}if(found)break}
    if(!found)return false;
  }
  if(!clear(angle,step))return false;
  p.x+=Math.sin(angle)*step;p.z+=Math.cos(angle)*step;n.heading=angle;return true;
}
