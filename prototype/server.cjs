const http = require('http');
const fs = require('fs');
const path = require('path');
const root=__dirname;
http.createServer((req,res)=>{let rel;try{rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);return res.end()}const file=path.resolve(root,'.'+(rel==='/'?'/index.html':rel));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found')}res.setHeader('Content-Type',file.endsWith('.mp3')?'audio/mpeg':file.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8');res.end(data)})}).listen(4173,'127.0.0.1',()=>console.log('Hanskoy Game: http://127.0.0.1:4173'));

