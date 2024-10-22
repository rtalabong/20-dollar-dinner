// map.js
mapboxgl.accessToken = 'pk.eyJ1IjoicmFtYm90YWxhYm9uZyIsImEiOiJjbTJpem03ZnMwMDdkMnJweGVpbjZseXk2In0.R54bZmkxazLgdkUEZ92JMw';

// Starting the map
const map = new mapboxgl.Map({
    container: 'map',
    zoom: 12,
    center: [-73.946048,40.719560],
    style: 'mapbox://styles/mapbox/light-v11',
    antialias: true,
    projection: 'mercator'
});

map.on('load', () => {
    map.setFog({});
    map.addSource('20DollarDinner', {
        type: 'geojson',
        data: '20DollarDinner.geojson'
    });
    //Circles on the map
    map.addLayer({
        id: '20DollarDinner-fill',
        type: 'circle',
        source: '20DollarDinner',
        paint: {
            'circle-color': '#A8271E',
            'circle-radius': 5,
            'circle-stroke-color': '#424242',
            'circle-stroke-width': 1.3,
        }
    });
    //Click mechanism
    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('click', '20DollarDinner-fill', (e) => {
        const properties = e.features[0].properties;
        const establishment = properties['Establishment'];
        const address = properties['Address'];
        const googleMapsLink = properties['Google maps'];
        const hellgateLink = properties['Read on Hellgate'];
        const cuisine = properties['Cuisine'] ? `Cuisine: ${properties['Cuisine']}` : '';
        const specialty = properties['Specialty'] ? `Specialty: ${properties['Specialty']}` : '';

        const details = [cuisine, specialty].filter(Boolean).join('<br>');
        //Formatting the tooltip
        const description = `
            <strong style="font-size: 15px;">${establishment}</strong><br>
            <em>${details}</em><br>
            <a href="${googleMapsLink}" target="_blank">${address}</a><br>
            <a href="${hellgateLink}" target="_blank">Read about this on Hellgate!</a>
        `;

        popup.setLngLat(e.lngLat)
             .setHTML(description)
             .addTo(map);
    });

    map.on('click', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['20DollarDinner-fill']
        });

        if (!features.length) {
            popup.remove();
        }
    });
    // Changing the mouse from pointer to clicker and vice versa
    map.on('mouseenter', '20DollarDinner-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', '20DollarDinner-fill', () => {
        map.getCanvas().style.cursor = '';
    });

    // Disable scroll zoom by default
    map.scrollZoom.disable();

    // Instructions for scrolling and zooming and placing it on the map
    const instructions = document.createElement('div');
    instructions.style.position = 'absolute';
    instructions.style.top = '50%';
    instructions.style.left = '50%';
    instructions.style.transform = 'translate(-50%, -50%)';
    instructions.style.padding = '10px 20px';
    instructions.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    instructions.style.color = 'white';
    instructions.style.fontSize = '16px';
    instructions.style.borderRadius = '5px';
    instructions.style.zIndex = '1';
    instructions.style.display = 'none';
    instructions.innerText = 'Use ⌘ + scroll to zoom the map';

    map.getContainer().appendChild(instructions);

    let lastShown = 0; // Setting up cooldown time

    // Show instructions without pressing the command button
    map.getContainer().addEventListener('wheel', (event) => {
        const now = Date.now();
        if (!event.metaKey && !event.ctrlKey && (now - lastShown > 6500)) {
            instructions.style.display = 'block';
            lastShown = now;

            setTimeout(() => {
                instructions.style.display = 'none';
            }, 2000);
        }
    });

    // Enabling scroll zoom only when Command (Mac) or Control (PC) is pressed
    function setScrollZoomBasedOnKey(event) {
        if (event.metaKey || event.ctrlKey) {
            map.scrollZoom.enable();
        } else {
            map.scrollZoom.disable();
        }
    }

    // Event listeners for keydown and keyup
    document.addEventListener('keydown', setScrollZoomBasedOnKey);
    document.addEventListener('keyup', setScrollZoomBasedOnKey);
});
