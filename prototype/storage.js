import {isBagSlot,addItem,itemLimit,countItem,inventoryError} from './inventory.js';
export function transferStack(source,index,target,start=0){
  const item=source[index];if(!item)return false;
  const same=target.findIndex((s,i)=>i>=start&&(start===6?isBagSlot(i):i<18)&&s?.id===item.id),empty=target.findIndex((s,i)=>i>=start&&(start===6?isBagSlot(i):i<18)&&!s),to=same>=0?same:empty;
  if(to<0)return false;
  if(target[to])target[to].count+=item.count;else target[to]={...item};source[index]=null;return true;
}

// The receiver may accept only part of a stack. Nothing leaves the chest on failure.
export function transferLoot(c,index,give){const item=c?.contents?.[index];if(!item)return false;const result=give({...item}),amount=result===true?item.count:result;if(!Number.isInteger(amount)||amount<=0||amount>item.count)return false;if(amount===item.count)c.contents.splice(index,1);else item.count-=amount;return true}
export function receiveLoot(p,slots,item){if(item.id==='gold'){p.gold=(p.gold||0)+item.count;return {amount:item.count,error:''}}const amount=Math.min(item.count,Math.max(0,itemLimit(item.id)-countItem(slots,item.id)));if(!amount)return {amount:0,error:inventoryError(slots,item.id,item.count)};const error=inventoryError(slots,item.id,amount);if(error)return {amount:0,error};if(!addItem(slots,item.id,amount))return {amount:0,error:'Предмет не удалось перенести.'};return {amount,error:amount<item.count?inventoryError(slots,item.id,1):''}}
