/**
 * Rock-Paper-Scissors Game Module (Pattern AI & Custom Image Animation Support)
 */

(function () {
  let rpsScores = { player: 0, ai: 0, ties: 0 };
  let rpsHistory = [];
  const RPS_MOVES = ['rock', 'paper', 'scissors'];
  const RPS_MAP = {
    rock: { emoji: '🪨', beats: 'scissors' },
    paper: { emoji: '📜', beats: 'rock' },
    scissors: { emoji: '✂️', beats: 'paper' }
  };

  // Image path configurations (supports rock.png, paper.png, scissors.png or hand-rock.png)
  const IMAGE_PATHS = {
    rock: 'assets/images/rock-paper-scissors/rock.png',
    paper: 'assets/images/rock-paper-scissors/paper.png',
    scissors: 'assets/images/rock-paper-scissors/scissors.png'
  };

  const ALT_IMAGE_PATHS = {
    rock: 'assets/images/rock-paper-scissors/hand-rock.png',
    paper: 'assets/images/rock-paper-scissors/hand-paper.png',
    scissors: 'assets/images/rock-paper-scissors/hand-scissors.png'
  };

  let rpsPlayerScoreEl, rpsAiScoreEl, rpsTiesScoreEl;
  let rpsPlayerChoiceEl, rpsAiChoiceEl, rpsStatusTextEl;
  let rpsChoiceBtns, rpsResetBtn;

  function initRPS() {
    rpsPlayerScoreEl = document.getElementById('rps-player-score');
    rpsAiScoreEl = document.getElementById('rps-ai-score');
    rpsTiesScoreEl = document.getElementById('rps-ties-score');
    rpsPlayerChoiceEl = document.getElementById('rps-player-choice');
    rpsAiChoiceEl = document.getElementById('rps-ai-choice');
    rpsStatusTextEl = document.getElementById('rps-status-text');
    rpsChoiceBtns = document.querySelectorAll('.rps-choice-btn');
    rpsResetBtn = document.getElementById('rps-reset-btn');

    if (!rpsChoiceBtns.length) return;

    rpsChoiceBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const choice = e.currentTarget.getAttribute('data-choice');
        playRPSWithAnimation(choice);
      });
    });

    if (rpsResetBtn) {
      rpsResetBtn.addEventListener('click', resetRPSGame);
    }
  }

  /**
   * Helper to set image content or fallback to emoji if image is missing.
   */
  function setDisplayContent(containerEl, choiceKey, isShaking = false) {
    if (!containerEl) return;
    const targetKey = isShaking ? 'rock' : choiceKey;
    const imgPath = IMAGE_PATHS[targetKey];
    const altPath = ALT_IMAGE_PATHS[targetKey];
    const fallbackEmoji = isShaking ? '✊' : RPS_MAP[targetKey].emoji;

    containerEl.innerHTML = `
      <img src="${imgPath}" alt="${targetKey}" class="hand-img" 
           onerror="if (!this.dataset.tried) { this.dataset.tried='1'; this.src='${altPath}'; } else { this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex'; }">
      <span class="fallback-emoji" style="display:none;">${fallbackEmoji}</span>
    `;
  }

  /**
   * Runs hand shaking animation (reusing rock.png fist) before revealing player & AI choices!
   */
  function playRPSWithAnimation(playerChoice) {
    // 1. Remove previous win highlights and add shaking animation class
    rpsPlayerChoiceEl.classList.remove('winner-choice');
    rpsAiChoiceEl.classList.remove('winner-choice');

    rpsPlayerChoiceEl.classList.add('animating-hand');
    rpsAiChoiceEl.classList.add('animating-hand');

    // Reuse rock.png (fist image) for shaking animation
    setDisplayContent(rpsPlayerChoiceEl, 'rock', true);
    setDisplayContent(rpsAiChoiceEl, 'rock', true);

    if (rpsStatusTextEl) rpsStatusTextEl.textContent = '1... 2... 3... Shoot!';

    // 2. After 600ms animation, reveal moves and evaluate winner
    setTimeout(() => {
      rpsPlayerChoiceEl.classList.remove('animating-hand');
      rpsAiChoiceEl.classList.remove('animating-hand');

      playRPS(playerChoice);
    }, 600);
  }

  function playRPS(playerChoice) {
    rpsHistory.push(playerChoice);
    const aiChoice = getSmartRPSMove();

    // Display final revealed move images
    setDisplayContent(rpsPlayerChoiceEl, playerChoice, false);
    setDisplayContent(rpsAiChoiceEl, aiChoice, false);

    if (playerChoice === aiChoice) {
      rpsScores.ties++;
      if (rpsTiesScoreEl) rpsTiesScoreEl.textContent = rpsScores.ties;
      if (rpsStatusTextEl) rpsStatusTextEl.textContent = `🤝 It's a Tie! Both chose ${RPS_MAP[playerChoice].emoji}`;
    } else if (RPS_MAP[playerChoice].beats === aiChoice) {
      rpsScores.player++;
      if (rpsPlayerScoreEl) rpsPlayerScoreEl.textContent = rpsScores.player;
      rpsPlayerChoiceEl.classList.add('winner-choice');
      if (rpsStatusTextEl) rpsStatusTextEl.textContent = `🎉 You Win! ${RPS_MAP[playerChoice].emoji} beats ${RPS_MAP[aiChoice].emoji}`;
    } else {
      rpsScores.ai++;
      if (rpsAiScoreEl) rpsAiScoreEl.textContent = rpsScores.ai;
      rpsAiChoiceEl.classList.add('winner-choice');
      if (rpsStatusTextEl) rpsStatusTextEl.textContent = `🤖 AI Wins! ${RPS_MAP[aiChoice].emoji} beats ${RPS_MAP[playerChoice].emoji}`;
    }
  }

  function getSmartRPSMove() {
    if (rpsHistory.length < 3 || Math.random() < 0.4) {
      const idx = Math.floor(Math.random() * RPS_MOVES.length);
      return RPS_MOVES[idx];
    }

    const counts = { rock: 0, paper: 0, scissors: 0 };
    rpsHistory.forEach(m => counts[m]++);

    let mostFrequent = 'rock';
    if (counts.paper > counts[mostFrequent]) mostFrequent = 'paper';
    if (counts.scissors > counts[mostFrequent]) mostFrequent = 'scissors';

    if (mostFrequent === 'rock') return 'paper';
    if (mostFrequent === 'paper') return 'scissors';
    return 'rock';
  }

  function resetRPSGame() {
    rpsScores = { player: 0, ai: 0, ties: 0 };
    rpsHistory = [];
    if (rpsPlayerScoreEl) rpsPlayerScoreEl.textContent = '0';
    if (rpsAiScoreEl) rpsAiScoreEl.textContent = '0';
    if (rpsTiesScoreEl) rpsTiesScoreEl.textContent = '0';
    if (rpsPlayerChoiceEl) rpsPlayerChoiceEl.textContent = '❓';
    if (rpsAiChoiceEl) rpsAiChoiceEl.textContent = '❓';
    if (rpsPlayerChoiceEl) rpsPlayerChoiceEl.classList.remove('winner-choice');
    if (rpsAiChoiceEl) rpsAiChoiceEl.classList.remove('winner-choice');
    if (rpsStatusTextEl) rpsStatusTextEl.textContent = 'Scores reset! Choose your move.';
  }

  document.addEventListener('DOMContentLoaded', initRPS);
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initRPS();
  }
})();
