class Point{
    constructor(){
        this.type='point';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 0.0, 0.0, 1.0];
        this.size = 10;
    }

    render() {
        // Pass position, color, and size to WebGL then draw
        const xy = this.position;
        const rgba = this.color;
        const rad = this.size;

        // Quit buffer for point attribute
        gl.disableVertexAttribArray(a_Position);
        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_Size, rad);

        gl.drawArrays(gl.POINTS, 0, 1);
    }
}