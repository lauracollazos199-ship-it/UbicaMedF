document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("changePasswordForm");

  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmNewPassword"); // ✅ CORREGIDO
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
    } else {
      passwordMatch.textContent = "✖ Las contraseñas no coinciden";
      passwordMatch.style.color = "#E53935";
    }
  });

  function togglePasswordVisibility(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);

    if (!input || !toggle) return; // ✅ PROTECCIÓN

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

  togglePasswordVisibility("newPassword", "toggleNewPassword");
  togglePasswordVisibility("confirmNewPassword", "toggleConfirmPassword"); // ✅ CORREGIDO

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmNewPassword").value; // ✅ CORREGIDO

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden',
        confirmButtonColor: '#E53935'
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
        confirmButtonColor: '#E53935'
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

      if (!res.ok) throw new Error("Error al cambiar la contraseña");

      Swal.fire({
        icon: 'success',
        title: 'Contraseña actualizada',
        text: 'Ahora puedes iniciar sesión',
        confirmButtonColor: '#4CAF50'
      }).then(() => {
        window.location.href = "index.html";
      });

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
        confirmButtonColor: '#1E6FB9'
      });
    }
  });
});