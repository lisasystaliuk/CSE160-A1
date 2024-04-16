// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  // if (!gl) {
  //   console.log('Failed to get the rendering context for WebGL');
  //   return;
  // }
  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL()
{
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  // Retrieve the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}
function addActionsforHtmlUI()
{
  document.getElementById("clearCanvas").onclick = function() {
    // clear the shapes list
    shapesList = [];
    // redraw the canvas
    renderAllShapes();
  };
  document.getElementById('modePoint').onclick = function() {
    currentMode = POINT;
  };

  document.getElementById('modeTriangle').onclick = function() {
    currentMode = TRIANGLE;
  };
  document.getElementById('modeCircle').onclick = function() {
    currentMode = CIRCLE;
  };
  document.getElementById("redSlider").oninput = updateColor;
  document.getElementById("greenSlider").oninput = updateColor;
  document.getElementById("blueSlider").oninput = updateColor;

  document.getElementById("sizeSlider").oninput = function() {
    currentSize = parseFloat(this.value);
  };
  document.getElementById("segmentsSlider").oninput = function() {
    currentSegments = parseInt(this.value); // Update the global variable controlling segments
  };
  document.getElementById("drawPineappleButton").onclick = function() {
    currentMode = MY_DRAW;
};
}
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 3;
const MY_DRAW = 4;
let currentColor = [1.0, 1.0, 1.0, 1.0]; // Default color: white
let currentSize = 10;
let shapesList = [];
let currentMode = POINT; // Can be POINT or TRIANGLE or CIRCLE
let currentSegments = 10;

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsforHtmlUI();

  // Register function (event handler) to be called on a mouse press
  // canvas.onmousedown = click;
  canvas.onmousedown = function(ev) { // Mouse is pressed
    click(ev);
  };

  canvas.onmousemove = function(ev) { // Mouse is moving
    if (ev.buttons === 1) { // Check if the left button is being pressed
      click(ev);
    }
  };


  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function updateColor() {
  var red = parseFloat(document.getElementById('redSlider').value);
  var green = parseFloat(document.getElementById('greenSlider').value);
  var blue = parseFloat(document.getElementById('blueSlider').value);
  currentColor = [red, green, blue, 1.0];
}

var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = [];
function click(ev) {
  [x,y] = convertCoordinatesEventToGL(ev);
  if (currentMode == POINT) {
    let point = new Point([x, y], currentColor.slice(), currentSize);
    shapesList.push(point);
  } else if (currentMode == TRIANGLE) {
    let triangle = new Triangle([x,y], currentColor.slice(), currentSize);
    shapesList.push(triangle);
  }
  else if(currentMode == CIRCLE) {
    let circle = new Circle([x,y], currentColor.slice(), currentSize, currentSegments);
    shapesList.push(circle);
  }
  else if(currentMode == MY_DRAW) {
    drawPineapple();
  }
  renderAllShapes();
}
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return([x,y]);
}
function renderAllShapes()
{
  let startTime = performance.now();
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  var len = shapesList.length;
  for(var i = 0; i < len; i++) {
    shapesList[i].render();
  }
  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: "+ len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
  // console.log(`Render time: ${endTime - startTime} milliseconds`);
}
function sendTextToHTML(text, htmlID)
{
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
function drawPineapple() {
  // shapesList = []; // Clear the current list of shapes to prepare for the new drawing.

  // // Pineapple body with different shades of orange
  // const bodyColor = [
  //     [1.0, 0.5, 0.0, 1.0], // Light orange
  //     [1.0, 0.6, 0.0, 1.0], // Medium orange
  //     [1.0, 0.4, 0.0, 1.0]  // Dark orange
  // ];
  // let baseX = 0, baseY = -0.5; // Starting point of the pineapple body
  // let segmentHeight = 0.05, maxWidth = 0.3;

  // // Draw triangles for the body
  // for (let i = 0; i < 15; i++) {
  //     let width = maxWidth * (1 - Math.abs(i - 7.5) / 10);
  //     let color = bodyColor[i % bodyColor.length];
  //     shapesList.push(new Triangle([baseX, baseY + i * segmentHeight, baseX + width, baseY + (i + 1) * segmentHeight, baseX - width, baseY + (i + 1) * segmentHeight], color));
  // }

  // // Pineapple leaves with shades of green
  // const leafColor = [0.0, 0.5, 0.0, 1.0];
  // let leafHeight = 0.1, leafWidth = 0.1;
  // let leafStartY = baseY + 15 * segmentHeight;

  // // Draw triangles for the leaves
  // for (let i = 0; i < 5; i++) {
  //     shapesList.push(new Triangle([baseX, leafStartY + i * leafHeight, baseX + leafWidth, leafStartY + i * leafHeight - leafHeight / 2, baseX - leafWidth, leafStartY + i * leafHeight - leafHeight / 2], leafColor));
  // }

  // renderAllShapes();

  var height = 0.1; // Triangle height
  var baseWidth = 0.2; // Width of the triangle base

  // Defining vertices for an isosceles triangle
  var vertices = [
      0, height,          // Top vertex (middle top)
      -baseWidth / 2, 0,  // Bottom left vertex
      baseWidth / 2, 0    // Bottom right vertex
  ];

  // Set the color for the triangle
  gl.uniform4f(u_FragColor, 1.0, 0.5, 0.0, 1.0); // Orange color

  // Call drawTriangle with correct vertices
  drawPinSegm();

  // Refresh the canvas
  renderAllShapes();

}
function drawPinSegm() {
  var vertices = new Float32Array([
    0.0,  0.5,  // Top vertex
   -0.5, -0.5,  // Left vertex
    0.5, -0.5   // Right vertex
  ]);

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    alert('Failed to create the buffer object');
    return;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // Set the color
  gl.uniform4f(u_FragColor, 1.0, 0.5, 0.0, 1.0);  // Orange color

  // Draw the triangle
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

