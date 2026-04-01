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

        // 🎨 Use CalTopo styling
        style: function(feature) {
            let p = feature.properties || {};

            return {
                color: p.stroke || "#00ff88",
                weight: Number(p["stroke-width"]) || 4,
                opacity: p["stroke-opacity"] || 1
            };
        },

        // 📍 Handle POIs / markers
        pointToLayer: function(feature, latlng) {
            let p = feature.properties || {};

            return L.circleMarker(latlng, {
                radius: 6,
                color: p["marker-color"] || "#ffffff",
                fillColor: p["marker-color"] || "#ffffff",
                fillOpacity: 1,
                weight: 1
            });
        },

        // 🏷 Optional: attach popup with title
        onEachFeature: function(feature, layer) {
            let p = feature.properties || {};

            if (p.title) {
                layer.bindPopup(p.title);
            }
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
