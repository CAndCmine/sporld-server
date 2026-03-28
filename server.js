const io = require('socket.io')(process.env.PORT || 3000, {
    cors: { origin: "*" }
});

let players = {};

io.on('connection', (socket) => {
    // Initial spawn
    players[socket.id] = { x: 1000, y: 1000 };

    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
        }
    });

    socket.on('disconnect', () => { delete players[socket.id]; });
});

setInterval(() => { io.emit('update', players); }, 16);
