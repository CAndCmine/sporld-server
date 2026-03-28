const io = require('socket.io')(process.env.PORT || 3000, { cors: { origin: "*" } });

let players = {};

io.on('connection', (socket) => {
    // Spawn at 1000, 1000
    players[socket.id] = { x: 1000, y: 1000 };

    socket.on('move', (dir) => {
        if (!players[socket.id]) return;
        const s = 7; // Speed
        if (dir === 'up')    players[socket.id].y -= s;
        if (dir === 'down')  players[socket.id].y += s;
        if (dir === 'left')  players[socket.id].x -= s;
        if (dir === 'right') players[socket.id].x += s;
    });

    socket.on('disconnect', () => delete players[socket.id]);
});

setInterval(() => io.emit('update', players), 16); // ~60fps
