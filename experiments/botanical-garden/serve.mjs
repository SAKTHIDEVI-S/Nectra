import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const shared=path.resolve(root,'../../public/assets');
const vendor=path.resolve(root,'../../public/vendor');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.mp4':'video/mp4','.svg':'image/svg+xml','.glb':'model/gltf-binary'};
http.createServer((req,res)=>{try{let url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let base=url.startsWith('/assets/')&&!url.startsWith('/assets/garden.png')?shared:url.startsWith('/vendor/')?vendor:root;let relative=base===shared?url.slice(8):base===vendor?url.slice(8):url==='/'?'index.html':url.slice(1);let file=path.resolve(base,relative);if(!file.startsWith(base+path.sep)){res.writeHead(403);return res.end()}if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'});fs.createReadStream(file).pipe(res)}catch{res.writeHead(400);res.end('Bad request')}}).listen(3012,'127.0.0.1',()=>console.log('Nectra garden local preview: http://localhost:3012'));
