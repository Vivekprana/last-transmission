# Last Transmission — Asteroid Rendezvous / Flight Study 01
A fictional planetary defense mission. This first slice implements the shared forward window and one pilot, not the complete deflection mission.

Run `node server.js` with Node 22. Render start command: `node server.js`. No packages or external asset services are required.

## Play
Open the site on the big screen and begin a flight. Arrow keys control yaw and pitch. W applies forward thrust; S applies reverse thrust. Release to coast. H shows/hides controls. Fullscreen hides browser chrome where supported.

Use Copy Phone Controller Link to open a control-only station on a phone. Tap Take Pilot Controls on the phone after the previous pilot closes or hides their tab (five-second lease timeout). The main screen remains the shared window. Touch controls are press-and-hold. Only one pilot can command a flight at a time. Display-only URL: `/?room=CODE&window=1`.

## Architecture
The Node server owns each mission's physics, ticks at 20 Hz and broadcasts snapshots through SSE. Displays interpolate position and attitude. Pilot commands are bounded yaw/pitch/thrust inputs. Server cuts input after 900 ms without a command, preserving velocity. A pilot lease prevents competing controllers.

The ship starts 1,800 m from the asteroid center, closing at 5 m/s. Translational acceleration is 3 m/s². Yaw and pitch use assisted angular-rate control; roll is stabilized. Velocity is expressed relative to the asteroid. This short-range flight model omits orbital dynamics and gravity. The rotating, seeded low-poly asteroid is rendered in canvas with perspective projection and directional lighting. A conservative spherical collision envelope is 205 m. Hold 350–550 m from the center at less than 1 m/s for five seconds to establish the survey position.

One Node instance only. Rooms are in memory and expire after 24 hours or on restart. Free Render services may sleep. No persistent sessions, other crew roles, attachment or deflection mechanics yet.
