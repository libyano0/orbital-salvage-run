# Orbital Salvage Run

**Course:** SENG 340 Computer Games and Simulation  
**Final project team:** VectorFlux  
**Game:** Orbital Salvage Run

Orbital Salvage Run is a browser-based canvas game where a salvage drone recovers unstable
reactor cores across three orbital sectors, manages fuel and shield integrity, avoids moving
asteroids, and docks safely at the orbital station.

## Run

From this folder:

```bash
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000
```

On Windows, see `WINDOWS_RUN_INSTRUCTIONS.md`.

## Controls

- `WASD` or arrow keys: thrust
- On-screen directional buttons also work for touch/mouse recording

## Implemented Course Concepts

### Physics

- Semi-implicit Euler integration for player and moving bodies
- Planetary gravity using inverse-square acceleration
- Velocity, acceleration, drag, restitution, and boundary collision response
- Circle-vs-circle collision impulses between asteroids
- Impact damage based on relative collision speed

### Simulation Logic

- Three-sector mission progression
- Dynamic asteroid and reactor-core generation per sector
- Fuel consumption and regeneration
- Shield damage, invulnerability window, docking validation, and mission state
- Particle and pulse systems for feedback events

### Rendering

- HTML5 Canvas rendering loop
- Procedural starfield, planet, station, drone, asteroid, core, particle, and pulse visuals
- Responsive canvas scaling using device pixel ratio
- HUD telemetry for sector, cores, shield, fuel, velocity, gravity, and progress

## Files

- `index.html`: game shell and HUD
- `styles.css`: responsive interface styling
- `src/game.js`: full game loop, physics, simulation, rendering, controls, and UI updates
- `AI_WORKFLOW.md`: behind-the-scenes AI workflow notes for the presentation
- `VIDEO_SCRIPT.md`: ready-to-read video script
- `SUBMISSION_CHECKLIST.md`: final LMS/YouTube checklist

## Submission Format

Submit only an unlisted YouTube link to LMS. Each team member submits the link individually.
Mention the team name, **VectorFlux**, in the recorded video.
