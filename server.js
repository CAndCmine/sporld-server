const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: "*" } });

const players = {};
let bullets = [];

io.on('connection', (socket) => {
    players[socket.id] = { x: 1000, y: 1000, angle: 0, name: "Guest", score: 0 };
    
    socket.on('join', name => { if (players[socket.id]) players[socket.id].name = name; });
    socket.on('move', data => { if (players[socket.id]) Object.assign(players[socket.id], data); });

    socket.on('fire', data => {
        bullets.push({
            x: data.x + Math.cos(data.angle) * 40,
            y: data.y + Math.sin(data.angle) * 40,
            angle: data.angle,
            speed: 18,
            life: 90
        });
    });
    
    socket.on('disconnect', () => { delete players[socket.id]; });
});

setInterval(() => {
    for (let id in players) players[id].score += 0.01;

    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.x += Math.cos(b.angle) * b.speed;
        b.y += Math.sin(b.angle) * b.speed;
        b.life--;
        if (b.life <= 0 || b.x < 0 || b.x > 2000 || b.y < 0 || b.y > 2000) {
            bullets.splice(i, 1);
        }
    }

    io.emit('update', { players, bullets });
}, 16);

server.listen(process.env.PORT || 3000);
