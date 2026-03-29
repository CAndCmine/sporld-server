const io = require('socket.io')(process.env.PORT || 3000, {
    cors: { origin: "*" }
});

const players = {};

io.on('connection', (socket) => {
    players[socket.id] = { x: 1000, y: 1000, angle: 0, name: "Guest" };

    socket.on('join', (name) => {
        if (players[socket.id]) {
            players[socket.id].name = name;
        }
    });

    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = Number(data.x) || 0;
            players[socket.id].y = Number(data.y) || 0;
            players[socket.id].angle = Number(data.angle) || 0;
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

setInterval(() => {
    io.emit('update', players);
}, 15);
