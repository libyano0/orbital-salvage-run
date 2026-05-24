# Windows Run Instructions

## Option 1: Run Without Terminal

1. Download the project ZIP from GitHub.
2. Right-click the ZIP file and choose **Extract All**.
3. Open the extracted folder.
4. Double-click `index.html`.
5. The game should open in your browser.

If the game opens correctly, this is enough for recording the final project video.

## Option 2: Run With Python Local Server

Use this if double-clicking `index.html` does not work correctly.

1. Install Python from:

```text
https://www.python.org/downloads/
```

During installation, enable:

```text
Add python.exe to PATH
```

2. Open the project folder.
3. Click the address bar, type `cmd`, and press Enter.
4. Run:

```bat
python -m http.server 8000
```

If `python` does not work, try:

```bat
py -m http.server 8000
```

5. Open this link in the browser:

```text
http://localhost:8000
```

## Recording Checklist

- Open the game.
- Press **Start Mission**.
- Show movement using arrow keys or WASD.
- Show the HUD: sector, cores, shield, fuel, velocity, gravity, and mission progress.
- Collect at least one reactor core.
- Show the planet gravity effect by flying near the planet.
- Show asteroid avoidance or collision.
- Show the code on GitHub or in the local folder.
- Mention the team name: **VectorFlux**.
- Mention the game name: **Orbital Salvage Run**.
