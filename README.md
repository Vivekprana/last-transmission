# The Last Transmission — 5-player browser prototype

A playable, real-time five-player spaceship emergency game. One player per role: Pilot, Engineer, Communications, Medical, Navigation. All five players interact with their own phone browser. A shared sixth screen is optional. No paid services, frameworks or API keys required.

## Run locally

1. Install Node.js 20+.
2. In this folder, run `node server.js`.
3. Open `http://localhost:3000` and click **Create a mission**.
4. Join the mission as the Pilot. Share the six-character room code with four other players.
5. On the SAME Wi-Fi network, they open `http://YOUR_COMPUTER_LOCAL_IP:3000` on their phones (not `localhost`, which points to each phone).
6. Everyone selects a different station. Pilot starts when all five are present.
7. Optionally choose **DISPLAY MODE** to show a shared bridge screen on a projector or second display.

If the host computer firewall blocks access, permit incoming connections to port 3000. Guest devices and the server must be able to connect to one another.

## Public deployment

Upload this directory to a Node.js hosting provider that supports long-lived processes and Server-Sent Events. Set start command to `node server.js`, and allow the host to set the `PORT` environment variable. Use the provider's HTTPS URL for everyone to join from anywhere. For instance, on Render, create a Web Service from a Git repository with runtime Node and start command `node server.js`.

**Important:** The app uses in-memory room storage and an SSE connection. It is intended for one running Node instance, with no horizontal scaling. Rooms expire after 24 hours and disappear if the server restarts. It is not a production-hardened ticketing or authentication system. Test over venue Wi-Fi before a paid event.

## Play mechanics

- Pilot adjusts the flight heading to the target range.
- Engineer balances reactor output.
- Communications tunes to a distress signal.
- Medical restores life-support circulation.
- Navigator plots an escape vector.
- When all five systems are aligned simultaneously, the crew must choose whether to rescue a stranded vessel or escape. The Navigator commits the final choice.

## Future upgrades

- Timed difficulty, adaptive emergencies, and better real puzzles (today the clues state the answer to test connectivity).
- Actor/GM control screen, cue triggering, audio and lighting integration.
- Session reservations, tickets, and analytics.
- Screen-reader accessibility and richer graphics.
