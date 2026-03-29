const io = require('socket.io')(process.env.PORT || 3000, {
    cors: { origin: "*" }
});

const players = {};
let bullets = [];
const MAP_SIZE = 2000;
const BULLET_SPEED = 15;
const PLAYER_RADIUS = 25; // Hitbox size

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

    // Handle shooting
    socket.on('shoot', () => {
        const p = players[socket.id];
        if (p) {
            bullets.push({
                x: p.x,
                y: p.y,
                angle: p.angle,
                ownerId: socket.id,
                life: 60
            });
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

function respawnPlayer(id) {
    if (players[id]) {
        players[id].x = Math.random() * MAP_SIZE;
        players[id].y = Math.random() * MAP_SIZE;
    }
}

setInterval(() => {
    // Update Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i];
        b.x += Math.cos(b.angle) * BULLET_SPEED;
        b.y += Math.sin(b.angle) * BULLET_SPEED;
        b.life--;

        // Delete bullet if going off map
        if (b.life <= 0 || b.x < 0 || b.x > MAP_SIZE || b.y < 0 || b.y > MAP_SIZE) {
            bullets.splice(i, 1);
            continue;
        }

        for (let id in players) {
            if (id === b.ownerId) continue; // Don't shoot yourself
            
            const p = players[id];
            const dist = Math.hypot(p.x - b.x, p.y - b.y);
            
            if (dist < PLAYER_RADIUS) {
                respawnPlayer(id);
                bullets.splice(i, 1);
                break; 
            }
        }
    }

    io.emit('update', { players, bullets });
}, 16);
