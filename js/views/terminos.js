document.addEventListener("DOMContentLoaded", () => {

  const volverBtn = document.getElementById("volverBtn");

  const params = new URLSearchParams(window.location.search);
  const from = params.get("from");

  if (!volverBtn) return;

  volverBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (from === "login") {
      window.location.href = "index.html?modal=login";
    } 
    else if (from === "register") {
      window.location.href = "index.html?modal=register";
    } 
    else if (from === "reset") {
      window.location.href = "index.html?modal=reset";
    } 
    else {
      window.location.href = "index.html";
    }
  });

});