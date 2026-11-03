export function descendants(root){return (root.children||[]).flatMap(child=>[child,...descendants(child)])}
// Tests address inventory cells by their persistent slot IDs, not visual panel order.
export function inventoryCells(root){const cells=descendants(root).filter(n=>n.dataset?.slot!==undefined);return {children:cells.sort((a,b)=>Number(a.dataset.slot)-Number(b.dataset.slot))}}
