class Screen1 {
  constructor() {
    this.currentAnimation = 'Horizontal';
    this.currentColorScheme = 'Default';
    this.gradientSpeedSlider = null;
  }

  init() {
    // Create a single container for both animation and color scheme buttons
    let allButtons = this.animations().concat(this.colorSchemes());
    
    // Add both sets of buttons in one container, positioned at the bottom
    createScreenButtons(
      allButtons, 
      (label) => this.handleButtonClick(label), 
      'screen1AllButtons', // Single container for all buttons
      'bottom', '40px' // Positioned above the persistent UI
    );

    // Initialize gradient speed slider
    this.gradientSpeedSlider = createSlider(0, 5, 0.5, 0.1);
    this.gradientSpeedSlider.position(20, height - 80);
    this.gradientSpeedSlider.style('width', '150px');
    this.gradientSpeedSlider.show();

    // Set initial values for global variables
    selectedAnimation = this.currentAnimation;
    selectedColorScheme = this.currentColorScheme;
  }

  handleButtonClick(label) {
    // Check if the clicked button is for an animation or color scheme
    if (this.animations().includes(label)) {
      this.selectAnimation(label);
    } else if (this.colorSchemes().includes(label)) {
      this.selectColorScheme(label);
    }
  }

  selectAnimation(animationName) {
    this.currentAnimation = animationName;
    selectedAnimation = animationName;
    console.log('Selected Animation: ' + animationName);
  }

  selectColorScheme(colorSchemeName) {
    this.currentColorScheme = colorSchemeName;
    selectedColorScheme = colorSchemeName;
    console.log('Selected Color Scheme: ' + colorSchemeName);
  }

  draw() {
    // Update animation speed from slider value
    animationSpeed = this.gradientSpeedSlider.value();
  }

  cleanup() {
    // Hide the gradient speed slider and remove buttons
    if (this.gradientSpeedSlider) this.gradientSpeedSlider.hide();

    // Remove the screen-specific buttons
    let buttonContainer = select('#screen1AllButtons');
    if (buttonContainer) buttonContainer.remove();
  }

  // Define available animations and color schemes
  animations() {
    return ['Horizontal', 'Vertical', 'Radial', 'Spinning', 'Kaleidoscope'];
  }

  colorSchemes() {
    return ['Default', 'Pastel', 'Warm', 'Cool', 'Rainbow'];
  }
}
