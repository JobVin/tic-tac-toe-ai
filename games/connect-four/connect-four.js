/**
 * Connect Four Game Module (7x6 Grid & Tactical AI)
 */

(function () {
  const C4_ROWS = 6;
  const C4_COLS = 7;
  let c4Grid = Array(C4_ROWS).fill(null).map(() => Array(C4_COLS).fill(''));
  let c4GameActive = true;
  let c4Scores = { player: 0, ai: 0, ties: 0 };

  let c4PlayerScoreEl, c4AiScoreEl, c4TiesScoreEl, c4StatusTextEl, c4Columns, c4RestartBtn;

  function initConnectFour() {
    c4PlayerScoreEl = document.getElementById('c4-player-score');
    c4AiScoreEl = document.getElementById('c4-ai-score');
    c4TiesScoreEl = document.getElementById('c4-ties-score');
    c4StatusTextEl = document.getElementById('c4-status-text');
    c4Columns = document.querySelectorAll('.c4-column');
    c4RestartBtn = document.getElementById('c4-restart-btn');

    if (!c4Columns.length) return;

    c4Columns.forEach(col => {
      col.addEventListener('click', (e) => {
        const colIndex = parseInt(e.currentTarget.getAttribute('data-col'), 10);
        handleC4ColumnClick(colIndex);
      });
    });

    if (c4RestartBtn) {
      c4RestartBtn.addEventListener('click', resetC4Board);
    }
  }

  function handleC4ColumnClick(colIndex) {
    if (!c4GameActive) return;

    const targetRow = getLowestAvailableRow(c4Grid, colIndex);
    if (targetRow === -1) return;

    makeC4Move(targetRow, colIndex, 'R');

    const winSlots = checkC4Win('R', c4Grid);
    if (winSlots) {
      endC4Game('R', winSlots);
      return;
    }

    if (isC4BoardFull(c4Grid)) {
      endC4Game('draw');
      return;
    }

    c4GameActive = false;
    updateC4Status("AI is thinking...");

    setTimeout(() => {
      makeC4AIMove();
    }, 450);
  }

  function makeC4AIMove() {
    const validCols = getValidC4Columns(c4Grid);
    if (validCols.length === 0) return;

    let chosenCol = -1;

    for (let c of validCols) {
      const r = getLowestAvailableRow(c4Grid, c);
      const tempGrid = copyC4Grid(c4Grid);
      tempGrid[r][c] = 'Y';
      if (checkC4Win('Y', tempGrid)) {
        chosenCol = c;
        break;
      }
    }

    if (chosenCol === -1) {
      for (let c of validCols) {
        const r = getLowestAvailableRow(c4Grid, c);
        const tempGrid = copyC4Grid(c4Grid);
        tempGrid[r][c] = 'R';
        if (checkC4Win('R', tempGrid)) {
          chosenCol = c;
          break;
        }
      }
    }

    if (chosenCol === -1) {
      const safeCols = validCols.filter(c => {
        const r = getLowestAvailableRow(c4Grid, c);
        if (r > 0) {
          const tempGrid = copyC4Grid(c4Grid);
          tempGrid[r][c] = 'Y';
          tempGrid[r - 1][c] = 'R';
          if (checkC4Win('R', tempGrid)) return false;
        }
        return true;
      });

      const candidates = safeCols.length > 0 ? safeCols : validCols;
      candidates.sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3));
      chosenCol = candidates[0];
    }

    const targetRow = getLowestAvailableRow(c4Grid, chosenCol);
    makeC4Move(targetRow, chosenCol, 'Y');

    const winSlots = checkC4Win('Y', c4Grid);
    if (winSlots) {
      endC4Game('Y', winSlots);
      return;
    }

    if (isC4BoardFull(c4Grid)) {
      endC4Game('draw');
      return;
    }

    c4GameActive = true;
    updateC4Status("Your turn! (🔴)");
  }

  function makeC4Move(row, col, symbol) {
    c4Grid[row][col] = symbol;
    const slotEl = document.querySelector(`.c4-column[data-col="${col}"] .c4-slot[data-row="${row}"]`);
    if (slotEl) {
      slotEl.classList.add(symbol === 'R' ? 'disc-red' : 'disc-yellow');
    }
  }

  function getLowestAvailableRow(grid, col) {
    for (let r = C4_ROWS - 1; r >= 0; r--) {
      if (grid[r][col] === '') return r;
    }
    return -1;
  }

  function getValidC4Columns(grid) {
    const cols = [];
    for (let c = 0; c < C4_COLS; c++) {
      if (grid[0][c] === '') cols.push(c);
    }
    return cols;
  }

  function copyC4Grid(grid) {
    return grid.map(row => [...row]);
  }

  function isC4BoardFull(grid) {
    return grid[0].every(cell => cell !== '');
  }

  function checkC4Win(symbol, grid) {
    for (let r = 0; r < C4_ROWS; r++) {
      for (let c = 0; c <= C4_COLS - 4; c++) {
        if (grid[r][c] === symbol && grid[r][c+1] === symbol && grid[r][c+2] === symbol && grid[r][c+3] === symbol) {
          return [[r,c], [r,c+1], [r,c+2], [r,c+3]];
        }
      }
    }

    for (let r = 0; r <= C4_ROWS - 4; r++) {
      for (let c = 0; c < C4_COLS; c++) {
        if (grid[r][c] === symbol && grid[r+1][c] === symbol && grid[r+2][c] === symbol && grid[r+3][c] === symbol) {
          return [[r,c], [r+1,c], [r+2,c], [r+3,c]];
        }
      }
    }

    for (let r = 3; r < C4_ROWS; r++) {
      for (let c = 0; c <= C4_COLS - 4; c++) {
        if (grid[r][c] === symbol && grid[r-1][c+1] === symbol && grid[r-2][c+2] === symbol && grid[r-3][c+3] === symbol) {
          return [[r,c], [r-1,c+1], [r-2,c+2], [r-3,c+3]];
        }
      }
    }

    for (let r = 0; r <= C4_ROWS - 4; r++) {
      for (let c = 0; c <= C4_COLS - 4; c++) {
        if (grid[r][c] === symbol && grid[r+1][c+1] === symbol && grid[r+2][c+2] === symbol && grid[r+3][c+3] === symbol) {
          return [[r,c], [r+1,c+1], [r+2,c+2], [r+3,c+3]];
        }
      }
    }

    return null;
  }

  function endC4Game(winner, winSlots = null) {
    c4GameActive = false;

    if (winner === 'R') {
      updateC4Status("🎉 You Win!");
      c4Scores.player++;
      if (c4PlayerScoreEl) c4PlayerScoreEl.textContent = c4Scores.player;
      highlightC4WinningSlots(winSlots);
    } else if (winner === 'Y') {
      updateC4Status("🤖 AI Wins!");
      c4Scores.ai++;
      if (c4AiScoreEl) c4AiScoreEl.textContent = c4Scores.ai;
      highlightC4WinningSlots(winSlots);
    } else {
      updateC4Status("🤝 It's a Draw!");
      c4Scores.ties++;
      if (c4TiesScoreEl) c4TiesScoreEl.textContent = c4Scores.ties;
    }
  }

  function highlightC4WinningSlots(winSlots) {
    if (!winSlots) return;
    winSlots.forEach(([r, c]) => {
      const slotEl = document.querySelector(`.c4-column[data-col="${c}"] .c4-slot[data-row="${r}"]`);
      if (slotEl) slotEl.classList.add('winner-disc');
    });
  }

  function resetC4Board() {
    c4Grid = Array(C4_ROWS).fill(null).map(() => Array(C4_COLS).fill(''));
    c4GameActive = true;

    document.querySelectorAll('.c4-slot').forEach(slot => {
      slot.className = 'c4-slot';
    });

    updateC4Status("Your turn! (🔴)");
  }

  function updateC4Status(msg) {
    if (c4StatusTextEl) c4StatusTextEl.textContent = msg;
  }

  document.addEventListener('DOMContentLoaded', initConnectFour);
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initConnectFour();
  }
})();
