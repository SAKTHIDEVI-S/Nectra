import { readdirSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const src='experiments/botanical-garden';
for(const dir of ['', 'art', 'assets']){
  mkdirSync(join('public',dir),{recursive:true});
  for(const name of readdirSync(join(src,dir))){
    if(!/\.(css|js|png|svg)$/.test(name))continue;
    copyFileSync(join(src,dir,name),join('public',dir,name));
  }
}
writeFileSync('public/garden-home.html',readFileSync(join(src,'index.html'),'utf8').replace('<meta name="robots" content="noindex,nofollow">','<link rel="canonical" href="https://nectrahoney.in/"><meta name="description" content="Explore eight Nectra honey varieties, choose your jars and build a honey gift box.">').replace('LOCAL CONCEPT','NECTRA HONEY'));
