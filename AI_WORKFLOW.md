# AI Workflow Notes

Use these notes in the behind-the-scenes part of the final project video.

## Team and Game Direction

- Team name selected: **VectorFlux**
- Game selected: **Orbital Salvage Run**
- Project direction: a compact browser game that clearly demonstrates physics, simulation
  logic, and rendering without requiring installation or external assets.

## AI-Assisted Development Workflow

1. **Requirement extraction**
   - The project brief was inspected and converted into concrete deliverables:
     functional game, code walkthrough, gameplay demo, and AI workflow explanation.

2. **Game design**
   - AI helped choose a game concept that naturally exposes course concepts:
     gravity, thrust, moving bodies, collisions, state simulation, and real-time rendering.

3. **Implementation**
   - AI generated the initial project structure:
     `index.html`, `styles.css`, `src/game.js`, and documentation.
   - The game loop was implemented with a fixed-step simulation update and a canvas render loop.
   - Physics logic was separated into functions for gravity, integration, collision response,
     world bounds, and planet collision handling.

4. **Debugging and refinement**
   - AI-assisted review focused on syntax correctness, runtime flow, UI state updates,
     collision behavior, and responsive layout.
   - The project was checked with JavaScript syntax validation and a local server smoke test.

5. **Asset creation**
   - Instead of importing external artwork, the visual assets are generated procedurally in code:
     planet, drone, asteroids, station, stars, particles, and collection pulses.
   - This keeps the project original and easy to explain during the code walkthrough.

## What to Show in the Video

- Show the running game first.
- Collect at least one reactor core.
- Let the drone pass near the planet to show gravity influence.
- Hit or narrowly avoid an asteroid to show collision simulation.
- Return to the station after collecting all cores in a sector.
- Show `src/game.js` and point to the functions that implement physics, simulation, and rendering.
