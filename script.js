/**
 * Arcade Hub - SPA Router & Main Hub Controller
 */

(function () {
  let hubView, ticTacToeView, rockPaperScissorsView, connectFourView, memoryMatchView;
  let backToHubBtn, navLogo, playBtns;

  function initAppRouter() {
    hubView = document.getElementById('hub-view');
    ticTacToeView = document.getElementById('tic-tac-toe-view');
    rockPaperScissorsView = document.getElementById('rock-paper-scissors-view');
    connectFourView = document.getElementById('connect-four-view');
    memoryMatchView = document.getElementById('memory-match-view');

    backToHubBtn = document.getElementById('back-to-hub-btn');
    navLogo = document.getElementById('nav-logo');
    playBtns = document.querySelectorAll('.play-btn[data-target]');

    if (backToHubBtn) {
      backToHubBtn.addEventListener('click', () => showView('hub'));
    }
    if (navLogo) {
      navLogo.addEventListener('click', () => showView('hub'));
    }

    playBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetView = e.currentTarget.getAttribute('data-target');
        showView(targetView);
      });
    });

    window.addEventListener('hashchange', handleHashRouting);
    handleHashRouting();
  }

  /**
   * SPA View Switcher
   * @param {string} viewName - 'hub', 'tic-tac-toe', 'rock-paper-scissors', 'connect-four', or 'memory-match'
   */
  function showView(viewName) {
    if (hubView) hubView.classList.add('hidden');
    if (ticTacToeView) ticTacToeView.classList.add('hidden');
    if (rockPaperScissorsView) rockPaperScissorsView.classList.add('hidden');
    if (connectFourView) connectFourView.classList.add('hidden');
    if (memoryMatchView) memoryMatchView.classList.add('hidden');

    if (viewName === 'tic-tac-toe' && ticTacToeView) {
      ticTacToeView.classList.remove('hidden');
      if (backToHubBtn) backToHubBtn.classList.remove('hidden');
      if (window.location.hash !== '#tic-tac-toe') window.location.hash = 'tic-tac-toe';
    } else if (viewName === 'rock-paper-scissors' && rockPaperScissorsView) {
      rockPaperScissorsView.classList.remove('hidden');
      if (backToHubBtn) backToHubBtn.classList.remove('hidden');
      if (window.location.hash !== '#rock-paper-scissors') window.location.hash = 'rock-paper-scissors';
    } else if (viewName === 'connect-four' && connectFourView) {
      connectFourView.classList.remove('hidden');
      if (backToHubBtn) backToHubBtn.classList.remove('hidden');
      if (window.location.hash !== '#connect-four') window.location.hash = 'connect-four';
    } else if (viewName === 'memory-match' && memoryMatchView) {
      memoryMatchView.classList.remove('hidden');
      if (backToHubBtn) backToHubBtn.classList.remove('hidden');
      if (window.location.hash !== '#memory-match') window.location.hash = 'memory-match';
    } else {
      if (hubView) hubView.classList.remove('hidden');
      if (backToHubBtn) backToHubBtn.classList.add('hidden');
      if (window.location.hash !== '#hub' && window.location.hash !== '') window.location.hash = 'hub';
    }
  }

  function handleHashRouting() {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'tic-tac-toe') {
      showView('tic-tac-toe');
    } else if (hash === 'rock-paper-scissors') {
      showView('rock-paper-scissors');
    } else if (hash === 'connect-four') {
      showView('connect-four');
    } else if (hash === 'memory-match') {
      showView('memory-match');
    } else {
      showView('hub');
    }
  }

  document.addEventListener('DOMContentLoaded', initAppRouter);
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initAppRouter();
  }
})();
