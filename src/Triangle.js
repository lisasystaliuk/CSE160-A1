// // Triangle.js
// class Triangle {
//   constructor(vertices, color) {
//     this.vertices = vertices;
//     this.color = color;
//   }

//   render(gl) {
//     // Call your drawTriangle function here
//     drawTriangle(gl, this.vertices, this.color);
//   }
// }
// function drawTriangle(gl, vertices, color) {
//     var vertexBuffer = gl.createBuffer();
//     if (!vertexBuffer) {
//       console.log('Failed to create the buffer object');
//       return;
//     }
//     gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  
//     var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
//     gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
//     gl.enableVertexAttribArray(a_Position);
  
//     var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
//     gl.uniform4fv(u_FragColor, color);
  
//     gl.drawArrays(gl.TRIANGLES, 0, 3);
// }
class Triangle {
  constructor(vertices, color) {
    this.vertices = vertices;
    this.color = color;
  }

  render(gl) {
    // Bind the appropriate buffers and draw the triangle
    // This assumes a 'triangle' buffer object is created once and reused
    // The vertices are updated every time this function is called
    if (!this.buffer) {
      this.buffer = gl.createBuffer();
      if (!this.buffer) {
        console.log('Failed to create the buffer object for the triangle');
        return -1;
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.uniform4fv(u_FragColor, this.color);

    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
// Draw the triangle
drawTriangle([0, 0.5, -0.5, -0.5, 0.5, -0.5]);
//gl.drawArrays(gl.TRIANGLES, 0, n);

function drawTriangle(vertices) {
  var vertices = new Float32Array([
    0, 0.5, -0.5, 0.5, 0.5, -0.5
  ]);
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
  //return n;
}
