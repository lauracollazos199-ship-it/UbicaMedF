document.addEventListener("DOMContentLoaded", () => {

  const buscarBtn = document.getElementById("buscarBtn");
  const epsSelect = document.getElementById("eps");
  const resultText = document.getElementById("result-text");
  const volverBusquedaBtn = document.getElementById("volverBusqueda");
  const mapContainer = document.getElementById("map-container");
  const hospitalInfo = document.getElementById("hospital-info");

  const userData = {
    nombre: "Usuario",
    email: "usuario@email.com"
  };

  document.getElementById("userName").textContent = userData.nombre;
  document.getElementById("userEmail").textContent = userData.email;

  let map;
  let markers = [];
  let cacheResultados = {};
  let userMarker; // 🔹 marcador único del usuario

  // 🔹 Inicializar mapa una sola vez (Bogotá por defecto)
  map = L.map('map').setView([4.6097, -74.0817], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  // 🔹 Ícono rojo para el usuario
  const userIcon = L.icon({
    iconUrl: 'images/icono_rojo.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  // 🔹 Crear marcador del usuario una sola vez
  userMarker = L.marker([4.6097, -74.0817], { icon: userIcon })
    .addTo(map)
    .bindPopup("Tu ubicación");

  function obtenerUbicacion() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }),
        () => reject("Debes permitir la ubicación para continuar")
      );
    });
  }

  function mostrarHospitalesEnMapa(hospitales) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    hospitales.forEach((h, index) => {
      const iconoHospital = L.icon({
        iconUrl: index === 0 
          ? 'images/icono_verde.png'   // hospital más cercano
          : 'images/icono_azul.png',   // otros hospitales
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
    try {
      const response = await fetch("http://localhost:8000/eps");
      const epsList = await response.json();

      epsList.forEach(eps => {
        const option = document.createElement("option");
        option.value = eps.nombre;
        option.textContent = eps.nombre;
        epsSelect.appendChild(option);
      });

    } catch (error) {
      console.error("Error cargando EPS:", error);
      resultText.textContent = "No se pudieron cargar las EPS";
    }
  }

  cargarEPS();

  // ============================
  // BUSCAR
  // ============================
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
        const url = `http://localhost:8000/hospitales?eps=${encodeURIComponent(eps)}&lat=${ubicacion.lat}&lng=${ubicacion.lng}`;
        const response = await fetch(url);
        data = await response.json();
        cacheResultados[key] = data;
      }

      let hospitales = Array.isArray(data) ? data : (data.hospitales || []);

      if (!hospitales.length) {
        hospitalInfo.innerHTML = "No se encontraron hospitales";
        return;
      }

      // 🔹 Mostrar mapa SOLO cuando ya hay hospitales
      mapContainer.style.display = "block";

      // 🔹 Mover marcador del usuario en vez de duplicarlo
      userMarker.setLatLng([ubicacion.lat, ubicacion.lng]).openPopup();

      map.setView([ubicacion.lat, ubicacion.lng], 13);
      setTimeout(() => map.invalidateSize(), 200);

      mostrarHospitalesEnMapa(hospitales);

      const masCercano = hospitales[0];
      hospitalInfo.innerHTML = `
        <div class="hospital-card">
          <h2>Hospital más cercano</h2>
          <p class="hospital-name">${masCercano.nombre}</p>
          <p class="hospital-distance">Distancia: ${masCercano.distancia_km ?? "N/A"} km</p>
        </div>
      `;

      document.getElementById("searchCard").style.display = "none";
      volverBusquedaBtn.style.display = "block";

    } catch (error) {
      console.error("ERROR GENERAL:", error);
      hospitalInfo.innerHTML = "Error: " + error;
    }
  });

  // ============================
  // VOLVER
  // ============================
  volverBusquedaBtn.addEventListener("click", () => {
    document.getElementById("searchCard").style.display = "block";
    mapContainer.style.display = "none";
    hospitalInfo.innerHTML = "";
    volverBusquedaBtn.style.display = "none";

    markers.forEach(m => map.removeLayer(m));
    markers = [];
  });

});




