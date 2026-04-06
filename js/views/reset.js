document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("changePasswordForm");

  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const passwordHint = document.getElementById("passwordHint");
  const passwordMatch = document.getElementById("passwordMatch");

  newPasswordInput.addEventListener("input", () => {
    const value = newPasswordInput.value;

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

  confirmPasswordInput.addEventListener("input", () => {
    if (confirmPasswordInput.value === newPasswordInput.value) {
      passwordMatch.textContent = "✔ Las contraseñas coinciden";
      passwordMatch.style.color = "#4CAF50";
      passwordMatch.style.textAlign = "left";
    } else {
      passwordMatch.textContent = "✖ Las contraseñas no coinciden";
      passwordMatch.style.color = "#E53935";
      passwordMatch.style.textAlign = "left";
    }
  });

  function togglePasswordVisibility(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);

    toggle.addEventListener("click", () => {
      const icon = toggle.querySelector("i");
      if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  }

  togglePasswordVisibility("newPassword", "toggleNewPassword");
  togglePasswordVisibility("confirmPassword", "toggleConfirmPassword");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden',
        background: '#f9f9f9',
        color: '#333',
        confirmButtonColor: '#E53935', 
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-button'
        }
      });
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Token inválido',
        text: 'El enlace ha expirado o no es válido',
        background: '#f9f9f9',
        color: '#333',
        confirmButtonColor: '#E53935',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-button'
        }
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          password: newPassword
        })
      });

      if (!res.ok) {
        let errorMessage = "La contraseña no cumple con los requisitos";
        try {
          const error = await res.json();
          if (Array.isArray(error.detail) && error.detail.length > 0) {
            errorMessage = error.detail[0].msg;
          } else if (typeof error.detail === "string") {
            errorMessage = error.detail;
          }
        } catch {
          const errorText = await res.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      Swal.fire({
        icon: 'success',
        title: 'Cambio de contraseña existoso',
        text: 'Ahora puede iniciar sesión',
        background: '#f9f9f9',
        color: '#333',
        confirmButtonColor: '#4CAF50', 
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-button'
        }
      }).then(() => {
        window.location.href = "index.html";
      });

    } catch (err) {
      let errorMessage = err.message;

      const match = errorMessage.match(/Value error, ([^']+)/);
      if (match && match[1]) {
        errorMessage = match[1];
      }

      Swal.fire({
        icon: 'error',
        title: errorMessage.toLowerCase().includes("contraseña") ? "Contraseña inválida" : "Error",
        text: errorMessage,
        background: '#f9f9f9',
        color: '#333',
        confirmButtonColor: '#1E6FB9',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-button'
        }
      });
    }
  });
});
