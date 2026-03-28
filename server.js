const io = require('socket.io')(process.env.PORT || 3000, {
    cors: { origin: "*" }
});

let players = {};

io.on('connection', (socket) => {
    players[socket.id] = { x: 1000, y: 1000 };
    
    socket.on('move', (dir) => {
        if (!players[socket.id]) return;
        const speed = 10;
        if (dir === 'up')    players[socket.id].y -= speed;
        if (dir === 'down')  players[socket.id].y += speed;
        if (dir === 'left')  players[socket.id].x -= speed;
        if (dir === 'right') players[socket.id].x += speed;
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

setInterval(() => {
    io.emit('update', players);
}, 16);
