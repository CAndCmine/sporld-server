const io = require('socket.io')(process.env.PORT || 3000, {
  cors: {
    origin: "https://sporld.io",
    methods: ["GET", "POST"]
  }
});

let cursors = {};

io.on('connection', (socket) => {

  cursors[socket.id] = { x: 0, y: 0 };

  socket.on('move', (pos) => {
    if (cursors[socket.id]) {
      cursors[socket.id].x = pos.x;
      cursors[socket.id].y = pos.y;
    }
  });

  socket.on('disconnect', () => {
    delete cursors[socket.id];
  });
});

setInterval(() => {
  io.emit('update', cursors);
}, 1000 / 60);

console.log("Cursor server is live!");