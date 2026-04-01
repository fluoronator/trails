// ---------------------------
// Map Initialization
// ---------------------------
const map = L.map('map', {
  zoomControl: true
}).setView([34.6, -86.98], 14); // Default (Decatur-ish fallback)

// ---------------------------
// Tile Layers
// ---------------------------

// OpenStreetMap
const osmLayer = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '© OpenStreetMap contributors'
  }
);

// Topographic (BEST DEFAULT)
const topoLayer = L.tileLayer(
  'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 17,
    attribution: '© OpenTopoMap contributors'
  }
);

// Satellite (Esri)
const satelliteLayer = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/' +
  'World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    attribution: 'Tiles © Esri'
  }
);

// Add default layer
topoLayer.addTo(map);

// Layer control
const baseMaps = {
  "Topo": topoLayer,
  "Satellite": satelliteLayer,
  "Standard": osmLayer
};

L.control.layers(baseMaps).addTo(map);

// ---------------------------
// User Location + Auto Reset
// ---------------------------

let userLocation = null;
let defaultZoom = 15;
let resetTimer = null;
const RESET_DELAY = 5000;
let lastInteractionTime = Date.now();

// Get user location
navigator.geolocation.getCurrentPosition(
  (pos) => {
    userLocation = [
      pos.coords.latitude,
      pos.coords.longitude
    ];

    map.setView(userLocation, defaultZoom);
  },
  () => {
    console.warn("Geolocation not available.");
  }
);

// Distance check (meters)
function movedFarEnough(a, b) {
  if (!a || !b) return true;
  return map.distance(a, b) > 75;
}

// Schedule reset
function scheduleReset() {
  clearTimeout(resetTimer);

  resetTimer = setTimeout(() => {
    if (!userLocation) return;

    // Prevent reset if user recently interacted
    if (Date.now() - lastInteractionTime < RESET_DELAY) return;

    const currentCenter = map.getCenter();

    if (movedFarEnough(currentCenter, userLocation)) {
      map.flyTo(userLocation, defaultZoom, {
        duration: 1.5
      });
    }
  }, RESET_DELAY);
}

// ---------------------------
// Map Interaction Handling
// ---------------------------

// Track interaction time
map.on('click touchstart', () => {
  lastInteractionTime = Date.now();
});

// Cancel reset while moving
map.on('movestart zoomstart', () => {
  clearTimeout(resetTimer);
});

// Restart timer after movement
map.on('moveend zoomend', () => {
  lastInteractionTime = Date.now();
  scheduleReset();
});

// ---------------------------
// Placeholder for Trails
// ---------------------------
// When you’re ready, load your GeoJSON here:
//
// fetch('data/trails.geojson')
//   .then(res => res.json())
//   .then(data => {
//     L.geoJSON(data).addTo(map);
//   });