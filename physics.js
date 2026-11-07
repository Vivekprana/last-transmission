const {initialEncounter,stepEncounter}=require('./encounter');
const DEG=Math.PI/180,MU=398600.4418,R=6371;
const initial=()=>({...initialEncounter(),phase:'pad',time:0,elapsed:0,countdown:8,altitude:.035,radial:0,speed:0,downrange:0,yaw:0,pitch:0,targetPitch:88,throttle:.86,fuel:100,q:0,g:1,hold:0,message:'Launch vehicle ready. Initiate countdown.',navigation:{profile:"balanced",altitude:220,bias:0},engineering:{cap:.95,cooling:.65,reserve:10},engineTemp:26,availableThrust:1,attitudePitch:88,pitchRate:0,yawRate:0,stress:0,linkLost:false});
function step(s,input,dt){if(s.phase==='pad'||s.phase==='briefing'||s.phase==='aborted')return s;s.elapsed+=dt;if(s.phase==='countdown'){s.countdown=Math.max(0,s.countdown-dt);if(s.countdown===0){s.phase='ascent';s.message='Liftoff. Hold the guidance marker.';}return s;}
if(['orbit','departure','complete'].includes(s.phase))return stepEncounter(s,input,dt);
s.time+=dt;if(Number.isFinite(input.throttle))s.throttle=Math.max(0,Math.min(1,input.throttle));
const t=s.time;s.stage=t<115?1:2;const r=R+s.altitude,circular=Math.sqrt(MU/r);s.targetPitch=t<12?88:Math.max(-7,80*Math.pow(Math.max(0,1-(t-12)/225),1.6));if(s.altitude>20){const desiredClimb=Math.max(-.1,Math.min(1.3,(s.navigation.altitude-s.altitude)*.012));s.targetPitch=Math.max(-14,Math.min(70,(desiredClimb-s.radial)*32+3));}
s.targetPitch=Math.max(-20,Math.min(90,s.targetPitch+s.navigation.bias));
const air=Math.exp(-s.altitude/45),gust=(Math.sin(t*.73)+.7*Math.sin(t*1.91)) * air;
if(s.stage===2&&!s.separated){s.separated=true;s.pitchRate-=2.4;s.yawRate+=2.8;}
s.pitchRate+=(input.pitch*14+gust*.9-s.pitchRate*.8)*dt;
s.yawRate+=(input.yaw*16+air*(.7*Math.sin(t*.51)+.5*Math.cos(t*1.33))-s.yawRate*.75)*dt;
s.attitudePitch=Math.max(-40,Math.min(120,s.attitudePitch+s.pitchRate*dt));s.yaw+=s.yawRate*dt;s.pitch=s.attitudePitch-s.targetPitch;
const error=Math.hypot(s.pitch,s.yaw);s.stress=Math.max(0,Math.min(100,s.stress+(error>12?(error-12)*.34:-1.5)*dt));
s.throttle=Math.min(s.throttle,s.engineering.cap);
s.engineTemp=Math.max(15,Math.min(120,s.engineTemp+(s.throttle*s.throttle*1.9-s.engineering.cooling*1.7-.3)*dt));
s.availableThrust=Math.min(s.engineering.cap,s.engineTemp>95?Math.max(.35,1-(s.engineTemp-95)*.045):1);if(s.fuel<=s.engineering.reserve)s.availableThrust=0;
s.throttle=Math.min(s.throttle,s.availableThrust);
const angle=s.attitudePitch*DEG;let acceleration=(s.stage===1?.029+t*.000065:.044+(t-115)*.000035)*s.throttle;
const density=1.225*Math.exp(-s.altitude/8.5),velocity=Math.hypot(s.radial,s.speed);s.q=.5*density*(velocity*1000)**2/1000;const drag=.000000045*density*(velocity*1000)**2;
s.radial+=(acceleration*Math.sin(angle)+s.speed*s.speed/r-MU/(r*r)-drag*(s.radial/(velocity||1)))*dt;s.speed+=(acceleration*Math.cos(angle)*Math.cos(s.yaw*DEG)-s.radial*s.speed/r-drag*(s.speed/(velocity||1)))*dt;s.altitude+=s.radial*dt;s.downrange+=s.speed*dt;s.g=acceleration/.00980665;s.fuel=Math.max(0,s.fuel-(s.throttle*.23+s.engineering.cooling*.035)*dt);
if(s.stress>=100){s.phase='aborted';s.message='Trajectory lost. Reset and counter the drift with smaller joystick corrections.';}else if(s.altitude<.025){s.altitude=.025;s.phase='aborted';s.message='Vehicle returned to ground. Reset and maintain launch thrust.';}else if(s.fuel<=0||t>440){s.phase='aborted';s.message='Insertion window missed. Reset and follow guidance.';}else if(s.altitude>160&&Math.abs(s.altitude-s.navigation.altitude)<35&&s.speed>=circular*.985&&Math.abs(s.radial)<.8){s.phase='orbit';s.speed=circular;s.radial=0;s.hold=1;s.message='Parking orbit established. Earth departure is the next mission chapter.';}else if(s.altitude>100){s.phase='insertion';s.message='Above the atmosphere. Follow the marker to build orbital speed.';}else if(s.q>25){s.message='Maximum aerodynamic pressure. Keep corrections small.';}else if(t>115){s.message='Stage two active. Continue the climb.';}else{s.message='Steer with the phone joystick. Keep the guidance ring centered; release early to avoid overshoot.';}
return s;}
module.exports={initial,step};
