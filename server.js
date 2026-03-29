const io = require('socket.io')(process.env.PORT || 3000, {
    cors: { origin: "*" }
});

const players = {};
let bullets = [];
const MAP_SIZE = 2000;
const BULLET_SPEED = 12;
const PLAYER_RADIUS = 30;

io.on('connection', (socket) => {
    // Initialize player
    players[socket.id] = { 
        x: Math.random() * MAP_SIZE, 
        y: Math.random() * MAP_SIZE, 
        angle: 0, 
        name: "Guest" 
    };

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
        const p = players[socket.id];
        if (p) {
            bullets.push({
                x: p.x,
                y: p.y,
                angle: p.angle,
                ownerId: socket.id,
                life: 100 
            });
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

setInterval(() => {
    // Update bullets and handle collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.x += Math.cos(b.angle) * BULLET_SPEED;
        b.y += Math.sin(b.angle) * BULLET_SPEED;
        b.life--;

        let hit = false;
        for (let id in players) {
            if (id === b.ownerId) continue;
            const p = players[id];
            const dist = Math.hypot(p.x - b.x, p.y - b.y);
            
            if (dist < PLAYER_RADIUS) {
                // Respawn player
                players[id].x = Math.random() * MAP_SIZE;
                players[id].y = Math.random() * MAP_SIZE;
                hit = true;
                break;
            }
        }

        if (hit || b.life <= 0 || b.x < 0 || b.x > MAP_SIZE || b.y < 0 || b.y > MAP_SIZE) {
            bullets.splice(i, 1);
        }
    }

    io.emit('update', { players, bullets });
}, 16);
