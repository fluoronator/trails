
let elevationBox = document.getElementById("elevationBox");

window.userMovedMap = false;

map.on("movestart", () => {
    window.userMovedMap = true;
});

// Blue dot
let userMarker = L.circleMarker([0,0], {
    radius: 8,
    color: '#fff',
    weight: 2,
    fillColor: '#007aff',
    fillOpacity: 1
}).addTo(map);

let accuracyCircle = L.circle([0,0], {
    radius: 0,
    color: '#007aff',
    fillColor: '#007aff',
    fillOpacity: 0.15,
    weight: 1
}).addTo(map);

// GPS tracking
navigator.geolocation.watchPosition(position => {

    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

    userMarker.setLatLng([lat, lon]);
    accuracyCircle.setLatLng([lat, lon]);
    accuracyCircle.setRadius(position.coords.accuracy);

    // Elevation
    if (position.coords.altitude !== null) {
        let feet = position.coords.altitude * 3.28084;
        elevationBox.innerHTML = "Elevation: " + feet.toFixed(0) + " ft";
    }

    // Auto-center logic
    if (window.trailCenter && !window.userMovedMap) {

        let distance = map.distance([lat, lon], window.trailCenter);

        if (distance < 3200) {
            map.setView([lat, lon], 17);
            document.getElementById("modeBox").innerHTML = "Hiking Mode";
        }
    }

}, () => {}, { enableHighAccuracy: true });
