// Variables globales
let canvas;
let time = 0;
let isPaused = false;
let buffer; // Buffer para renderizado

// Sliders de color
let redSlider, greenSlider, blueSlider;
let redValue = 1.0;
let greenValue = 1.0;
let blueValue = 1.0;

function setup() {
  // Crear un canvas que se ajuste al contenedor
  canvas = createCanvas(windowWidth * 0.8, windowHeight * 0.8);
  canvas.parent('canvas-container');
  
  // Configuración inicial
  pixelDensity(1);
  noStroke();
  
  // Crear buffer de menor resolución para mejorar rendimiento
  createBuffer();
  
  // Crear interfaz de controles
  createControls();
  
  // Inicializar display de color
  setTimeout(() => {
    updateColorDisplay();
  }, 100);
}

function createBuffer() {
  // Crear buffer con tamaño reducido
  buffer = createGraphics(max(1, floor(width/4)), max(1, floor(height/4)));
  buffer.pixelDensity(1);
  buffer.noStroke();
}

function createControls() {
  // Panel de controles
  let controls = createDiv('');
  controls.parent('canvas-container');
  controls.style('position', 'absolute');
  controls.style('top', '10px');
  controls.style('left', '10px');
  controls.style('background', 'rgba(0,0,0,0.8)');
  controls.style('padding', '15px');
  controls.style('border-radius', '10px');
  controls.style('color', 'white');
  controls.style('font-family', 'Arial, sans-serif');
  controls.style('font-size', '12px');
  controls.style('max-width', '300px');
  controls.style('z-index', '1000');
  
  // Título
  let title = createP('🎨 CONTROLES DE COLOR');
  title.parent(controls);
  title.style('margin', '0 0 10px 0');
  title.style('font-weight', 'bold');
  title.style('font-size', '14px');
  
  // Slider Rojo
  createP('🔴 ROJO:').parent(controls).style('margin', '5px 0');
  redSlider = createSlider(0, 100, 100);
  redSlider.parent(controls);
  redSlider.style('width', '100%');
  redSlider.input(() => {
    redValue = redSlider.value() / 100;
    updateColorDisplay();
  });
  
  // Slider Verde
  createP('🟢 VERDE:').parent(controls).style('margin', '5px 0');
  greenSlider = createSlider(0, 100, 100);
  greenSlider.parent(controls);
  greenSlider.style('width', '100%');
  greenSlider.input(() => {
    greenValue = greenSlider.value() / 100;
    updateColorDisplay();
  });
  
  // Slider Azul
  createP('🔵 AZUL:').parent(controls).style('margin', '5px 0');
  blueSlider = createSlider(0, 100, 100);
  blueSlider.parent(controls);
  blueSlider.style('width', '100%');
  blueSlider.input(() => {
    blueValue = blueSlider.value() / 100;
    updateColorDisplay();
  });
  
  // Display de color actual
  let colorDisplay = createDiv('COLOR ACTUAL: RGB(255, 255, 255)');
  colorDisplay.parent(controls);
  colorDisplay.id('color-display');
  colorDisplay.style('margin', '10px 0');
  colorDisplay.style('padding', '5px');
  colorDisplay.style('background', '#fff');
  colorDisplay.style('color', '#000');
  colorDisplay.style('text-align', 'center');
  colorDisplay.style('border-radius', '5px');
  colorDisplay.style('font-weight', 'bold');
  
  // Info FPS
  let fpsDisplay = createDiv('FPS: --');
  fpsDisplay.parent(controls);
  fpsDisplay.id('fps-display');
  fpsDisplay.style('margin', '10px 0');
  fpsDisplay.style('text-align', 'center');
  
  // Controles de teclado
  let keysInfo = createP('⌨️ CONTROLES:<br>P: Pausa/Play<br>S: Guardar<br>R: Reiniciar<br>C: Reset Color<br>1-4: Presets');
  keysInfo.parent(controls);
  keysInfo.style('margin', '10px 0 0 0');
  keysInfo.style('font-size', '11px');
}

function updateColorDisplay() {
  let r = Math.round(redValue * 255);
  let g = Math.round(greenValue * 255);
  let b = Math.round(blueValue * 255);
  let display = select('#color-display');
  if (display) {
    display.html(`COLOR ACTUAL: RGB(${r}, ${g}, ${b})`);
    display.style('background', `rgb(${r}, ${g}, ${b})`);
    // Ajustar color de texto según brillo del fondo
    let brightness = (r * 299 + g * 587 + b * 114) / 1000;
    display.style('color', brightness > 128 ? '#000' : '#fff');
  }
}

