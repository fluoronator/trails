// orientation.js — handles device heading and map rotation

// ── STATE ─────────────────────────────────────────────────────────────────────

let currentHeading = null;
let smoothedHeading = null;
let lastAppliedRotation = null;

// ➕ NEW: compass-specific smoothing state
let compassHeading = null;

// Smoothing factor (lower = smoother, slower)
const HEADING_SMOOTHING = 0.15;

// ➕ NEW: separate smoothing for compass (slightly faster feels better)
const COMPASS_SMOOTHING = 0.25;

// Minimum change required before updating DOM (degrees)
const ROTATION_THRESHOLD = 0.5;

// ── HELPERS ───────────────────────────────────────────────────────────────────

function normalizeAngle(angle) {
    return (angle + 360) % 360;
}

// Smooth angle interpolation (handles wraparound at 360°)
function smoothAngle(current, target, factor) {
    if (current === null) return target;

    let delta = target - current;

    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    return current + delta * factor;
}

function applyRotation(deg) {
    const wrapper = document.getElementById("map-rotate-wrapper");
    if (!wrapper) return;

    wrapper.style.transform = `scale(2) rotate(${-deg}deg)`;
    window.mapRotationDeg = deg;
}

// ➕ NEW: compass update (completely independent of map)
function updateCompass(realHeading) {
    const needle = document.getElementById("compass-needle");
    if (!needle) return;

    compassHeading = smoothAngle(compassHeading, realHeading, COMPASS_SMOOTHING);
    compassHeading = normalizeAngle(compassHeading);

    needle.style.transform =
        `translate(-50%, -100%) rotate(${compassHeading}deg)`;
}

// ── MAIN ORIENTATION HANDLER ──────────────────────────────────────────────────

function handleOrientation(event) {
    let heading = null;

    // iOS (webkitCompassHeading)
    if (event.webkitCompassHeading !== undefined) {
        heading = event.webkitCompassHeading;
    }
    // Android (alpha)
    else if (event.alpha !== null) {
        heading = 360 - event.alpha;
    }

    if (heading === null) return;

    heading = normalizeAngle(heading);
    currentHeading = heading;

    // ➕ ALWAYS update compass (independent of everything)
    updateCompass(currentHeading);

    // ── CONDITIONS TO ALLOW ROTATION ──────────────────────────────────────────

    if (!window.isHikingMode) return;

    // 🚫 Do NOT rotate if user is interacting or has manually moved map
    if (window.isUserInteracting || window.userMovedMap) return;

    // ── SMOOTHING ────────────────────────────────────────────────────────────

    smoothedHeading = smoothAngle(smoothedHeading, currentHeading, HEADING_SMOOTHING);
    smoothedHeading = normalizeAngle(smoothedHeading);

    // ── AVOID MICRO-UPDATES ───────────────────────────────────────────────────

    if (
        lastAppliedRotation !== null &&
        Math.abs(smoothedHeading - lastAppliedRotation) < ROTATION_THRESHOLD
    ) {
        return;
    }

    lastAppliedRotation = smoothedHeading;

    // ── APPLY ROTATION ────────────────────────────────────────────────────────

    applyRotation(smoothedHeading);
}

// ── PERMISSION (iOS) ──────────────────────────────────────────────────────────

function enableOrientation() {
    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {

        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === "granted") {
                    window.addEventListener("deviceorientation", handleOrientation, true);
                } else {
                    console.warn("Orientation permission denied");
                }
            })
            .catch(console.error);

    } else {
        window.addEventListener("deviceorientation", handleOrientation, true);
    }
}

// ── START ─────────────────────────────────────────────────────────────────────

enableOrientation();