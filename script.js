/**
 * Tic-Tac-Toe Game with Simple AI Opponent
 * Built using Vanilla JavaScript (ES6)
 */

// ==========================================
// 1. GAME STATE & CONSTANTS
// ==========================================

/**
 * The board state is represented as a 1D array of 9 strings.
 * Indices map to the 3x3 grid as follows:
 *   0 | 1 | 2
 *  ---+---+---
 *   3 | 4 | 5
 *  ---+---+---
 *   6 | 7 | 8
 * 
 * Empty string '' indicates an open cell.
 */
let board = ['', '', '', '', '', '', '', '', ''];

// Controls whether user clicks are accepted
let gameActive = true;

// Player and AI symbol assignments
const PLAYER = 'X';
const AI = 'O';

// Score tracker
let scores = {
  player: 0,
  ai: 0,
  ties: 0
};

/**
 * All 8 possible winning line index patterns on a 3x3 board:
 * - 3 horizontal rows
 * - 3 vertical columns
 * - 2 diagonals
 */
const WINNING_COMBINATIONS = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Top-left to bottom-right diagonal
  [2, 4, 6]  // Top-right to bottom-left diagonal
];


// ==========================================
// 2. DOM ELEMENTS & INITIALIZATION
// ==========================================
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status-text');
const restartBtn = document.getElementById('restart-btn');
const playerScoreEl = document.getElementById('player-score');
const aiScoreEl = document.getElementById('ai-score');
const tiesScoreEl = document.getElementById('ties-score');

/**
 * Attaches event listeners and sets the initial game state on page load.
 */
function initGame() {
  cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
  });
  restartBtn.addEventListener('click', resetBoard);
  updateStatus("Your turn! (X)");
}


// ==========================================
// 3. PLAYER MOVE LOGIC
// ==========================================

/**
 * Handles cell click events triggered by the human player.
 */
function handleCellClick(event) {
  const cell = event.target;
  const index = parseInt(cell.getAttribute('data-index'), 10);

  // Guard clause: Ignore click if the cell is already occupied or if game is inactive
  if (board[index] !== '' || !gameActive) {
    return;
  }

  // 1. Execute Player's Move
  makeMove(index, PLAYER);

  // 2. Check if Player won after this move
  const winCombo = checkWin(PLAYER);
  if (winCombo) {
    endGame(PLAYER, winCombo);
    return;
  }

  // 3. Check if the game is a draw
  if (checkDraw()) {
    endGame('draw');
    return;
  }

  // 4. If game continues, pass turn to AI
  gameActive = false; // Disable board interaction while AI makes its move
  updateStatus("AI is thinking...");

  // Introduce a slight artificial delay (400ms) for a more natural feel
  setTimeout(() => {
    makeAIMove();
  }, 400);
}


// ==========================================
// 4. AI MOVE LOGIC (SIMPLE RANDOM SELECTION)
// ==========================================

/**
 * AI Logic:
 * 1. Find all available (empty) cell indices on the board.
 * 2. Select one of those indices uniformly at random.
 * 3. Place the AI move ('O') and evaluate the game state.
 */
function makeAIMove() {
  // Step 4.1: Gather all indices where the board array has an empty string ''
  const availableIndices = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      availableIndices.push(i);
    }
  }

  // Safety check: if no spaces are available, exit
  if (availableIndices.length === 0) return;

  // Step 4.2: Select a random element index from availableIndices
  // Math.random() gives a float between [0, 1)
  // Multiplying by availableIndices.length and flooring gives a valid index offset [0, length-1]
  const randomIndex = Math.floor(Math.random() * availableIndices.length);
  const chosenCellIndex = availableIndices[randomIndex];

  // Step 4.3: Apply AI move to board
  makeMove(chosenCellIndex, AI);

  // Step 4.4: Check if AI won
  const winCombo = checkWin(AI);
  if (winCombo) {
    endGame(AI, winCombo);
    return;
  }

  // Step 4.5: Check if move resulted in a draw
  if (checkDraw()) {
    endGame('draw');
    return;
  }

  // Step 4.6: Return control back to human player
  gameActive = true;
  updateStatus("Your turn! (X)");
}


// ==========================================
// 5. WIN & DRAW DETECTION LOGIC
// ==========================================

/**
 * Updates both the internal state array and the visible UI for a move.
 * @param {number} index - Board position (0 to 8)
 * @param {string} symbol - 'X' or 'O'
 */
function makeMove(index, symbol) {
  board[index] = symbol;
  const cell = cells[index];
  cell.textContent = symbol;
  cell.classList.add(symbol.toLowerCase());
}

/**
 * Checks if the specified symbol ('X' or 'O') has completed any winning line.
 * 
 * Logic Breakdown:
 * - We loop through each of the 8 winning combinations in WINNING_COMBINATIONS.
 * - Destructure the 3 index positions: [a, b, c].
 * - If board[a], board[b], and board[c] all equal symbol, we have a winner!
 * 
 * @param {string} symbol - 'X' or 'O'
 * @returns {Array|null} The winning combination triplet if won, or null if no win.
 */
function checkWin(symbol) {
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const [a, b, c] = WINNING_COMBINATIONS[i];
    
    if (board[a] === symbol && board[b] === symbol && board[c] === symbol) {
      return WINNING_COMBINATIONS[i]; // Return winning indices (e.g. [0, 1, 2])
    }
  }
  return null;
}

/**
 * Checks if the board is completely full without any winner.
 * Array.prototype.every() checks if every element in board is NOT an empty string.
 * 
 * @returns {boolean} True if board is full, false otherwise.
 */
function checkDraw() {
  return board.every(cell => cell !== '');
}


// ==========================================
// 6. GAME OVER & RESET HELPERS
// ==========================================

/**
 * Ends current game round, updates scoreboard, and highlights winning cells.
 * @param {string} winner - 'X', 'O', or 'draw'
 * @param {Array|null} winCombo - The array of winning cell indices
 */
function endGame(winner, winCombo = null) {
  gameActive = false;

  if (winner === PLAYER) {
    updateStatus("🎉 You Win!");
    scores.player++;
    playerScoreEl.textContent = scores.player;
    highlightWinningCells(winCombo);
  } else if (winner === AI) {
    updateStatus("🤖 AI Wins!");
    scores.ai++;
    aiScoreEl.textContent = scores.ai;
    highlightWinningCells(winCombo);
  } else {
    updateStatus("🤝 It's a Draw!");
    scores.ties++;
    tiesScoreEl.textContent = scores.ties;
  }
}

/**
 * Adds the '.winner' CSS class to the 3 cells in the winning combination.
 */
function highlightWinningCells(winCombo) {
  if (!winCombo) return;
  winCombo.forEach(index => {
    cells[index].classList.add('winner');
  });
}

/**
 * Resets the game state and board UI for a new round.
 */
function resetBoard() {
  board = ['', '', '', '', '', '', '', '', ''];
  gameActive = true;

  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell'; // Reset all classes (removes .x, .o, .winner)
  });

  updateStatus("Your turn! (X)");
}

/**
 * Helper to update status bar message text.
 */
function updateStatus(msg) {
  statusText.textContent = msg;
}

// Start the game once script is executed
initGame();
