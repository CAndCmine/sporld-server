const io = require('socket.io')(process.env.PORT || 3000, {
    cors: { origin: "*" }
});

let players = {};
let bullets = [];

io.on('connection', (socket) => {
    players[socket.id] = { x: 1000, y: 1000, angle: 0, name: "Guest" };

    socket.on('join', (name) => {
        if (players[socket.id]) players[socket.id].name = name;
    });

    socket.on('move', (data) => {
        if (!players[socket.id]) return;
        players[socket.id].x = Number(data.x);
        players[socket.id].y = Number(data.y);
        players[socket.id].angle = Number(data.angle);
    });

    socket.on('shoot', () => {
        if (!players[socket.id]) return;
        bullets.push({
            id: Math.random(),
            owner: socket.id,
            x: players[socket.id].x,
            y: players[socket.id].y,
            angle: players[socket.id].angle,
            speed: 10,
            life: 100
        });
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

setInterval(() => {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.x += Math.cos(b.angle) * b.speed;
        b.y += Math.sin(b.angle) * b.speed;
        b.life--;

        if (b.life <= 0) {
            bullets.splice(i, 1);
        }
    }

    io.emit('update', {
        players: JSON.parse(JSON.stringify(players)),
        bullets: bullets
    });
}, 16);
