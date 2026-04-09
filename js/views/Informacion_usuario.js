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

  // =========================
  // 🔥 detectar usuario Google
  // =========================
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const isGoogleUser = usuario?.google === true;

  // =========================
  // 🔓 ABRIR MODAL
  // =========================
  if (openBtn && modal) {
    openBtn.addEventListener("click", () => {

      modal.style.display = "flex";
      document.body.classList.add("modal-open");

      if (usuario) {
        nombreInput.value = usuario.nombre || "";
      }

      // limpiar campos contraseña
      oldPassword.value = "";
      newPassword.value = "";
      confirmPassword.value = "";
      passwordRules.textContent = "";
      passwordMatch.textContent = "";

      // =========================
      // 🔥 GOOGLE USER FIX (CORRECTO)
      // =========================
      const passwordSection = document.getElementById("passwordSection");

      if (isGoogleUser && passwordSection) {
        passwordSection.style.display = "none";   // 👈 ocultas TODO el bloque
      } else if (passwordSection) {
        passwordSection.style.display = "block";  // 👈 restauras si no es google
      }
    });
  }

  // =========================
  // 🔒 CERRAR MODAL
  // =========================
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
      document.body.classList.remove("modal-open");
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
        document.body.classList.remove("modal-open");
      }
    });
  }

  // =========================
  // 🔐 REGLAS DE CONTRASEÑA
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
      <span style="color:${checks.length ? 'green' : 'red'}">8-64 caracteres</span>,
      <span style="color:${checks.upper ? 'green' : 'red'}">Mayúscula</span>,
      <span style="color:${checks.lower ? 'green' : 'red'}">Minúscula</span>,
      <span style="color:${checks.number ? 'green' : 'red'}">Número</span>,
      <span style="color:${checks.special ? 'green' : 'red'}">Especial</span>
    `;
  });

  // =========================
  // 🔁 VALIDAR COINCIDENCIA
  // =========================
  confirmPassword?.addEventListener("input", () => {

    if (confirmPassword.value === newPassword.value) {
      passwordMatch.textContent = "✔ Las contraseñas coinciden";
      passwordMatch.style.color = "green";
    } else {
      passwordMatch.textContent = "✖ No coinciden";
      passwordMatch.style.color = "red";
    }
  });

  // =========================
  // 📤 ENVIAR UPDATE
  // =========================
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = nombreInput.value.trim();
      const body = {};

      if (nombre) body.nombre = nombre;

      // =========================
      // 🔥 SOLO USUARIOS NORMALES
      // =========================
      if (!isGoogleUser) {

        const wantsPasswordChange =
          oldPassword.value || newPassword.value || confirmPassword.value;

        if (wantsPasswordChange) {

          // ❗ VALIDACIÓN FRONTEND
          if (newPassword.value !== confirmPassword.value) {
            return Swal.fire("Error", "Las contraseñas no coinciden", "error");
          }

          if (!oldPassword.value) {
            return Swal.fire("Error", "Debes ingresar la contraseña actual", "error");
          }

          if (!newPassword.value) {
            return Swal.fire("Error", "Debes ingresar la nueva contraseña", "error");
          }

          body.password = newPassword.value;
          body.oldPassword = oldPassword.value;
        }
      }

      try {

        const res = await fetch(`http://localhost:8003/users/${usuario.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
          },
          body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Error al actualizar");
        }

        Swal.fire("OK", "Usuario actualizado", "success");

        // =========================
        // UI UPDATE
        // =========================
        if (nombre) {
          document.getElementById("userName").textContent = nombre;
          usuario.nombre = nombre;
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
  }

});