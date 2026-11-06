# Last Transmission — Earth Departure / Flight Study 02
A fictional planetary-defense mission. This chapter starts at an Earth launchpad and ends in a parking orbit. Asteroid transfer and deflection are not implemented yet.

## Run and deploy
Node 22: `node server.js`. Render build: `node --check server.js`; start: `node server.js`. One instance; no npm install required. The self-hosted Three.js renderer and Earth textures use WebGL 2 on the shared window, with an automatic software-rendered textured-Earth fallback when WebGL is unavailable. The phone controller works without WebGL.

## Flight
Enter cockpit, then Initiate Countdown. Eight-second countdown. Maintain approximately 86% throttle and keep the guidance ring centered. Arrow keys trim yaw/pitch; W/S increase/decrease throttle. A neutral flight reaches parking orbit after approximately 4 minutes 23 seconds of flight, plus countdown. Stage separation occurs at T+115 seconds. Passing 100 km transitions to insertion. Guided circularization completes in a roughly 188 km orbit at 7.8 km/s.

Use Phone Controller to show and copy the controller address. Click Release Controls on the big screen, then Take Pilot Controls on the phone. Window Only hides control UI; H restores it. Fullscreen uses the browser fullscreen API. A new flight code isolates each session. Reset returns to the pad.

## Model and architecture
Server-authoritative 20 Hz physics and SSE snapshots shared across screens. Pilot lease prevents competing controllers. After 900 ms without command updates, attitude/rate inputs neutralize; the engine retains its current throttle and ascent guidance continues. The pilot can explicitly release controls. Rooms expire after 24 hours or disappear on restart. Free hosting can sleep.

The simplified two-dimensional ascent model integrates radial/tangential motion around a spherical Earth, Newtonian gravity, an exponential atmosphere and approximate drag. Throttle changes acceleration; yaw/pitch trims change the thrust vector. Propellant, load and staging are approximations. Guidance schedules the climb and automatically completes final circularization once the insertion envelope is reached. This is an accessible flight experience, not a launch certification or high-fidelity orbital simulator. The visual globe and sky are illustrative rather than a geospatially precise launch location.

## Graphics and sources
Perspective WebGL scene with a textured Earth sphere, separate drifting cloud shell, atmosphere glow, day/night imagery, directional lighting, cloud billboards, launch gantry and cockpit framing. Imagery is served locally; there are no runtime CDN dependencies.
- Three.js 0.170.0: https://github.com/mrdoob/three.js (MIT; license in public/vendor/THREE-LICENSE.txt).
- Planet textures: Three.js example assets https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets (earth_atmos_2048.jpg, earth_lights_2048.png, earth_clouds_1024.png; copies of night/cloud maps converted to JPEG).
