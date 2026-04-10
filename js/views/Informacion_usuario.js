document.addEventListener("DOMContentLoaded", () => {

  const modal = document.getElementById("updateUserContainer");
  const openBtn = document.getElementById("openUpdateUser");
  const closeBtn = document.getElementById("closeUpdateUser");
  const form = document.getElementById("updateUserForm");

  const nombreInput = document.getElementById("updateNombre");

  const oldPassword = document.getElementById("oldPassword");
  const newPassword = document.getElementById("newPassword");
  const confirmPassword = document.getElementById("confirmPassword");

  const passwordRules = document.getElementById("passwordRules");
  const passwordMatch = document.getElementById("passwordMatch");

  let usuario = JSON.parse(localStorage.getItem("usuario")) || {};

  const isGoogleUser = () => usuario.google === true;

  // =========================
  // ABRIR MODAL
  // =========================
  openBtn?.addEventListener("click", () => {
    usuario = JSON.parse(localStorage.getItem("usuario")) || {};

    modal.style.display = "flex";
    document.body.classList.add("modal-open");

    nombreInput.value = usuario.nombre || "";

    oldPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";

    passwordRules.innerHTML = "";
    passwordMatch.innerHTML = "";

    const showPass = !isGoogleUser();

    [oldPassword, newPassword, confirmPassword].forEach(input => {
      const group = input?.closest(".input-group");
      if (group) {
        group.classList.toggle("hidden", !showPass);
      }
    });

    passwordRules?.classList.toggle("hidden", !showPass);
    passwordMatch?.classList.toggle("hidden", !showPass);
  });

  // =========================
  // CERRAR MODAL
  // =========================
  closeBtn?.addEventListener("click", () => {
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
  });

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      document.body.classList.remove("modal-open");
    }
  });

  // =========================
  // REGLAS CONTRASEÑA
  // =========================
  newPassword?.addEventListener("input", () => {
    const v = newPassword.value;

    const checks = {
      length: v.length >= 8 && v.length <= 64,
      upper: /[A-Z]/.test(v),
      lower: /[a-z]/.test(v),
      number: /[0-9]/.test(v),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(v)
    };

    passwordRules.innerHTML = `
      <span style="color:${checks.length ? '#4CAF50' : '#999'}">Entre 8 y 64 caracteres</span>,
      <span style="color:${checks.upper ? '#4CAF50' : '#999'}">una mayúscula</span>,
      <span style="color:${checks.lower ? '#4CAF50' : '#999'}">una minúscula</span>,
      <span style="color:${checks.number ? '#4CAF50' : '#999'}">un número</span>,
      <span style="color:${checks.special ? '#4CAF50' : '#999'}">un carácter especial</span>
    `;
  });

  // =========================
  // COINCIDENCIA CONTRASEÑA
  // =========================
  confirmPassword?.addEventListener("input", () => {

    const match = confirmPassword.value === newPassword.value;

    passwordMatch.textContent =
      match
        ? "✔ Las contraseñas coinciden"
        : "✖ No coinciden";

    passwordMatch.style.color = match ? "#4CAF50" : "#999";
  });


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

  // =========================
  // UPDATE USER
  // =========================
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    usuario = JSON.parse(localStorage.getItem("usuario")) || {};

    const body = {};

    const nombre = nombreInput.value.trim();
    if (nombre) body.nombre = nombre;

    if (!isGoogleUser()) {
      const wantsChange =
        oldPassword.value || newPassword.value || confirmPassword.value;

      if (wantsChange) {
        if (newPassword.value !== confirmPassword.value) {
          return Swal.fire("Error", "Las contraseñas no coinciden", "error");
        }

        body.password = newPassword.value;
        body.old_password = oldPassword.value;
      }
    }

    try {
      const res = await fetch(`http://localhost:8000/users/${usuario.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify(body)
      });
      
      
      let data = {};
      try {
        data = await res.json();
      } catch {
        // Si no hay JSON, dejamos data vacío
        data = {};
      }

      if (!res.ok) {
        throw new Error(getErrorMessage(data));
      }

      Swal.fire("Éxito", "Usuario actualizado correctamente", "success");

      if (nombre) {
        usuario.nombre = nombre;
        document.getElementById("userName").textContent = nombre;
      }

      localStorage.setItem("usuario", JSON.stringify(usuario));

      modal.style.display = "none";
      document.body.classList.remove("modal-open");

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message
      });
    }
  });

  // =========================
  // OJITO 
  // =========================
  document.querySelectorAll(".toggle-password").forEach(icon => {
    icon.addEventListener("click", () => {

      const target = document.getElementById(icon.dataset.target);
      if (!target) return;

      target.type = target.type === "password" ? "text" : "password";

      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });
  });

});