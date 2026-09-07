import {readdir,stat} from 'node:fs/promises';
import {join,extname} from 'node:path';
const excluded=new Set(['.git','node_modules','dist','coverage','.impeccable','artifacts']);
async function scan(dir='.') {
  const files=[];
  for(const entry of await readdir(dir,{withFileTypes:true})) {
    if(excluded.has(entry.name))continue;
    const path=join(dir,entry.name);
    if(entry.isDirectory())files.push(...await scan(path));
    else if(!['.md','.txt','.png','.webp','.jpg'].includes(extname(path)))files.push([path,(await stat(path)).size]);
  }
  return files;
}
const files=await scan();const bytes=files.reduce((sum,[,size])=>sum+size,0);
for(const [file,size] of files)console.log(`${String(size).padStart(6)}  ${file}`);
console.log(`SOURCE: ${bytes} / 40000 bytes; ${40000-bytes} bytes remaining`);
if(bytes>40000)process.exitCode=1;
