document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");

  const emailInput = document.getElementById("registerEmail");
  const emailHint = document.getElementById("emailHint");

  const passwordInput = document.getElementById("registerPassword");
  const confirmInput = document.getElementById("confirmPassword");
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

  

  // SUBMIT
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value;
      const email = emailInput.value;
      const password = passwordInput.value;
      const confirmPassword = confirmInput.value;

     if (password !== confirmPassword) {
    return Swal.fire("Error", "Las contraseñas no coinciden", "error");
  }

  try {
    const res = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nombre, email, password })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(getErrorMessage(data));
    }

    Swal.fire("Éxito", "Registro exitoso", "success").then(() => {
      window.location.href = "index.html";
    });

  } catch (err) {
    Swal.fire("Error", err.message, "error");
  }
});

  }})
     
