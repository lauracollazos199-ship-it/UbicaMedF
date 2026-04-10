document.addEventListener("DOMContentLoaded", () => {

  // FUNCIONES GENERALES

  function clearForms() {
    document.querySelectorAll("form").forEach(form => {
      form.reset();
    });

    document.querySelectorAll(".hint, .password-hint").forEach(el => {
      el.textContent = "";
    });
  }

  function openModal(modal) {
    if (!modal) return;

    document.querySelectorAll(".modal-overlay").forEach(m => {
      m.style.display = "none";
    });

    modal.style.display = "flex";
    document.body.classList.add("modal-open");
  }

  function closeModal(modal) {
    if (!modal) return;

    modal.style.display = "none";
    document.body.classList.remove("modal-open");

    clearForms();
  }

  function switchModal(closeM, openM) {
    document.querySelectorAll(".modal-overlay").forEach(modal => {
      modal.style.display = "none";
    });

    if (openM) {
      openM.style.display = "flex";
    }

    document.body.classList.add("modal-open");

    clearForms();
  }

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

  // TOGGLE PASSWORD 
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

  togglePasswordVisibility("loginPassword", "toggleLoginPassword");
  togglePasswordVisibility("registerPassword", "toggleRegisterPassword");
  togglePasswordVisibility("confirmPassword", "toggleConfirmPassword");

  // MODALES
  const loginModal = document.getElementById("loginModal");
  const registerModal = document.getElementById("registerModal");
  const resetModal = document.getElementById("resetModal");

  document.querySelectorAll(".login-link").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(loginModal);
    });
  });

  document.querySelectorAll(".register-link").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      switchModal(loginModal, registerModal);
    });
  });

  document.querySelectorAll(".forgot-password a").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchModal(loginModal, resetModal);
    });
  });

  const backToLogin = document.getElementById("backToLogin");
  if (backToLogin) {
    backToLogin.addEventListener("click", (e) => {
      e.preventDefault();
      switchModal(resetModal, loginModal);
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === loginModal) closeModal(loginModal);
    if (e.target === registerModal) closeModal(registerModal);
    if (e.target === resetModal) closeModal(resetModal);
  });

  document.querySelectorAll(".close-modal").forEach(btn => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-close");
      const modal = document.getElementById(modalId);
      closeModal(modal);
    });
  });

  // RESET PASSWORD
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

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.detail || "No se pudo enviar el correo");
        }

        Swal.fire({
          icon: 'success',
          title: 'Correo enviado',
          text: 'Revisa tu correo para recuperar la contraseña',
          confirmButtonColor: '#1E6FB9'
        });

        switchModal(resetModal, loginModal);

      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message,
          confirmButtonColor: '#1E6FB9'
        });
      }
    });
  }

  // LOGIN TRADICIONAL
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("loginPassword").value;

      fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      })
        .then(res => {
          if (!res.ok) throw new Error("Correo o contraseña incorrectos");
          return res.json();
        })
        .then(data => {
          localStorage.setItem("token", data.access_token);

          const usuario = {
            id: data.user_id || data.id,
            nombre: data.nombre,
            email: data.email,
            google: false
          };

          localStorage.setItem("usuario", JSON.stringify(usuario));
          window.location.href = "panel.html";
        })
        .catch(err => {
          Swal.fire({
            icon: 'error',
            title: 'Error de login',
            text: err.message,
            confirmButtonColor: '#1E6FB9'
          });
        });
    });
  }

  // GOOGLE
  function renderGoogleButtons() {
    if (!window.google || !google.accounts) return;

    const loginContainer = document.getElementById("google-btn");
    if (loginContainer && loginContainer.children.length === 0) {
      google.accounts.id.renderButton(loginContainer, {
        theme: "outline",
        size: "large",
        width: 300
      });
    }

    const registerContainer = document.getElementById("google-btn-register");
    if (registerContainer && registerContainer.children.length === 0) {
      google.accounts.id.renderButton(registerContainer, {
        theme: "outline",
        size: "large",
        width: 300
      });
    }
  }

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
        if (!res.ok) throw new Error("Error con Google");
        return res.json();
      })
      .then(data => {
        localStorage.setItem("token", data.access_token);

        const payload = parseJwt(data.access_token);

        const usuario = {
          id: data.user_id || data.id,
          nombre: formatName(data.nombre || payload.email.split("@")[0]),
          email: data.email || payload.email,
          google: true
        };

        localStorage.setItem("usuario", JSON.stringify(usuario));
        window.location.href = "panel.html";
      })
      .catch(err => {
        Swal.fire({
          icon: 'error',
          title: 'Error con Google',
          text: err.message,
          confirmButtonColor: '#1E6FB9'
        });
      });
  };

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

    renderGoogleButtons(); 
  });

});