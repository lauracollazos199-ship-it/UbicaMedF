document.addEventListener("DOMContentLoaded", () => {

  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value;
      const email = document.getElementById("registerEmail").value;
      const password = document.getElementById("registerPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // VALIDACIÓN
      if (password !== confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Las contraseñas no coinciden',
          confirmButtonColor: '#1E6FB9'
        });
        return;
      }

      try {

        const res = await fetch("http://localhost:8000/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nombre,
            email,
            password
          })
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.detail || "No se pudo registrar el usuario");
        }

        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: 'Tu cuenta ha sido creada correctamente',
          confirmButtonColor: '#1E6FB9'
        }).then(() => {
          window.location.href = "index.html";
        });

      } catch (err) {

        Swal.fire({
          icon: 'error',
          title: 'Error en registro',
          text: err.message,
          confirmButtonColor: '#1E6FB9'
        });

      }

    });
  }

  // -------- ABRIR REGISTRO --------
  const registerLink = document.querySelector(".register-link");
  const mainRegisterBtn = document.querySelector(".btn-outline");;
  const registerModal = document.getElementById("registerModal");
  const loginModal = document.getElementById("loginModal");



if (registerLink) {
  registerLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginModal.style.display = "none";
    registerModal.style.display = "flex";
  });
}

if (mainRegisterBtn) {
  mainRegisterBtn.addEventListener("click", () => {
    const registerModal = document.getElementById("registerModal");
    const loginModal = document.getElementById("loginModal");

    if (loginModal) loginModal.style.display = "none";
    if (registerModal) registerModal.style.display = "flex";
  });
}

  // -------- VOLVER AL LOGIN --------
  const loginLink = document.querySelector(".login-link");

  if (loginLink) {
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      registerModal.style.display = "none";
      loginModal.style.display = "flex";
    });
  }


// CERRAR MODALES AL HACER CLICK AFUERA
window.addEventListener("click", (e) => {

  const loginModal = document.getElementById("loginModal");
  const registerModal = document.getElementById("registerModal");

  if (e.target === loginModal) {
    loginModal.style.display = "none";
  }

  if (e.target === registerModal) {
    registerModal.style.display = "none";
  }

});

function renderGoogleRegister() {
  if (!window.google || !google.accounts) return;

  const container = document.getElementById("google-btn-register");
  if (!container) return;

  if (container.children.length > 0) return;

  google.accounts.id.renderButton(container, {
    theme: "outline",
    size: "large",
    width: 300
  });
}


const interval = setInterval(() => {
  if (window.google && google.accounts) {
    clearInterval(interval);
    renderGoogleRegister();
  }
}, 100);

});
