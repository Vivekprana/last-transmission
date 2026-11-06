const http=require('http');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const PORT=process.env.PORT||3000;
const rooms=new Map();
const roles=['pilot','engineer','comms','medic','navigator'];
const initial=()=>({phase:'lobby',hull:68,oxygen:62,power:0,alignment:0,frequency:0,medical:0,route:0,log:['Emergency channel opened. Awaiting crew.'],ending:null,startedAt:null});
function createRoom(){let code;do{code=crypto.randomBytes(3).toString('hex').toUpperCase()}while(rooms.has(code));let room={code,crew:{},state:initial(),clients:new Set(),created:Date.now()};rooms.set(code,room);return room;}
function view(r){return {code:r.code,crew:Object.fromEntries(roles.map(x=>[x,r.crew[x]?{name:r.crew[x].name}:null])),state:r.state};}
function emit(r){const data=`data: ${JSON.stringify(view(r))}\n\n`;for(const c of r.clients){try{c.write(data)}catch{r.clients.delete(c)}}}
function log(s,msg){s.log.unshift(msg);s.log=s.log.slice(0,9)}
function json(res,status,obj){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(obj));}
function body(req){return new Promise((resolve,reject)=>{let s='';req.on('data',x=>{s+=x;if(s.length>20000){reject(new Error('Request too large'));req.destroy()}});req.on('end',()=>{try{resolve(JSON.parse(s||'{}'))}catch{reject(new Error('Invalid JSON'))}})})}
function validToken(r,t){return Object.entries(r.crew).find(([,p])=>p.token===t)?.[0]}
function action(r,role,type,v){const s=r.state; if(type==='start'&&s.phase==='lobby'&&Object.keys(r.crew).length===5){s.phase='emergency';s.startedAt=Date.now();log(s,'CAPTAIN: All hands, emergency procedures now.');return}
 if(type==='reset'){r.state=initial();return}
 if(s.phase!=='emergency'&&s.phase!=='decision')throw Error('Mission is not in an interactive phase');
 if(type==='set'){
 const value=Number(v);if(!Number.isFinite(value))throw Error('Invalid value');
 const field={pilot:'alignment',engineer:'power',comms:'frequency',medic:'medical',navigator:'route'}[role];
 if(!field)throw Error('Unknown role');
 s[field]=Math.max(0,Math.min(100,Math.round(value)));
 if(s.phase==='emergency'){
 const labels={pilot:'Flight controls adjusted',engineer:'Reactor distribution adjusted',comms:'Signal receiver tuned',medic:'Life-support valves adjusted',navigator:'Navigation vector updated'};
 log(s,`${r.crew[role].name}: ${labels[role]}.`);
 const finished=s.alignment>=70&&s.power>=65&&s.frequency>=75&&s.medical>=60&&s.route>=80;
 if(finished){s.phase='decision';s.hull=55;s.oxygen=24;log(s,'CAPTAIN: Systems stabilized. Distress signal identified. Choose our fate.');}
 }return;
 }
 if(type==='choose'&&s.phase==='decision'&&role==='navigator'){
 if(!['rescue','escape'].includes(v))throw Error('Invalid ending');
 s.phase='ended';s.ending=v;
 if(v==='rescue'){s.hull=12;s.oxygen=8;log(s,'MISSION END: You diverted to save the stranded ship. Your crew survived, barely.')}else{s.hull=72;s.oxygen=32;log(s,'MISSION END: You escaped with your crew, leaving the distress beacon unanswered.')}
 return;
 }
 throw Error('Action unavailable');
}
function respondFile(res,file){let ext=path.extname(file);let mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml'}[ext]||'application/octet-stream';fs.readFile(file,(e,data)=>{if(e){res.writeHead(404);res.end('Not found')}else{res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-cache'});res.end(data)}})}
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});return res.end()}
 try{
 if(req.method==='POST'&&url.pathname==='/api/create'){let r=createRoom();return json(res,200,{code:r.code})}
 if(req.method==='GET'&&url.pathname==='/api/room'){let r=rooms.get((url.searchParams.get('code')||'').toUpperCase());return r?json(res,200,view(r)):json(res,404,{error:'Room not found'})}
 if(req.method==='POST'&&url.pathname==='/api/join'){
 let b=await body(req),r=rooms.get(String(b.code||'').toUpperCase());if(!r)return json(res,404,{error:'Room not found'});
 let role=String(b.role||'');if(!roles.includes(role))return json(res,400,{error:'Choose a crew role'});
 if(r.crew[role])return json(res,409,{error:'Role already taken'});
 if(r.state.phase!=='lobby')return json(res,409,{error:'Mission already started'});
 const token=crypto.randomBytes(20).toString('hex');r.crew[role]={name:String(b.name||role).trim().slice(0,24),token};log(r.state,`${r.crew[role].name} joined as ${role}.`);emit(r);return json(res,200,{token,role,code:r.code});
 }
 if(req.method==='POST'&&url.pathname==='/api/action'){
 let b=await body(req),r=rooms.get(String(b.code||'').toUpperCase());if(!r)return json(res,404,{error:'Room not found'});
 let role=validToken(r,b.token);if(!role)return json(res,403,{error:'Not authorized. Rejoin your station.'});
 if(['start','reset'].includes(b.type)&&role!=='pilot')return json(res,403,{error:'Only the pilot can start or reset'});
 action(r,role,b.type,b.value);emit(r);return json(res,200,view(r));
 }
 if(req.method==='GET'&&url.pathname==='/api/events'){
 let r=rooms.get(String(url.searchParams.get('code')||'').toUpperCase());if(!r)return json(res,404,{error:'Room not found'});
 res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no','Access-Control-Allow-Origin':'*'});
 res.write(`data: ${JSON.stringify(view(r))}\n\n`);r.clients.add(res);const heartbeat=setInterval(()=>{try{res.write(': heartbeat\n\n')}catch{}},15000);req.on('close',()=>{clearInterval(heartbeat);r.clients.delete(res)});return;
 }
 if(req.method==='GET'){
 let f=url.pathname==='/'?'index.html':url.pathname.slice(1);const full=path.resolve(__dirname,'public',f);if(!full.startsWith(path.join(__dirname,'public')+path.sep)&&full!==path.join(__dirname,'public','index.html')){res.writeHead(403);return res.end()};return respondFile(res,full);
 }
 json(res,404,{error:'Not found'});
 }catch(e){json(res,400,{error:e.message||'Unexpected error'})}
});
setInterval(()=>{for(const [k,v] of rooms)if(Date.now()-v.created>24*60*60*1000){for(const c of v.clients)c.end();rooms.delete(k)}},60*60*1000);
server.listen(PORT,'0.0.0.0',()=>console.log(`The Last Transmission running on http://localhost:${PORT}`));
