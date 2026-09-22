/**
 * Word Search Game Module (Dynamic Difficulties: Easy 6x6, Medium 8x8, Hard 10x10)
 */

(function () {
  const DIFFICULTIES = {
    easy: {
      gridSize: 6,
      wordCount: 3,
      minWordLength: 3,
      maxWordLength: 5,
      directions: [
        [0, 1],   // Right
        [1, 0],   // Down
        [1, 1]    // Down-Right
      ],
      gridClass: 'ws-grid-easy'
    },
    medium: {
      gridSize: 8,
      wordCount: 5,
      minWordLength: 4,
      maxWordLength: 6,
      directions: [
        [0, 1],   // Right
        [0, -1],  // Left
        [1, 0],   // Down
        [-1, 0],  // Up
        [1, 1],   // Down-Right
        [-1, 1]   // Up-Right
      ],
      gridClass: 'ws-grid-medium'
    },
    hard: {
      gridSize: 10,
      wordCount: 8,
      minWordLength: 4,
      maxWordLength: 8,
      directions: [
        [0, 1],   // Right
        [0, -1],  // Left
        [1, 0],   // Down
        [-1, 0],  // Up
        [1, 1],   // Down-Right
        [1, -1],  // Down-Left
        [-1, 1],  // Up-Right
        [-1, -1]  // Up-Left
      ],
      gridClass: 'ws-grid-hard'
    }
  };

  const WORD_BANKS = {
    tech: [
      'CODE', 'BYTE', 'DATA', 'WEB', 'APP', 'CSS', 'BIT', 'DEV', 'NET',
      'ALGO', 'PIXEL', 'LOGIC', 'REACT', 'HTML', 'CYBER', 'DEBUG', 'ROBOT', 'CLOUD',
      'PROGRAM', 'NETWORK', 'BACKEND', 'PYTHON', 'BROWSER', 'SERVER', 'SECURITY'
    ],
    space: [
      'MOON', 'STAR', 'SUN', 'MARS', 'NOVA', 'SKY', 'AERO',
      'ORBIT', 'SOLAR', 'COMET', 'EARTH', 'VENUS', 'SPACE', 'ALIEN',
      'PLANET', 'GALAXY', 'NEBULA', 'COSMOS', 'JUPITER', 'ASTEROID', 'ROCKET'
    ],
    animals: [
      'CAT', 'DOG', 'LION', 'FROG', 'BEAR', 'BIRD', 'FISH', 'WOLF',
      'TIGER', 'PANDA', 'EAGLE', 'KOALA', 'WHALE', 'ZEBRA', 'SHARK', 'HORSE',
      'DOLPHIN', 'GIRAFFE', 'CHEETAH', 'PENGUIN', 'ELEPHANT', 'LEOPARD', 'KANGAROO'
    ],
    gaming: [
      'BOSS', 'LOOT', 'MANA', 'XP', 'RUN', 'PLAY', 'GOLD', 'CLAN',
      'QUEST', 'LEVEL', 'SCORE', 'SPEED', 'ARMOR', 'MAGIC', 'PIXEL',
      'WARRIOR', 'DUNGEON', 'STEALTH', 'RESPAWN', 'VICTORY', 'CRITICAL', 'CONSOLE'
    ]
  };

  let currentDifficulty = 'medium';
  let currentCategory = 'tech';
  let gridLetters = [];
  let placedWords = []; // Array of { word, coords: [[r, c], ...] }
  let foundWords = new Set();
  let selectedCells = []; // Array of { row, col }
  let startCell = null;
  let clickedStartCell = null;
  let isPointerDown = false;

  let timerInterval = null;
  let secondsElapsed = 0;
  let isGameOver = false;

  // DOM Elements
  let gridEl, wordListEl, foundScoreEl, timerEl, statusTextEl, restartBtn, categoryBtns, diffBtns;

  function initWordSearch() {
    gridEl = document.getElementById('ws-grid');
    wordListEl = document.getElementById('ws-word-list');
    foundScoreEl = document.getElementById('ws-found-score');
    timerEl = document.getElementById('ws-timer');
    statusTextEl = document.getElementById('ws-status-text');
    restartBtn = document.getElementById('ws-restart-btn');
    categoryBtns = document.querySelectorAll('.ws-category-btn');
    diffBtns = document.querySelectorAll('.ws-diff-btn');

    if (!gridEl) return;

    if (restartBtn) {
      restartBtn.addEventListener('click', startNewGame);
    }

    if (diffBtns) {
      diffBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const diff = e.currentTarget.getAttribute('data-diff');
          if (diff && diff !== currentDifficulty) {
            currentDifficulty = diff;
            diffBtns.forEach(b => {
              b.classList.remove('active');
              b.setAttribute('aria-checked', 'false');
            });
            e.currentTarget.classList.add('active');
            e.currentTarget.setAttribute('aria-checked', 'true');
            startNewGame();
          }
        });
      });
    }

    if (categoryBtns) {
      categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const cat = e.currentTarget.getAttribute('data-cat');
          if (cat && cat !== currentCategory) {
            currentCategory = cat;
            categoryBtns.forEach(b => {
              b.classList.remove('active');
              b.setAttribute('aria-checked', 'false');
            });
            e.currentTarget.classList.add('active');
            e.currentTarget.setAttribute('aria-checked', 'true');
            startNewGame();
          }
        });
      });
    }

    setupPointerEvents();
    startNewGame();
  }

  function startNewGame() {
    clearInterval(timerInterval);
    secondsElapsed = 0;
    isGameOver = false;
    foundWords.clear();
    selectedCells = [];
    startCell = null;
    clickedStartCell = null;
    isPointerDown = false;

    if (timerEl) timerEl.textContent = '00:00';
    if (gridEl) {
      gridEl.classList.remove('completed', 'ws-grid-easy', 'ws-grid-medium', 'ws-grid-hard');
      gridEl.classList.add(DIFFICULTIES[currentDifficulty].gridClass);
    }

    generatePuzzle();
    renderWordList();
    renderGrid();
    updateScoreDisplay();
    updateStatus('Drag or tap letters to select words!');

    timerInterval = setInterval(() => {
      secondsElapsed++;
      const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
      const secs = String(secondsElapsed % 60).padStart(2, '0');
      if (timerEl) timerEl.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  function generatePuzzle() {
    const config = DIFFICULTIES[currentDifficulty];
    const pool = (WORD_BANKS[currentCategory] || WORD_BANKS.tech).filter(w =>
      w.length >= config.minWordLength && w.length <= config.maxWordLength && w.length <= config.gridSize
    );

    let success = false;
    let attempts = 0;

    while (!success && attempts < 30) {
      attempts++;
      gridLetters = Array(config.gridSize).fill(null).map(() => Array(config.gridSize).fill(''));
      placedWords = [];

      const candidateWords = [...pool];
      shuffleArray(candidateWords);
      const targetWords = candidateWords.slice(0, config.wordCount);

      let allPlaced = true;
      for (const word of targetWords) {
        const placed = placeWordInGrid(word, config);
        if (!placed) {
          allPlaced = false;
          break;
        }
      }

      if (allPlaced && placedWords.length === targetWords.length) {
        success = true;
      }
    }

    // Fill remaining empty cells with random uppercase letters
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < config.gridSize; r++) {
      for (let c = 0; c < config.gridSize; c++) {
        if (!gridLetters[r][c]) {
          gridLetters[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }
  }

  function placeWordInGrid(word, config) {
    const letters = word.toUpperCase().split('');
    const dirs = [...config.directions];
    shuffleArray(dirs);

    for (let attempt = 0; attempt < 120; attempt++) {
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      const [dr, dc] = dir;

      const minR = dr < 0 ? letters.length - 1 : 0;
      const maxR = dr > 0 ? config.gridSize - letters.length : config.gridSize - 1;
      const minC = dc < 0 ? letters.length - 1 : 0;
      const maxC = dc > 0 ? config.gridSize - letters.length : config.gridSize - 1;

      if (minR > maxR || minC > maxC) continue;

      const startR = minR + Math.floor(Math.random() * (maxR - minR + 1));
      const startC = minC + Math.floor(Math.random() * (maxC - minC + 1));

      let canPlace = true;
      const coords = [];
      for (let i = 0; i < letters.length; i++) {
        const r = startR + i * dr;
        const c = startC + i * dc;
        if (gridLetters[r][c] !== '' && gridLetters[r][c] !== letters[i]) {
          canPlace = false;
          break;
        }
        coords.push([r, c]);
      }

      if (canPlace) {
        for (let i = 0; i < letters.length; i++) {
          const [r, c] = coords[i];
          gridLetters[r][c] = letters[i];
        }
        placedWords.push({ word, coords });
        return true;
      }
    }
    return false;
  }

  function renderWordList() {
    if (!wordListEl) return;
    wordListEl.innerHTML = '';

    placedWords.forEach((item) => {
      const chip = document.createElement('div');
      chip.className = 'ws-word-chip';
      chip.id = `ws-chip-${item.word}`;
      chip.setAttribute('data-word', item.word);
      chip.textContent = item.word;
      wordListEl.appendChild(chip);
    });
  }

  function renderGrid() {
    if (!gridEl) return;
    const config = DIFFICULTIES[currentDifficulty];
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${config.gridSize}, 1fr)`;
    gridEl.style.gridTemplateRows = `repeat(${config.gridSize}, 1fr)`;

    for (let r = 0; r < config.gridSize; r++) {
      for (let c = 0; c < config.gridSize; c++) {
        const cell = document.createElement('div');
        cell.className = 'ws-cell';
        cell.setAttribute('data-row', r);
        cell.setAttribute('data-col', c);
        cell.textContent = gridLetters[r][c];
        gridEl.appendChild(cell);
      }
    }
  }

  function setupPointerEvents() {
    if (!gridEl) return;

    gridEl.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  }

  function getCellFromPoint(clientX, clientY) {
    const el = document.elementFromPoint(clientX, clientY);
    if (el && el.classList && el.classList.contains('ws-cell')) {
      const r = parseInt(el.getAttribute('data-row'), 10);
      const c = parseInt(el.getAttribute('data-col'), 10);
      return { row: r, col: c, element: el };
    }
    return null;
  }

  function handlePointerDown(e) {
    if (isGameOver) return;
    const cell = getCellFromPoint(e.clientX, e.clientY);
    if (!cell) return;

    // Check if this is second click of click-start + click-end selection
    if (clickedStartCell) {
      const line = getStraightLine(clickedStartCell, cell);
      if (line && line.length > 1) {
        selectedCells = line;
        checkSelectedWord();
        clickedStartCell = null;
        clearSelectionHighlight();
        return;
      }
      clickedStartCell = null;
      clearSelectionHighlight();
    }

    isPointerDown = true;
    startCell = cell;
    selectedCells = [cell];
    highlightCells(selectedCells);
  }

  function handlePointerMove(e) {
    if (!isPointerDown || !startCell || isGameOver) return;

    const cell = getCellFromPoint(e.clientX, e.clientY);
    if (!cell) return;

    const line = getStraightLine(startCell, cell);
    if (line && line.length > 0) {
      selectedCells = line;
      highlightCells(selectedCells);
    }
  }

  function handlePointerUp(e) {
    if (!isPointerDown || isGameOver) return;
    isPointerDown = false;

    if (selectedCells.length > 1) {
      checkSelectedWord();
      clearSelectionHighlight();
      startCell = null;
      clickedStartCell = null;
    } else if (selectedCells.length === 1) {
      clickedStartCell = selectedCells[0];
      highlightCells([clickedStartCell]);
    }
  }

  function getStraightLine(start, end) {
    const dr = end.row - start.row;
    const dc = end.col - start.col;
    const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
    const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

    // Straight line condition: horizontal, vertical, or 45-degree diagonal
    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) {
      return null;
    }

    const length = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
    const line = [];
    for (let i = 0; i < length; i++) {
      line.push({
        row: start.row + i * stepR,
        col: start.col + i * stepC
      });
    }
    return line;
  }

  function highlightCells(cells) {
    if (!gridEl) return;
    const allCells = gridEl.querySelectorAll('.ws-cell');
    allCells.forEach(cell => cell.classList.remove('selected'));

    cells.forEach(coord => {
      const cellEl = gridEl.querySelector(`.ws-cell[data-row="${coord.row}"][data-col="${coord.col}"]`);
      if (cellEl) cellEl.classList.add('selected');
    });
  }

  function clearSelectionHighlight() {
    if (!gridEl) return;
    const allCells = gridEl.querySelectorAll('.ws-cell');
    allCells.forEach(cell => cell.classList.remove('selected'));
    selectedCells = [];
  }

  function checkSelectedWord() {
    if (selectedCells.length === 0) return;

    const forwardStr = selectedCells.map(c => gridLetters[c.row][c.col]).join('');
    const reverseStr = forwardStr.split('').reverse().join('');

    let matchedItem = placedWords.find(item =>
      (!foundWords.has(item.word)) && (item.word === forwardStr || item.word === reverseStr)
    );

    if (matchedItem) {
      const word = matchedItem.word;
      const colorIndex = foundWords.size % 8;
      foundWords.add(word);

      // Permanently style word cells
      matchedItem.coords.forEach(([r, c]) => {
        const cellEl = gridEl.querySelector(`.ws-cell[data-row="${r}"][data-col="${c}"]`);
        if (cellEl) {
          cellEl.classList.add('found', `found-color-${colorIndex}`);
        }
      });

      // Update chip
      const chip = document.getElementById(`ws-chip-${word}`);
      if (chip) chip.classList.add('found');

      updateScoreDisplay();
      updateStatus(`Awesome! Found "${word}"!`);

      // Check win condition
      if (foundWords.size === placedWords.length) {
        endGameVictory();
      }
    } else {
      updateStatus('Try another word!');
    }
  }

  function endGameVictory() {
    isGameOver = true;
    clearInterval(timerInterval);

    if (gridEl) gridEl.classList.add('completed');
    const mins = Math.floor(secondsElapsed / 60);
    const secs = secondsElapsed % 60;
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    updateStatus(`🎉 Solved in ${timeStr}! Great job!`);
  }

  function updateScoreDisplay() {
    if (foundScoreEl) {
      foundScoreEl.textContent = `${foundWords.size} / ${placedWords.length}`;
    }
  }

  function updateStatus(msg) {
    if (statusTextEl) {
      statusTextEl.textContent = msg;
    }
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  document.addEventListener('DOMContentLoaded', initWordSearch);
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initWordSearch();
  }
})();
