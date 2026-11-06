const {initial,step}=require('./physics');const roles=['pilot','navigator','engineer'];const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function pilotAI(s){return {yaw:clamp((-s.yaw*2-s.yawRate*2)/16,-1,1),pitch:clamp((-s.pitch*2-s.pitchRate*2)/14,-1,1),throttle:.86};}
function makeRoom(id,host){return {id,host,s:initial(),crew:Object.fromEntries(roles.map(role=>[role,{token:null,last:0}])),pilotInput:{yaw:0,pitch:0,throttle:.86},clients:new Set(),created:Date.now(),trace:[],forecast:[],sample:0};}
function active(r,role,now=Date.now()){const c=r.crew[role];return !!c.token&&now-c.last<1600;}
function applyAI(r,now){const s=r.s;if(!active(r,'navigator',now)){s.navigation.bias*=.97;}if(!active(r,'engineer',now)){s.engineering={cap:s.q>35?.82:.95,cooling:s.engineTemp>65?.95:.65,reserve:10};}}
function tick(r,dt,now=Date.now()){applyAI(r,now);r.s.linkLost=false;step(r.s,active(r,'pilot',now)?r.pilotInput:pilotAI(r.s),dt);r.sample+=dt;if(r.sample>=1){r.sample=0;if(!['pad','countdown'].includes(r.s.phase)){r.trace.push([r.s.downrange,r.s.altitude]);if(r.trace.length>600)r.trace.shift();}r.forecast=forecast(r.s);}}
function forecast(state){if(['pad','countdown','orbit','aborted'].includes(state.phase))return [];const s=structuredClone(state),points=[];for(let i=0;i<600;i++){step(s,pilotAI(s),.1);if(i%30===0)points.push([s.downrange,s.altitude]);if(['orbit','aborted'].includes(s.phase))break;}return points;}
function view(r){return {id:r.id,...r.s,crew:Object.fromEntries(roles.map(role=>[role,{mode:active(r,role)?'human':'ai'}])),trace:r.trace,forecast:r.forecast,input:active(r,'pilot')?r.pilotInput:pilotAI(r.s)};}
module.exports={roles,pilotAI,makeRoom,active,tick,view};
