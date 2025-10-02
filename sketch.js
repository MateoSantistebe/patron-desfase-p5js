// Variables globales
let canvas;
let time = 0;
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
  // Actualizar el tiempo
  time += 0.05;
  
  // Trabajar con el buffer de menor resolución
  buffer.loadPixels();
  
  // Procesar cada píxel del buffer (que es 16 veces menos píxeles)
  for (let x = 0; x < buffer.width; x++) {
    for (let y = 0; y < buffer.height; y++) {
      // Coordenadas normalizadas
      let uv = [x / buffer.width, y / buffer.height];
      
      // Calcular colores con función simplificada
      let r = desfaseSimple(uv, 0.0);
      let g = desfaseSimple(uv, PI / 5.0);
      let b = desfaseSimple(uv, PI / 2.0);
      
      // Calcular índice del píxel
      let index = (x + y * buffer.width) * 4;
      
      // Asignar colores
      buffer.pixels[index] = r * 255;
      buffer.pixels[index + 1] = g * 255;
      buffer.pixels[index + 2] = b * 255;
      buffer.pixels[index + 3] = 255;
    }
  }
  
  buffer.updatePixels();
  
  // Dibujar el buffer escalado al tamaño del canvas
  image(buffer, 0, 0, width, height);
  
  // Mostrar información
  drawUI();
}

// Función desfase simplificada para mejor rendimiento
function desfaseSimple(uv, fase) {
  // Versión mucho más simple pero con efecto visual similar
  let t1 = sin(uv[0] * 10.0 * PI + time);
  let t2 = sin(uv[1] * 10.0 * PI - time);
  let formafinal = sin(t1 + t2 + fase) * 0.5 + 0.5;
  
  return formafinal;
}

// Versión original por si quieres volver a ella
function desfaseOriginal(uv, fase) {
  let t1 = sin(uv[1] * 10.0 * PI - time);
  let t2 = sin(uv[0] * 10.0 * PI - time + t1);
  let t3 = sin(uv[1] * 10.0 * PI - time + t2);
  let t4 = sin(uv[0] * 10.0 * PI - time + t3);
  let t5 = sin(uv[1] * 2.0 * PI + time + t4);
  let formafinal = sin(uv[0] * 10.0 * PI + time + t5 + fase) * 0.5 + 0.5;
  
  return formafinal;
}

function drawUI() {
  fill(0, 0, 0, 150);
  rect(5, 5, 300, 60, 5);
  
  fill(255);
  noStroke();
  textSize(14);
  text("Patrón Generativo con Desfase de Fase", 10, 20);
  text("Tiempo: " + time.toFixed(2), 10, 40);
  text("FPS: " + frameRate().toFixed(1), 150, 40);
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
  // Pausar/reanudar animación
  if (key === 'p' || key === 'P') {
    if (isLooping()) {
      noLoop();
    } else {
      loop();
    }
  }
  
  // Capturar frame
  if (key === 's' || key === 'S') {
    save('patron_generativo_' + frameCount + '.png');
  }
  
  // Reiniciar tiempo
  if (key === 'r' || key === 'R') {
    time = 0;
  }
}

function mousePressed() {
  // Cambiar velocidad al hacer click
  if (mouseButton === LEFT) {
    // Alternar entre velocidad normal y rápida
    if (time < 10) {
      time += 5;
    }
  }
}