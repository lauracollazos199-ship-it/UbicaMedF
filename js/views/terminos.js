document.addEventListener("DOMContentLoaded", () => {

  const loginModal = document.getElementById("loginModal");
  const registerModal = document.getElementById("registerModal");

  const loginBtns = document.querySelectorAll(".login-link");
  const registerBtns = document.querySelectorAll(".register-link");

  const closeBtns = document.querySelectorAll(".close-modal");


  // ABRIR LOGIN

  loginBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      loginModal.style.display = "flex";
    });
  });


  // ABRIR REGISTRO

  registerBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      registerModal.style.display = "flex";
    });
  });


  // CERRAR MODALES

  closeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-close");
      const modal = document.getElementById(modalId);

      if (modal) {
        modal.style.display = "none";
      }
    });
  });

 
  // CLICK FUERA DEL MODAL

  window.addEventListener("click", (e) => {
    if (e.target === loginModal) loginModal.style.display = "none";
    if (e.target === registerModal) registerModal.style.display = "none";
  });

});