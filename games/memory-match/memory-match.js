/**
 * Memory Match Game Module (4x4 Grid, Shuffle & 3D Card Flip)
 */

(function () {
  const MEMORY_EMOJIS = ['🐶', '🐱', '🦊', '🐼', '🦁', '🐯', '🐸', '🐵'];
  let firstMemoryCard = null;
  let secondMemoryCard = null;
  let memoryLockBoard = false;
  let memoryMoves = 0;
  let memoryMatches = 0;
  let memoryBestScore = null;

  let memoryMovesEl, memoryMatchesEl, memoryBestEl, memoryStatusTextEl, memoryGridEl, memoryRestartBtn;

  function initMemoryGame() {
    memoryMovesEl = document.getElementById('memory-moves');
    memoryMatchesEl = document.getElementById('memory-matches');
    memoryBestEl = document.getElementById('memory-best');
    memoryStatusTextEl = document.getElementById('memory-status-text');
    memoryGridEl = document.getElementById('memory-grid');
    memoryRestartBtn = document.getElementById('memory-restart-btn');

    if (!memoryGridEl) return;

    if (memoryRestartBtn) {
      memoryRestartBtn.addEventListener('click', initMemoryBoard);
    }

    initMemoryBoard();
  }

  function initMemoryBoard() {
    if (!memoryGridEl) return;

    const deck = shuffleArray([...MEMORY_EMOJIS, ...MEMORY_EMOJIS]);
    memoryGridEl.innerHTML = '';

    deck.forEach((emoji, index) => {
      const card = document.createElement('div');
      card.classList.add('memory-card');
      card.setAttribute('data-emoji', emoji);
      card.setAttribute('data-index', index);

      card.innerHTML = `
        <div class="card-face card-back">❓</div>
        <div class="card-face card-front">${emoji}</div>
      `;

      card.addEventListener('click', () => handleMemoryCardClick(card));
      memoryGridEl.appendChild(card);
    });

    firstMemoryCard = null;
    secondMemoryCard = null;
    memoryLockBoard = false;
    memoryMoves = 0;
    memoryMatches = 0;

    if (memoryMovesEl) memoryMovesEl.textContent = '0';
    if (memoryMatchesEl) memoryMatchesEl.textContent = '0 / 8';
    if (memoryStatusTextEl) memoryStatusTextEl.textContent = 'Click cards to flip and match pairs!';
  }

  function handleMemoryCardClick(card) {
    if (memoryLockBoard) return;
    if (card === firstMemoryCard) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');

    if (!firstMemoryCard) {
      firstMemoryCard = card;
      return;
    }

    secondMemoryCard = card;
    memoryMoves++;
    if (memoryMovesEl) memoryMovesEl.textContent = memoryMoves;

    checkMemoryMatch();
  }

  function checkMemoryMatch() {
    const isMatch = firstMemoryCard.dataset.emoji === secondMemoryCard.dataset.emoji;

    if (isMatch) {
      firstMemoryCard.classList.add('matched');
      secondMemoryCard.classList.add('matched');
      memoryMatches++;
      if (memoryMatchesEl) memoryMatchesEl.textContent = `${memoryMatches} / 8`;

      resetMemoryCardSelection();

      if (memoryMatches === 8) {
        endMemoryGame();
      }
    } else {
      memoryLockBoard = true;
      setTimeout(() => {
        if (firstMemoryCard) firstMemoryCard.classList.remove('flipped');
        if (secondMemoryCard) secondMemoryCard.classList.remove('flipped');
        resetMemoryCardSelection();
      }, 800);
    }
  }

  function resetMemoryCardSelection() {
    firstMemoryCard = null;
    secondMemoryCard = null;
    memoryLockBoard = false;
  }

  function endMemoryGame() {
    if (memoryBestScore === null || memoryMoves < memoryBestScore) {
      memoryBestScore = memoryMoves;
      if (memoryBestEl) memoryBestEl.textContent = memoryBestScore;
    }
    if (memoryStatusTextEl) {
      memoryStatusTextEl.textContent = `🎉 Outstanding! All 8 pairs matched in ${memoryMoves} moves!`;
    }
  }

  function shuffleArray(arr) {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  document.addEventListener('DOMContentLoaded', initMemoryGame);
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initMemoryGame();
  }
})();
