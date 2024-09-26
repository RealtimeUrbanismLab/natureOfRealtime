class Screen5 {
  constructor() {
    this.mediaElement = null;
    this.mediaType = '';  // 'image' or 'video' depending on the file type
    this.caption = 'Sample Media Caption';
    this.filePath = 'https://pam-s3-bucket.s3.amazonaws.com/YourCribs+-+Leigha+Dennis+and+Farzin+Lotfi-Jam%2C+2015.mp4'; 
  }

  init() {
    // Check if the file path is set and determine the media type
    if (this.filePath.endsWith('.mp4') || this.filePath.endsWith('.webm')) {
      this.mediaType = 'video';
      this.mediaElement = createVideo([this.filePath]);
      //this.mediaElement.showControls();

      // Start playing the video after the metadata is loaded
      this.mediaElement.elt.addEventListener('loadedmetadata', () => {
        this.mediaElement.size(width * 0.8, height * 0.6);  // Set size for the video
        this.mediaElement.play();  // Start the video
        this.mediaElement.loop();  // Loop the video
        this.windowResized();  // Position the video after it loads
      });

    } else if (this.filePath.endsWith('.jpg') || this.filePath.endsWith('.png')) {
      this.mediaType = 'image';
      this.mediaElement = createImg(this.filePath, 'Media Image');

      // Use the 'load' event for images
      this.mediaElement.elt.addEventListener('load', () => {
        this.mediaElement.size(width * 0.8, height * 0.6);  // Set size for the image
        this.windowResized();  // Position the image after it loads
      });
    }

    // Add the caption below the media element
    let captionElement = createP(this.caption);
    captionElement.class('caption');
    captionElement.style('text-align', 'center');  // Center the caption
    captionElement.position(width / 2 - captionElement.width / 2, height * 0.85);  // Position the caption
  }

  draw() {
    // No continuous drawing needed for this screen
  }

  cleanup() {
    if (this.mediaElement) {
      this.mediaElement.remove();
    }
    select('.caption').remove();
  }

  windowResized() {
    // Properly position the media element in the center of the screen
    if (this.mediaElement) {
      this.mediaElement.position(
        (width - this.mediaElement.width) / 2,
        (height - this.mediaElement.height) / 2
      );
    }

    // Update the position of the caption if it exists
    let captionElement = select('.caption');
    if (captionElement) {
      captionElement.position(width / 2 - captionElement.width / 2, height * 0.85);
    }
  }
}
