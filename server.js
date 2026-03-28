const io = require('socket.io')(process.env.PORT || 3000, {
    cors: { origin: "*" }
});

let players = {};

io.on('connection', (socket) => {

    players[socket.id] = { x: 1000, y: 1000, name: "Connecting..." };

    socket.on('join', (name) => {
        if (players[socket.id]) {
            players[socket.id].name = name || "Guest" + Math.random();
        }
    });

    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
        }
    });

    socket.on('disconnect', () => { 
        delete players[socket.id]; 
    });
});

// Send the world state to everyone 60 times per second
setInterval(() => { 
    io.emit('update', players); 
}, 16);
