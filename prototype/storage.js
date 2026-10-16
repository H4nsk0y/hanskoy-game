export function transferStack(source,index,target,start=0){
  const item=source[index];if(!item)return false;
  const same=target.findIndex((s,i)=>i>=start&&s?.id===item.id),empty=target.findIndex((s,i)=>i>=start&&!s),to=same>=0?same:empty;
  if(to<0)return false;
  if(target[to])target[to].count+=item.count;else target[to]={...item};source[index]=null;return true;
}
