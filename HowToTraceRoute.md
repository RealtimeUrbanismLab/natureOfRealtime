# Traceroute to Physical Path Network Map with Leaflet.js

This guide explains how to trace your network route to a specific service (like Zoom), visualize it in a map using Leaflet.js, and enhance it to represent the physical path using real-world network infrastructure data (e.g., submarine cables, fiber optics, and IXPs).

## Prerequisites

- **Windows OS**
- **Git Bash** or Command Prompt
- **Basic HTML/JavaScript knowledge**
- **A text editor** (e.g., VS Code, Notepad++, Sublime Text)

## Steps Overview
1. Run a traceroute to a target service (e.g., `zoom.us`).
2. Extract and geolocate the IP addresses.
3. Build a Leaflet.js map to visualize the path.
4. Enhance the map to reflect real-world network infrastructure.

---

## Step-by-Step Guide

### 1. **Run Traceroute to Gather Network Data**
On **Windows**, open Git Bash or Command Prompt and run the `tracert` command to trace the route to a target service, such as Zoom:
```bash
tracert zoom.us
```

This will provide a list of IP addresses and the time (latency) it took to reach each hop.

**Example Traceroute Output**:
```
Tracing route to zoom.us [170.114.52.2]
over a maximum of 30 hops:

  1     1 ms     1 ms     1 ms  192.168.0.1
  2    10 ms    10 ms    10 ms  syn-142-254-213-181.inf.spectrum.com [142.254.213.181]
  3    31 ms    33 ms    27 ms  lag-38.ithcnycy01h.netops.charter.com [24.58.240.97]
  ...
 10    30 ms    26 ms    29 ms  170.114.52.2
```

### 2. **Extract and Geolocate IP Addresses**
Extract the IP addresses from the traceroute and use an IP geolocation service (e.g., **ipinfo.io**) to get the latitude and longitude for each hop.

You can automate this in Git Bash:
```bash
for ip in $(grep -oE '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' trace.txt); do
   curl ipinfo.io/$ip?token=YOUR_API_KEY;
done
```
Record the city, region, country, and latitude/longitude for each hop. This will be used in the map.

### 3. **Create a Basic Leaflet.js Map**
Create an HTML file for the Leaflet.js map:

```bash
touch map.html
```

Open this file in a text editor and add the following base HTML structure:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Traceroute Map</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <style>#map { height: 600px; }</style>
</head>
<body>
    <div id="map"></div>

    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    <script>
        var map = L.map('map').setView([37.7749, -122.4194], 4); // Center of US

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add basic markers for each hop (adjust lat/lon based on your traceroute)
        var locations = [
            {"lat": 37.3329, "lon": -121.8916, "city": "San Jose", "latency": 20},
            {"lat": 42.4406, "lon": -76.4966, "city": "Ithaca", "latency": 15},
            // Add more hops based on traceroute
        ];

        locations.forEach(function(location, index) {
            L.marker([location.lat, location.lon]).addTo(map)
                .bindPopup(location.city + "<br>Latency: " + location.latency + " ms")
                .openPopup();
        });
    </script>
</body>
</html>
```

### 4. **Enhance Map with Numbered Markers and Polyline Paths**
Modify your `map.html` to include numbered markers and lines connecting each hop:

```html
var colors = ['#ff0000', '#ff6600', '#ffcc00', '#ccff00', '#66ff00', '#00ff00'];

locations.forEach(function(location, index) {
    var marker = L.divIcon({
        className: 'leaflet-div-icon',
        html: '<div class="numbered-marker">' + (index + 1) + '</div>'
    });
    
    L.marker([location.lat, location.lon], { icon: marker })
        .addTo(map)
        .bindPopup(location.city + "<br>Latency: " + location.latency + " ms")
        .openPopup();

    if (index > 0) {
        var prev = locations[index - 1];
        L.polyline([[prev.lat, prev.lon], [location.lat, location.lon]], {
            color: colors[index % colors.length],
            weight: 2
        }).addTo(map);
    }
});
```

This code adds:
- **Numbered Markers**: Markers labeled by hop number.
- **Polylines**: Connect the hops using lines with different colors for easy visualization.

### 5. **Use Real Network Infrastructure Data**
Now, to make the map more physically accurate, include real-world network paths (e.g., submarine cables, IXPs, fiber routes). Use **GeoJSON** files to overlay real network infrastructure:

#### Example:
```javascript
L.geoJSON(submarineCableData, {
    style: function (feature) {
        return {color: '#00f', weight: 2, opacity: 0.8};
    }
}).addTo(map);
```

GeoJSON files for network infrastructure (like submarine cables) can be found on sites like **TeleGeography**.

### 6. **Fine-Tune with PeeringDB and BGP Data**
Use **PeeringDB** and **BGP** data to refine your routes. Add markers for key network exchange points (IXPs) and adjust the lines to follow real-world fiber or undersea cable paths.

```javascript
L.marker([40.7143, -74.0060]) // New York IXP
    .bindPopup('IXP: New York')
    .addTo(map);
```

Adjust the lines connecting your hops to pass through these interconnection points.

---

## Example Resources
- [IP Geolocation (ipinfo.io)](https://ipinfo.io)
- [TeleGeography Submarine Cable Map](https://www.submarinecablemap.com/)
- [PeeringDB](https://www.peeringdb.com/)
- [CAIDA's Internet Topology Data](https://www.caida.org/)

---

## Final Output
By the end, your map should reflect:
- Accurate geolocation of each hop in the traceroute.
- Numbered markers for each hop.
- Polyline connections that match the real-world infrastructure (submarine cables, IXPs).
- A visually intuitive representation of the physical network path.
