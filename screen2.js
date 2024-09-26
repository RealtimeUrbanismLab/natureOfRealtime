class Screen2 {
  constructor() {
    this.cameraFeed1 = null;
    this.cameraFeed2 = null;
  }

  init() {
    // Combine left and right camera labels into one set of buttons
    let camLabelsLeft = cameras.map((_, index) => `Cam ${index + 1} for Left`);
    let camLabelsRight = cameras.map((_, index) => `Cam ${index + 1} for Right`);
    let allCamButtons = camLabelsLeft.concat(camLabelsRight);

    // Create a single container for all camera buttons
    createScreenButtons(allCamButtons, (label) => this.handleCameraChange(label), 'screen2AllCamButtons', 'bottom', '40px');

    // Initialize camera feeds if needed
    if (cameras.length > 0) {
      this.cameraFeed1 = new CameraFeed(cameras[0].deviceId, 0);
      this.cameraFeed2 = new CameraFeed(cameras[1].deviceId, 1);
    }
  }

  handleCameraChange(label) {
    let camIndex = parseInt(label.split(' ')[1]) - 1;

    if (label.includes('Left') && this.cameraFeed1) {
      this.cameraFeed1.changeCamera(cameras[camIndex].deviceId);
    } else if (label.includes('Right') && this.cameraFeed2) {
      this.cameraFeed2.changeCamera(cameras[camIndex].deviceId);
    }
  }

  draw() {
    if (this.cameraFeed1) this.cameraFeed1.draw(0, 0, width / 2, height);
    if (this.cameraFeed2) this.cameraFeed2.draw(width / 2, 0, width / 2, height);
  }

  cleanup() {
    // Remove all camera buttons in the single container
    let camButtonContainer = select('#screen2AllCamButtons');
    if (camButtonContainer) camButtonContainer.remove();

    // Clean up the camera feeds
    if (this.cameraFeed1) this.cameraFeed1.remove();
    if (this.cameraFeed2) this.cameraFeed2.remove();
  }
}
