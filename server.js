const io = require('socket.io')(process.env.PORT || 3000, { cors: { origin: "*" } });
let players = {};

io.on('connection', (socket) => {
    
    players[socket.id] = { x: 1000, y: 1000 };

    socket.on('move', (dir) => {
        const p = players[socket.id];
        if (!p) return;
        const s = 10; // Speed
        if (dir === 'up')    p.y -= s;
        if (dir === 'down')  p.y += s;
        if (dir === 'left')  p.x -= s;
        if (dir === 'right') p.x += s;
    });

    socket.on('disconnect', () => delete players[socket.id]);
});

setInterval(() => io.emit('update', players), 16);
