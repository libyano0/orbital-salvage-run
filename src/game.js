"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  status: document.getElementById("statusText"),
  sector: document.getElementById("sectorValue"),
  cores: document.getElementById("coresValue"),
  shield: document.getElementById("shieldValue"),
  fuel: document.getElementById("fuelValue"),
  velocity: document.getElementById("velocityValue"),
  gravity: document.getElementById("gravityValue"),
  missionBar: document.getElementById("missionBar"),
  startOverlay: document.getElementById("startOverlay"),
  resultOverlay: document.getElementById("resultOverlay"),
  resultKicker: document.getElementById("resultKicker"),
  resultTitle: document.getElementById("resultTitle"),
  resultCopy: document.getElementById("resultCopy"),
  summarySector: document.getElementById("summarySector"),
  summaryCores: document.getElementById("summaryCores"),
  summaryTime: document.getElementById("summaryTime"),
  startButton: document.getElementById("startButton"),
  restartButton: document.getElementById("restartButton"),
};

const TAU = Math.PI * 2;
const keys = new Set();
const activeTouchKeys = new Set();

const game = {
  width: 0,
  height: 0,
  scale: 1,
  lastTime: 0,
  accumulator: 0,
  fixedStep: 1 / 120,
  running: false,
  over: false,
  elapsed: 0,
  sector: 1,
  maxSector: 3,
  totalCollected: 0,
  cameraShake: 0,
  planet: null,
  station: null,
  player: null,
  stars: [],
  asteroids: [],
  cores: [],
  particles: [],
  pulses: [],
};

class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  clone() {
    return new Vec2(this.x, this.y);
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  mul(s) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  len() {
    return Math.hypot(this.x, this.y);
  }

