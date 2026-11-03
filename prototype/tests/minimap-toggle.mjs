import assert from 'node:assert/strict';
import {PerspectiveCamera} from '../vendor/three.module.js';
import {minimap} from '../minimap.js';
import {worldMap} from '../world-map.js';
import {createProgress} from '../progress.js';

class Element{constructor(){this.children=[];this.style={};this.attributes={}}append(...nodes){this.children.push(...nodes)}setAttribute(key,value){this.attributes[key]=value}}
const document={body:new Element(),createElement:()=>new Element()},oldDocument=globalThis.document;
globalThis.document=document;
const p=createProgress(),camera=new PerspectiveCamera(),ctx={started:()=>true};
assert.equal(p.minimapVisible,true);
const radar=minimap({document,ctx,p,camera,bags:()=>[],zone:()=> 'forest'}),root=document.body.children[0];radar.tick(0);
assert.equal(root.hidden,false);assert.equal(root.children.length,2,'no text below the minimap');
const container=new Element(),view=worldMap({container,ctx,p,current:'forest',camera,onPin(){},onClose(){},onMinimapChange(){radar.refresh();radar.tick(0)}});
const toolbar=container.children.find(n=>n.className==='map-toolbar'),button=toolbar.children.find(n=>n.textContent==='Скрыть мини-карту');
assert(button);button.onclick();assert.equal(p.minimapVisible,false);assert.equal(root.hidden,true);assert.equal(button.textContent,'Показать мини-карту');assert.equal(button.attributes['aria-pressed'],'false');
button.onclick();assert.equal(p.minimapVisible,true);assert.equal(root.hidden,false);assert.equal(button.textContent,'Скрыть мини-карту');
delete p.minimapVisible;radar.refresh();radar.tick(0);assert.equal(root.hidden,false,'old saves default to visible');
view.dispose();globalThis.document=oldDocument;
console.log('PASS large-map minimap toggle, immediate visibility, label/pressed state, no footer text and legacy default');
