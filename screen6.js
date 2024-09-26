class Screen6 {
  constructor() {
    this.mapDiv = null;
    this.map = null;
    this.locations = [];
    this.currentLocationIndex = 0;
    this.intervalId = null;
    this.speed = 67; // Default speed in meters per second (Fast Car)
    this.zoomLevel = 5; // Default zoom level to show the whole map
    this.targetZoomLevel = 17; // Zoom level to zoom into when animating
    this.labels = null;
    this.distanceTime = null;
    this.elapsedTime = 0;
    this.animationProgress = 0;
    this.isAnimating = false;
    this.animationId = null;
    this.polylineBounds = null; // Store the polyline bounds
  }

  init() {
    // Set the screen title dynamically
    screenTitle.html("Route");

    // Create a div for the Leaflet map
    this.mapDiv = createDiv().id("map");
    this.mapDiv.position(20, 100); // Position the map with margins

    // Initialize the Leaflet map with a fixed zoom level
    this.map = L.map(this.mapDiv.elt).setView(
      [37.7749, -122.4194],
      this.zoomLevel
    );

    // Add the satellite tile layer for the map
    L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmVhbHRpbWVsYWIiLCJhIjoiY2x6cWUyYmNkMGNyNzJxcTg5ZHB3cmM3aCJ9.GxeOk3BD74C7ElBQZZCguw",
      {
        id: "mapbox/satellite-v9", // Use the satellite style
        tileSize: 512,
        zoomOffset: -1,
        attribution: "© Mapbox © OpenStreetMap",
      }
    ).addTo(this.map);

    // Define the data with lat, lon, city, latency, and hop number (trace route sequence)
    this.locations = [
      {
        lat: 42.4406,
        lon: -76.4966,
        city: "Ithaca, New York",
        latency: 1,
        hop: 1,
      },
      {
        lat: 42.5423,
        lon: -76.6661,
        city: "Trumansburg, New York",
        latency: 31,
        hop: 2,
      },
      {
        lat: 40.7143,
        lon: -74.006,
        city: "New York City, New York",
        latency: 17,
        hop: 3,
      },
      {
        lat: 37.3329,
        lon: -121.8916,
        city: "San Jose, California",
        latency: 30,
        hop: 4,
      },
    ];

    // Create markers and polylines on the map
    this.createMapElements();

    // Create the speed control, zoom buttons, and toggle for animation
    this.createControls();

    // Create labels for current and next marker information
    this.createLabels();
  }

  createMapElements() {
    let latlngs = []; // Store lat/lon for the polyline

    // Colors for gradient effect
    const colors = ["#ff0000", "#ff6600", "#ffcc00", "#66ff00"];

    // Loop through locations to add markers and lines
    this.locations.forEach((location, index) => {
      // Add numbered marker
      const marker = L.divIcon({
        className: "leaflet-div-icon",
        html: `<div class="numbered-marker">${location.hop}</div>`,
      });

      L.marker([location.lat, location.lon], { icon: marker })
        .addTo(this.map)
        .bindPopup(`${location.city}<br>Latency: ${location.latency} ms`);

      latlngs.push([location.lat, location.lon]);

      // Draw polyline between markers
      if (index > 0) {
        const previousLocation = this.locations[index - 1];
        L.polyline(
          [
            [previousLocation.lat, previousLocation.lon],
            [location.lat, location.lon],
          ],
          {
            color: colors[index - 1], // Gradient color
            weight: 15,
            opacity: 1.0,
          }
        ).addTo(this.map);
      }
    });

    // Store the bounds of the polyline (all marker coordinates)
    this.polylineBounds = L.latLngBounds(latlngs);

    // Fit the map to the bounds of the polyline initially
    this.map.fitBounds(this.polylineBounds);
  }

  createControls() {
    // Create a container for buttons and labels
    let uiContainer = createDiv();
    uiContainer.id("mapUI");
    uiContainer.style("display", "flex");
    uiContainer.style("justify-content", "center");
    uiContainer.style("align-items", "center");
    uiContainer.style("position", "fixed");
    uiContainer.style("bottom", "40px");
    uiContainer.style("width", "100%");

    // Speed control buttons for Fiber Optic, 747, and Fast Car
    const speeds = {
      "Fast Car": 67, // Speed in meters per second
      "747 Plane": 250, // Speed in meters per second
      "Fiber Optics": 200000, // Speed in meters per second
    };

    Object.keys(speeds).forEach((speedLabel) => {
      let btn = createButton(speedLabel);
      btn.mousePressed(() => {
        this.speed = speeds[speedLabel]; // Set the speed based on the label
        this.updateSpeedLabel(speedLabel); // Update the label with the selected speed
        this.updateDistanceTime(); // Update the distance time for the new speed
        console.log(`Speed set to ${speedLabel}: ${this.speed} meters/second`);
      });
      uiContainer.child(btn);
    });

    // Toggle animation button
    let toggleAnimation = createButton("Start Animation");
    toggleAnimation.mousePressed(() => {
      if (!this.isAnimating) {
        this.isAnimating = true;
        // Fly smoothly to the first location and zoom in
        const firstLocation = this.locations[0];
        this.map.flyTo(
          [firstLocation.lat, firstLocation.lon],
          this.targetZoomLevel,
          { duration: 2 }
        ); // Fly over 2 seconds
        setTimeout(() => {
          this.animateMap(); // Start animation after the zoom
        }, 2000);
        toggleAnimation.html("Stop Animation");
      } else {
        this.isAnimating = false;
        cancelAnimationFrame(this.animationId); // Stop animation
        // Fly smoothly to the polyline bounds (zoom out to show entire route)
        this.map.flyToBounds(this.polylineBounds, { duration: 2 });
        toggleAnimation.html("Start Animation");
      }
    });
    uiContainer.child(toggleAnimation);
  }

  // Create Labels
  createLabels() {
    // Create a label div to show the current and next marker information
    this.labels = createDiv();

    // Set larger font size for better readability
    this.labels.style("font-size", "32px"); // Increase font size

    // Set the color of the text to white
    this.labels.style("color", "#ffffff");

    // Center the text horizontally
    this.labels.style("text-align", "center");

    // Set label width to 100% so it spans across the entire screen width
    this.labels.style("width", "100%");

    // Position the label in the center of the screen vertically and horizontally
    this.labels.style("position", "absolute");
    this.labels.style("top", "50%"); // Vertically center the label
    this.labels.style("left", "50%"); // Horizontally center the label

    // Use transform to adjust for the label's width and height
    this.labels.style("transform", "translate(-50%, -50%)");

    // Ensure the label is on top of all other elements using a high z-index
    this.labels.style("z-index", "9999");

    // Initially hide the labels when the map is loaded
    this.labels.hide();

    // Initialize the label with the first set of information
    this.updateLabels();
  }

  // Function to update the heading and speed labels
  updateLabels() {
    const currentLocation = this.locations[this.currentLocationIndex];
    const nextLocation = this.locations[
      (this.currentLocationIndex + 1) % this.locations.length
    ];

    // Store the current label content for the location and latency
    this.headingText = `<b>Leaving:</b> ${currentLocation.city} (Latency: ${currentLocation.latency} ms) -> <b>Heading to:</b> ${nextLocation.city}`;

    // Call a function to combine heading and speed text and update the label
    this.updateCombinedLabel();
  }

  // Function to update only the speed portion of the label
  updateSpeedLabel(speedLabel) {
    // Update the speed text
    this.speedText = `<br><b>Speed:</b> ${this.speed} meters/second (${speedLabel})`;

    // Call a function to combine heading and speed text and update the label
    this.updateCombinedLabel();
  }

  // Function to combine the heading and speed information and update the label content
  updateCombinedLabel() {
    // Combine the heading and speed text and update the label
    this.labels.html(`${this.headingText}${this.speedText}`);
  }

  // Update the animation control to hide/show labels based on the animation state
  createControls() {
    // Create a container for buttons and labels
    let uiContainer = createDiv();
    uiContainer.id("mapUI");
    uiContainer.style("display", "flex");
    uiContainer.style("justify-content", "center");
    uiContainer.style("align-items", "center");
    uiContainer.style("position", "fixed");
    uiContainer.style("bottom", "40px");
    uiContainer.style("width", "100%");

    // Speed control buttons for Fiber Optic, 747, and Fast Car
    const speeds = {
      "Fast Car": 67, // Speed in meters per second
      "747 Plane": 250, // Speed in meters per second
      "Fiber Optics": 200000, // Speed in meters per second
    };

    Object.keys(speeds).forEach((speedLabel) => {
      let btn = createButton(speedLabel);
      btn.mousePressed(() => {
        this.speed = speeds[speedLabel]; // Set the speed based on the label
        this.updateSpeedLabel(speedLabel); // Update the label with the selected speed
        this.updateDistanceTime(); // Update the distance time for the new speed
        console.log(`Speed set to ${speedLabel}: ${this.speed} meters/second`);
      });
      uiContainer.child(btn);
    });

    // Toggle animation button
    let toggleAnimation = createButton("Start Animation");
    toggleAnimation.mousePressed(() => {
      if (!this.isAnimating) {
        this.isAnimating = true;
        // Fly smoothly to the first location and zoom in
        const firstLocation = this.locations[0];
        this.map.flyTo(
          [firstLocation.lat, firstLocation.lon],
          this.targetZoomLevel,
          { duration: 2 }
        ); // Fly over 2 seconds
        setTimeout(() => {
          this.labels.show(); // Show the labels when the animation starts
          this.animateMap(); // Start animation after the zoom
        }, 2000);
        toggleAnimation.html("Stop Animation");
      } else {
        this.isAnimating = false;
        cancelAnimationFrame(this.animationId); // Stop animation
        this.labels.hide(); // Hide the labels when animation stops
        // Fly smoothly to the polyline bounds (zoom out to show entire route)
        this.map.flyToBounds(this.polylineBounds, { duration: 2 });
        toggleAnimation.html("Start Animation");
      }
    });
    uiContainer.child(toggleAnimation);
  }

  updateDistanceTime() {
    // Recalculate distanceTime based on the new speed
    const currentLocation = this.locations[this.currentLocationIndex];
    const nextLocation = this.locations[
      (this.currentLocationIndex + 1) % this.locations.length
    ];
    const distance = this.map.distance(
      [currentLocation.lat, currentLocation.lon],
      [nextLocation.lat, nextLocation.lon]
    );

    // Time to cover the distance based on the speed (in seconds)
    this.distanceTime = (distance / this.speed) * 1000; // Convert to milliseconds
  }

  animateMap() {
    const moveToNextLocation = () => {
      const currentLocation = this.locations[this.currentLocationIndex];
      const nextLocation = this.locations[
        (this.currentLocationIndex + 1) % this.locations.length
      ];

      // Calculate distance between the markers in meters
      const distance = this.map.distance(
        [currentLocation.lat, currentLocation.lon],
        [nextLocation.lat, nextLocation.lon]
      );

      // Time to cover the distance based on the speed (in seconds)
      this.distanceTime = (distance / this.speed) * 1000; // Convert to milliseconds for frame updates

      this.elapsedTime = 0;
      this.animationProgress = 0;

      // Animate from currentLocation to nextLocation
      const animate = () => {
        if (!this.isAnimating) return; // Stop animation if toggle is off
        this.elapsedTime += deltaTime; // Increase elapsed time
        this.animationProgress = this.elapsedTime / this.distanceTime; // Calculate progress (0 to 1)

        if (this.animationProgress >= 1) {
          // Complete the transition and move to the next location
          this.currentLocationIndex =
            (this.currentLocationIndex + 1) % this.locations.length;
          this.updateLabels();
          this.elapsedTime = 0;
          this.animationId = requestAnimationFrame(moveToNextLocation); // Move to the next marker
        } else {
          // Interpolate between the two locations
          const interpolatedLat = lerp(
            currentLocation.lat,
            nextLocation.lat,
            this.animationProgress
          );
          const interpolatedLon = lerp(
            currentLocation.lon,
            nextLocation.lon,
            this.animationProgress
          );
          this.map.panTo([interpolatedLat, interpolatedLon], {
            animate: false,
          });
          this.animationId = requestAnimationFrame(animate); // Continue animating
        }
      };

      animate(); // Start animation
    };

    requestAnimationFrame(moveToNextLocation); // Start the first animation
  }

  cleanup() {
    // Clean up the map, labels, and remove the div
    if (this.mapDiv) {
      this.map.remove(); // Remove the map instance
      this.mapDiv.remove(); // Remove the div from the DOM
      this.labels.remove(); // Remove the labels
      let uiContainer = select("#mapUI");
      if (uiContainer) uiContainer.remove(); // Remove the UI container
    }
  }

  windowResized() {
    // Reposition labels and UI elements on resize
    this.labels.position(0, height - 100);
  }
}
