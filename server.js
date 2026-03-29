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
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].angle = data.angle;
        }
    });

    socket.on('shoot', () => {
        if (players[socket.id]) {
            bullets.push({
                id: Math.random(),
                owner: socket.id,
                x: players[socket.id].x,
                y: players[socket.id].y,
                angle: players[socket.id].angle,
                speed: 12,
                life: 60
            });
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

setInterval(() => {
    // Update bullet positions
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].x += Math.cos(bullets[i].angle) * bullets[i].speed;
        bullets[i].y += Math.sin(bullets[i].angle) * bullets[i].speed;
        bullets[i].life--;
        
        // Remove dead bullets
        if (bullets[i].life <= 0) {
            bullets.splice(i, 1);
        }
    }

    // Send the structured object back to clients
    io.emit('update', { 
        players: players, 
        bullets: bullets 
    });
}, 16);
