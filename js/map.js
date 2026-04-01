// ---------------------------
// Map Initialization
// ---------------------------
const map = L.map('map', {
  zoomControl: true,
  maxZoom: 21,
  minZoom: 3
}).setView([34.6, -86.98], 14); // Default fallback

// ---------------------------
// Tile Layers
// ---------------------------

// OpenStreetMap (supports high zoom)
const osmLayer = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 21,
    attribution: '© OpenStreetMap contributors'
  }
);

// Topographic
const topoLayer = L.tileLayer(
  'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 17,
    maxNativeZoom: 17, // 👈 key fix
    attribution: '© OpenTopoMap contributors'
  }
);

// Satellite (Esri)
const satelliteLayer = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/' +
  'World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    maxZoom: 21,
    attribution: 'Tiles © Esri'
  }
);

// Default layer
topoLayer.addTo(map);

// Layer control
L.control.layers({
  "Topo": topoLayer,
  "Satellite": satelliteLayer,
  "Standard": osmLayer
}).addTo(map);

// ---------------------------
// IMPORTANT:
// This file ONLY handles the base map
// ---------------------------