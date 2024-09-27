class Screen0 {
    constructor() {
      this.button = null;
      this.particles = [];
      this.isAnimating = false;
      this.clickCount = 0;
      this.flashTime = null;
    }
  
    init() {
      // Set the screen title dynamically
      screenTitle.html('Realtime');
      screenTitle.style('color', 'black');
        
      // No need to create a new canvas; use the main canvas from sketch.js
  
      // Create a giant button in the center
      this.button = createButton('INPUT');
      this.button.position(windowWidth / 2, windowHeight / 2);
      this.styleButton();
      this.button.mousePressed(() => {
        this.processData();
      });
    }
  
    styleButton() {
      this.button.style('font-size', '48px');
      this.button.style('padding', '20px 40px');
      this.button.style('background-color', '#ff0000');
      this.button.style('color', '#ffffff');
      this.button.style('border', 'none');
      this.button.style('border-radius', '0px');
      this.button.style('cursor', 'pointer');
      this.button.style('position', 'absolute');
      this.button.style('transform', 'translate(-50%, -50%)');
      this.button.style('z-index', '1');
  
      // Prevent text wrapping
      this.button.style('white-space', 'nowrap');
  
      // Hide overflow to prevent scrollbars
      document.body.style.overflow = 'hidden';
    }
  
    processData() {
      // Increase click count
      this.clickCount++;
  
      // Generate new particles to simulate data processing
      for (let i = 0; i < 200; i++) {
        this.particles.push(new Particle(mouseX, mouseY, this.clickCount));
      }
  
      // Start animation
      this.isAnimating = true;
  
      // Flash effect
      this.flashScreen();
  
      // Move the button to a new random position
      this.moveButton();
    }
  
    moveButton() {
      // Calculate new random position within the window bounds, considering button size
      const buttonWidth = this.button.elt.offsetWidth;
      const buttonHeight = this.button.elt.offsetHeight;
  
      const newX = random(buttonWidth / 2, windowWidth - buttonWidth / 2);
      const newY = random(buttonHeight / 2, windowHeight - buttonHeight / 2);
  
      this.button.position(newX, newY);
    }
  
    flashScreen() {
      // Store the time of the flash
      this.flashTime = millis();
    }
  
    draw() {
        // Set the background to gray at the start
        background(128);
      
        if (this.isAnimating) {
          // Overlay semi-transparent white for trailing effect
          fill(255, 128);
          noStroke();
          rect(0, 0, width, height);
      
          // Update and display particles
          for (let i = this.particles.length - 1; i >= 0; i--) {
            let particle = this.particles[i];
            particle.update();
            particle.display();
      
            // Remove particle if its lifespan is over
            if (particle.lifespan <= 0) {
              this.particles.splice(i, 1);
            }
          }
      
          // Stop animation if no particles are left
          if (this.particles.length === 0) {
            this.isAnimating = false;
          }
        }
      
        // Handle flash effect
        if (this.flashTime && millis() - this.flashTime < 50) {
          push();
          fill(255, 200);
          noStroke();
          rect(0, 0, width, height);
          pop();
        }
      }
      
  
    cleanup() {
      // Remove the button
      if (this.button) this.button.remove();
  
      // Clear particles and reset animation state
      this.particles = [];
      this.isAnimating = false;
  
      // Clear any lingering graphics
      clear();
  
      // Restore body overflow
      document.body.style.overflow = 'auto';
    }
  
    windowResized() {
      // Adjust button position on window resize
      const buttonWidth = this.button.elt.offsetWidth;
      const buttonHeight = this.button.elt.offsetHeight;
  
      const newX = windowWidth / 2;
      const newY = windowHeight / 2;
  
      this.button.position(newX, newY);
    }
  }
  
  // Particle class remains unchanged
  class Particle {
    constructor(x, y, intensity) {
      this.position = createVector(x, y);
      this.velocity = p5.Vector.random2D();
      this.velocity.mult(random(2 * intensity, 5 * intensity));
      this.acceleration = createVector(0, 0);
      this.lifespan = 255 * intensity;
      this.size = random(2 * intensity, 5 * intensity);
      this.hue = random(0, 45);
    }
  
    update() {
      this.velocity.add(this.acceleration);
      this.position.add(this.velocity);
      this.lifespan -= 2;
    }
  
    display() {
      colorMode(HSB, 360, 100, 100, 255);
      noStroke();
      fill(this.hue, 100, 100, this.lifespan);
      ellipse(this.position.x, this.position.y, this.size);
    }
  }
  