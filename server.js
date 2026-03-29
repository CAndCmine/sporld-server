const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: "*" } });

const players = {};
const bullets = {};
let bulletIdCounter = 0;

io.on('connection', (socket) => {
    players[socket.id] = { x: 1000, y: 1000, angle: 0, name: "Guest", score: 0 };

    socket.on('join', (name) => {
        if (players[socket.id]) players[socket.id].name = name;
    });

    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].angle = data.angle;
        }
    });

    socket.on('fire', (data) => {
        const id = bulletIdCounter++;
        const offset = 30;
        bullets[id] = {
            x: data.x + Math.cos(data.angle) * offset,
            y: data.y + Math.sin(data.angle) * offset,
            angle: data.angle,
            owner: socket.id,
            speed: 15,
            life: 100
        };
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

setInterval(() => {
    for (let id in players) {
        players[id].score += 0.01;
    }

    for (let id in bullets) {
        const b = bullets[id];
        b.x += Math.cos(b.angle) * b.speed;
        b.y += Math.sin(b.angle) * b.speed;
        b.life--;
        if (b.life <= 0) delete bullets[id];
    }

    io.emit('update', { players, bullets });
}, 16);

const PORT = process.env.PORT || 3000;
server.listen(PORT);
