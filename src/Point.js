class Point {
  constructor(position, color, size) {
    this.type = 'point'
    this.position = position;
    this.color = color;
    this.size = size;
  }

  render() {
    // let xy = this.position;
    // var rgba = this.color;
    // var size = this.size;
    //quit using buffer to send attribute
    gl.disableVertexAttribArray(a_Position);
    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([xy[0],xy[1]]), gl.DYNAMIC_DRAW);
    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, this.position[0], this.position[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    // Set the size for the point
    gl.uniform1f(u_Size, this.size);
    // Draw the point
    gl.drawArrays(gl.POINTS, 0, 1);
    // drawTriangle([this.position[0], this.position[1], this.position[0]+.1, this.position[1], this.position[0], this.position[1]+.1]);
    // drawTriangle([xy[0], xy[1], xy[0] + 0.1, xy[1], xy[0], xy[1] + 0.1]);
  }
}