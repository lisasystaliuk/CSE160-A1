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
let currentColor = [1.0, 1.0, 1.0, 1.0]; // Default color: white
let currentSize = 10;
let shapesList = [];
let currentMode = 'point'; // Can be 'point' or 'triangle' or circle
function main() {
  setupWebGL();
  connectVariablesToGLSL();

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

  document.getElementById("clearCanvas").onclick = function() {
    // clear the shapes list
    shapesList = [];
    // redraw the canvas
    renderAllShapes();
  };
  document.getElementById('modePoint').onclick = function() {
    currentMode = 'point';
  };

  document.getElementById('modeTriangle').onclick = function() {
    currentMode = 'triangle';
  };
  // document.getElementById('modeCircle').onclick = function() {
  //   currentMode = 'circle';
  // };
  document.getElementById("redSlider").oninput = updateColor;
  document.getElementById("greenSlider").oninput = updateColor;
  document.getElementById("blueSlider").oninput = updateColor;

  document.getElementById("sizeSlider").oninput = function() {
    currentSize = parseFloat(this.value);
  };
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

  if (currentMode === 'point') {
    let point = new Point([x, y], currentColor.slice(), currentSize);
    shapesList.push(point);
  } else if (currentMode === 'triangle') {
    // You will need to define how to get the vertices for the triangle
    let triangleVertices = [x, y, x + 0.1, y - 0.1, x - 0.1, y - 0.1];
    let triangle = new Triangle(triangleVertices, currentColor.slice());
    shapesList.push(triangle);
  }
  // else if(currentMode === 'circle') {
  //   let triangle = new Triangle(triangleVertices, currentColor.slice());
  //   shapesList.push(triangle);
  // }
  // // Store the coordinates to g_points array
  // g_points.push([x, y]);
  // g_sizes.push(currentSize);
  // // Use the currentColor for the color of the clicked point
  // g_colors.push(currentColor.slice()); // slice to copy the currentColor array
  // Create a new Point object with the current settings and add it to shapesList
  // let point = new Point([x, y], currentColor.slice(), currentSize);
  // shapesList.push(point);
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
  
  // var len = g_points.length;
  // for(var i = 0; i < len; i++) {
  //   var xy = g_points[i];
  //   var rgba = g_colors[i];
  //   var size = g_sizes[i];

  //   // Pass the position of a point to a_Position variable
  //   gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
  //   // Pass the color of a point to u_FragColor variable
  //   gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  //   // Set the size for the point
  //   gl.uniform1f(u_Size, size);
  //   // Draw
  //   gl.drawArrays(gl.POINTS, 0, 1);
  // }
  // Iterate over shapesList and call render on each Point
  shapesList.forEach((shape) => {
    shape.render(gl);
  });
  let endTime = performance.now();
  // console.log(`Render time: ${endTime - startTime} milliseconds`);
}
