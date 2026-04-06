document.addEventListener("DOMContentLoaded", () => {

  // FUNCIONES
  
  function formatName(name) {
  if (!name) return "Usuario";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

  
  // MODAL

  document.querySelectorAll('[data-login]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('loginModal').style.display = 'flex';

    });
  });

  document.getElementById('loginModal').addEventListener('click', (e) => {
    if (e.target.id === 'loginModal') {
      document.getElementById('loginModal').style.display = 'none';

    }
  });


// MODAL RESTAURAR CONTRASEÑA

document.querySelectorAll('.forgot-password a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('resetModal').style.display = 'flex';
    document.getElementById('loginModal').style.display = 'none';
  });
});

// Cerrar modal al hacer click fuera
document.getElementById('resetModal').addEventListener('click', (e) => {
  if (e.target.id === 'resetModal') {
    document.getElementById('resetModal').style.display = 'none';
  }
});

// Volver al login
document.getElementById('backToLogin').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('resetModal').style.display = 'none';
  document.getElementById('loginModal').style.display = 'flex';
});

// Envío del formulario
const resetForm = document.getElementById("resetForm");
if (resetForm) {
  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("resetEmail").value;

    try {
      const res = await fetch("http://localhost:8000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!res.ok) throw new Error("No se pudo enviar el correo de recuperación");

      alert("Se ha enviado un enlace de recuperación a tu correo.");
      document.getElementById('resetModal').style.display = 'none';
      document.getElementById('loginModal').style.display = 'flex';
    } catch (err) {
      alert(err.message);
    }
  });
}


  
  // LOGIN TRADICIONAL

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
          
          window.location.href = "panel.html";
        })
        .catch(err => alert(err.message));
    });
  }


 
  // LOGIN GOOGLE

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

        const payload = parseJwt(data.access_token);

         // 🔹 Guardar datos del usuario
         const usuario = {
          nombre: formatName(data.nombre || payload.email.split("@")[0]),
          email: data.email || payload.email
        };
        
        localStorage.setItem("usuario", JSON.stringify(usuario));
        
        window.location.href = "panel.html";
      })
      .catch(err => alert(err.message));
  };



  // ESPERAR GOOGLE Y CONFIGURAR

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

     renderGoogleButton();
  });


  
  // RENDER BOTÓN GOOGLE

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


