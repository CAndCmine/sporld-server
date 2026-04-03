const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const MAP_SIZE = 2000;
const TICK_MS = 16;
const players = {};
const bullets = [];
io.on('connection', socket => {
  players[socket.id] = { x: 1000, y: 1000, angle: 0, name: "Guest", score: 0, lastFire: 0 };
  socket.on('join', name => {
    if (players[socket.id]) players[socket.id].name = name || "Guest";
  });
  socket.on('move', data => {
    const p = players[socket.id];
    if (!p) return;
    if (typeof data.x === 'number') p.x = Math.max(0, Math.min(MAP_SIZE, data.x));
    if (typeof data.y === 'number') p.y = Math.max(0, Math.min(MAP_SIZE, data.y));
    if (typeof data.angle === 'number') p.angle = data.angle;
  });
  socket.on('fire', data => {
    const p = players[socket.id];
    if (!p) return;
    const now = Date.now();
    if (now - p.lastFire < 200) return;
    if (typeof data.angle !== 'number') return;
    p.lastFire = now;
    const speed = 18;
    const spawnDist = 40;
    const bx = (typeof data.x === 'number' ? data.x : p.x) + Math.cos(data.angle) * spawnDist;
    const by = (typeof data.y === 'number' ? data.y : p.y) + Math.sin(data.angle) * spawnDist;
    bullets.push({ id: `${socket.id}-${now}`, owner: socket.id, x: bx, y: by, vx: Math.cos(data.angle) * speed, vy: Math.sin(data.angle) * speed, life: 80 });
  });
  socket.on('disconnect', () => {
    delete players[socket.id];
  });
});
setInterval(() => {
  for (const id in players) players[id].score += 0.01;
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;
    b.life--;
    let hit = false;
    for (const id in players) {
      if (id === b.owner) continue;
      const p = players[id];
      const dx = b.x - p.x;
      const dy = b.y - p.y;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < 28 * 28) {
        if (players[b.owner]) players[b.owner].score += 10;
        hit = true;
        break;
      }
    }
    if (hit || b.life <= 0 || b.x < 0 || b.x > MAP_SIZE || b.y < 0 || b.y > MAP_SIZE) bullets.splice(i, 1);
  }
  io.emit('state', { players, bullets });
}, TICK_MS);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server running on port', PORT));
