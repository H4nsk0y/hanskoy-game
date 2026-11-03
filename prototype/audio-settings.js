export const AUDIO_SETTINGS_KEY='hanskoy.audio.v1';
export function audioSettings({document=globalThis.document,storage=()=>globalThis.localStorage,onChange=()=>{}}={}){
 const defaults={effects:1,music:1,master:1};let values={...defaults},open=false;
 try{const saved=JSON.parse(storage()?.getItem(AUDIO_SETTINGS_KEY)||'null');for(const key of Object.keys(defaults))if(Number.isFinite(saved?.[key]))values[key]=Math.max(0,Math.min(1,saved[key]))}catch{}
 const trigger=document?.querySelector?.('#settings-open'),panel=document?.createElement?.('div'),inputs={},outputs={};
 function apply(){onChange({...values})}
 function set(key,value){if(!Object.hasOwn(defaults,key)||!Number.isFinite(value))return;values[key]=Math.max(0,Math.min(1,value));if(inputs[key])inputs[key].value=String(Math.round(values[key]*100));if(outputs[key])outputs[key].textContent=Math.round(values[key]*100)+'%';try{storage()?.setItem(AUDIO_SETTINGS_KEY,JSON.stringify(values))}catch{}apply()}
 function close(){open=false;if(panel)panel.hidden=true;trigger?.focus?.()}
 if(panel&&document.body?.append){panel.id='audio-settings';panel.className='audio-settings';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','audio-settings-title');const section=document.createElement('section'),title=document.createElement('h2');title.id='audio-settings-title';title.textContent='Настройки звука';section.append(title);
  for(const [key,text] of [['effects','Звуки'],['music','Фоновая музыка'],['master','Общая громкость']]){const row=document.createElement('div'),label=document.createElement('label'),input=document.createElement('input'),output=document.createElement('output');row.className='audio-setting';input.type='range';input.min='0';input.max='100';input.step='1';input.id='audio-'+key;input.value=String(Math.round(values[key]*100));label.htmlFor=input.id;label.textContent=text;output.htmlFor=input.id;output.textContent=input.value+'%';input.oninput=()=>set(key,Number(input.value)/100);inputs[key]=input;outputs[key]=output;row.append(label,output,input);section.append(row)}
  const back=document.createElement('button');back.textContent='Назад';back.onclick=close;section.append(back);panel.append(section);document.body.append(panel);if(trigger)trigger.onclick=()=>{open=true;panel.hidden=false;inputs.effects.focus?.()};document.addEventListener('keydown',event=>{if(!open)return;if(event.code==='Escape'){event.preventDefault();close()}event.stopImmediatePropagation()},true);
 }
 apply();return {get values(){return {...values}},gain:channel=>values.master*(values[channel]??1),set,close,get open(){return open}};
}
