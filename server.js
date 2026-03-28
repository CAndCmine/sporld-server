const io = require('socket.io')(process.env.PORT || 3000, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

let players = {};

io.on('connection', (socket) => {
    console.log("Joined:", socket.id);
    
    players[socket.id] = { x: 1000, y: 1000, size: 15 };

    socket.on('move', (dir) => {
        if (players[socket.id]) {
            const s = 10;
            if (dir === 'up')    players[socket.id].y -= s;
            if (dir === 'down')  players[socket.id].y += s;
            if (dir === 'left')  players[socket.id].x -= s;
            if (dir === 'right') players[socket.id].x += s;
        }
    });

    socket.on('disconnect', () => { delete players[socket.id]; });
});

setInterval(() => {
    io.emit('update', players);
}, 16);
