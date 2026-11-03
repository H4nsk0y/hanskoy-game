export function itemTooltip(document){
 if(!document.body?.append)return;
 const root=document.createElement('aside'),level=document.createElement('small'),name=document.createElement('strong'),details=document.createElement('div'),equipped=document.createElement('div');root.id='item-tooltip';root.hidden=true;root.append(level,name,details,equipped);document.body.append(root);let owner=null,original='';
 function hide(){root.hidden=true;if(owner&&original)owner.setAttribute('title',original);owner=null;original=''}
 function position(e){root.style.left=Math.max(8,Math.min(e.clientX+18,globalThis.innerWidth-root.offsetWidth-10))+'px';root.style.top=Math.max(8,Math.min(e.clientY+12,globalThis.innerHeight-root.offsetHeight-10))+'px'}
 document.addEventListener('mouseover',e=>{const cell=e.target.closest?.('.slot,.shop-item,.craft-preview');if(!cell||cell===owner)return;hide();const text=cell.getAttribute('title');if(!text)return;owner=cell;original=text;cell.removeAttribute('title');const sections=text.split('\nСейчас надето: '),lines=sections[0].split('\n'),index=lines.findIndex(l=>l.startsWith('Уровень предмета:'));level.textContent=index>=0?lines.splice(index,1)[0]:'';name.textContent=cell.dataset?.itemName||'';name.hidden=!name.textContent;if(lines[0]===name.textContent)lines.shift();details.textContent=lines.join('\n');equipped.textContent=sections.length>1?'Сейчас надето: '+sections.slice(1).join('\n'):'';equipped.hidden=!equipped.textContent;root.hidden=false;position(e)});
 document.addEventListener('mousemove',e=>{if(owner)position(e)});
 document.addEventListener('mouseout',e=>{if(owner&&!owner.contains(e.relatedTarget))hide()});
 document.addEventListener('click',hide);document.addEventListener('keydown',hide);document.addEventListener('scroll',hide,true);
}
