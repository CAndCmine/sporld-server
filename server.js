const io = require('socket.io')(process.env.PORT || 3000, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let players = {};

io.on('connection', (socket) => {
    console.log("New connection:", socket.id);

    players[socket.id] = { 
        x: 1000, 
        y: 1000, 
        name: "Guest" 
    };

    socket.on('join', (name) => {
        if (players[socket.id]) {
            // Save the name provided by the prompt into the server's memory
            players[socket.id].name = name || "Guest";
            console.log(`${socket.id} set name to: ${players[socket.id].name}`);
        }
    });

    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
        }
    });

    socket.on('disconnect', () => {
        console.log("Player disconnected:", socket.id);
        delete players[socket.id];
    });
});

setInterval(() => {
    io.emit('update', players);
}, 16);
