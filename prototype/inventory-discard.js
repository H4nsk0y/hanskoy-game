export function inventoryDiscard({document,modal,slots,isOpen,onDiscard}){
 let dragged=null;
 const cancel=()=>{dragged=null;document.body?.classList?.remove?.('inventory-drag')};
 function outside(e){const r=modal.getBoundingClientRect?.();return r&&Number.isFinite(e.clientX)&&Number.isFinite(e.clientY)&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)}
 document.addEventListener('dragover',e=>{if(dragged&&isOpen()){e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect='move'}});
 document.addEventListener('drop',e=>{if(!dragged||!isOpen())return;const d=dragged;if(!outside(e))return;e.preventDefault();cancel();if(slots[d.index]!==d.item)return;slots[d.index]=null;onDiscard(d.item,d.index)});
 return {start(index,item){if(!isOpen()||slots[index]!==item)return;dragged={index,item};document.body?.classList?.add?.('inventory-drag')},cancel};
}
