// STEP 0: GET DATA

// Add console.log to see if code is working
console.log("QuakeData");

// Load in the geoJSON data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.properties.mag),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }
    function getColor(magnitude) {
        if (magnitude > 5) {
          return "#ea2c2c";
        }
        if (magnitude > 4) {
          return "#ea822c";
        }
        if (magnitude > 3) {
          return "#ee9c00";
        }
        if (magnitude > 2) {
          return "#eecc00";
        }
        if (magnitude > 1) {
          return "#d4ee00";
        }
        return "#98ee00";
      }

    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 4;
    };

    var quakeCircles = L.geoJSON(data, {
            // turn each feature into a marker using pointToLayer
            pointToLayer: function(feature, latlng) {
                console.log(data);
                return L.circleMarker(latlng)
            },
    // add our styling function
    style: styleInfo,

    // create popup for each marker with magnitude and location
    onEachFeature: function(feature, layer) {
        layer.bindPopup("<h4> Magnitude: " + feature.properties.mag + "</h4><hr><h6>Location: " + feature.properties.place + "</h6>");
        }
    })

    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(tect) {
        console.log(tect);

        function styleStyle(lines) {
            return {
            color: "#8F00FF",
            weight: 3.0
        };
        
        }
        var tecPlates = L.geoJSON(tect, {
            style: styleStyle
        });

        d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson").then(function(maj) {
            function majStyles(feature) {
            return {
                opacity: 1,
                fillOpacity: 1,
                fillColor: getColor(feature.properties.mag),
                color: "#000000",
                radius: getRadius(feature.properties.mag),
                stroke: true,
                weight: 0.5
            };
            }
            function getColor(magnitude) {
                if (magnitude > 6) {
                return "#ea2c2c";
                }
                if (magnitude > 5) {
                return "#ea822c";
                }
                if (magnitude < 5) {
                return "#ee9c00";
                }}

            function getRadius(magnitude) {
                if (magnitude === 0) {
                    return 1;
                }
                return magnitude * 4;
            };

            var majCircles = L.geoJSON(maj, {
                    // turn each feature into a marker using pointToLayer
                    pointToLayer: function(feature, latlng) {
                        console.log(maj);
                        return L.circleMarker(latlng)
                    },
            // add our styling function
            style: majStyles,

            // create popup for each marker with magnitude and location
            onEachFeature: function(feature, layer) {
                layer.bindPopup("<h4> Magnitude: " + feature.properties.mag + "</h4><hr><h6>Location: " + feature.properties.place + "</h6>");
                }
            })

    // STEP 1: CREATE THE BASE LAYERS
    // We create the tile layer that will be the background of our map.

    var streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        accessToken: API_KEY
    });

    var satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        accessToken: API_KEY
    });
    
    var pencil = L.tileLayer('https://api.mapbox.com/styles/v1/condorhanson/cl4u0boxx004814pr1rtyeu7p/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        accessToken: API_KEY
    });

    // STEP 2: OVERLAYS
    let earthquakes = new L.layerGroup();
    let tectPlates = new L.layerGroup();
    let majorQuakes = new L.layerGroup();

    quakeCircles.addTo(earthquakes);
    tecPlates.addTo(tectPlates);
    majCircles.addTo(majorQuakes);

    // STEP 3: DICTS FOR LAYERS
    var baseMaps = {
        "Streets": streets,
        "Satellite": satelliteStreets,
        "Pencil": pencil
    };

    let overlays = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": tectPlates,
        "Major Earthquakes": majorQuakes
    };

    // STEP 4: INITIALIZE MAP
    var map = L.map("map", {
        center: [39.5, -98.5],
        zoom: 3,
        layers: [streets]
    });

    // STEP 5: LAYER CONTROLS
    L.control.layers(baseMaps, overlays).addTo(map);
    tectPlates.addTo(map);
    earthquakes.addTo(map);
    majorQuakes.addTo(map);
    
    // Legend
    let legend = L.control({
        position: 'bottomright'
    });

    legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend');
    const magnitudes = [0,1,2,3,4,5];
    const colors = [
        "#98ee00",
        "#d4ee00",
        "#eecc00",
        "#ee9c00",
        "#ea822c",
        "#ea2c2c"
    ];

        // loop through our intervals and generate a label with a colored square for each interval
        for (var i = 0; i < magnitudes.length; i++) {
            console.log(colors[i]);
            div.innerHTML +=
                '<i style="background:' + colors[i] + '"></i> ' +
                magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
        }
        return div;
    };

    legend.addTo(map);

})})});