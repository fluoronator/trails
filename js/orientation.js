// orientation.js

let tilePane = null;

// Wait until map is ready
setTimeout(() => {
    tilePane = map.getPane('tilePane');
}, 500);

function rotateMap(deg) {
    if (tilePane) {
        tilePane.style.transformOrigin = "50% 50%";
        tilePane.style.transform = "rotate(" + (-deg) + "deg)";
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
            rotateMap(0);
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