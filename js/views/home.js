document.addEventListener("DOMContentLoaded", () => {
  
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-6px)";
      card.style.boxShadow = "0 14px 28px rgba(0,0,0,0.12)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)";
      card.style.boxShadow = "0 10px 24px rgba(0,0,0,0.08)";
    });
  });


  const params = new URLSearchParams(window.location.search);
const modal = params.get("modal");

if (modal === "login") {
  const loginModal = document.getElementById("loginModal");
  if (loginModal) loginModal.style.display = "flex";
} 
else if (modal === "register") {
  const registerModal = document.getElementById("registerModal");
  if (registerModal) registerModal.style.display = "flex";
}
else if (modal === "reset") {
  const resetModal = document.getElementById("resetModal");
  if (resetModal) resetModal.style.display = "flex";
}


});