// Variables globales
let canvas;
let time = 0;
let colorMode = 0;
let isPaused = false;
let buffer; // Buffer para renderizado

function setup() {
  // Crear un canvas que se ajuste al contenedor
  canvas = createCanvas(windowWidth * 0.8, windowHeight * 0.8);
  canvas.parent('canvas-container');
  
  // Configuración inicial
  pixelDensity(1);
  noStroke();
  
  // Crear buffer de menor resolución para mejorar rendimiento
  buffer = createGraphics(width/4, height/4);
  buffer.pixelDensity(1);
  buffer.noStroke();
}

function draw() {
  // Actualizar el tiempo si no está pausado
  if (!isPaused) {
    time += 0.05;
  }
  
  // Trabajar con el buffer de menor resolución
  buffer.loadPixels();
  
  // Procesar cada píxel del buffer (que es 16 veces menos píxeles)
  for (let x = 0; x < buffer.width; x++) {
    for (let y = 0; y < buffer.height; y++) {
      let uv = [x / buffer.width, y / buffer.height];
      let r, g, b;
      
      switch(colorMode) {
        case 0: // Original
          r = desfase(uv, 0.0);
          g = desfase(uv, PI / 5.0);
          b = desfase(uv, PI / 2.0);
          break;
        case 1: // Cálida (Atardecer)
          r = desfase(uv, 0.0) * 0.8 + desfase(uv, PI/3.0) * 0.2;
          g = desfase(uv, PI/4.0) * 0.6;
          b = desfase(uv, PI/2.0) * 0.4;
          break;
        case 2: // Fría (Océano)
          r = desfase(uv, PI/2.0) * 0.3;
          g = desfase(uv, PI/3.0) * 0.8;
          b = desfase(uv, 0.0) * 0.9 + desfase(uv, PI/4.0) * 0.1;
          break;
        case 3: // Psicodélica (Neón)
          r = (sin(desfase(uv, 0.0) * PI * 2.0) * 0.5 + 0.5);
          g = (sin(desfase(uv, PI/1.5) * PI * 2.0 + PI/3.0) * 0.5 + 0.5);
          b = (sin(desfase(uv, PI/0.75) * PI * 2.0 + 2.0*PI/3.0) * 0.5 + 0.5);
          break;
        case 4: // Monocromática (Verde Matrix)
          let intensity = desfase(uv, 0.0) * 0.7 + desfase(uv, PI/2.0) * 0.3;
          r = intensity * 0.2;
          g = intensity;
          b = intensity * 0.4;
          break;
        case 5: // Rosa y Púrpura (Unicornio)
          r = desfase(uv, 0.0) * 0.9 + desfase(uv, PI/6.0) * 0.1;
          g = desfase(uv, PI/2.0) * 0.4;
          b = desfase(uv, PI/3.0) * 0.8;
          break;
      }
      
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
  
  drawUI();
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
  rect(5, 5, 350, 110, 8);
  
  fill(255);
  noStroke();
  textSize(14);
  text("🎨 PATRÓN GENERATIVO INTERACTIVO", 15, 25);
  
  textSize(12);
  let modeNames = [
    "ORIGINAL", 
    "CÁLIDA (Atardecer)", 
    "FRÍA (Océano)", 
    "PSICODÉLICA (Neón)", 
    "MONOCROMÁTICA (Matrix)", 
    "ROSA (Unicornio)"
  ];
  text("Modo: " + modeNames[colorMode], 15, 45);
  text("Tiempo: " + time.toFixed(2), 15, 65);
  text("FPS: " + frameRate().toFixed(1), 150, 65);
  text("C: Cambiar colores | P: Pausar | S: Guardar", 15, 85);
  text("R: Reiniciar | Click: Acelerar", 15, 105);
}

function windowResized() {
  // Ajustar el tamaño del canvas cuando cambia el tamaño de la ventana
  resizeCanvas(windowWidth * 0.8, windowHeight * 0.8);
  // Redimensionar el buffer también
  buffer = createGraphics(width/4, height/4);
  buffer.pixelDensity(1);
  buffer.noStroke();
}

// Controles interactivos
function keyPressed() {
  // Cambiar esquema de color
  if (key === 'c' || key === 'C') {
    colorMode = (colorMode + 1) % 6;
  }
  
  // Pausar/reanudar animación
  if (key === 'p' || key === 'P') {
    isPaused = !isPaused;
  }
  
  // Capturar frame
  if (key === 's' || key === 'S') {
    save('patron_generativo_' + colorMode + '_' + frameCount + '.png');
  }
  
  // Reiniciar tiempo
  if (key === 'r' || key === 'R') {
    time = 0;
  }
  
  return false;
}

function mousePressed() {
  // Cambiar velocidad al hacer click
  if (mouseButton === LEFT) {
    // Acelerar temporalmente
    time += 2.0;
  }
}

// Función para obtener nombre del modo actual (para uso externo si es necesario)
function getCurrentModeName() {
  const names = [
    "ORIGINAL", 
    "CÁLIDA (Atardecer)", 
    "FRÍA (Océano)", 
    "PSICODÉLICA (Neón)", 
    "MONOCROMÁTICA (Matrix)", 
    "ROSA (Unicornio)"
  ];
  return names[colorMode];
}