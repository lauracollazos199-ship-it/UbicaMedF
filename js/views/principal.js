document.addEventListener("DOMContentLoaded", () => {

  const buscarBtn = document.getElementById("buscarBtn");
  const epsSelect = document.getElementById("eps");
  const resultText = document.getElementById("result-text");
  const volverBusquedaBtn = document.getElementById("volverBusqueda");
  const mapContainer = document.getElementById("map-container");
  const hospitalInfo = document.getElementById("hospital-info");

  // HAMBURGUESA PANEL LATERAL

  const hamburgerBtn = document.querySelector(".hamburger");
  const userPanel = document.getElementById("userPanel");
  const overlayMenu = document.getElementById("overlayMenu");

  if (hamburgerBtn && userPanel) {
    hamburgerBtn.addEventListener("click", () => {
      userPanel.classList.toggle("open");

      if (overlayMenu) {
        overlayMenu.classList.toggle("active");
      }
    });

    if (overlayMenu) {
      overlayMenu.addEventListener("click", () => {
        userPanel.classList.remove("open");
        overlayMenu.classList.remove("active");
      });
    }
  }

  // USUARIO

  let userData;
  try {
    userData = JSON.parse(localStorage.getItem("usuario"));
  } catch {
    userData = null;
  }

  if (userData) {
    const userName = document.getElementById("userName");
    const userEmail = document.getElementById("userEmail");

    if (userName) userName.textContent = userData.nombre || "Usuario";
    if (userEmail) userEmail.textContent = userData.email || "usuario@email.com";
  } else {
    window.location.href = "index.html";
  }

  // MAPA

  let map;
  let userMarker;
  let markers = [];
  let cacheResultados = {};

  if (document.getElementById("map")) {

    map = L.map('map').setView([4.6097, -74.0817], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const userIcon = L.icon({
      iconUrl: 'images/icono_rojo.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    userMarker = L.marker([4.6097, -74.0817], { icon: userIcon })
      .addTo(map)
      .bindPopup("Tu ubicación");
  }

  // FUNCIONES

  function obtenerUbicacion() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          Swal.fire({
            icon: 'error',
            title: 'Ubicación requerida',
            text: 'Debes permitir la ubicación para continuar',
            confirmButtonColor: '#1E6FB9'
          });
          reject("Debes permitir la ubicación para continuar");
        }
      );
    });
  }

  function mostrarHospitalesEnMapa(hospitales) {
    if (!map) return;

    markers.forEach(m => map.removeLayer(m));
    markers = [];

    hospitales.forEach((h, index) => {
      const iconoHospital = L.icon({
        iconUrl: index === 0 ? 'images/icono_verde.png' : 'images/icono_azul.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([h.latitud, h.longitud], { icon: iconoHospital })
        .addTo(map)
        .bindPopup(`
          <b>${h.nombre}</b><br>
          ${h.direccion}<br>
          Distancia: ${h.distancia_km ?? "N/A"} km
        `);

      markers.push(marker);
    });
  }

  async function cargarEPS() {
    if (!epsSelect) return;

    try {
      const response = await fetch(`${BASE_URL}/eps`);
      const epsList = await response.json();

      epsList.forEach(eps => {
        const option = document.createElement("option");
        option.value = eps.nombre;
        option.textContent = eps.nombre;
        epsSelect.appendChild(option);
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las EPS',
        confirmButtonColor: '#1E6FB9'
      });
    }
  }

  cargarEPS();

  // BUSCAR HOSPITALES

  if (buscarBtn) {
    buscarBtn.addEventListener("click", async () => {
      try {
        const eps = epsSelect.value;
        resultText.innerHTML = '<div class="loader"></div><p>Obteniendo ubicación...</p>';

        const ubicacion = await obtenerUbicacion();
        resultText.innerHTML = '<div class="loader"></div><p>Buscando hospitales cercanos...</p>';

        const key = `${eps}-${ubicacion.lat}-${ubicacion.lng}`;
        let data;

        if (cacheResultados[key]) {
          data = cacheResultados[key];
        } else {
          const url = `${BASE_URL}/hospitales?eps=${encodeURIComponent(eps)}&lat=${ubicacion.lat}&lng=${ubicacion.lng}`;
          const response = await fetch(url);
          data = await response.json();
          cacheResultados[key] = data;
        }

        let hospitales = Array.isArray(data) ? data : (data.hospitales || []);

        if (!hospitales.length) {
          hospitalInfo.innerHTML = "No se encontraron hospitales";
          return;
        }

        mapContainer.style.display = "block";

        if (userMarker) {
          userMarker.setLatLng([ubicacion.lat, ubicacion.lng]).openPopup();
          map.setView([ubicacion.lat, ubicacion.lng], 13);
          setTimeout(() => map.invalidateSize(), 200);
        }

        mostrarHospitalesEnMapa(hospitales);

        let html = "";

        const masCercano = hospitales[0];

        html += `
          <div class="hospital-card destacado">
            <h2>Hospital más cercano</h2>
            <p class="hospital-name">${masCercano.nombre ?? "Sin nombre"}</p>
            <p class="direccion">${masCercano.direccion ?? "Sin dirección"}</p>
            <p class="hospital-distance">
              Distancia: ${masCercano.distancia_km ?? "N/A"} km
            </p>
          </div>
        `;

        html += `<h3 style="margin-top:15px;">Hospitales disponibles para esta EPS</h3>`;

        hospitales.slice(1).forEach((h, index) => {
          html += `
            <div class="hospital-card">
              <span class="numero">${index + 2}</span>
              <p class="hospital-name">${h.nombre ?? "Sin nombre"}</p>
              <p class="direccion">${h.direccion ?? "Sin dirección"}</p>
              <p class="hospital-distance">
                Distancia: ${h.distancia_km ?? "N/A"} km
              </p>
            </div>
          `;
        });

        hospitalInfo.innerHTML = html;

        const subtitle = document.getElementById("subtitleText");

        if (subtitle) {
          subtitle.innerHTML = `
            <p>
              El mapa indica la ubicación actual (rojo), el hospital más cercano (verde) y los demás disponibles (azul).
              Al seleccionar un marcador, se muestra información básica del hospital.
            </p>

          `;
        }

        resultText.innerHTML = "";

        document.getElementById("searchCard").style.display = "none";
        volverBusquedaBtn.style.display = "block";

      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error en la búsqueda',
          text: error,
          confirmButtonColor: '#1E6FB9'
        });
      }
    });
  }

  // VOLVER

  if (volverBusquedaBtn) {
    volverBusquedaBtn.addEventListener("click", () => {
      document.getElementById("searchCard").style.display = "block";
      mapContainer.style.display = "none";
      hospitalInfo.innerHTML = "";
      volverBusquedaBtn.style.display = "none";

      markers.forEach(m => map.removeLayer(m));
      markers = [];

      const subtitle = document.getElementById("subtitleText");

      if (subtitle) {
        subtitle.innerHTML = `
          Consulta los hospitales más cercanos según tu EPS y tu ubicación actual.
        `;
      }
    });
  }

  // LOGOUT

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");

      if (window.google && google.accounts) {
        google.accounts.id.cancel();
      }

      window.location.href = "index.html";
    });
  }

});