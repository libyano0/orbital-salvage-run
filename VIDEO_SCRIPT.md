# Video Script

Target length: 4-6 minutes.

## Opening

Hello, this is our SENG 340 final project.  
Our team name is **VectorFlux**, and our game is called **Orbital Salvage Run**.

The game was developed from scratch as a browser-based canvas game, and the development
workflow used AI assistance for requirement analysis, game design, code generation,
debugging, and procedural asset creation.

## Gameplay Demonstration

In this game, the player controls a salvage drone in orbit around a planet.  
The goal is to collect all reactor cores in each sector, avoid asteroids, manage fuel and
shield, and then dock at the orbital station.

The HUD shows the current sector, collected cores, shield, fuel, velocity, gravity, and
overall mission progress.

The planet applies gravity to the drone and to moving objects. The drone is controlled by
thrust, so the movement is based on acceleration and velocity rather than direct position
teleporting.

Asteroids are simulated as moving circular bodies. If the drone collides with an asteroid,
the impact damage is calculated using relative speed, and the drone is pushed away by a
collision impulse.

After all cores are collected, the station becomes the objective. The drone must approach
the station at a controlled speed to complete the sector.

## Code Walkthrough

The main files are:

- `index.html`, which defines the canvas, HUD, overlays, and control buttons.
- `styles.css`, which defines the responsive layout and visual interface.
- `src/game.js`, which contains the game loop, physics, simulation, rendering, controls,
  and UI updates.

The physics is implemented in `src/game.js`.

The `gravityAt` function calculates inverse-square gravity from the planet.  
The `update` function applies player thrust, gravity, drag, and position integration.  
Collision handling is implemented through `resolveWorldBounds`, `resolvePlanetCollision`,
`resolveCircleCollision`, and `handleAsteroidImpacts`.

The simulation logic is handled by functions such as `populateSector`,
`handleCollections`, `handleDocking`, and `finish`. These functions manage sector
progression, collectible cores, docking, failure, and mission completion.

Rendering is done with the HTML5 Canvas API. The `draw` function calls separate render
functions for the background, gravity grid, planet, station, cores, asteroids, player,
particles, and pulses.

The assets are procedural. The planet, asteroids, drone, station, stars, and particle
effects are all drawn in code instead of imported from external files.

## AI Workflow Explanation

AI was used as a development assistant. First, it helped inspect the final project brief
and convert it into implementation requirements. Then it helped choose a game concept that
would clearly demonstrate physics, simulation, and rendering.

During coding, AI helped generate the structure and implement the game systems. It was
also used for debugging and checking syntax. For visual assets, AI helped create the
procedural rendering approach, so the project does not depend on downloaded art.

The final result is a complete game with real-time physics, simulated moving objects,
mission progression, procedural visuals, and a playable browser interface.

## Closing

This completes the demonstration of **Orbital Salvage Run** by team **VectorFlux**.
