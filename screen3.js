class Screen3 {
  constructor() {
    this.cameraSelection = null;
    this.gridCells = [];
    this.gridRows = 3;
    this.gridCols = 3;
    this.cellWidth = width / this.gridCols;
    this.cellHeight = height / this.gridRows;
    this.delayPerCell = 0.5; // Default delay in seconds per cell
    this.selectedCameraId = null;

    // UI Elements
    this.gridSizeSelection = null;
    this.delayModeToggle = null;
    this.tintToggle = null;
    this.delaySlider = null;
    this.isRandomDelay = false;
    this.isTintEnabled = false;
  }

  init() {
    // Hide gradient speed slider if it's visible
    if (typeof gradientSpeedSlider !== 'undefined' && gradientSpeedSlider) {
      gradientSpeedSlider.hide();
    }

    if (cameras.length > 0) {
      this.selectedCameraId = cameras[1].deviceId; // Default to Camera 2

      // Create a container for the UI elements (dropdowns, checkboxes, sliders, buttons)
      let uiContainer = createDiv();
      uiContainer.id('screen3UI');
      uiContainer.style('display', 'flex');
      uiContainer.style('justify-content', 'center');
      uiContainer.style('align-items', 'center');
      uiContainer.style('position', 'fixed');
      uiContainer.style('bottom', '40px');
      uiContainer.style('width', '100%');

      // Camera selection dropdown
      this.cameraSelection = createSelect();
      for (let i = 0; i < cameras.length; i++) {
        this.cameraSelection.option(`Camera ${i + 1}`, cameras[i].deviceId);
      }
      this.cameraSelection.selected(this.selectedCameraId);
      this.cameraSelection.changed(() => this.updateGrid());
      uiContainer.child(this.cameraSelection);  // Add to the UI container

      // Grid size selection dropdown
      this.gridSizeSelection = createSelect();
      this.gridSizeSelection.option('2x2');
      this.gridSizeSelection.option('3x3');
      this.gridSizeSelection.option('4x4');
      this.gridSizeSelection.option('4x2');
      this.gridSizeSelection.selected('3x3'); // Default selection
      this.gridSizeSelection.changed(() => this.updateGrid());
      uiContainer.child(this.gridSizeSelection);  // Add to the UI container

      // Delay mode toggle checkbox
      this.delayModeToggle = createCheckbox('Randomize', false);
      this.delayModeToggle.style('margin-right', '10px');
      this.delayModeToggle.changed(() => {
        this.isRandomDelay = this.delayModeToggle.checked();
        this.updateGrid();
      });
      uiContainer.child(this.delayModeToggle);  // Add to the UI container

      // Tint toggle checkbox
      this.tintToggle = createCheckbox('Tint', false);
      this.tintToggle.style('margin-right', '10px');
      this.tintToggle.changed(() => {
        this.isTintEnabled = this.tintToggle.checked();
        this.updateGrid();
      });
      uiContainer.child(this.tintToggle);  // Add to the UI container

      // Delay slider
      let sliderLabel = createP('Delay (sec)');
      sliderLabel.style('color', '#ffffff');
      sliderLabel.style('margin-right', '10px');
      uiContainer.child(sliderLabel);

      this.delaySlider = createSlider(0, 2, 0.5, 0.1);
      this.delaySlider.style('width', '150px');
      this.delaySlider.input(() => {
        this.delayPerCell = this.delaySlider.value();
        this.updateGrid();
      });
      uiContainer.child(this.delaySlider);  // Add to the UI container

      // Initialize the grid
      this.updateGrid();
    }
  }

  updateGrid() {
    // Remove existing grid cells
    this.gridCells.forEach((cell) => cell.remove());
    this.gridCells = [];

    this.selectedCameraId = this.cameraSelection.value();
    this.isRandomDelay = this.delayModeToggle.checked();
    this.isTintEnabled = this.tintToggle.checked();
    this.delayPerCell = this.delaySlider.value();

    // Set grid size based on selection
    let gridSize = this.gridSizeSelection.value();
    switch (gridSize) {
      case '2x2':
        this.gridRows = 2;
        this.gridCols = 2;
        break;
      case '3x3':
        this.gridRows = 3;
        this.gridCols = 3;
        break;
      case '4x4':
        this.gridRows = 4;
        this.gridCols = 4;
        break;
      case '4x2':
        this.gridRows = 2;
        this.gridCols = 4;
        break;
    }

    // Recalculate cell dimensions
    this.cellWidth = width / this.gridCols;
    this.cellHeight = height / this.gridRows;

    // Initialize the grid cells
    let totalCells = this.gridRows * this.gridCols;
    let delays = [];
    for (let i = 0; i < totalCells; i++) {
      delays.push(i * this.delayPerCell);
    }

    if (this.isRandomDelay) {
      delays = shuffle(delays);
    }

    for (let i = 0; i < totalCells; i++) {
      let row = floor(i / this.gridCols);
      let col = i % this.gridCols;
      let delay = delays[i];
      let cell = new GridCell(
        col * this.cellWidth,
        row * this.cellHeight,
        this.cellWidth,
        this.cellHeight,
        this.selectedCameraId,
        delay,
        this.isTintEnabled,
        i // Index for tinting
      );
      this.gridCells.push(cell);
    }
  }

  draw() {
    if (this.gridCells.length > 0) {
      this.drawGridCells();
    }
  }

  drawGridCells() {
    for (let cell of this.gridCells) {
      cell.update();
      cell.draw();
    }
  }

  cleanup() {
    // Hide UI elements
    if (this.cameraSelection) this.cameraSelection.hide();
    if (this.goButton) this.goButton.hide();
    if (this.gridSizeSelection) this.gridSizeSelection.hide();
    if (this.delayModeToggle) this.delayModeToggle.hide();
    if (this.tintToggle) this.tintToggle.hide();
    if (this.delaySlider) this.delaySlider.hide();

    // Remove captures from all grid cells
    this.gridCells.forEach((cell) => cell.remove());
    this.gridCells = [];
  }

  windowResized() {
    // Reposition UI elements (if needed)
    let uiContainer = select('#screen3UI');
    if (uiContainer) {
      uiContainer.style('bottom', '40px');
    }

    // Recalculate cell dimensions
    this.cellWidth = width / this.gridCols;
    this.cellHeight = height / this.gridRows;

    // Update positions of grid cells
    for (let i = 0; i < this.gridCells.length; i++) {
      let row = floor(i / this.gridCols);
      let col = i % this.gridCols;
      this.gridCells[i].x = col * this.cellWidth;
      this.gridCells[i].y = row * this.cellHeight;
      this.gridCells[i].w = this.cellWidth;
      this.gridCells[i].h = this.cellHeight;
    }
  }
}
