class Snowflake {
  constructor(position, size, color) {
    this.position = position; // Expected to be an array [x, y]
    this.size = size;         // Relative size of the snowflake
    this.color = color;       // Color array [r, g, b, a]
  }

  render() {
    const points = 6; // Number of points in the snowflake
    const layers = 3; // Number of layers of detail in each arm
    const angleStep = Math.PI / points;

    for (let i = 0; i < points; i++) {
      let angle = i * 2 * angleStep;
      for (let j = 1; j <= layers; j++) {
        let armLength = j / layers *(this.size*0.01); // Scale the length of each arm layer
        let x1 = this.position[0] + armLength * Math.cos(angle);
        let y1 = this.position[1] + armLength * Math.sin(angle);
        let x2 = this.position[0] + armLength * Math.cos(angle + angleStep);
        let y2 = this.position[1] + armLength * Math.sin(angle + angleStep);
        
        // Drawing each triangle of the snowflake
        drawTriangle([this.position[0], this.position[1], x1, y1, x2, y2], this.color);
      }
    }
  }
}

function drawTriangle(vertices, color) {
  // Create a buffer object, bind it, write data, link it to the attribute, and draw it
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // Set color for the snowflake
  var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  gl.uniform4fv(u_FragColor, new Float32Array(color));

  // Draw the triangle
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}