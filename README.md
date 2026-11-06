# Last Transmission — Earth Departure / Flight Study 03
Fictional planetary defense mission: Earth launch to parking orbit. Asteroid transfer, rendezvous and deflection are not built into this chapter.

## Run
Node 22: `node server.js`. Render build: `node --check server.js`; start: `node server.js`. One running instance. No npm install required. Three.js, Earth textures and generated audio are self-hosted. The main screen uses WebGL 2 with an automatic textured software fallback; the pilot station does not need WebGL.

## Play
1. Open the site on the big screen and choose Create Shared Window.
2. Click Connect Phone and open its pilot link on a phone. Alternatively, open `/?controller=1` and enter the six-character flight code.
3. The phone automatically claims the pilot station. Set the forward-thrust lever, then initiate countdown on the phone.
4. Drag the circular joystick to apply yaw/pitch torque. Release early: angular motion persists and gradually damps. Keep the guidance ring centered on the shared window. Gusts and a stage-separation impulse require active corrections.
5. The lever is forward thrust only, 0–100%. There is no reverse engine. Around 86% is the baseline ascent setting. Launch, reset and release are all on the phone.
6. Enable Sound on the big screen to unlock browser audio. Engine rumble responds to thrust, airflow responds to dynamic pressure, countdown tones increase urgency, staging thumps, deviation/link-loss warnings beep and orbit has a confirmation chime. Mute and volume are available on the shared screen.

The central window has no flight keyboard bindings or flight-control widgets. Pilot-station tokens authorize the control endpoints, and an exclusive pilot lease prevents competing controllers. The controller URL separates product roles; it is not a security attestation that the client is a physical phone. Alternative touch sliders are included for users who cannot use the circular joystick. Phone joystick pointer capture supports steering and throttle with separate fingers.

## Difficulty and connection behavior
The ship does not automatically follow the guidance pitch. Inputs apply angular acceleration with damped inertia. A climb program supplies a target, while atmospheric disturbances and staging perturb the actual attitude. Sustained deviation beyond 12 degrees accumulates stress; stress recovers inside the safe corridor. An unattended flight loses its trajectory in roughly 48 seconds. Simulated active corrections reach orbit in approximately 4 minutes 23 seconds, plus an eight-second countdown. Poor steering or throttle can extend the flight or cause failure.

When pilot updates stop for more than 1.2 seconds, an active launch pauses rather than crashing due to a connection interruption. Return to the phone controller to resume. Reclaim the pilot station if another pilot has taken the lease. Releasing the joystick centers input, not angular velocity. Reset on the phone starts over at the pad.

## Model and architecture
Server-authoritative 20 Hz motion and SSE snapshots shared across windows. Radial/tangential motion around a spherical Earth includes Newtonian gravity, an exponential atmosphere and approximate drag. Throttle changes acceleration; yaw/pitch change the thrust vector. Fuel, load and staging are approximations. The final insertion envelope still performs assisted circularization. This is a flight experience prototype rather than a high-fidelity orbital simulator. The scenery is illustrative, not a geospatially precise Kennedy Space Center reconstruction.

Rooms expire after 24 hours or disappear on server restart. Free hosting can sleep. No durable reservation, ticketing or authentication system is provided.

## Graphics and sources
Perspective WebGL scene with textured Earth, separate cloud shell, atmosphere glow, directional lighting, cloud billboards, launch gantry and cockpit framing; software ray/sphere rendering when WebGL is unavailable. Browser-generated Web Audio synthesis uses no licensed sound downloads.
- Three.js 0.170.0: https://github.com/mrdoob/three.js (MIT; license in public/vendor/THREE-LICENSE.txt).
- Planet textures: https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets (earth_atmos_2048.jpg, earth_lights_2048.png, earth_clouds_1024.png; locally optimized JPEG copies).
