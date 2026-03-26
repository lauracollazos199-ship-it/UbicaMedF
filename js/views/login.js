document.addEventListener("DOMContentLoaded", () => {
  // OPEN MODAL
  document.querySelectorAll('[data-login]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('loginModal').style.display = 'flex';
    });
  });

  // CLOSE MODAL when clicking outside
  document.getElementById('loginModal').addEventListener('click', (e) => {
    if (e.target.id === 'loginModal') {
      document.getElementById('loginModal').style.display = 'none';
    }
  });
});