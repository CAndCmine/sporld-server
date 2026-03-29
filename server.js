const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: "*" } });

const players = {};

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

    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

setInterval(() => {
    for (let id in players) {
        players[id].score += 0.1; 
    }
    io.emit('update', players);
}, 16);

const PORT = process.env.PORT || 3000;
server.listen(PORT);
