const hills=new Map();
export function registerHill(x,z,rx,rz,height){hills.set(x+':'+z,{x,z,rx,rz,height})}
export function hillSurface(dx,dz,rx,rz,height){const q=(dx/rx)**2+(dz/rz)**2;return q>=1?0:height*(1-q)**2}
export function terrainHeight(x,z){let height=0;for(const h of hills.values())height=Math.max(height,hillSurface(x-h.x,z-h.z,h.rx,h.rz,h.height));return height}
