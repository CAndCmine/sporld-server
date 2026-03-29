const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let players = {};

// This serves your index.html automatically
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    players[socket.id] = { x: 1000, y: 1000, angle: 0, name: "Guest" };

    socket.on('join', (name) => {
        if (players[socket.id]) players[socket.id].name = name;
    });

    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = Number(data.x);
            players[socket.id].y = Number(data.y);
            players[socket.id].angle = Number(data.angle);
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

setInterval(() => {
    io.emit('update', players);
}, 15);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
