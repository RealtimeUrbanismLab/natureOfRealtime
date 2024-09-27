class Screen4 {
  constructor() {
    // Video elements
    this.cameraFeed = null;
    this.frames = [];
    this.maxFrames = 60; // Maximum frames to store

    // Change persistence tracking
    this.changePersistence = [];

    // UI Elements
    this.cameraSelection = null;

    // New UI elements
    this.persistenceSlider = null;
    this.persistenceLabel = null;
    this.resolutionSlider = null;
    this.resolutionLabel = null;

    // Visual Parameters
    this.threshold = 90; // Threshold for detecting pixel changes

    // Text Labels
    this.infoText = '';
    this.persistenceText = '';
  }

  init() {
    // Hide gradient speed slider if it's visible
    if (typeof gradientSpeedSlider !== 'undefined' && gradientSpeedSlider) {
      gradientSpeedSlider.hide();
    }

    // Create a container for the UI elements (dropdowns, sliders)
    let uiContainer = createDiv();
    uiContainer.id('screen4UI');
    uiContainer.style('display', 'flex');
    uiContainer.style('justify-content', 'center');
    uiContainer.style('align-items', 'center');
    uiContainer.style('position', 'fixed');
    uiContainer.style('bottom', '40px');
    uiContainer.style('width', '100%');

    // Create camera selection dropdown
    if (cameras.length > 0) {
      this.selectedCameraId = cameras[1]?.deviceId || cameras[0].deviceId;

      this.cameraSelection = createSelect();
      for (let i = 0; i < cameras.length; i++) {
        this.cameraSelection.option(`Camera ${i + 1}`, cameras[i].deviceId);
      }
      this.cameraSelection.selected(this.selectedCameraId);
      this.cameraSelection.changed(() => this.changeCamera());
      uiContainer.child(this.cameraSelection);  // Add to the UI container

      // Initialize camera feed
      this.cameraFeed = new CameraFeed(this.selectedCameraId, 0);
    } else {
      // No cameras available
      alert('No cameras found.');
    }

    // Persistence slider with label
    let persistenceLabel = createP('Persistence (frames)');
    persistenceLabel.style('color', '#ffffff');
    persistenceLabel.style('margin-right', '10px');
    uiContainer.child(persistenceLabel);

    this.persistenceSlider = createSlider(1, 60, 60, 1); // Persistence from 1 to 60 frames
    this.persistenceSlider.style('width', '150px');
    uiContainer.child(this.persistenceSlider);  // Add to the UI container

    // Resolution slider with label
    let resolutionLabel = createP('Resolution (pixels)');
    resolutionLabel.style('color', '#ffffff');
    resolutionLabel.style('margin-right', '10px');

    uiContainer.child(resolutionLabel);

    this.resolutionSlider = createSlider(2, 1280, 20, 1); // Resolution from 2 to 1280 pixels across
    this.resolutionSlider.style('width', '150px');
    uiContainer.child(this.resolutionSlider);  // Add to the UI container
  }

  changeCamera() {
    this.selectedCameraId = this.cameraSelection.value();
    if (this.cameraFeed) {
      this.cameraFeed.changeCamera(this.selectedCameraId);
    }
  }

  resetParameters() {
    this.frames = [];
    this.infoText = '';
    this.persistenceText = '';
  }

  draw() {
    clear();

    // Update parameters from UI
    let persistenceFrames = this.persistenceSlider.value();
    let numPixelsAcross = this.resolutionSlider.value();

    // Draw video to canvas
    if (this.cameraFeed && this.cameraFeed.captureReady) {
      // Get the current frame
      let currentFrame = this.cameraFeed.capture.get();

      // Reduce the resolution of the current frame
      let aspectRatio = currentFrame.height / currentFrame.width;
      let adjustedWidth = numPixelsAcross;
      let adjustedHeight = int(numPixelsAcross * aspectRatio);

      // Create a low-res buffer
      let lowResBuffer = createGraphics(adjustedWidth, adjustedHeight);

      // Draw the current frame into the low-res buffer, scaling it down
      lowResBuffer.image(currentFrame, 0, 0, adjustedWidth, adjustedHeight);

      // Draw the low-res buffer back onto the canvas, scaling it up
      image(lowResBuffer, 0, 0, width, height);

      // Update currentFrame to be the low-res version
      currentFrame = lowResBuffer.get();

      // Dispose of lowResBuffer
      lowResBuffer.remove();

      // Store the current frame
      this.frames.push(currentFrame);

      // Limit the number of stored frames
      if (this.frames.length > this.maxFrames) {
        this.frames.shift();
      }

      // Initialize or resize deltaBuffer to match currentFrame dimensions
      if (!this.deltaBuffer || this.deltaBuffer.width !== currentFrame.width || this.deltaBuffer.height !== currentFrame.height) {
        this.deltaBuffer = createGraphics(currentFrame.width, currentFrame.height);
        this.deltaBuffer.clear();
        this.changePersistence = [];
      }

      // Frame Differencing
      if (this.frames.length > 1) {
        let previousFrame = this.frames[this.frames.length - 2];

        currentFrame.loadPixels();
        previousFrame.loadPixels();

        // Initialize changePersistence array if needed
        if (this.changePersistence.length === 0 || this.changePersistence.length !== currentFrame.pixels.length / 4) {
          this.changePersistence = new Array(currentFrame.pixels.length / 4).fill(0);
        }

        this.deltaBuffer.loadPixels();

        for (let i = 0; i < currentFrame.pixels.length; i += 4) {
          let index = i / 4;

          let diff =
            abs(currentFrame.pixels[i] - previousFrame.pixels[i]) +
            abs(currentFrame.pixels[i + 1] - previousFrame.pixels[i + 1]) +
            abs(currentFrame.pixels[i + 2] - previousFrame.pixels[i + 2]);

          if (diff > this.threshold) {
            // Pixel has changed
            this.changePersistence[index] = persistenceFrames;
          }

          // Decrement changePersistence
          if (this.changePersistence[index] > 0) {
            this.changePersistence[index]--;

            // Set delta pixel to red
            this.deltaBuffer.pixels[i] = 255; // R
            this.deltaBuffer.pixels[i + 1] = 0; // G
            this.deltaBuffer.pixels[i + 2] = 0; // B
            this.deltaBuffer.pixels[i + 3] = 255; // A
          } else {
            // Set delta pixel to transparent
            this.deltaBuffer.pixels[i + 3] = 0; // A
          }
        }

        this.deltaBuffer.updatePixels();

        // Draw deltaBuffer onto main canvas, scaling it to match canvas size
        image(this.deltaBuffer, 0, 0, width, height);
      }

      // Display persistence and resolution information, horizontally centered and in uppercase
      this.persistenceText = `Persistence: ${persistenceFrames} frame${
        persistenceFrames !== 1 ? 's' : ''
      }`.toUpperCase();
      this.infoText = `Resolution: ${adjustedWidth} x ${adjustedHeight} pixels`.toUpperCase();

      textSize(32);
      fill(255);
      noStroke();

      // Set text alignment to horizontal center
      textAlign(CENTER, CENTER);

      // Vertically centered text
      let verticalCenter = height / 2;

      // Draw persistence and resolution text, horizontally centered and uppercase
      text(this.persistenceText, width / 2, verticalCenter - 20);
      text(this.infoText, width / 2, verticalCenter + 20);
    }
  }



  cleanup() {
    // Hide UI elements
    let uiContainer = select('#screen4UI');
    if (uiContainer) uiContainer.remove();

    if (this.cameraSelection) this.cameraSelection.hide();
    if (this.persistenceSlider) this.persistenceSlider.hide();
    if (this.resolutionSlider) this.resolutionSlider.hide();

    if (this.persistenceLabel) this.persistenceLabel.hide();
    if (this.resolutionLabel) this.resolutionLabel.hide();

    // Remove camera feed
    if (this.cameraFeed) this.cameraFeed.remove();
    this.cameraFeed = null;

    // Clear frames
    this.frames = [];

    // Remove deltaBuffer
    if (this.deltaBuffer) {
      this.deltaBuffer.remove();
      this.deltaBuffer = null;
    }
  }

  windowResized() {
    // Reposition UI elements if needed
    let uiContainer = select('#screen4UI');
    if (uiContainer) {
      uiContainer.style('bottom', '40px');
    }
  }
}
