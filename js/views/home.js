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
});