  normalize() {
    const length = this.len() || 1;
    this.x /= length;
    this.y /= length;
    return this;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  static fromAngle(angle, length = 1) {
    return new Vec2(Math.cos(angle) * length, Math.sin(angle) * length);
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  game.width = Math.floor(window.innerWidth);
  game.height = Math.floor(window.innerHeight);
  game.scale = dpr;
  canvas.width = Math.floor(game.width * dpr);
  canvas.height = Math.floor(game.height * dpr);
  canvas.style.width = `${game.width}px`;
  canvas.style.height = `${game.height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildScene(false);
}

function buildScene(resetPlayer = true) {
  const minSide = Math.min(game.width, game.height);
  game.planet = {
    pos: new Vec2(game.width * 0.28, game.height * 0.56),
    radius: clamp(minSide * 0.16, 88, 180),
    mass: 540000 + game.sector * 65000,
    rotation: 0,
  };
  game.station = {
    pos: new Vec2(game.width * 0.78, game.height * 0.34),
    radius: 44,
    angle: 0,
  };

  if (!game.stars.length) {
    for (let i = 0; i < 220; i += 1) {
      game.stars.push({
        x: Math.random(),
        y: Math.random(),
        size: rand(0.6, 2.2),
        depth: rand(0.2, 1),
        flicker: rand(0, TAU),
      });
    }
  }

  if (resetPlayer || !game.player) {
    game.player = {
      pos: new Vec2(game.width * 0.74, game.height * 0.72),
      vel: new Vec2(0, -36),
      radius: 15,
      angle: -Math.PI / 2,
      shield: 100,
      fuel: 100,
      collected: 0,
      docked: false,
      invulnerable: 0,
    };
  } else {
    game.player.pos.x = clamp(game.player.pos.x, 80, game.width - 80);
    game.player.pos.y = clamp(game.player.pos.y, 80, game.height - 80);
  }
}

function resetMission() {
  game.running = true;
  game.over = false;
  game.elapsed = 0;
  game.sector = 1;
  game.totalCollected = 0;
  game.cameraShake = 0;
  game.asteroids = [];
  game.cores = [];
  game.particles = [];
  game.pulses = [];
  buildScene(true);
  populateSector();
  ui.startOverlay.classList.remove("active");
  ui.resultOverlay.classList.remove("active");
  setStatus("Sector 1 active");
}

function populateSector() {
  game.asteroids = [];
  game.cores = [];

  const asteroidCount = 8 + game.sector * 3;
  const coreCount = 3 + game.sector;
  const minPlanetClearance = game.planet.radius + 62;

  for (let i = 0; i < asteroidCount; i += 1) {
    const orbit = rand(minPlanetClearance + 30, Math.max(game.width, game.height) * 0.55);
    const angle = (i / asteroidCount) * TAU + rand(-0.24, 0.24);
    const pos = game.planet.pos.clone().add(Vec2.fromAngle(angle, orbit));
    const tangent = Vec2.fromAngle(angle + Math.PI / 2, rand(28, 74) * (Math.random() > 0.5 ? 1 : -1));
    game.asteroids.push({
      pos,
      vel: tangent,
      radius: rand(15, 31) + game.sector * 1.5,
      mass: rand(70, 160),
      spin: rand(-1.1, 1.1),
      angle: rand(0, TAU),
      roughness: Array.from({ length: 10 }, () => rand(0.78, 1.22)),
    });
  }

  for (let i = 0; i < coreCount; i += 1) {
    const angle = (i / coreCount) * TAU + rand(0.2, 0.7);
    const orbit = rand(minPlanetClearance + 60, Math.max(game.width, game.height) * 0.48);
    const pos = game.planet.pos.clone().add(Vec2.fromAngle(angle, orbit));
    game.cores.push({
      pos,
      vel: Vec2.fromAngle(angle + Math.PI / 2, rand(12, 32)),
      radius: 11,
      phase: rand(0, TAU),
      collected: false,
    });
  }
}

function setStatus(text) {
  ui.status.textContent = text;
}

function gravityAt(pos) {
  const direction = game.planet.pos.clone().sub(pos);
  const distSq = Math.max(direction.x * direction.x + direction.y * direction.y, game.planet.radius * game.planet.radius);
  const strength = game.planet.mass / distSq;
  return direction.normalize().mul(strength);
}

function controlVector() {
  const vector = new Vec2();
  const isDown = (code) => keys.has(code) || activeTouchKeys.has(code);

  if (isDown("ArrowUp") || isDown("KeyW")) vector.y -= 1;
  if (isDown("ArrowDown") || isDown("KeyS")) vector.y += 1;
  if (isDown("ArrowLeft") || isDown("KeyA")) vector.x -= 1;
  if (isDown("ArrowRight") || isDown("KeyD")) vector.x += 1;

  if (vector.len() > 0) vector.normalize();
  return vector;
}

function update(dt) {
  if (!game.running || game.over) return;

  game.elapsed += dt;
  game.planet.rotation += dt * 0.05;
  game.station.angle += dt * 0.85;
  game.cameraShake = Math.max(0, game.cameraShake - dt * 20);

  const player = game.player;
  player.invulnerable = Math.max(0, player.invulnerable - dt);

  const input = controlVector();
  const g = gravityAt(player.pos);
  const thrustPower = 228;
  const fuelBurn = input.len() > 0 ? 12 * dt : -7 * dt;
  player.fuel = clamp(player.fuel - fuelBurn, 0, 100);

  if (input.len() > 0 && player.fuel > 0) {
    player.vel.add(input.clone().mul(thrustPower * dt));
    player.angle = Math.atan2(input.y, input.x);
    emitThruster(input);
  }

  player.vel.add(g.mul(dt));
  player.vel.mul(1 - 0.045 * dt);
  player.pos.add(player.vel.clone().mul(dt));

  resolveWorldBounds(player, 0.72);
  resolvePlanetCollision(player);
  updateObjects(dt);
  handleCollections();
  handleAsteroidImpacts();
  handleDocking();
  updateParticles(dt);
  updateUi();

  if (player.shield <= 0) {
    finish(false, "Drone destroyed", "Shield integrity reached zero before docking.");
  }
}

function updateObjects(dt) {
  for (const asteroid of game.asteroids) {
    asteroid.vel.add(gravityAt(asteroid.pos).mul(dt * 0.42));
    asteroid.vel.mul(1 - 0.012 * dt);
    asteroid.pos.add(asteroid.vel.clone().mul(dt));
    asteroid.angle += asteroid.spin * dt;
    resolveWorldBounds(asteroid, 0.88);
    resolvePlanetCollision(asteroid, 0.65);
  }

  for (const core of game.cores) {
    if (core.collected) continue;
    core.phase += dt * 3;
    core.vel.add(gravityAt(core.pos).mul(dt * 0.3));
    core.vel.mul(1 - 0.02 * dt);
    core.pos.add(core.vel.clone().mul(dt));
    resolveWorldBounds(core, 0.7);
    resolvePlanetCollision(core, 0.62);
  }

  for (let i = 0; i < game.asteroids.length; i += 1) {
    for (let j = i + 1; j < game.asteroids.length; j += 1) {
      resolveCircleCollision(game.asteroids[i], game.asteroids[j], 0.8);
    }
  }
}

function resolveWorldBounds(body, restitution) {
  const margin = body.radius + 8;
  if (body.pos.x < margin) {
    body.pos.x = margin;
    body.vel.x = Math.abs(body.vel.x) * restitution;
  } else if (body.pos.x > game.width - margin) {
    body.pos.x = game.width - margin;
    body.vel.x = -Math.abs(body.vel.x) * restitution;
  }

  if (body.pos.y < margin) {
    body.pos.y = margin;
    body.vel.y = Math.abs(body.vel.y) * restitution;
  } else if (body.pos.y > game.height - margin) {
    body.pos.y = game.height - margin;
    body.vel.y = -Math.abs(body.vel.y) * restitution;
  }
}

function resolvePlanetCollision(body, restitution = 0.76) {
  const delta = body.pos.clone().sub(game.planet.pos);
  const distance = delta.len();
  const minDistance = game.planet.radius + body.radius;
  if (distance >= minDistance) return;

  const normal = delta.normalize();
  body.pos = game.planet.pos.clone().add(normal.clone().mul(minDistance + 0.5));
  const velocityAlongNormal = body.vel.dot(normal);
  if (velocityAlongNormal < 0) {
    body.vel.sub(normal.mul((1 + restitution) * velocityAlongNormal));
  }
}

function resolveCircleCollision(a, b, restitution = 0.7) {
  const delta = b.pos.clone().sub(a.pos);
  const distance = delta.len();
  const minDistance = a.radius + b.radius;
  if (distance <= 0 || distance >= minDistance) return;

  const normal = delta.mul(1 / distance);
  const overlap = minDistance - distance;
  a.pos.add(normal.clone().mul(-overlap * 0.5));
  b.pos.add(normal.clone().mul(overlap * 0.5));

  const relative = b.vel.clone().sub(a.vel);
  const velocityAlongNormal = relative.dot(normal);
  if (velocityAlongNormal > 0) return;

  const invMassA = 1 / (a.mass || 1);
  const invMassB = 1 / (b.mass || 1);
  const impulseMag = (-(1 + restitution) * velocityAlongNormal) / (invMassA + invMassB);
  const impulse = normal.mul(impulseMag);
  a.vel.sub(impulse.clone().mul(invMassA));
  b.vel.add(impulse.mul(invMassB));
}

function handleCollections() {
  const player = game.player;
  for (const core of game.cores) {
    if (core.collected) continue;
    const distance = core.pos.clone().sub(player.pos).len();
    if (distance < player.radius + core.radius + 6) {
      core.collected = true;
      player.collected += 1;
      game.totalCollected += 1;
      player.fuel = clamp(player.fuel + 18, 0, 100);
      addPulse(core.pos, "#37d6bd", 48);
      burst(core.pos, "#37d6bd", 18, 145);
      setStatus(`Core secured ${player.collected}/${game.cores.length}`);
    }
  }
}

function handleAsteroidImpacts() {
  const player = game.player;
  if (player.invulnerable > 0) return;

  for (const asteroid of game.asteroids) {
    const delta = player.pos.clone().sub(asteroid.pos);
    const distance = delta.len();
    if (distance >= player.radius + asteroid.radius) continue;

    const normal = delta.normalize();
    const relativeSpeed = player.vel.clone().sub(asteroid.vel).len();
    const damage = clamp(relativeSpeed * 0.08 + asteroid.radius * 0.12, 7, 22);
    player.shield = clamp(player.shield - damage, 0, 100);
    player.invulnerable = 0.45;
    player.vel.add(normal.clone().mul(140 + damage * 4));
    asteroid.vel.sub(normal.mul(32));
    game.cameraShake = Math.min(14, game.cameraShake + damage * 0.38);
    addPulse(player.pos, "#e75d53", 60);
    burst(player.pos, "#e75d53", 22, 180);
    setStatus(`Impact detected -${Math.round(damage)} shield`);
    break;
  }
}

function handleDocking() {
  const player = game.player;
  const allCores = player.collected === game.cores.length;
  const distance = player.pos.clone().sub(game.station.pos).len();
  const speed = player.vel.len();

  if (!allCores) return;
  if (distance > game.station.radius + player.radius + 18) {
    setStatus("Return to dock");
    return;
  }

  if (speed < 96) {
    addPulse(game.station.pos, "#89d66e", 110);
    burst(game.station.pos, "#89d66e", 32, 190);
    if (game.sector >= game.maxSector) {
      finish(true, "Mission complete", "All sectors cleared and reactor cores recovered.");
      return;
    }
    game.sector += 1;
    setStatus(`Sector ${game.sector} active`);
    player.collected = 0;
    player.shield = clamp(player.shield + 18, 0, 100);
    player.fuel = 100;
    player.pos.set(game.width * 0.74, game.height * 0.72);
    player.vel.set(0, -42 - game.sector * 8);
    buildScene(false);
    populateSector();
  } else {
    setStatus("Dock approach unstable");
  }
}

function finish(success, title, copy) {
  game.running = false;
  game.over = true;
  ui.resultKicker.textContent = success ? "Mission Report" : "Failure Report";
  ui.resultTitle.textContent = title;
  ui.resultCopy.textContent = copy;
  ui.summarySector.textContent = `${game.sector} / ${game.maxSector}`;
  ui.summaryCores.textContent = `${game.totalCollected}`;
  ui.summaryTime.textContent = formatTime(game.elapsed);
  ui.resultOverlay.classList.add("active");
}

function emitThruster(input) {
  const back = input.clone().mul(-1);
  const origin = game.player.pos.clone().add(back.clone().mul(game.player.radius * 0.8));
  if (Math.random() < 0.72) {
    game.particles.push({
      pos: origin,
      vel: back.mul(rand(90, 170)).add(new Vec2(rand(-20, 20), rand(-20, 20))),
      life: rand(0.25, 0.48),
      maxLife: 0.48,
      size: rand(2, 4),
      color: Math.random() > 0.35 ? "#f3b44b" : "#37d6bd",
    });
  }
}

function burst(pos, color, count, speed) {
  for (let i = 0; i < count; i += 1) {
    game.particles.push({
      pos: pos.clone(),
      vel: Vec2.fromAngle(rand(0, TAU), rand(speed * 0.2, speed)),
      life: rand(0.4, 0.9),
      maxLife: 0.9,
      size: rand(2, 5),
      color,
    });
  }
}

function addPulse(pos, color, radius) {
  game.pulses.push({
    pos: pos.clone(),
    color,
    radius,
    life: 0.55,
    maxLife: 0.55,
  });
}

function updateParticles(dt) {
  for (const particle of game.particles) {
    particle.life -= dt;
    particle.vel.mul(1 - 1.6 * dt);
    particle.pos.add(particle.vel.clone().mul(dt));
  }
  game.particles = game.particles.filter((p) => p.life > 0);

  for (const pulse of game.pulses) {
    pulse.life -= dt;
  }
  game.pulses = game.pulses.filter((p) => p.life > 0);
}

function draw() {
  const shakeX = game.cameraShake ? rand(-game.cameraShake, game.cameraShake) : 0;
  const shakeY = game.cameraShake ? rand(-game.cameraShake, game.cameraShake) : 0;

  ctx.save();
  ctx.clearRect(0, 0, game.width, game.height);
  ctx.translate(shakeX, shakeY);
  drawBackground();
  drawGravityGrid();
  drawPlanet();
  drawStation();
  drawCores();
  drawAsteroids();
  drawPlayer();
  drawParticles();
  drawPulses();
  ctx.restore();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, game.width, game.height);
  gradient.addColorStop(0, "#07090d");
  gradient.addColorStop(0.52, "#0d1113");
  gradient.addColorStop(1, "#19100e");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, game.width, game.height);

  for (const star of game.stars) {
    const x = (star.x * game.width + Math.sin(game.elapsed * 0.03 * star.depth) * 18) % game.width;
    const y = (star.y * game.height + Math.cos(game.elapsed * 0.024 * star.depth) * 12) % game.height;
    const alpha = 0.35 + Math.sin(game.elapsed * 1.6 + star.flicker) * 0.25 + star.depth * 0.34;
    ctx.fillStyle = `rgba(235, 248, 245, ${clamp(alpha, 0.15, 0.95)})`;
    ctx.fillRect(x, y, star.size, star.size);
  }
}

function drawGravityGrid() {
  const planet = game.planet;
  ctx.save();
  ctx.strokeStyle = "rgba(55, 214, 189, 0.09)";
  ctx.lineWidth = 1;
  for (let r = planet.radius + 46; r < Math.max(game.width, game.height); r += 54) {
    ctx.beginPath();
    ctx.arc(planet.pos.x, planet.pos.y, r, 0, TAU);
    ctx.stroke();
  }
  for (let a = 0; a < TAU; a += Math.PI / 8) {
    const from = planet.pos.clone().add(Vec2.fromAngle(a, planet.radius + 28));
    const to = planet.pos.clone().add(Vec2.fromAngle(a, Math.max(game.width, game.height)));
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlanet() {
  const p = game.planet;
  ctx.save();
  ctx.translate(p.pos.x, p.pos.y);
  ctx.rotate(p.rotation);

  const atmosphere = ctx.createRadialGradient(0, 0, p.radius * 0.8, 0, 0, p.radius * 1.36);
  atmosphere.addColorStop(0, "rgba(55, 214, 189, 0.0)");
  atmosphere.addColorStop(0.78, "rgba(55, 214, 189, 0.12)");
  atmosphere.addColorStop(1, "rgba(55, 214, 189, 0.0)");
  ctx.fillStyle = atmosphere;
  ctx.beginPath();
  ctx.arc(0, 0, p.radius * 1.36, 0, TAU);
  ctx.fill();

  const body = ctx.createRadialGradient(-p.radius * 0.34, -p.radius * 0.42, p.radius * 0.14, 0, 0, p.radius);
  body.addColorStop(0, "#d7bb83");
  body.addColorStop(0.42, "#926c44");
  body.addColorStop(0.72, "#3a5d60");
  body.addColorStop(1, "#182528");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 0, p.radius, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = "rgba(244, 247, 248, 0.13)";
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.ellipse(0, i * p.radius * 0.16, p.radius * 0.84, p.radius * 0.09, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStation() {
  const s = game.station;
  ctx.save();
  ctx.translate(s.pos.x, s.pos.y);
  ctx.rotate(s.angle);

  ctx.strokeStyle = "rgba(137, 214, 110, 0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, s.radius + 16 + Math.sin(game.elapsed * 3) * 2, 0, TAU);
  ctx.stroke();

  ctx.fillStyle = "rgba(144, 167, 175, 0.95)";
  ctx.fillRect(-34, -8, 68, 16);
  ctx.fillRect(-8, -34, 16, 68);
  ctx.fillStyle = "#89d66e";
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 2;
  ctx.strokeRect(-40, -14, 80, 28);
  ctx.restore();
}

function drawCores() {
  for (const core of game.cores) {
    if (core.collected) continue;
    const glow = 8 + Math.sin(core.phase) * 4;
    ctx.save();
    ctx.translate(core.pos.x, core.pos.y);
    ctx.rotate(core.phase * 0.65);
    ctx.fillStyle = "rgba(55, 214, 189, 0.18)";
    ctx.beginPath();
    ctx.arc(0, 0, core.radius + glow, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#37d6bd";
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * TAU;
      const r = i % 2 === 0 ? core.radius + 4 : core.radius * 0.62;
      const point = Vec2.fromAngle(a, r);
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawAsteroids() {
  for (const asteroid of game.asteroids) {
    ctx.save();
    ctx.translate(asteroid.pos.x, asteroid.pos.y);
    ctx.rotate(asteroid.angle);
    const gradient = ctx.createRadialGradient(-asteroid.radius * 0.35, -asteroid.radius * 0.35, 3, 0, 0, asteroid.radius);
    gradient.addColorStop(0, "#b9a88d");
    gradient.addColorStop(0.52, "#66594a");
    gradient.addColorStop(1, "#25231f");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    asteroid.roughness.forEach((factor, i) => {
      const angle = (i / asteroid.roughness.length) * TAU;
      const point = Vec2.fromAngle(angle, asteroid.radius * factor);
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(244, 247, 248, 0.14)";
    ctx.stroke();
    ctx.restore();
  }
}

function drawPlayer() {
  const p = game.player;
  ctx.save();
  ctx.translate(p.pos.x, p.pos.y);
  ctx.rotate(p.angle + Math.PI / 2);

  if (p.invulnerable > 0 && Math.floor(game.elapsed * 18) % 2 === 0) {
    ctx.globalAlpha = 0.42;
  }

  ctx.fillStyle = "rgba(55, 214, 189, 0.16)";
  ctx.beginPath();
  ctx.arc(0, 0, p.radius + 11, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#f4f7f8";
  ctx.beginPath();
  ctx.moveTo(0, -p.radius - 7);
  ctx.lineTo(p.radius, p.radius + 5);
  ctx.lineTo(0, p.radius * 0.55);
  ctx.lineTo(-p.radius, p.radius + 5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#37d6bd";
  ctx.beginPath();
  ctx.moveTo(0, -p.radius - 1);
  ctx.lineTo(5, 4);
  ctx.lineTo(-5, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawParticles() {
  for (const particle of game.particles) {
    const alpha = clamp(particle.life / particle.maxLife, 0, 1);
    ctx.fillStyle = hexToRgba(particle.color, alpha);
    ctx.beginPath();
    ctx.arc(particle.pos.x, particle.pos.y, particle.size * alpha, 0, TAU);
    ctx.fill();
  }
}

function drawPulses() {
  for (const pulse of game.pulses) {
    const t = 1 - pulse.life / pulse.maxLife;
    ctx.strokeStyle = hexToRgba(pulse.color, 1 - t);
    ctx.lineWidth = 3 * (1 - t);
    ctx.beginPath();
    ctx.arc(pulse.pos.x, pulse.pos.y, pulse.radius * t, 0, TAU);
    ctx.stroke();
  }
}

function hexToRgba(hex, alpha) {
  const value = parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function updateUi() {
  const player = game.player;
  const totalNeeded = game.cores.length;
  const missionProgress = ((game.sector - 1 + player.collected / totalNeeded) / game.maxSector) * 100;

  ui.sector.textContent = `${game.sector} / ${game.maxSector}`;
  ui.cores.textContent = `${player.collected} / ${totalNeeded}`;
  ui.shield.textContent = `${Math.round(player.shield)}%`;
  ui.fuel.textContent = `${Math.round(player.fuel)}%`;
  ui.velocity.textContent = `${(player.vel.len() / 10).toFixed(1)} m/s`;
  ui.gravity.textContent = `${(gravityAt(player.pos).len() / 9.8).toFixed(2)} g`;
  ui.missionBar.style.width = `${clamp(missionProgress, 0, 100)}%`;
}

function formatTime(seconds) {
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60).toString().padStart(2, "0");
  const rest = (total % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

function loop(time = 0) {
  const seconds = time / 1000;
  const delta = Math.min(0.05, seconds - game.lastTime || 0);
  game.lastTime = seconds;
  game.accumulator += delta;

  while (game.accumulator >= game.fixedStep) {
    update(game.fixedStep);
    game.accumulator -= game.fixedStep;
  }

  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
    event.preventDefault();
  }
  keys.add(event.code);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

for (const button of document.querySelectorAll(".thrust")) {
  const code = button.dataset.key;
  const activate = (event) => {
    event.preventDefault();
    activeTouchKeys.add(code);
    button.classList.add("active");
  };
  const release = (event) => {
    event.preventDefault();
    activeTouchKeys.delete(code);
    button.classList.remove("active");
  };
  button.addEventListener("pointerdown", activate);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
}

ui.startButton.addEventListener("click", resetMission);
ui.restartButton.addEventListener("click", resetMission);
window.addEventListener("resize", resize);

resize();
populateSector();
updateUi();
requestAnimationFrame(loop);
