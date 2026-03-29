const io = require("socket.io")(process.env.PORT || 3000, {
    cors: { origin: "*" }
});

const players = {};

io.on("connection", socket => {
    players[socket.id] = {
        x: 1000,
        y: 1000,
        angle: 0,
        name: "Guest"
    };

    socket.on("join", name => {
        players[socket.id].name = name;
    });

    socket.on("move", data => {
        const p = players[socket.id];
        if (!p) return;

        p.x = data.x;
        p.y = data.y;
        p.angle = data.angle;
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
    });
});

setInterval(() => {
    io.emit("update", players);
}, 30);
