// shared.js

class CameraFeed {
  constructor(deviceId, index) {
    this.index = index;
    this.deviceId = deviceId;
    this.capture = createCapture({
      video: { deviceId: deviceId },
      audio: false,
    });
    this.capture.elt.setAttribute('playsinline', '');
    this.capture.hide();
    this.buffer = createGraphics(640, 480); // Default dimensions
    this.captureReady = false;

    this.capture.elt.addEventListener('loadedmetadata', () => {
      this.buffer.resizeCanvas(this.capture.width, this.capture.height);
      this.captureReady = true;
    });
  }

  changeCamera(deviceId) {
    this.deviceId = deviceId;
    this.capture.remove();
    this.capture = createCapture({
      video: { deviceId: deviceId },
      audio: false,
    });
    this.capture.elt.setAttribute('playsinline', '');
    this.capture.hide();
    this.captureReady = false;

    this.capture.elt.addEventListener('loadedmetadata', () => {
      this.buffer.resizeCanvas(this.capture.width, this.capture.height);
      this.captureReady = true;
    });
  }

  draw(x, y, w, h) {
    if (!this.captureReady) return;

    this.buffer.image(this.capture, 0, 0);

    let camAspectRatio = this.buffer.width / this.buffer.height;
    let frameAspectRatio = w / h;

    let srcX, srcY, srcW, srcH;

    if (camAspectRatio > frameAspectRatio) {
      // Camera is wider than the frame, crop sides
      srcH = this.buffer.height;
      srcW = srcH * frameAspectRatio;
      srcY = 0;
      srcX = (this.buffer.width - srcW) / 2;
    } else {
      // Camera is taller than the frame, crop top and bottom
      srcW = this.buffer.width;
      srcH = srcW / frameAspectRatio;
      srcX = 0;
      srcY = (this.buffer.height - srcH) / 2;
    }

    image(
      this.buffer,
      x,
      y,
      w,
      h,
      srcX,
      srcY,
      srcW,
      srcH
    );
  }

  remove() {
    this.capture.remove();
    this.buffer.remove();
  }
}

class GridCell {
  constructor(x, y, w, h, deviceId, delay, isTintEnabled, index) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.delay = delay;
    this.startTime = millis();
    this.frames = [];
    this.capture = createCapture({
      video: { deviceId: deviceId },
      audio: false,
    });
    this.capture.elt.setAttribute('playsinline', '');
    this.capture.hide();
    this.buffer = createGraphics(640, 480); // Default dimensions
    this.captureReady = false;
    this.frameDelay = floor(delay * 60); // Convert delay in seconds to frame count
    this.isActive = false;
    this.isTintEnabled = isTintEnabled;
    this.index = index; // Index of the cell

    this.capture.elt.addEventListener('loadedmetadata', () => {
      this.buffer.resizeCanvas(this.capture.width, this.capture.height);
      this.captureReady = true;
    });

    // Variables for dynamic tinting
    this.hueOffset = random(360);
  }

  update() {
    if (!this.captureReady) return;

    // Store frames for delay effect
    this.buffer.image(this.capture, 0, 0);
    this.frames.push(this.buffer.get());

    // Activate cell after its delay has passed
    if (!this.isActive && millis() - this.startTime >= this.delay * 1000) {
      this.isActive = true;
    }

    // Limit the frames array size to prevent memory issues
    if (this.frames.length > this.frameDelay + 60) {
      this.frames.shift();
    }
  }

  draw() {
    if (this.isActive && this.frames.length > this.frameDelay) {
      let frameIndex = max(0, this.frames.length - this.frameDelay - 1);
      let frame = this.frames[frameIndex];

      if (frame) {
        // Adjusted cell height to leave space for label
        let imageHeight = this.h * 0.9;
        let labelHeight = this.h * 0.1;

        // Draw the frame to the main canvas, maintaining aspect ratio and filling the cell
        let cellAspectRatio = this.w / imageHeight;
        let camAspectRatio = frame.width / frame.height;

        let srcX, srcY, srcW, srcH;

        if (camAspectRatio > cellAspectRatio) {
          // Camera is wider than the cell, crop sides
          srcH = frame.height;
          srcW = srcH * cellAspectRatio;
          srcY = 0;
          srcX = (frame.width - srcW) / 2;
        } else {
          // Camera is taller than the cell, crop top and bottom
          srcW = frame.width;
          srcH = srcW / cellAspectRatio;
          srcX = 0;
          srcY = (frame.height - srcH) / 2;
        }

        // Apply dynamic tint if enabled
        if (this.isTintEnabled) {
          colorMode(HSB, 360, 100, 100, 100);
          let currentTime = millis() / 1000;
          let hueValue = (currentTime * 10 + this.delay * 100) % 360;
          tint(hueValue, 100, 100, 50); // Apply tint with transparency
        } else {
          noTint();
        }

        image(
          frame,
          this.x,
          this.y,
          this.w,
          imageHeight,
          srcX,
          srcY,
          srcW,
          srcH
        );

        // Remove tint for text
        noTint();

        // Draw the label
        fill(0); // White text
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(18);
        let delayText = this.delay === 0 ? 'REALTIME' : `- ${this.delay.toFixed(1)} SEC`;
        text(
          delayText.toUpperCase(),
          this.x + this.w / 2,
          this.y + imageHeight + labelHeight / 2
        );
      }
    }
  }

  remove() {
    this.capture.remove();
    this.buffer.remove();
    this.frames = [];
  }
}

function createScreenButtons(buttonLabels, actionCallback, containerId, positionProperty = 'bottom', positionValue = '50px') {
  // Check if the container div already exists for the current screen
  let buttonContainer = select(`#${containerId}`);

  // If it doesn't exist, create a new one
  if (!buttonContainer) {
    buttonContainer = createDiv();
    buttonContainer.id(containerId);
    buttonContainer.style('display', 'flex');
    buttonContainer.style('justify-content', 'center');
    buttonContainer.style('align-items', 'center');
    buttonContainer.style('position', 'fixed');
    buttonContainer.style(positionProperty, positionValue); // Use passed positioning for flexibility
    buttonContainer.style('width', '100%');
  } else {
    // If it exists, clear out the old buttons before adding new ones
    buttonContainer.html(''); // Clear previous buttons if any
  }

  // Iterate over the button labels and create buttons
  buttonLabels.forEach((label) => {
    let btn = createButton(label);
    btn.mousePressed(() => actionCallback(label));  // Call the passed-in action function
    buttonContainer.child(btn);  // Add buttons to the container
  });

  return buttonContainer; // Return the container for flexibility in placing it
}





