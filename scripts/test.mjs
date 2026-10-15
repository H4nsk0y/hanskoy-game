import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const tests=new URL('../prototype/tests/',import.meta.url);
for(const file of (await readdir(tests)).filter(n=>n.endsWith('.mjs')).sort()){const result=spawnSync(process.execPath,[fileURLToPath(new URL(file,tests))],{stdio:'inherit'});if(result.status!==0)process.exit(result.status||1)}
