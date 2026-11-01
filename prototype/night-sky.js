import * as T from './vendor/three.module.js';
// Direction-based shading has no UV pole or panoramic upper edge.
export function nightSky(root,x,z){
 const material=new T.ShaderMaterial({side:T.BackSide,fog:false,depthWrite:false,depthTest:false,uniforms:{top:{value:new T.Color(0x0c2041)},low:{value:new T.Color(0x08182c)},cloud:{value:new T.Color(0x253e5e)}},vertexShader:`varying vec3 vDirection;void main(){vDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`varying vec3 vDirection;uniform vec3 top;uniform vec3 low;uniform vec3 cloud;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 void main(){vec3 d=normalize(vDirection);float height=smoothstep(-.1,1.0,d.y);vec3 color=mix(low,top,height);float wave=sin(d.x*9.+d.y*6.+sin(d.z*12.)*1.7)*.25+sin(d.z*20.-d.x*11.+d.y*15.)*.16+sin(d.x*34.+d.z*27.)*.08;float clouds=smoothstep(.08,.42,wave);color=mix(color,cloud,clouds*.42);vec2 starUv=d.xz/(abs(d.y)+.25)*220.;vec2 cell=floor(starUv);float star=step(.996,hash(cell))*pow(max(0.,1.-length(fract(starUv)-.5)*2.),5.)*smoothstep(.12,.7,d.y);color+=vec3(.6,.72,.9)*star;color+=(hash(gl_FragCoord.xy)-.5)/700.;gl_FragColor=vec4(color,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});const dome=new T.Mesh(new T.SphereGeometry(230,40,24),material);dome.name='complete-night-sky';dome.position.set(x,0,z);dome.renderOrder=-1001;dome.frustumCulled=false;root.add(dome);return dome;
}
