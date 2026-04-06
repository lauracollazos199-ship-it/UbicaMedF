document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("changePasswordForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      alert("Token inválido o expirado");
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
        const error = await res.json();
        throw new Error(error.detail || "Error al cambiar contraseña");
      }

      alert("Contraseña cambiada con éxito. Ahora puedes iniciar sesión.");
      window.location.href = "index.html";

    } catch (err) {
      alert(err.message);
    }
  });
});