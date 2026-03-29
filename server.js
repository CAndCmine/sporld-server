const io = require('socket.io')(process.env.PORT || 3000, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let players = {};

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);


    players[socket.id] = { 
        x: 1000, 
        y: 1000, 
        angle: 0, 
        name: "Guest" 
    };

    socket.on('join', (name) => {
        if (players[socket.id]) {
            players[socket.id].name = name.substring(0, 15) || "Guest";
        }
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
        console.log('Player disconnected:', socket.id);
    });
});

setInterval(() => {
    io.emit('update', players);
}, 16);
