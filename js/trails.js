window.trailCenter = null;

// Load parks list
fetch('data/parks.json')
.then(r => r.json())
.then(parks => {

    // For now just load the first park
    let park = parks[0];

    return fetch(park.file);

})
.then(r => r.json())
.then(data => {

    let trails = L.geoJSON(data, {
        style: {
            color: "#00ff88",
            weight: 4
        }
    }).addTo(map);

    let bounds = trails.getBounds();
    window.trailCenter = bounds.getCenter();

    map.fitBounds(bounds);

    document.getElementById("modeBox").innerHTML = "Browse Mode";

})
.catch(err => {
    document.getElementById("modeBox").innerHTML = "Error loading trails";
    console.log(err);
});
