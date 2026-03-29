const io = require('socket.io')(process.env.PORT || 3000, {
    cors: { origin: "*" }
});

const players = {};

io.on('connection', (socket) => {
    console.log("CONNECTED:", socket.id);

    players[socket.id] = { x: 1000, y: 1000, angle: 0, name: "Guest" };

    socket.on('join', (name) => {
        if (players[socket.id]) {
            players[socket.id].name = typeof name === "string" ? name : "Guest";
        }
    });

    socket.on('move', (data) => {
        console.log("RECEIVED:", data);

        if (players[socket.id] && data) {
            if (Number.isFinite(data.x)) players[socket.id].x = data.x;
            if (Number.isFinite(data.y)) players[socket.id].y = data.y;
            if (Number.isFinite(data.angle)) players[socket.id].angle = data.angle;
        }
    });

    socket.on('disconnect', () => {
        console.log("DISCONNECTED:", socket.id);
        delete players[socket.id];
    });
});

setInterval(() => {
    io.emit('update', players);
}, 16);
