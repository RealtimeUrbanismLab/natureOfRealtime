// sketch.js

// Global variables
let h = 0; // For gradient background hue
let animationSpeed = 0.5; // Default animation speed
let selectedAnimation = "Horizontal Gradient"; // Default animation
let selectedColorScheme = "Default"; // Default color scheme
let gradientSpeedSlider; // Declare gradientSpeedSlider globally
let screenTitle; // Global reference to the heading

let currentScreenIndex = 0; // Start with Screen 1
let screens = []; // Array to hold screen objects
let cameras = []; // To hold camera devices

function preload() {
  // Get video input devices
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    cameras = devices.filter((device) => device.kind === "videoinput");
    // Initialize screens after cameras are loaded
    initializeScreens();
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);

  // Create and style the screen title
  screenTitle = createElement("h1", ""); // Create once, keep it for reuse
  screenTitle.id("screen-title");
  screenTitle.style("width", "100%");
  screenTitle.style("text-align", "center");
  screenTitle.style('font-size', '72px');
  screenTitle.style('color', '#ffffff');
  screenTitle.position(0,-40); // Position at the top center

  createNavigationUI();
  initializeScreens();
}

function draw() {
  // Draw the gradient background based on the selected options
  drawBackgroundGradient();

  // Call the draw function of the active screen
  if (
    screens[currentScreenIndex] &&
    typeof screens[currentScreenIndex].draw === "function"
  ) {
    screens[currentScreenIndex].draw();
  }
}

// Gradient background functions
function drawBackgroundGradient() {
  switch (selectedAnimation) {
    case "Horizontal":
      drawHorizontalGradient();
      break;
    case "Vertical":
      drawVerticalGradient();
      break;
    case "Radial":
      drawRadialGradient();
      break;
    case "Spinning":
      drawSpinningColorWheel();
      break;
    case "Kaleidoscope":
      drawKaleidoscopeEffect();
      break;
  }

  // Update the hue or other parameters
  h = (h + animationSpeed) % 360;
}

function drawHorizontalGradient() {
  noFill();
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c1 = getColor1();
    let c2 = getColor2();
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function drawVerticalGradient() {
  noFill();
  for (let x = 0; x < width; x++) {
    let inter = map(x, 0, width, 0, 1);
    let c1 = getColor1();
    let c2 = getColor2();
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, 0, x, height);
  }
}

function drawRadialGradient() {
  noStroke();
  let radius = max(width, height) * 0.7;
  let c1 = getColor1();
  let c2 = getColor2();

  push();
  translate(width / 2, height / 2);
  for (let r = radius; r > 0; r -= 5) {
    let inter = map(r, radius, 0, 0, 1);
    let c = lerpColor(c1, c2, inter);
    fill(c);
    ellipse(0, 0, r * 2, r * 2);
  }
  pop();
}

function drawSpinningColorWheel() {
  push();
  translate(width / 2, height / 2);
  rotate(radians(h));
  let numSegments = 18;
  let angleStep = 360 / numSegments;
  for (let i = 0; i < numSegments; i++) {
    let c = color((h + i * angleStep) % 360, 100, 100);
    fill(c);
    noStroke();
    //arc(0, 0, width * 0.75, width * 0.75, i * angleStep, (i + 1) * angleStep); // Draw the segment in the shape of a ball
    arc(
      0,
      0,
      width,
      height,
      radians(i * angleStep),
      radians((i + 1) * angleStep)
    );
  }
  pop();
}

// function drawSpinningColorWheel() {
//   push();
//   translate(width / 2, height / 2); // Move origin to the center of the canvas
//   rotate(radians(h)); // Rotate the color wheel based on the hue value

//   let numSegments = 48; // Number of segments in the color wheel
//   let angleStep = TWO_PI / numSegments; // Each segment covers an equal portion of the wheel

//   for (let i = 0; i < numSegments; i++) {
//     let c = color((h + i * 30) % 360, 100, 100); // Adjust the hue for each segment
//     fill(c);
//     noStroke();
//     arc(0, 0, width * 0.75, width * 0.75, i * angleStep, (i + 1) * angleStep); // Draw the segment in the shape of a ball
//   }

//   pop();
// }

function drawKaleidoscopeEffect() {
  push();
  translate(width / 2, height / 2);
  let numSegments = 96;
  let angleStep = 360 / numSegments;
  for (let i = 0; i < numSegments; i++) {
    push();
    rotate(radians(i * angleStep + h));
    let c = color((h + i * angleStep) % 360, 100, 100);
    fill(c);
    noStroke();
    triangle(0, 0, width, 0, width / 2, height / 2);
    pop();
  }
  pop();
}

// Color functions
function getColor1() {
  switch (selectedColorScheme) {
    case "Default":
      return color(h % 360, 100, 100);
    case "Pastel":
      return color((h + 30) % 360, 50, 100);
    case "Warm":
      return color((h + 10) % 60, 100, 100);
    case "Cool":
      return color((h + 180) % 360, 100, 100);
    case "Rainbow":
      return color(h % 360, 100, 100);
    default:
      return color(h % 360, 100, 100);
  }
}

function getColor2() {
  switch (selectedColorScheme) {
    case "Default":
      return color((h + 100) % 360, 100, 100);
    case "Pastel":
      return color((h + 60) % 360, 50, 100);
    case "Warm":
      return color((h + 30) % 60, 100, 100);
    case "Cool":
      return color((h + 200) % 360, 100, 100);
    case "Rainbow":
      return color((h + 180) % 360, 100, 100);
    default:
      return color((h + 100) % 360, 100, 100);
  }
}



function switchScreen(index) {
  // Clean up the previous screen
  if (
    screens[currentScreenIndex] &&
    typeof screens[currentScreenIndex].cleanup === "function"
  ) {
    screens[currentScreenIndex].cleanup();
  }

  currentScreenIndex = index;

  // Update the screen title dynamically
  let screenTitles = [
    "Loops",
    "Simultaneity",
    "Delay",
    "Delta",
    "Media Display",
  ];

  // Ensure screenTitle exists before updating it
  if (screenTitle) {
    screenTitle.html(screenTitles[currentScreenIndex]);
  } else {
    console.error('screenTitle is undefined');
  }

  // Initialize the new screen
  if (
    screens[currentScreenIndex] &&
    typeof screens[currentScreenIndex].init === "function"
  ) {
    screens[currentScreenIndex].init();
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (
    screens[currentScreenIndex] &&
    typeof screens[currentScreenIndex].windowResized === "function"
  ) {
    screens[currentScreenIndex].windowResized();
  }
}

function initializeScreens() {
  screens[0] = new Screen1();
  screens[1] = new Screen2();
  screens[2] = new Screen3();
  screens[3] = new Screen4();
  screens[4] = new Screen5();
  screens[5] = new Screen6(); // New Map screen
  switchScreen(0);
}


// Navigation UI
 function createNavigationUI() {
   let buttonNames = [
     "Screen 1",
     "Screen 2",
     "Screen 3",
     "Screen 4",
     "Screen 5",
     "Screen 6",
   ];

   let buttonContainer = createDiv(); // Create a div to center buttons
   buttonContainer.style("display", "flex");
   buttonContainer.style("justify-content", "center");
   buttonContainer.style("align-items", "center");
   buttonContainer.style("position", "absolute");
   buttonContainer.style("bottom", "5px");
   buttonContainer.style("width", "100%");

   for (let i = 0; i < buttonNames.length; i++) {
     let btn = createButton(buttonNames[i]);
     btn.mousePressed(() => switchScreen(i));
     buttonContainer.child(btn); // Add button to the container
   }
 }