function draw() {
  // Actualizar el tiempo si no está pausado
  if (!isPaused) {
    time += 0.05;
  }
  
  // Actualizar FPS en tiempo real
  let fpsDisplay = select('#fps-display');
  if (fpsDisplay) {
    fpsDisplay.html(`FPS: ${frameRate().toFixed(1)}`);
  }
  
  // Dibujar el patrón
  drawPattern();
  
  // Dibujar UI
  drawUI();
}

function drawPattern() {
  // Trabajar con el buffer de menor resolución
  buffer.loadPixels();
  
  // Procesar cada píxel del buffer
  for (let x = 0; x < buffer.width; x++) {
    for (let y = 0; y < buffer.height; y++) {
      let uv = [x / buffer.width, y / buffer.height];
      
      // Calcular el patrón base
      let pattern = desfase(uv, 0.0);
      
      // Aplicar los valores RGB de los sliders
      let r = pattern * redValue;
      let g = pattern * greenValue;
      let b = pattern * blueValue;
      
      // Calcular índice del píxel en el buffer
      let index = (x + y * buffer.width) * 4;
      buffer.pixels[index] = r * 255;
      buffer.pixels[index + 1] = g * 255;
      buffer.pixels[index + 2] = b * 255;
      buffer.pixels[index + 3] = 255;
    }
  }
  
  buffer.updatePixels();
  
  // Dibujar el buffer escalado al tamaño del canvas
  image(buffer, 0, 0, width, height);
}

// Función desfase simplificada para mejor rendimiento
function desfase(uv, fase) {
  // Versión simplificada para mejorar rendimiento
  let t1 = sin(uv[0] * 10.0 * PI + time);
  let t2 = sin(uv[1] * 10.0 * PI - time);
  let t3 = sin(uv[0] * 10.0 * PI - time + t2);
  let formafinal = sin(t1 + t2 + t3 + fase) * 0.5 + 0.5;
  
  return formafinal;
}

function drawUI() {
  fill(0, 0, 0, 180);
  rect(5, 5, 300, 60, 8);
  
  fill(255);
  noStroke();
  textSize(14);
  text("🎨 CONTROL DE COLORES RGB", 15, 25);
  
  textSize(12);
  text(`Tiempo: ${time.toFixed(2)} | P: Pausar | S: Guardar`, 15, 45);
}

function windowResized() {
  // Ajustar el tamaño del canvas cuando cambia el tamaño de la ventana
  resizeCanvas(windowWidth * 0.8, windowHeight * 0.8);
  // Redimensionar el buffer también
  createBuffer();
}

// Controles interactivos
function keyPressed() {
  // Pausar/reanudar animación
  if (key === 'p' || key === 'P') {
    isPaused = !isPaused;
    return false;
  }
  
  // Capturar frame
  if (key === 's' || key === 'S') {
    let timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    saveCanvas(`patron_color_${timestamp}`, 'png');
    return false;
  }
  
  // Reiniciar tiempo
  if (key === 'r' || key === 'R') {
    time = 0;
    return false;
  }
  
  // Reset sliders de color a blanco
  if (key === 'c' || key === 'C') {
    redSlider.value(100);
    greenSlider.value(100);
    blueSlider.value(100);
    redValue = 1.0;
    greenValue = 1.0;
    blueValue = 1.0;
    updateColorDisplay();
    return false;
  }
  
  // Presets de color rápidos
  if (key === '1') {
    // Rojo
    setColorPreset(1.0, 0.2, 0.2);
    return false;
  }
  if (key === '2') {
    // Verde
    setColorPreset(0.2, 1.0, 0.2);
    return false;
  }
  if (key === '3') {
    // Azul
    setColorPreset(0.2, 0.2, 1.0);
    return false;
  }
  if (key === '4') {
    // Psicodélico
    setColorPreset(1.0, 0.5, 1.0);
    return false;
  }
  
  return false;
}

function setColorPreset(r, g, b) {
  redSlider.value(r * 100);
  greenSlider.value(g * 100);
  blueSlider.value(b * 100);
  redValue = r;
  greenValue = g;
  blueValue = b;
  updateColorDisplay();
}