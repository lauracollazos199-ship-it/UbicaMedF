document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("changePasswordForm");

  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmNewPassword"); // 
  const passwordHint = document.getElementById("passwordHint");
  const passwordMatch = document.getElementById("passwordMatch");

// =========================
// ERRORES
// =========================
function getErrorMessage(data) {
  if (!data) return "Error desconocido";

  let detail = data.detail || data.message || data;

  // Función auxiliar para limpiar cualquier string
  const clean = (msg) => {
    let s = String(msg).trim();

    // Elimina prefijos 
    s = s.replace(/^400:\s*/i, "");
    s = s.replace(/Value error,\s*/gi, ""); 
    s = s.replace(/^\[+/, "").replace(/\]+$/, ""); 
    s = s.replace(/^'+|'+$/g, "");

    return s.trim();
  };

  // Caso string directo
  if (typeof detail === "string") {
    return clean(detail);
  }

  // Caso lista tipo FastAPI / Pydantic
  if (Array.isArray(detail)) {
    return detail
      .map(err => {
        if (typeof err === "string") return clean(err);
        if (err.msg) return clean(err.msg);
        if (err.message) return clean(err.message);
        return clean(JSON.stringify(err));
      })
      .join("\n");
  }

  // Caso objeto
  if (typeof detail === "object") {
    return Object.values(detail)
      .flat()
      .map(e => clean(e))
      .join("\n");
  }

  // Fallback
  return clean(detail);
}


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
      <span style="color:${checks.length ? '#4CAF50' : '#4b5563'}">Entre 8 y 64 caracteres</span>,
      <span style="color:${checks.uppercase ? '#4CAF50' : '#4b5563'}">una mayúscula</span>,
      <span style="color:${checks.lowercase ? '#4CAF50' : '#4b5563'}">una minúscula</span>,
      <span style="color:${checks.number ? '#4CAF50' : '#4b5563'}">un número</span> y
      <span style="color:${checks.special ? '#4CAF50' : '#4b5563'}">un carácter especial</span>.
    `;
  });

  confirmPasswordInput.addEventListener("input", () => {
    if (confirmPasswordInput.value === newPasswordInput.value) {
      passwordMatch.textContent = "✔ Las contraseñas coinciden";
      passwordMatch.style.color = "#4CAF50";
    } else {
      passwordMatch.textContent = "✖ Las contraseñas no coinciden";
      passwordMatch.style.color = "#4b5563";
    }
  });

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

  togglePasswordVisibility("newPassword", "toggleNewPassword");
  togglePasswordVisibility("confirmNewPassword", "toggleConfirmPassword"); // 

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmNewPassword").value; // 

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden',
        confirmButtonColor: '#4b5563'
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
        confirmButtonColor: '#4b5563'
      });
      return;
    }

    try {
  const res = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: token,
      password: newPassword
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(getErrorMessage(data));

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
}})})