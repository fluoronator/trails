// gps.js — GPS tracking, mode detection, and return-to-location logic

// ── CONFIG ────────────────────────────────────────────────────────────────────

window.MODE_DISTANCE = 90000;
const RECENTER_DELAY_MS = 4000;

// ── STATE ─────────────────────────────────────────────────────────────────────

let userMarker       = null;
let userPulseMarker  = null;
let userLatLng       = null;
let hasCentered      = false;
let isHikingMode     = false;

let userMovedMap     = false;
let isUserInteracting = false;
let recenterTimer    = null;

// ── UI HELPERS ────────────────────────────────────────────────────────────────

function setMode(mode) {
    const modeBox  = document.getElementById("modeBox");
    const modeIcon = document.getElementById("modeIcon");
    const modeText = document.getElementById("modeText");

    isHikingMode = (mode === "hiking");
    window.isHikingMode = isHikingMode;

    if (isHikingMode) {
        modeBox.className  = "hiking";
        modeIcon.textContent = "🥾";
        modeText.textContent = "Hiking Mode";
    } else {
        modeBox.className  = "browse";
        modeIcon.textContent = "🗺";
        modeText.textContent = "Browse Mode";

        const wrapper = document.getElementById("map-rotate-wrapper");
        if (wrapper) wrapper.style.transform = 'scale(2) rotate(0deg)';
        window.mapRotationDeg = 0;
    }
}

function showRecenterBtn(show) {
    const btn = document.getElementById("recenterBtn");
    if (show) btn.classList.remove("hidden");
    else btn.classList.add("hidden");
}

// ── RECENTER ──────────────────────────────────────────────────────────────────

function recenterToUser() {
    if (!userLatLng) return;

    map.flyTo(userLatLng, Math.max(map.getZoom(), 15), {
        duration: 1.2
    });

    userMovedMap = false;
    showRecenterBtn(false);
}

// ── USER MARKER ───────────────────────────────────────────────────────────────

function updateUserMarker(latlng) {
    if (!userMarker) {
        const pulseIcon = L.divIcon({
            html: '<div class="user-location-pulse"></div>',
            className: '',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });

        userPulseMarker = L.marker(latlng, { icon: pulseIcon, zIndexOffset: 900 }).addTo(map);

        userMarker = L.circleMarker(latlng, {
            radius:      8,
            color:       '#ffffff',
            weight:      2.5,
            fillColor:   '#007AFF',
            fillOpacity: 1,
            zIndexOffset: 1000
        }).addTo(map);
    } else {
        userMarker.setLatLng(latlng);
        userPulseMarker.setLatLng(latlng);
    }
}

// ── INTERACTION HANDLING ──────────────────────────────────────────────────────

function startUserInteraction() {
    isUserInteracting = true;
    userMovedMap = true;

    if (isHikingMode) showRecenterBtn(true);

    clearTimeout(recenterTimer);
}

function stopUserInteractionSoon() {
    clearTimeout(recenterTimer);

    recenterTimer = setTimeout(() => {
        isUserInteracting = false;

        if (isHikingMode && userMovedMap) {
            recenterToUser();
        }
    }, RECENTER_DELAY_MS);
}

// Detect ALL interaction types
map.on('mousedown', startUserInteraction);
map.on('touchstart', startUserInteraction);
map.on('wheel', startUserInteraction);

map.on('dragstart', startUserInteraction);
map.on('zoomstart', startUserInteraction);

// When interaction stops
map.on('dragend', stopUserInteractionSoon);
map.on('zoomend', stopUserInteractionSoon);

// ── GEOLOCATION ───────────────────────────────────────────────────────────────

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            userLatLng = L.latLng(lat, lon);

            updateUserMarker(userLatLng);

            // ── MODE DETECTION ────────────────────────────────────────────────
            if (window.trailCenter) {
                const dist = userLatLng.distanceTo(window.trailCenter);
                const shouldHike = dist <= window.MODE_DISTANCE;
                const wasHiking = isHikingMode;

                setMode(shouldHike ? "hiking" : "browse");

                if (shouldHike && !wasHiking && !hasCentered) {
                    map.setView(userLatLng, 15);
                    hasCentered = true;
                }
            } else {
                document.getElementById("modeText").textContent = "Locating…";
            }

            // ── INITIAL CENTER ───────────────────────────────────────────────
            if (!hasCentered) {
                map.setView(userLatLng, 15);
                hasCentered = true;
            }

            // ── AUTO FOLLOW (FIXED) ──────────────────────────────────────────
            if (isHikingMode && !userMovedMap && !isUserInteracting) {
                map.panTo(userLatLng, {
                    animate: true,
                    duration: 0.5
                });
            }
        },
        (err) => {
            console.warn("GPS error:", err.message);
            if (!hasCentered) {
                document.getElementById("modeText").textContent = "GPS unavailable";
            }
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 15000
        }
    );
} else {
    document.getElementById("modeText").textContent = "GPS not supported";
}