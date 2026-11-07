# Last Transmission — Optional Crew / Flight 04
Fictional Earth-launch chapter ending in parking orbit. Asteroid transfer and deflection are not built yet.

## Run and deploy
Node 22: `node server.js`. Render build: `node --check server.js`; start: `node server.js`. One instance. No npm install required. Graphics, textures and synthesized audio are served locally. WebGL 2 has a software-rendered fallback; phone stations do not require 3D.

## Any crew size
Create a shared window on the main screen. Pilot, navigator and engineer begin in GAME AI mode. Start Mission runs a fully automated flight even with no players. Start/reset on the shared window are mission-host actions, not steering controls; no flight keyboard bindings exist.

Open a crew link on a phone, or `/?controller=1` and enter the code. Choose Pilot, Navigator or Engineer. Claim any available seat before or during flight. Hand to AI releases it immediately. If its phone stops heartbeats for 1.6 seconds, the game controller takes over without pausing. Return to the phone to resume if the lease has not been replaced. Each station has an exclusive lease. You can switch seats from the phone selector; an occupied seat rejects a competing claim. Every role is optional, including the pilot.

## Roles
- Pilot: analog thumb joystick applies yaw/pitch torque with inertia, gusts and staging kicks. Forward-only 0–100% thrust lever. No reverse engine. Release centers input rather than angular velocity. Sustained guidance error accumulates trajectory stress. Alternative touch sliders are available.
- Navigator: ascent map shows actual path (cyan), committed target altitude (dashed), and a 60-second projection assuming guidance tracking (gold). Select low (180 km), balanced (220 km), or high (260 km) target orbit; optionally apply a −8° to +8° pitch offset, then Commit Flight Plan. The pilot's guidance target and the physical climb respond. A higher target requires a longer climb and more fuel. The final insertion envelope allows up to 35 km deviation from target; this is a simplified assisted launch model.
- Engineer: cap available engine thrust (50–100%), allocate cooling (0–100%) and protect a fuel reserve (5–40%). Apply Allocation makes these limits authoritative. Delivered thrust is the lesser of pilot request and engine capability. Above 95°C heat derates thrust. Cooling consumes auxiliary fuel; reserves cut engine thrust when reached. The pilot's throttle lever is a request, not an override of engine limits.

## Built-in game controllers
These are deterministic simulation controllers, not LLM calls. The AI pilot tracks the current guidance with damped feedback; the AI navigator retains the committed route and relaxes manual pitch offsets; the AI engineer manages a conservative thrust cap, cooling and reserve. Role labels on the main window always show HUMAN or GAME AI. A human can make poor decisions; optional AI fills empty seats rather than overriding an occupied station.

## Flight model
Server-authoritative 20 Hz integration and SSE snapshots. Radial/tangential motion includes Newtonian gravity around a spherical Earth, exponential atmospheric density and approximate drag. The navigator's target defines guidance, and actual pilot attitude determines the thrust vector. Angular inertia, gusts and staging impulses require corrections. Engine heat, fuel and cooling are simplified. Assisted final circularization completes the insertion envelope. This is a game prototype, not a high-fidelity orbital simulator or geospatial reconstruction of Kennedy Space Center.

A balanced automated flight takes about 4 minutes 24 seconds plus an eight-second countdown. Hands-off human piloting can lose the trajectory in under a minute. All eight combinations of occupied/unoccupied roles were simulated to orbit using active control inputs for the occupied pilot. Live endpoint checks verify independent role authorization, exclusive seats, course/allocation effects and automatic takeover on release/disconnection.

Rooms expire after 24 hours or disappear on restart. Free hosting may sleep. Reservations, durable saves and ticketing are not provided.

## Sound and graphics
Enable Sound on the main window to unlock browser audio. Engine/sub-bass rumble responds to thrust, airflow to pressure, with countdown tones, staging thump, deviation alerts and an orbit chime. Sound activation is one-way; there is no off/mute control. Volume remains adjustable above zero. A shared fuel bar on the main window and all phone stations marks the protected reserve. Audio is generated with Web Audio; no external sound downloads.

Three.js 0.170.0 (MIT): https://github.com/mrdoob/three.js — license in public/vendor/THREE-LICENSE.txt. Planet textures from https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets (earth_atmos_2048.jpg, earth_lights_2048.png, earth_clouds_1024.png; optimized JPEG copies).

## Departure encounter
After parking orbit, a 20–110 second maneuver window opens. Deliver 350 m/s and preserve 25% fuel, then cut thrust. The prototype ends at departure confirmation; the asteroid transfer remains a future chapter.

Use **Practice departure encounter** to start at parking orbit with 45% fuel. Press Start mission to begin the clock. Reset preserves practice mode.

Navigator: compare steady 55% and pulsed 95% burns on the time/delta-v graph, inspect predicted finish/fuel/temperature with current equipment, choose a start delay, commit, and monitor actual progress. Predictions assume accurate piloting and cutoff and do not predict future equipment faults.

Engineer: diagnose primary-loop pressure collapse, isolate the leaking loop, activate backup cooling, and communicate capability. Sustained configuration supports 55% continuously. Boost permits 95% in 18-second pulses with eight seconds coast between. Leaving the primary loop open continues coolant loss even if backup is active.

Pilot: hold attitude and manually execute the committed throttle schedule, including coasts and final cutoff. Phones remain the flight controls. Empty stations use deterministic AI and can be taken over or handed back mid-mission. Flight director messages and maneuver progress appear on the shared screen.
