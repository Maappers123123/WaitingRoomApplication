<script>
    function toggleMenu() {
      const menu = document.getElementById('dropdown-menu');
      menu.classList.toggle('hidden');
    }

    function goHome() {
      showOnlySection('intro-screen');
    }

    function showOptions() {
      showOnlySection('options-screen');
    }
    
    function goBack() {
      showOnlySection('options-screen');
    }
    
    function goBack2() {
      showOnlySection('game-screen');
    }

    function showInfoScreen() {
      showOnlySection('info-screen');
    }

    function showChatbot() {
      showOnlySection('chatbot-intro-screen');
    }

function openChatConversation() {
  showOnlySection('chatbot-screen');
}

function goBackToIntro() {
  showOnlySection('chatbot-intro-screen');
}


    function openRelaxation() {
      alert("Ontspanningsopties geopend");
    }

    function showGame() {
      showOnlySection('game-screen');
    }

function showVideoScreen() {
  showOnlySection('video-screen');
}


    function showOnlySection(id) {
      const sections = document.querySelectorAll('main > section');
      sections.forEach(s => s.classList.add('hidden'));
      document.getElementById(id).classList.remove('hidden');
    }

    const canvas = document.getElementById('tetris');
    const context = canvas.getContext('2d');
    context.scale(20, 20);

    const nextCanvas = document.getElementById('next');
    const nextContext = nextCanvas.getContext('2d');
    nextContext.scale(20, 20);

    let arena, player, nextPiece;
    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;
    let paused = false;
    let level = 1;

    const colors = [null,'#caa6ff','#67d6ff','#b5f4be','#fcd6ff','#ffcb8a','#ffe57f','#3877FF'];

    const pieces = 'ILJOTSZ';

    function createMatrix(w, h) {
      const matrix = [];
      while (h--) matrix.push(new Array(w).fill(0));
      return matrix;
    }

    function createPiece(type) {
      if (type === 'T') return [[0, 1, 0], [1, 1, 1], [0, 0, 0]];
      if (type === 'O') return [[2, 2], [2, 2]];
      if (type === 'L') return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];
      if (type === 'J') return [[0, 4, 0], [0, 4, 0], [4, 4, 0]];
      if (type === 'I') return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
      if (type === 'S') return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
      if (type === 'Z') return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
    }

function drawMatrix(matrix, offset, ctx = context) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = colors[value];
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function updateNextCanvas() {
  nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

  const gridSize = 4; // 4x4 blokken
  const matrix = nextPiece;
  const matrixWidth = matrix[0].length;
  const matrixHeight = matrix.length;

  const offsetX = Math.floor((gridSize - matrixWidth) / 2);
  const offsetY = Math.floor((gridSize - matrixHeight) / 2);

  drawMatrix(matrix, { x: offsetX, y: offsetY }, nextContext);
}

    function update(time = 0) {
      if (paused) return;
      const deltaTime = time - lastTime;
      lastTime = time;
      dropCounter += deltaTime;
      if (dropCounter > dropInterval) {
        playerDrop();
      }
      draw();
      requestAnimationFrame(update);
    }

    function draw() {
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      drawMatrix(arena, { x: 0, y: 0 });
      drawMatrix(player.matrix, player.pos);
    }

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    arenaSweep(); // <- hier toevoegen
    playerReset();
  }
  dropCounter = 0;
}

    function collide(arena, player) {
      const [m, o] = [player.matrix, player.pos];
      for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
          if (m[y][x] !== 0 &&
              (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
            return true;
          }
        }
      }
      return false;
    }

    function merge(arena, player) {
      player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            arena[y + player.pos.y][x + player.pos.x] = value;
          }
        });
      });
    }

function playerReset() {
  player.matrix = nextPiece;
  nextPiece = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
  updateNextCanvas(); // <- hier!
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    level = 1;
    document.getElementById('level').textContent = '01';
  }
}

    function playerMove(dir) {
      player.pos.x += dir;
      if (collide(arena, player)) {
        player.pos.x -= dir;
      }
    }

    function rotate(matrix, dir) {
      for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
          [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
      }
      if (dir > 0) matrix.forEach(row => row.reverse());
      else matrix.reverse();
    }

    function playerRotate(dir) {
      const pos = player.pos.x;
      let offset = 1;
      rotate(player.matrix, dir);
      while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
          rotate(player.matrix, -dir);
          player.pos.x = pos;
          return;
        }
      }
    }

function startGame(type) {
  if (type === 'tetris') {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('tetris-screen').classList.remove('hidden');
    arena = createMatrix(12, 20);
    player = { pos: { x: 0, y: 0 }, matrix: null };
    nextPiece = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    playerReset();
    paused = false;
    document.getElementById('resume-btn').classList.add('hidden');
    lastTime = 0; // reset the clock
    requestAnimationFrame(update); // <- HIER toevoegen
  }
}

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) continue outer;
    }


    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;

    // Update level or score here if needed
    level++;
    document.getElementById('level').textContent = String(level).padStart(2, '0');
  }
}


    function pauseGame() {
      paused = true;
      document.getElementById('resume-btn').classList.remove('hidden');
    }

    function resumeGame() {
      paused = false;
      document.getElementById('resume-btn').classList.add('hidden');
      update();
    }

    document.addEventListener('keydown', event => {
      if (paused) return;
      if (event.key === 'ArrowLeft') playerMove(-1);
      else if (event.key === 'ArrowRight') playerMove(1);
      else if (event.key === 'ArrowDown') playerDrop();
      else if (event.key === 'q') playerRotate(-1);
      else if (event.key === 'w') playerRotate(1);
    });

  </script>
