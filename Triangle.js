class Triangle {
    constructor() {
        this.type = 'triangle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 0.0, 0.0, 1.0];
        this.size = 10;
    }

    render() {
        var xy = this.position;
        var rgba = this.color;
        var rad = this.size;

        // Pass color and size to WebGL then draw
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_Size, rad);

        var d = this.size/200.0;
        drawTriangle( [xy[0], xy[1], xy[0]+d, xy[1], xy[0], xy[1]+d] );
    }
}

function drawTriangle(vertices) {
    var n = 3;

    // Create buffer
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer');
        return -1;
    }

    // Bind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}