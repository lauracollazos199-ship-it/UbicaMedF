document.addEventListener("DOMContentLoaded", () => {
  const buscarBtn = document.getElementById("buscarBtn");
  const epsSelect = document.getElementById("eps");
  const resultText = document.getElementById("result-text");

  // Datos de usuario (ejemplo dinámico)
  const userData = {
    nombre: "Usuario",
    email: "usuario@email.com"
  };

  document.getElementById("userName").textContent = userData.nombre;
  document.getElementById("userEmail").textContent = userData.email;

  // Acción del botón Buscar
  buscarBtn.addEventListener("click", () => {
    const eps = epsSelect.value;
    resultText.innerHTML = `Mostrando resultados para <strong>${eps}</strong> cerca de <span class="highlight">Bogotá</span>`;
  });
});