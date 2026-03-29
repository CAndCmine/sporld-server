<!DOCTYPE html>
<html>
<head>
    <title>Sporld IO</title>
    <style>
        body { margin: 0; background: #1a1a1a; overflow: hidden; font-family: sans-serif; color: white; touch-action: none; }
        canvas { display: block; width: 100vw; height: 100vh; }
        #ui-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10; }
        .menu { background: #222; padding: 40px; border-radius: 15px; text-align: center; border: 2px solid #444; }
        input { padding: 12px; font-size: 18px; border-radius: 5px; border: 2px solid #555; background: #111; color: white; width: 200px; margin-bottom: 20px; outline: none; }
        button { padding: 12px 40px; font-size: 18px; background: #008cff; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
        #leaderboard { position: fixed; top: 20px; right: 20px; background: rgba(0, 0, 0, 0.5); padding: 15px; border-radius: 5px; min-width: 150px; z-index: 5; pointer-events: none; }
    </style>
</head>
<body>
    <div id="ui-overlay">
        <div class="menu">
            <input type="text" id="nickInput" placeholder="Nickname" maxlength="10">
            <br>
            <button id="playBtn">Join Game</button>
        </div>
    </div>
    <div id="leaderboard"></div>
    <canvas id="canvas"></canvas>

    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const nickInput = document.getElementById('nickInput');
        const lbElement = document.getElementById('leaderboard');
        const socket = io(window.location.hostname === "localhost" ? 'http://localhost:3000' : 'https://sporld-server.onrender.com');

        let gameStarted = false;
        let players = {};
        let bullets = {};
        let myPos = { x: 1000, y: 1000, angle: 0, name: "" };
        let mousePos = { x: 0, y: 0 };
        const keys = {};
        const MAP_SIZE = 2000;

        socket.on('update', data => {
            players = data.players || {};
            bullets = data.bullets || {};
            updateLeaderboard();
        });

        document.getElementById('playBtn').onclick = () => {
            myPos.name = nickInput.value.trim() || "Guest";
            socket.emit('join', myPos.name);
            document.getElementById('ui-overlay').style.display = 'none';
            gameStarted = true;
        };

        window.onkeydown = e => keys[e.key.toLowerCase()] = true;
        window.onkeyup = e => keys[e.key.toLowerCase()] = false;
        window.onmousemove = e => { mousePos.x = e.clientX; mousePos.y = e.clientY; };
        
        window.onmousedown = () => {
            if (!gameStarted) return;
            socket.emit('fire', { x: myPos.x, y: myPos.y, angle: myPos.angle });
        };

        setInterval(() => {
            if (!gameStarted) return;
            let moveX = 0, moveY = 0;
            if (keys.w || keys.arrowup) moveY -= 5;
            if (keys.s || keys.arrowdown) moveY += 5;
            if (keys.a || keys.arrowleft) moveX -= 5;
            if (keys.d || keys.arrowright) moveX += 5;

            myPos.angle = Math.atan2(mousePos.y - window.innerHeight / 2, mousePos.x - window.innerWidth / 2);
            myPos.x = Math.max(0, Math.min(MAP_SIZE, myPos.x + moveX));
            myPos.y = Math.max(0, Math.min(MAP_SIZE, myPos.y + moveY));
            
            socket.emit('move', { x: myPos.x, y: myPos.y, angle: myPos.angle });
        }, 16);

        function updateLeaderboard() {
            let sorted = Object.values(players).sort((a, b) => b.score - a.score).slice(0, 5);
            lbElement.innerHTML = sorted.map(p => `<div>${p.name}: ${Math.floor(p.score)}</div>`).join('');
        }

        function render() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (!gameStarted) { requestAnimationFrame(render); return; }

            ctx.save();
            ctx.translate(window.innerWidth / 2 - myPos.x, window.innerHeight / 2 - myPos.y);

            ctx.strokeStyle = "#333";
            for (let i = 0; i <= MAP_SIZE; i += 100) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, MAP_SIZE); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(MAP_SIZE, i); ctx.stroke();
            }

            for (let id in bullets) {
                const b = bullets[id];
                ctx.fillStyle = "#ff4444";
                ctx.beginPath();
                ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
                ctx.fill();
            }

            for (let id in players) {
                const p = players[id];
                const drawX = id === socket.id ? myPos.x : p.x;
                const drawY = id === socket.id ? myPos.y : p.y;
                const drawA = id === socket.id ? myPos.angle : p.angle;

                ctx.save();
                ctx.translate(drawX, drawY);
                ctx.rotate(drawA);
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.moveTo(20, 0); ctx.lineTo(-15, 15); ctx.lineTo(-15, -15);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.fillText(p.name, drawX, drawY - 25);
            }

            ctx.restore();
            requestAnimationFrame(render);
        }
        render();
    </script>
</body>
</html>
