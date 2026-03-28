const io = require('socket.io')(process.env.PORT || 3000, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

let players = {};
const SPEED = 7;
const MAP_SIZE = 2000;

io.on('connection', (socket) => {
    // Start at map center
    players[socket.id] = { x: 1000, y: 1000, size: 15 };

    socket.on('move', (dir) => {
        const player = players[socket.id];
        if (!player) return;

        if (dir === 'up' && player.y > 0) player.y -= SPEED;
        if (dir === 'down' && player.y < MAP_SIZE) player.y += SPEED;
        if (dir === 'left' && player.x > 0) player.x -= SPEED;
        if (dir === 'right' && player.x < MAP_SIZE) player.x += SPEED;
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

setInterval(() => {
    io.emit('update', players);
}, 1000 / 60);
