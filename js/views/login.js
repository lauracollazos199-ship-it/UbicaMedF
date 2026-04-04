document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // MODAL
  // =========================

  document.querySelectorAll('[data-login]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('loginModal').style.display = 'flex';

      // Render con pequeño delay (asegura que el DOM y Google estén listos)
      setTimeout(() => {
        renderGoogleButton();
      }, 200);
    });
  });

  document.getElementById('loginModal').addEventListener('click', (e) => {
    if (e.target.id === 'loginModal') {
      document.getElementById('loginModal').style.display = 'none';

    }
  });


  // =========================
  // LOGIN TRADICIONAL
  // =========================

  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      })
        .then(res => {
          if (!res.ok) throw new Error("Credenciales incorrectas");
          return res.json();
        })
        .then(data => {
          localStorage.setItem("token", data.access_token);

          const usuario = {
            nombre: data.nombre,
            email: data.email
          };
          
          localStorage.setItem("usuario", JSON.stringify(usuario));
          
          window.location.href = "/panel.html";
        })
        .catch(err => alert(err.message));
    });
  }


  // =========================
  // LOGIN GOOGLE
  // =========================

  window.handleCredentialResponse = function (response) {
    const token = response.credential;

    fetch("http://localhost:8000/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token })
    })
      .then(res => {
        if (!res.ok) throw new Error("Error en login con Google");
        return res.json();
      })
      .then(data => {
        localStorage.setItem("token", data.access_token);

         // 🔹 Guardar datos del usuario
         const usuario = {
          nombre: data.nombre,
          email: data.email
        };
        
        localStorage.setItem("usuario", JSON.stringify(usuario));
        
        window.location.href = "/panel.html";
      })
      .catch(err => alert(err.message));
  };


  // =========================
  // ESPERAR GOOGLE Y CONFIGURAR
  // =========================

  function waitForGoogle(callback) {
    const interval = setInterval(() => {
      if (window.google && google.accounts) {
        clearInterval(interval);
        callback();
      }
    }, 100);
  }

  waitForGoogle(() => {
    google.accounts.id.initialize({
      client_id: "575523896419-jl0b1qdq8fblhkka7icqr39er72nmpo7.apps.googleusercontent.com",
      callback: handleCredentialResponse
    });
  });


  // =========================
  // RENDER BOTÓN GOOGLE
  // =========================

  function renderGoogleButton() {
    if (!window.google || !google.accounts) return;

    const container = document.getElementById("google-btn");
    if (!container) return;

    if (container.children.length > 0) return;

    google.accounts.id.renderButton(container, {
      theme: "outline",
      size: "large",
      width: 300
    });
  }

});