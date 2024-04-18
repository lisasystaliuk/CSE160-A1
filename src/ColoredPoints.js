// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
  attribute vec4 a_Position;
  uniform float u_Size;
  uniform vec4 u_FragColor;
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
  document.getElementById("drawPineappleButton").onclick = drawPineapple;
  // document.getElementById("drawSnowflakeButton").addEventListener("click", drawSnowflake);
  document.getElementById('drawSnowflakeButton').onclick = function() {
    currentMode = SNOWFLAKE;
  };
}
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 3;
const MY_DRAW = 4;
const SNOWFLAKE = 5;
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
  if (currentMode == SNOWFLAKE) {
    let snowflake = new Snowflake([x, y], currentSize, currentColor.slice()); // Drawing white snowflakes
    shapesList.push(snowflake);
    renderAllShapes();
  }
  else if (currentMode == POINT) {
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
      // Write the positions of vertices to a vertex shader
    var n = initVertexBuffers(gl);
    if (n < 0) {
      console.log('Failed to set the positions of the vertices');
      return;
    }

    // Specify the color for clearing <canvas>
    gl.clearColor(0, 0, 0, 1);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the rectangle
    gl.drawArrays(gl.TRIANGLES, 0, n);
    // renderAllShapes();
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
function drawTriangle(vertices, color) {
  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return;
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Get the attribute location, assign buffer and enable
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.useProgram(shaderProgram);
  // Set the color for the triangle
  gl.uniform4fv(u_FragColor, new Float32Array(color));

  // Draw the triangle
  gl.drawArrays(gl.TRIANGLES, 0, 3); // 3 vertices per triangle
}
function drawPineapple() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, canvas.width, canvas.height);  // Ensure the viewport is correctly set

  const rows = 6;
  const scale = 1.5;
  const xoffset = 0.1 * scale;
  const shift = 0.2 * scale;
  const tX = [-0.1 * scale, 0, 0.1 * scale];
  const tY = [-0.4 * scale, -0.3 * scale, -0.4 * scale];
  const orange = [1.0, 0.65, 0.0, 1.0];
  const yellow = [1.0, 1.0, 0.0, 1.0];
  const orellow = [1.0, 0.825, 0, 1.0]
  var vertices  = [];
  var color = [];
  var yOffset;
  for (let i = 0; i < rows; i++) {
      yOffset = 0.1 * i * scale;
      const currentXoffset = (i % 2 === 0) ? 0 : -xoffset;
      vertices = [
          tX[0] + currentXoffset, tY[0] + yOffset,
          tX[1] + currentXoffset, tY[1] + yOffset,
          tX[2] + currentXoffset, tY[2] + yOffset
      ];
      if(i != rows -1)
      {
        // First triangle vertices (orange)
        color = orange;
        vertices = [tX[1]-shift + currentXoffset, tY[1] + yOffset,
        tX[0] + currentXoffset, tY[0] + yOffset,
        tX[1] + currentXoffset, tY[1] + yOffset];
        gl.uniform4fv(u_FragColor, new Float32Array(color));
        drawTriangle(vertices);
      }
      else
      {
        // Second triangle vertices (yellow)
        color = yellow;
        vertices = [tX[0] + currentXoffset+ shift, tY[0] + yOffset, 
        tX[1] + currentXoffset + shift, tY[1] + yOffset,
        tX[2] + currentXoffset + shift, tY[2] + yOffset];
        gl.uniform4fv(u_FragColor, new Float32Array(color));
        drawTriangle(vertices);
      }
      // Second triangle vertices (yellow)
      color = yellow;
      vertices = [tX[0] + currentXoffset, tY[0] + yOffset, 
      tX[1] + currentXoffset, tY[1] + yOffset,
      tX[2] + currentXoffset, tY[2] + yOffset];
      gl.uniform4fv(u_FragColor, new Float32Array(color));
      drawTriangle(vertices);
      // Third triangle vertices (orange)
      color = orange;
      vertices = [tX[1] + currentXoffset, tY[1] + yOffset,
      tX[2] + currentXoffset, tY[2] + yOffset,
      tX[1] + shift + currentXoffset, tY[1] + yOffset];
      gl.uniform4fv(u_FragColor, new Float32Array(color));
      drawTriangle(vertices);
      if (i != 0 && i != rows - 1) {
          var extraXOffset = currentXoffset + (i % 2 == 0 ? -shift : shift);
          // Fourth triangle (yellow)
          color = yellow;
          vertices = [tX[0] + extraXOffset, tY[0] + yOffset,
          tX[1] + extraXOffset, tY[1] + yOffset,
          tX[2] + extraXOffset, tY[2] + yOffset];
          gl.uniform4fv(u_FragColor, new Float32Array(color));
          drawTriangle(vertices);
          if(i % 2 == 1)
          {   
            color = orange;
            vertices = [tX[1] + extraXOffset, tY[1] + yOffset,
            tX[2] + extraXOffset, tY[2] + yOffset,
            tX[1] + shift + extraXOffset, tY[1] + yOffset];
            gl.uniform4fv(u_FragColor, new Float32Array(color));
            drawTriangle(vertices);
          }
          else 
          {
            color = yellow;
            vertices = [tX[0] + extraXOffset+ 2*shift, tY[0] + yOffset, 
            tX[1] + extraXOffset+ 2*shift, tY[1] + yOffset,
            tX[2] + extraXOffset+ 2*shift, tY[2] + yOffset];
            gl.uniform4fv(u_FragColor, new Float32Array(color));
            drawTriangle(vertices);
            if(i == 2)
            {
              color = orellow;
              vertices = [tX[1] + extraXOffset, tY[1] + yOffset,
              tX[2] + extraXOffset -shift, tY[2] + yOffset,
              tX[2] + extraXOffset - shift, tY[2] + 2*yOffset];
              gl.uniform4fv(u_FragColor, new Float32Array(color));
              drawTriangle(vertices);
              color = orellow;
              vertices = [tX[1] + extraXOffset+ shift, tY[1] + 2*yOffset,
              tX[2] + extraXOffset + 2*shift, tY[2] + yOffset,
              tX[2] + extraXOffset + 2*shift, tY[2] + 2*yOffset];
              gl.uniform4fv(u_FragColor, new Float32Array(color));
              drawTriangle(vertices);
            
            }
          }
        }
      console.log('Drawing triangle with vertices:', vertices, 'and color:', color);
  }
  var startX = tX[0];
  var startY = tY[0]+yOffset+0.15;
  var endX = tX[2];
  var endY = tY[2]+yOffset+ 0.15;
  var startColor = 0.3
  var steps = (1-startColor)/0.1;
  var leaf_color = [0, 0.3, 0.0, 1.0];
  color = leaf_color;
  vertices = [startX, startY,
    0, 1,
    endX, endY];
  gl.uniform4fv(u_FragColor, new Float32Array(color));
  drawTriangle(vertices);
  endX = 0;
  for(let i = 1; i <= steps; i++) {
    color[1] = startColor+0.1*i
    vertices = [startX, startY,
      -0.1*i, 1-0.1*i,
      endX, endY];
    gl.uniform4fv(u_FragColor, new Float32Array(color));
    drawTriangle(vertices);
    vertices = [startX+shift, startY,
      0.1*i, 1-0.1*i,
      endX, endY];
    gl.uniform4fv(u_FragColor, new Float32Array(color));
    drawTriangle(vertices);
  }
}
function drawSnowflake() {
  const points = 6; // Number of points in the snowflake
  const layers = 3; // Number of layers of detail in each arm
  const angleStep = Math.PI / points;

  gl.clear(gl.COLOR_BUFFER_BIT); // Clear the canvas

  for (let i = 0; i < points; i++) {
      let angle = i * 2 * angleStep;
      for (let j = 1; j <= layers; j++) {
          let armLength = j / layers * 0.2; // Scale the length of each arm layer
          let x1 = armLength * Math.cos(angle);
          let y1 = armLength * Math.sin(angle);
          let x2 = armLength * Math.cos(angle + angleStep);
          let y2 = armLength * Math.sin(angle + angleStep);
          drawTriangle([0, 0, x1, y1, x2, y2]);
      }
  }
}
