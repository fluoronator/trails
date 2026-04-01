// orientation.js

let tilePane = null;
let overlayPane = null;

function getPanes() {
    if (map) {
        if (!tilePane) tilePane = map.getPane('tilePane');
        if (!overlayPane) overlayPane = map.getPane('overlayPane');
    }
}

// Rotate both map + overlays
function rotateMap(deg) {
    getPanes();

    if (tilePane && overlayPane) {

        const rotation = "rotate(" + (-deg) + "deg)";

        tilePane.style.transformOrigin = "50% 50%";
        overlayPane.style.transformOrigin = "50% 50%";

        tilePane.style.transform = rotation;
        overlayPane.style.transform = rotation;
    }
}

// Check mode
function isHikingMode() {
    let modeBox = document.getElementById("modeBox");
    return modeBox && modeBox.innerText.includes("Hiking");
}

function handleOrientation(event) {

    let heading;

    if (event.webkitCompassHeading !== undefined) {
        heading = event.webkitCompassHeading;
    }
    else if (event.alpha !== null) {
        heading = 360 - event.alpha;
    }

    if (heading !== undefined) {

        if (isHikingMode()) {
            rotateMap(heading);
        } else {
            rotateMap(0); // reset
        }
    }
}

// iPhone permission
if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    document.body.addEventListener("click", function() {
        DeviceOrientationEvent.requestPermission()
        .then(function(permissionState) {
            if (permissionState === 'granted') {
                window.addEventListener("deviceorientation", handleOrientation);
            }
        });
    }, { once: true });
} else {
    window.addEventListener("deviceorientation", handleOrientation);
}