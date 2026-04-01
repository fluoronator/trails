// map.js

// --- Base Layers ---
const standardLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
    }
);

const topoLayer = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 17,
        attribution: "&copy; OpenTopoMap contributors"
    }
);

const satelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        maxZoom: 19,
        attribution: "Tiles &copy; Esri"
    }
);

// --- Map Init ---
const map = L.map("map", {
    center: [34.7, -86.9],
    zoom: 13,
    layers: [standardLayer],
    zoomControl: false
});

// Move zoom control to bottom right
L.control.zoom({ position: "bottomright" }).addTo(map);

// --- Base Layer Switching ---
let currentBaseLayer = standardLayer;

function setBaseLayer(newLayer) {
    if (currentBaseLayer) {
        map.removeLayer(currentBaseLayer);
    }
    map.addLayer(newLayer);
    currentBaseLayer = newLayer;
}

// --- Hook up radio buttons ---
document.addEventListener("DOMContentLoaded", () => {
    const radios = document.querySelectorAll('input[name="basemap"]');

    radios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            const value = e.target.value;

            if (value === "standard") {
                setBaseLayer(standardLayer);
            } else if (value === "topo") {
                setBaseLayer(topoLayer);
            } else if (value === "satellite") {
                setBaseLayer(satelliteLayer);
            }
        });
    });
});