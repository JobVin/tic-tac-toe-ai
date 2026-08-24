/**
 * Tic-Tac-Toe Game Module (Easy, Medium, Hard Minimax AI)
 */

(function () {
  let board = ['', '', '', '', '', '', '', '', ''];
  let gameActive = true;
  let currentDifficulty = 'medium';

  const PLAYER = 'X';
  const AI = 'O';
  let scores = { player: 0, ai: 0, ties: 0 };

  const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  let cells, statusText, restartBtn, playerScoreEl, aiScoreEl, tiesScoreEl, difficultyBtns;

  function initTicTacToe() {
    cells = document.querySelectorAll('.cell');
    statusText = document.getElementById('status-text');
    restartBtn = document.getElementById('restart-btn');
    playerScoreEl = document.getElementById('player-score');
    aiScoreEl = document.getElementById('ai-score');
    tiesScoreEl = document.getElementById('ties-score');
    difficultyBtns = document.querySelectorAll('.difficulty-btn');

    if (!cells.length) return;

    cells.forEach(cell => {
      cell.addEventListener('click', handleCellClick);
    });

    if (restartBtn) {
      restartBtn.addEventListener('click', resetBoard);
    }

    difficultyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedLevel = e.currentTarget.getAttribute('data-level');
        if (selectedLevel === currentDifficulty) return;

        difficultyBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });

        e.currentTarget.classList.add('active');
        e.currentTarget.setAttribute('aria-checked', 'true');
        currentDifficulty = selectedLevel;

        resetBoard();
      });
    });

    updateStatus("Your turn! (X)");
  }

  function handleCellClick(event) {
    const cell = event.target;
    const index = parseInt(cell.getAttribute('data-index'), 10);

    if (board[index] !== '' || !gameActive) return;

    makeMove(index, PLAYER);

    const winCombo = checkWin(PLAYER);
    if (winCombo) {
      endGame(PLAYER, winCombo);
      return;
    }

    if (checkDraw()) {
      endGame('draw');
      return;
    }

    gameActive = false;
    updateStatus("AI is thinking...");

    setTimeout(() => {
      makeAIMove();
    }, 400);
  }

  function makeAIMove() {
    const availableIndices = getAvailableIndices(board);
    if (availableIndices.length === 0) return;

    let chosenCellIndex;
    switch (currentDifficulty) {
      case 'easy':
        chosenCellIndex = getEasyMove(availableIndices);
        break;
      case 'medium':
        chosenCellIndex = getMediumMove(board, availableIndices);
        break;
      case 'hard':
        chosenCellIndex = getHardMove(board);
        break;
      default:
        chosenCellIndex = getEasyMove(availableIndices);
    }

    makeMove(chosenCellIndex, AI);

    const winCombo = checkWin(AI);
    if (winCombo) {
      endGame(AI, winCombo);
      return;
    }

    if (checkDraw()) {
      endGame('draw');
      return;
    }

    gameActive = true;
    updateStatus("Your turn! (X)");
  }

  function getEasyMove(availableIndices) {
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    return availableIndices[randomIndex];
  }

  function getMediumMove(currentBoard, availableIndices) {
    for (let idx of availableIndices) {
      const tempBoard = [...currentBoard];
      tempBoard[idx] = AI;
      if (checkWin(AI, tempBoard)) return idx;
    }

    if (Math.random() < 0.8) {
      for (let idx of availableIndices) {
        const tempBoard = [...currentBoard];
        tempBoard[idx] = PLAYER;
        if (checkWin(PLAYER, tempBoard)) return idx;
      }
    }

    if (availableIndices.includes(4) && Math.random() < 0.5) return 4;
    return getEasyMove(availableIndices);
  }

  function getHardMove(currentBoard) {
    const result = minimax([...currentBoard], 0, true);
    return result.move;
  }

  function minimax(boardState, depth, isMaximizing) {
    if (checkWin(AI, boardState)) return { score: 10 - depth };
    if (checkWin(PLAYER, boardState)) return { score: depth - 10 };

    const available = getAvailableIndices(boardState);
    if (available.length === 0) return { score: 0 };

    if (isMaximizing) {
      let bestScore = -Infinity;
      let bestMove = available[0];
      for (let index of available) {
        boardState[index] = AI;
        let result = minimax(boardState, depth + 1, false);
        boardState[index] = '';
        if (result.score > bestScore) {
          bestScore = result.score;
          bestMove = index;
        }
      }
      return { score: bestScore, move: bestMove };
    } else {
      let bestScore = Infinity;
      let bestMove = available[0];
      for (let index of available) {
        boardState[index] = PLAYER;
        let result = minimax(boardState, depth + 1, true);
        boardState[index] = '';
        if (result.score < bestScore) {
          bestScore = result.score;
          bestMove = index;
        }
      }
      return { score: bestScore, move: bestMove };
    }
  }

  function getAvailableIndices(b) {
    const indices = [];
    for (let i = 0; i < b.length; i++) {
      if (b[i] === '') indices.push(i);
    }
    return indices;
  }

  function makeMove(index, symbol) {
    board[index] = symbol;
    const cell = cells[index];
    cell.textContent = symbol;
    cell.classList.add(symbol.toLowerCase());
  }

  function checkWin(symbol, targetBoard = board) {
    for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
      const [a, b, c] = WINNING_COMBINATIONS[i];
      if (targetBoard[a] === symbol && targetBoard[b] === symbol && targetBoard[c] === symbol) {
        return WINNING_COMBINATIONS[i];
      }
    }
    return null;
  }

  function checkDraw(targetBoard = board) {
    return targetBoard.every(cell => cell !== '');
  }

  function endGame(winner, winCombo = null) {
    gameActive = false;
    if (winner === PLAYER) {
      updateStatus("🎉 You Win!");
      scores.player++;
      if (playerScoreEl) playerScoreEl.textContent = scores.player;
      highlightWinningCells(winCombo);
    } else if (winner === AI) {
      updateStatus("🤖 AI Wins!");
      scores.ai++;
      if (aiScoreEl) aiScoreEl.textContent = scores.ai;
      highlightWinningCells(winCombo);
    } else {
      updateStatus("🤝 It's a Draw!");
      scores.ties++;
      if (tiesScoreEl) tiesScoreEl.textContent = scores.ties;
    }
  }

  function highlightWinningCells(winCombo) {
    if (!winCombo) return;
    winCombo.forEach(index => {
      cells[index].classList.add('winner');
    });
  }

  function resetBoard() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    cells.forEach(cell => {
      cell.textContent = '';
      cell.className = 'cell';
    });
    updateStatus("Your turn! (X)");
  }

  function updateStatus(msg) {
    if (statusText) statusText.textContent = msg;
  }

  document.addEventListener('DOMContentLoaded', initTicTacToe);
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initTicTacToe();
  }
})();
