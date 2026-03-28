const io = require('socket.io')(process.env.PORT || 3000, {
  cors: {
    origin: "https://sporld.io",
    methods: ["GET", "POST"]
  }
});

let cursors = {};

io.on('connection', (socket) => {
  
    players[socket.id] = { x: 400, y: 300, size: 10 };

    socket.on('move', (dir) => {
        const player = players[socket.id];
        if (!player) return;

        const speed = 5;
        if (dir === 'up') player.y -= speed;
        if (dir === 'down') player.y += speed;
        if (dir === 'left') player.x -= speed;
        if (dir === 'right') player.x += speed;
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

setInterval(() => {
  io.emit('update', cursors);
}, 1000 / 60);

console.log("Cursor server is live!");
