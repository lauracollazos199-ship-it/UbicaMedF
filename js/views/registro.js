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

    msg = msg.replace(/^\d+:\s*/, "");
    msg = msg.replace("Value error, ", "");
    msg = msg.replace(/[\[\]']/g, "");
    msg = msg.replace(/El usuario con email .* ya existe/, "Este correo ya está registrado");

    return msg.trim();
  }

  // VALIDACIÓN EMAIL
  emailInput.addEventListener("input", () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(emailInput.value)) {
      emailHint.textContent = "Correo inválido";
      emailHint.style.color = "#999";
    } else {
      emailHint.textContent = "";
    }
  });

  // VALIDACIÓN PASSWORD
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
    <span style="color:${checks.length ? '#4CAF50' : '#999'}">Entre 8 y 64 caracteres</span>,
    <span style="color:${checks.uppercase ? '#4CAF50' : '#999'}">una mayúscula</span>,
    <span style="color:${checks.lowercase ? '#4CAF50' : '#999'}">una minúscula</span>,
    <span style="color:${checks.number ? '#4CAF50' : '#999'}">un número</span> y
    <span style="color:${checks.special ? '#4CAF50' : '#999'}">un carácter especial</span>.
  `;
  });

  // CONFIRMAR PASSWORD
  confirmInput.addEventListener("input", () => {
    if (confirmInput.value === passwordInput.value) {
      passwordMatch.textContent = "✔ Las contraseñas coinciden";
      passwordMatch.style.color = "#4CAF50";
    } else {
      passwordMatch.textContent = "✖ Las contraseñas no coinciden";
      passwordMatch.style.color = "#999";
    }
  });

  // MOSTRAR/OCULTAR PASSWORD
  function togglePasswordVisibility(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);

    if (!input || !toggle) return;

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

  // SUBMIT
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value;
      const email = emailInput.value;
      const password = passwordInput.value;
      const confirmPassword = confirmInput.value;

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
        .then(res => {
          if (!res.ok) throw new Error("Error en registro");
          return res.json();
        })
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Registro exitoso',
            text: 'Tu cuenta ha sido creada correctamente',
            confirmButtonColor: '#1E6FB9'
          }).then(() => {
            window.location.href = "index.html";
          });
        })
        .catch(err => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.message,
            confirmButtonColor: '#1E6FB9'
          });
        });
    });
  }

});