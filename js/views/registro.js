document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");

  const emailInput = document.getElementById("registerEmail");
  const emailHint = document.getElementById("emailHint");

  const passwordInput = document.getElementById("registerPassword");
  const confirmInput = document.getElementById("confirmPassword");
  const passwordHint = document.getElementById("passwordHint");
  const passwordMatch = document.getElementById("passwordMatch");

  function limpiarMensaje(msg) {
  if (!msg) return "";

  // Quitar "400:" u otros códigos
  msg = msg.replace(/^\d+:\s*/, "");

  // Quitar "Value error, "
  msg = msg.replace("Value error, ", "");

  // Quitar corchetes y comillas
  msg = msg.replace(/[\[\]']/g, "");

  // Mejorar mensaje de correo duplicado
  msg = msg.replace(/El usuario con email .* ya existe/, "Este correo ya está registrado");

  return msg.trim();
}

  // -------- VALIDACIONES EN VIVO --------
  emailInput.addEventListener("input", () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(emailInput.value)) {
      emailHint.textContent = "Correo inválido";
      emailHint.style.color = "#E53935";
    } else {
      emailHint.textContent = "";
    }
  });

  passwordInput.addEventListener("input", () => {
    const value = passwordInput.value;
    const checks = {
      length: value.length >= 8 && value.length <= 64,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
    };

    passwordHint.innerHTML = `
      <span style="color:${checks.length ? '#4CAF50' : '#E53935'}">Entre 8 y 64 caracteres</span>,
      <span style="color:${checks.uppercase ? '#4CAF50' : '#E53935'}">una mayúscula</span>,
      <span style="color:${checks.lowercase ? '#4CAF50' : '#E53935'}">una minúscula</span>,
      <span style="color:${checks.number ? '#4CAF50' : '#E53935'}">un número</span> y
      <span style="color:${checks.special ? '#4CAF50' : '#E53935'}">un carácter especial</span>.
    `;
  });

  confirmInput.addEventListener("input", () => {
    if (confirmInput.value === passwordInput.value) {
      passwordMatch.textContent = "✔ Las contraseñas coinciden";
      passwordMatch.style.color = "#4CAF50";
    } else {
      passwordMatch.textContent = "✖ Las contraseñas no coinciden";
      passwordMatch.style.color = "#E53935";
    }
  });

  function togglePasswordVisibility(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);

    toggle.addEventListener("click", () => {
      const icon = toggle.querySelector("i");
      if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
      } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
      }
    });
  }

  togglePasswordVisibility("registerPassword", "toggleRegisterPassword");
  togglePasswordVisibility("confirmPassword", "toggleConfirmPassword");

  // -------- SUBMIT --------
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value;
      const email = emailInput.value;
      const password = passwordInput.value;
      const confirmPassword = confirmInput.value;

      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!regex.test(email)) {
        Swal.fire({
          icon: 'error',
          title: 'Error en registro',
          text: 'El correo no es válido',
          confirmButtonColor: '#1E6FB9'
        });
        return;
      }

      if (password !== confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Error en registro',
          text: 'Las contraseñas no coinciden',
          confirmButtonColor: '#1E6FB9'
        });
        return;
      }

      fetch("http://localhost:8000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombre, email, password })
      })
        .then(async res => {
          if (!res.ok) {
            let errorMessage = "Error en registro";

            try {
              const error = await res.json();

              if (typeof error.detail === "string") {
                errorMessage = limpiarMensaje(error.detail);
              } 
              else if (Array.isArray(error.detail)) {
                errorMessage = error.detail
                  .map(e => limpiarMensaje(e.msg || e))
                  .join("\n");
              }

            } catch {
              errorMessage = "Error inesperado en el registro";
            }

            throw new Error(errorMessage);
          }

          return res.json();
        })
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Registro exitoso',
            text: 'Tu cuenta ha sido creada correctamente',
            confirmButtonColor: '#1E6FB9'
          }).then(() => {
            document.body.classList.remove("modal-open");
            window.location.href = "index.html";
          });
        })
        .catch(err => {
          Swal.fire({
            icon: 'error',
            title: 'Error en registro',
            text: limpiarMensaje(err.message),
            confirmButtonColor: '#1E6FB9'
          });
        });
    });
  }

  // -------- ABRIR/CERRAR MODALES --------
  const registerLink = document.querySelector(".register-link");
  const mainRegisterBtn = document.querySelector(".btn-outline");
  const registerModal = document.getElementById("registerModal");
  const loginModal = document.getElementById("loginModal");

  if (registerLink) {
    registerLink.addEventListener("click", (e) => {
      e.preventDefault();
      loginModal.style.display = "none";
      registerModal.style.display = "flex";
      document.body.classList.add("modal-open");
    });
  }

  if (mainRegisterBtn) {
    mainRegisterBtn.addEventListener("click", () => {
      if (loginModal) loginModal.style.display = "none";
      if (registerModal) registerModal.style.display = "flex";
      document.body.classList.add("modal-open");
    });
  }

  const loginLink = document.querySelector(".login-link");
  if (loginLink) {
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      registerModal.style.display = "none";
      loginModal.style.display = "flex";
      document.body.classList.add("modal-open");
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === loginModal) {
      loginModal.style.display = "none";
      document.body.classList.remove("modal-open");
    }
    if (e.target === registerModal) {
      registerModal.style.display = "none";
      document.body.classList.remove("modal-open");
    }
  });

  // -------- GOOGLE REGISTER --------
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