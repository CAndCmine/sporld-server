const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const ui = document.getElementById('ui-overlay');
const statusText = document.getElementById('status');
const nickInput = document.getElementById('nickInput');
const joyCheck = document.getElementById('joyCheck');
const joyContainer = document.getElementById('joystick-container');
const joyKnob = document.getElementById('joystick-knob');
const lbElement = document.getElementById('leaderboard');
const SERVER_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? 'http://localhost:3000' : 'https://sporld-server.onrender.com';
const socket = io(SERVER_URL);
let gameStarted = false;
let players = {};
let myPos = {
  x: 1000,
  y: 1000,
  angle: 0,
      name: ""
    };
    let mousePos = {
      x: 0,
      y: 0
    };
    const keys = {};
    const MAP_SIZE = 2000;
    let joystickActive = false;
    let joystickData = {
      x: 0,
      y: 0
    };
    if ('ontouchstart' in window) joyCheck.checked = true;
    socket.on('connect', () => {
      statusText.innerText = "Connected";
      statusText.style.color = "white";
    });
    socket.on('update', data => {
      players = data;
      updateLeaderboard();
    });
    document.getElementById('playBtn').onclick = () => {
      const name = nickInput.value.trim() || "Guest";
      myPos.name = name;
      socket.emit('join', name);
      ui.style.display = 'none';
      gameStarted = true;
      if (joyCheck.checked) joyContainer.style.display = 'block';
    };
    window.onkeydown = e => keys[e.key.toLowerCase()] = true;
    window.onkeyup = e => keys[e.key.toLowerCase()] = false;
    window.onmousemove = e => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };
    joyContainer.ontouchstart = () => {
      joystickActive = true;
    };
    window.ontouchend = () => {
      joystickActive = false;
      joystickData = {
        x: 0,
        y: 0
      };
      joyKnob.style.transform = `translate(-50%, -50%)`;
    };
    window.ontouchmove = e => {
      if (!joystickActive) return;
      const touch = e.touches[0];
      const rect = joyContainer.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let dx = touch.clientX - centerX;
      let dy = touch.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = rect.width / 2;
      if (dist > maxDist) {
        dx *= maxDist / dist;
        dy *= maxDist / dist;
      }
      joystickData = {
        x: dx / maxDist,
        y: dy / maxDist
      };
      joyKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    };
    setInterval(() => {
      if (!gameStarted) return;
      let moveX = 0,
        moveY = 0;
      if (keys.w || keys.arrowup) moveY -= 5;
      if (keys.s || keys.arrowdown) moveY += 5;
      if (keys.a || keys.arrowleft) moveX -= 5;
      if (keys.d || keys.arrowright) moveX += 5;
      if (joystickActive) {
        moveX = joystickData.x * 5;
        moveY = joystickData.y * 5;
        myPos.angle = Math.atan2(moveY, moveX);
      } else {
        myPos.angle = Math.atan2(mousePos.y - window.innerHeight / 2, mousePos.x - window.innerWidth / 2);
      }
      myPos.x = Math.max(0, Math.min(MAP_SIZE, myPos.x + moveX));
      myPos.y = Math.max(0, Math.min(MAP_SIZE, myPos.y + moveY));
      socket.emit('move', {
        x: myPos.x,
        y: myPos.y,
        angle: myPos.angle
      });
    }, 16);
    function updateLeaderboard() {
      let sorted = Object.values(players).sort((a, b) => b.score - a.score).slice(0, 5);
      let html = "";
      sorted.forEach(p => {
        html += `<div class="lb-item"><span class="lb-name">${p.name || "Guest"}</span><span class="lb-score">${Math.floor(p.score)}</span></div>`;
      });
      lbElement.innerHTML = html;
    }
    function drawPlayer(x, y, angle, color, name) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = color;
      ctx.strokeStyle = "white";
      ctx.lineWidth = 6;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(25, 0);
      ctx.lineTo(-20, 22);
      ctx.lineTo(-20, -22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "white";
      ctx.font = "700 14px Ubuntu";
      ctx.textAlign = "center";
      ctx.fillText(name, x, y - 45);
    }
    function render() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.save();
      ctx.translate(window.innerWidth / 2 - myPos.x, window.innerHeight / 2 - myPos.y);
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      for (let i = 0; i <= MAP_SIZE; i += 100) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, MAP_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(MAP_SIZE, i);
        ctx.stroke();
      }
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, MAP_SIZE, MAP_SIZE);
      let foundMyself = false;
      for (let id in players) {
        const p = players[id];
        const playerColor = (id === socket.id) ? "rgb(255, 255, 255)" : "rgb(255, 255, 255)";
        const playerName = p.name || "Guest";
        if (id === socket.id) {
          foundMyself = true;
          drawPlayer(myPos.x, myPos.y, myPos.angle, playerColor, playerName);
        } else {
          drawPlayer(p.x, p.y, p.angle, playerColor, playerName);
        }
      }
      if (!foundMyself && gameStarted) {
        drawPlayer(myPos.x, myPos.y, myPos.angle, "rgb(255, 255, 255)", myPos.name || "Guest");
      }
      ctx.restore();
      requestAnimationFrame(render);
    }
    render();
