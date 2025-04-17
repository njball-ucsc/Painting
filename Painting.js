// Instantiate gl and shaders globally
let gl;
let canvas;
let a_Position;
let u_FragColor;
let u_Size
var color = [1.0, 0.0, 0.0, 1.0];
var size = 10;
var queue = [];
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
let type = POINT;
let segments = 10;
let frogDrawn = false;

// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform float u_Size;\n' +
    'void main() {\n' +
    ' gl_Position = a_Position;\n' +
    ' gl_PointSize = u_Size;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +
    'void main() {\n' +
    ' gl_FragColor = u_FragColor;\n' +
    '}\n'; 

function main() {
    // Retrieve canvas
    setupWebGL();

    // Instantiate UI actions
    addHtmlUiActions();

    // Initialize shaders
    connectVariablesToGLSL();
}

function setupWebGL() {
    canvas = document.getElementById('Paint');
    if (!canvas) {
        console.log('Failed to retrieve the canvas');
        return;
    }

    // Retrieve WebGL rendering context
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to retrieve rendering context');
        return;
    }

    // Initialize canvas
    clearCanvas();

    // Event listener for canvas clicks
    canvas.onmousedown = function(ev){ click(ev) };
    canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
}

function addHtmlUiActions() {
    // Sliders
    document.getElementById('redS').addEventListener('mouseup', function()   { color[0] = this.value/100; });
    document.getElementById('greenS').addEventListener('mouseup', function() { color[1] = this.value/100; });
    document.getElementById('blueS').addEventListener('mouseup', function()  { color[2] = this.value/100; });
    document.getElementById('sizeS').addEventListener('mouseup', function()  { size = this.value; });
    document.getElementById('sgmS').addEventListener('mouseup', function() { segments = this.value; });

    // Buttons
    document.getElementById('redB').onclick = function() {
        color = [1.0, 0.0, 0.0, 1.0];
        document.getElementById('redS').value = 100;
        document.getElementById('greenS').value = 0;
        document.getElementById('blueS').value = 0;
    }
    document.getElementById('greenB').onclick = function() {
        color = [0.0, 1.0, 0.0, 1.0];
        document.getElementById('redS').value = 0;
        document.getElementById('greenS').value = 100;
        document.getElementById('blueS').value = 0;
    }
    document.getElementById('blueB').onclick = function() {
        color = [0.0, 0.0, 1.0, 1.0];
        document.getElementById('redS').value = 0;
        document.getElementById('greenS').value = 0;
        document.getElementById('blueS').value = 100;
    }
    document.getElementById('clear').onclick = function() {
        queue = [];
        frogDrawn = false;
        renderAllShapes();
    }
    document.getElementById('pnt').onclick = function() { type = POINT; }
    document.getElementById('tri').onclick = function() { type = TRIANGLE; }
    document.getElementById('cir').onclick = function() { type = CIRCLE; }
    document.getElementById('frog').onclick = drawFrog;
    document.getElementById('spll').onclick = spellCast;
}

function clearCanvas() {
     gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set a black color
     gl.clear(gl.COLOR_BUFFER_BIT);
     if (frogDrawn) { drawFrog(); }
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders');
        return;
    }

    // Get attribute/uniform locations
    a_Position  = gl.getAttribLocation(gl.program, 'a_Position');
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (a_Position < 0 || !u_FragColor || !u_Size) {
        console.error('Failed to get variable locations');
        return;
    }


}

function renderAllShapes() {
    clearCanvas();
    var len = queue.length;
    for(var i = 0; i < len; i++ ) {
        queue[i].render();
    }
}

function click(ev) {
    [x, y] = convertCoordinatesEventToGL(ev);
    const rgba = color;
    const rad = size;

    // Create new shape object
    let shape;
    if (type == POINT) {
        shape = new Point();
    } else if (type == TRIANGLE) {
        shape = new Triangle();
    } else {
        shape = new Circle();
        shape.segments = segments;
    }
    shape.position = [x, y];
    shape.color = rgba.slice();
    shape.size = rad;

    // Push shape to queue
    queue.push(shape);

    // Clear canvas
    clearCanvas();

    // Draw shapes
    renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
    // Convert coordinates
    var x = ev.clientX;
    var y = ev.clientY;
    const rect = ev.target.getBoundingClientRect();
    
    x = ((x - rect.left) - canvas.width/2) / (canvas.width/2);
    y = (canvas.height/2 - (y - rect.top)) / (canvas.height/2);

    return ([x, y]);
}

function drawFrog() {
    frogDrawn = false;

    // Draw unshaded body triangles
    const green = [0.2, 0.8, 0.2, 1.0];
    const frogTriangles = [
        // Body
        [-0.4545, -0.5454, -0.2727, -0.5454, -0.4545, -0.7272],
        [0.4545, -0.5454, 0.2727, -0.5454, 0.4545, -0.7272],
        [-0.4545, -0.4545, -0.6363, -0.4545, -0.4545, -0.7272],
        [0.4545, -0.4545, 0.6363, -0.4545, 0.4545, -0.7272],
        [-0.4545, -0.5454, -0.4545, -0.4545, -0.2727, -0.5454],
        [0.4545, -0.5454, 0.4545, -0.4545, 0.2727, -0.5454],
        [-0.2727, -0.5454, -0.0909, -0.4545, -0.4545, -0.4545],
        [0.2727, -0.5454, 0.0909, -0.4545, 0.4545, -0.4545],
        [-0.6363, -0.4545, 0.6363, -0.4545, -0.6363, -0.0909],
        [0.6363, -0.0909, -0.6363, -0.0909, 0.6363, -0.4545],
        [-0.5454, -0.0909, -0.6363, -0.0909, -0.5454, 0],
        [0.5454, -0.0909, -0.5454, -0.0909, 0.5454, 0.2727],
        [-0.5454, 0.2727, 0.5454, 0.2727, -0.5454, -0.0909]
    ]
    gl.uniform4f(u_FragColor, green[0], green[1], green[2], green[3]);
    frogTriangles.forEach(tri => {
        drawTriangle(tri);
    });

    // Draw most shaded triangles
    const mShaded = [0.0, 0.4, 0.0, 1.0]
    const mShadedTriangles = [
        // Nose
        [-0.0909, 0, -0.0909, 0.0909, -0.1818, 0.0455],
        [0.0909, 0, 0.0909, 0.0909, 0.1818, 0.0455],
        // Mouth
        [-0.1818, -0.0909, 0.1818, -0.0909, -0.1818, -0.1818],
        [0.1818, -0.1818, -0.1818, -0.1818, 0.1818, -0.0909],
        [-0.1818, -0.0909, -0.1818, -0.1818, -0.2727, -0.0909],
        [0.1818, -0.0909, 0.1818, -0.1818, 0.2727, -0.0909],
        [-0.2727, -0.0909, -0.1818, -0.0909, -0.2727, 0],
        [0.2727, -0.0909, 0.1818, -0.0909, 0.2727, 0],
        [-0.2727, 0, -0.4545, 0, -0.2727, -0.0909],
        [0.2727, 0, 0.4545, 0, 0.2727, -0.0909],
        // Right Leg
        [0.6363, -0.4545, 0.6363, -0.2727, 0.7272, -0.2727],
        [0.6363, -0.4545, 0.7272, -0.2727, 0.8181, -0.3636],
        [0.6363, -0.4545, 0.8181, -0.3636, 0.8181, -0.7272],
        [0.6363, -0.4545, 0.8181, -0.7272, 0.7272, -0.8181],
        [0.6363, -0.4545, 0.7272, -0.7272, 0.6363, -0.8181],
        [0.6363, -0.4545, 0.6363, -0.7272, 0.5454, -0.8181],
        [0.6363, -0.4545, 0.6363, -0.7272, 0.4545, -0.7272],
        // Left leg
        [-0.6363, -0.4545, -0.4545, -0.7272, -0.6363, -0.7272],
        [-0.6363, -0.4545, -0.5454, -0.8181, -0.6363, -0.7272],
        [-0.6363, -0.4545, -0.6363, -0.8181, -0.7272, -0.7272],
        [-0.6363, -0.4545, -0.7272, -0.8181, -0.8181, -0.7272],
    ];
    gl.uniform4f(u_FragColor, mShaded[0], mShaded[1], mShaded[2], mShaded[3]);
    mShadedTriangles.forEach(tri => {
        drawTriangle(tri);
    });

    // Draw shaded accessories
    const sBrown = [0.3, 0.1, 0.0, 1.0];
    const sAccTriangles = [
        // Hat rim
        [-0.3636, 0.4545, -0.1818, 0.2727, -0.0909, 0.6363],
        [0.3636, 0.4545, 0.1818, 0.2727, 0.0909, 0.6363],
        [-0.1818, 0.4545, 0.1818, 0.4545, -0.1818, 0.2727],
        [0.1818, 0.2727, -0.1818, 0.2727, 0.1818, 0.4545],
        // Staff handle
        [-0.6363, -0.7272, -0.8181, -0.7272, -0.6363, 0.1818],
        [-0.8181, 0.1818, -0.6363, 0.1818, -0.8181, -0.7272]
    ];
    gl.uniform4f(u_FragColor, sBrown[0], sBrown[1], sBrown[2], sBrown[3]);
    sAccTriangles.forEach(tri => {
        drawTriangle(tri);
    });
    
    // Draw accessories
    const brown = [0.4, 0.2, 0.0, 1.0];
    const accTriangles = [
        // Hat tip
        [-0.1818, 0.4545, 0.1818, 0.4545, 0.0909, 0.7272],
        [-0.0909, 0.7272, -0.1818, 0.4545, 0.0909, 0.7272],
        [0.0909, 0.7272, -0.0909, 0.7272, 0.0909, 0.8181],
        [0.0909, 0.7272, 0.1818, 0.7272, 0.0909, 0.8181],
        // Staff head
        [-0.8181, 0.1818, -0.6363, 0.1818, -0.9090, 0.2727],
        [-0.6363, 0.1818, -0.9090, 0.2727, -0.5454, 0.2727],
        [-0.5454, 0.2727, -0.9090, 0.2727, -0.5454, 0.4545],
        [-0.5454, 0.4545, -0.9090, 0.2727, -0.6363, 0.5454],
        [-0.6363, 0.5454, -0.9090, 0.2727, -0.8181, 0.5454],
        [-0.8181, 0.5454, -0.9090, 0.2727, -0.9090, 0.4545]
    ];
    gl.uniform4f(u_FragColor, brown[0], brown[1], brown[2], brown[3]);
    accTriangles.forEach(tri => {
        drawTriangle(tri);
    });

    // Draw staff gem
    const blue = [0.0, 0.0, 0.8, 1.0];
    const gemTriangles = [
        [-0.7272, 0.2727, -0.8181, 0.3636, -0.7272, 0.4545],
        [-0.7272, 0.2727, -0.6363, 0.3636, -0.7272, 0.4545]
    ];
    gl.uniform4f(u_FragColor, blue[0], blue[1], blue[2], blue[3]);
    gemTriangles.forEach(tri => {
        drawTriangle(tri);
    });

    // Draw eyes
    const eyeTriangles = [
        [-0.2727, 0.0909, -0.1818, 0.1818, -0.1818, 0.2727],
        [0.2727, 0.0909, 0.1818, 0.1818, 0.1818, 0.2727],
        [-0.2727, 0.0909, -0.1818, 0.2727, -0.2727, 0.3636],
        [0.2727, 0.0909, 0.1818, 0.2727, 0.2727, 0.3636],
        [-0.2727, 0.0909, -0.2727, 0.3636, -0.4545, 0.3636],
        [0.2727, 0.0909, 0.2727, 0.3636, 0.4545, 0.3636],
        [-0.2727, 0.0909, -0.4545, 0.3636, -0.5454, 0.2727],
        [0.2727, 0.0909, 0.4545, 0.3636, 0.5454, 0.2727],
        [-0.2727, 0.0909, -0.5454, 0.2727, -0.5454, 0.1818],
        [0.2727, 0.0909, 0.5454, 0.2727, 0.5454, 0.1818],
        [-0.2727, 0.0909, -0.5454, 0.1818, -0.4545, 0.0909],
        [0.2727, 0.0909, 0.5454, 0.1818, 0.4545, 0.0909],
    ];
    gl.uniform4f(u_FragColor, 0.8, 1.0, 0.8, 1.0);
    eyeTriangles.forEach(tri => {
        drawTriangle(tri);
    });

    // Draw pupils
    const pupTriangles = [
        [-0.2727, 0.2273, -0.3182, 0.2727, -0.4090, 0.2727],
        [0.2727, 0.2273, 0.3182, 0.2727, 0.4090, 0.2727],
        [-0.2727, 0.2273, -0.4090, 0.2727, -0.4545, 0.2273],
        [0.2727, 0.2273, 0.4090, 0.2727, 0.4545, 0.2273],
        [-0.2727, 0.2273, -0.4545, 0.2273, -0.4090, 0.1818],
        [0.2727, 0.2273, 0.4545, 0.2273, 0.4090, 0.1818],
        [-0.2727, 0.2273, -0.4090, 0.1818, -0.3182, 0.1818],
        [0.2727, 0.2273, 0.4090, 0.1818, 0.3182, 0.1818],
    ];
    gl.uniform4f(u_FragColor, 0.1, 0.1, 0.1, 1.0);
    pupTriangles.forEach(tri => {
        drawTriangle(tri);
    });

    // Draw shaded frog triangles
    const shaded = [0.0, 0.6, 0.0, 1.0]
    const shadedTriangles = [
        // Belly
        [0.2727, -0.8181,  -0.2727, -0.8181,  0.2727, -0.5454],
        [-0.2727, -0.5454, 0.2727, -0.5454, -0.2727, -0.8181],
        [0.2727, -0.7272, 0.2727, -0.8181, 0.4545, -0.7272],
        [-0.2727, -0.7272, -0.2727, -0.8181, -0.4545, -0.7272],
        [0.2727, -0.7272, 0.4545, -0.7272, 0.2727, -0.5454],
        [-0.2727, -0.7272, -0.4545, -0.7272, -0.2727, -0.5454],
        [-0.0909, -0.5454, -0.2727, -0.5454, -0.0909, -0.4545],
        [0.0909, -0.5454, 0.2727, -0.5454, 0.0909, -0.4545],
        [-0.0909, -0.5454, -0.0909, -0.4545, 0.0909, -0.5454],
        [0.0909, -0.4545, -0.0909, -0.4545, 0.0909, -0.5454],
        // Right arm
        [0.5454, 0, 0.6363, -0.0909, 0.6363, -0.4545],
        [0.5454, 0, 0.6363, -0.4545, 0.5454, -0.3636],
        [0.5454, 0, 0.5454, -0.4545, 0.4545, -0.3636],
        [0.5454, 0, 0.4545, -0.4545, 0.3636, -0.3636],
        // Left fingers
        [-0.8181, -0.0909, -0.6818, -0.1818, -0.8181, -0.1818],
        [-0.8181, -0.1818, -0.6818, -0.2727, -0.8181, -0.2727],
        [-0.8181, -0.2727, -0.6818, -0.3636, -0.8181, -0.3636],
    ];
    gl.uniform4f(u_FragColor, shaded[0], shaded[1], shaded[2], shaded[3]);
    shadedTriangles.forEach(tri => {
        drawTriangle(tri);
    });

    frogDrawn = true;
}

function spellCast() {
    // Generate background gradient
    createRandomGradient();

    // Empty shapes queue and generate new shapes
    queue = [];
    for (let i = 0; i < 25; i++) {
        addRandomShape();
    }

    // Possible special effect
    const effects = [
        () => pulseEffect(),
        () => rippleEffect(),
        () => shakeEffect(),
    ];

    // Pick 1-2
    const effectCount = Math.random() > 0.5 ? (Math.random() > 0.5 ? 3 : 2) : 1;
    for (i = 0; i < effectCount; i++) {
        const randEffect = effects[Math.floor(Math.random() * 3)];
        randEffect();
    }

    renderAllShapes();
}

function createRandomGradient() {
    const gradientTypes = ['linear', 'radial', 'conic'];
    const type = gradientTypes[Math.floor(Math.random() * 3)];

    const color1 = getRandomColor();
    const color2 = getRandomColor();
    const color3 = Math.random() > 0.5 ? getRandomColor() : null;

    let gradientString;
    let pos = 0;

    switch(type) {
        case 'linear':
            const directions = [
                'to top', 'to bottom', 'to left', 'to right', 'to top left',
                'to top right', 'to bottom left', 'to bottom right',
                `${Math.floor(Math.random() * 360)}deg`
            ];
            const dir = directions[Math.floor(Math.random() * directions.length)];
            
            gradientString = color3
                ? `linear-gradient(${dir}, ${color1}, ${color2}, ${color3})`
                : `linear-gradient(${dir}, ${color1}, ${color2})`;
            break;

        case 'radial':
            const shapes = ['circle', 'ellipse'];
            const shape = shapes[Math.floor(Math.random() * 2)];
            const sizeKeywords = [
                'closest-side', 'farthest-side',
                'closest-corner', 'farthest-corner'
            ];

            const size = sizeKeywords[Math.floor(Math.random() * sizeKeywords.length)];
            pos = `${Math.floor(Math.random() * 100)}% ${Math.floor(Math.random() * 100)}%`

            gradientString = color3
                ? `radial-gradient(${shape} ${size} at ${pos}, ${color1}, ${color2}, ${color3})`
                : `radial-gradient(${shape} ${size} at ${pos}, ${color1}, ${color2})`;
            break;

        case 'conic':
            const stAngle = Math.floor(Math.random() * 360);
            pos = `${Math.floor(Math.random() * 100)}% ${Math.floor(Math.random() * 100)}%`;

            gradientString = color3
                ? `conic-gradient(from ${stAngle}deg at ${pos}, ${color1}, ${color2}, ${color3})`
                : `conic-gradient(from ${stAngle}deg at ${pos}, ${color1}, ${color2})`;
            break;
    }

    document.body.style.background = gradientString;
    document.body.style.backgroundBlendMode = [
        'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge',
        'color-burn', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
    ][Math.floor(Math.random() * 14)];
}

function getRandomColor() {
    // Chance for vibrant
    if (Math.random() > 0.33) {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 100%, 50%)`;
    } else {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r}, ${g}, ${b})`;
    }
}

function addRandomShape() {
    // Generate random type
    const shapeTypes = [POINT, TRIANGLE, CIRCLE];
    const randType = shapeTypes[Math.floor(Math.random() * 3)];

    // Generate random position between -1 and 1
    const x = Math.random() * 2 - 1; 
    const y = Math.random() * 2 - 1;
    
    // Generate random size and color
    const randColor = getRandomColorArray();
    const randSize = 20 + Math.random() * 20;

    // Draw shape
    let shape;
    switch(randType) {
        case POINT:
            shape = new Point();
            break;
        case TRIANGLE:
            shape = new Triangle();
            break;
        case CIRCLE:
            shape = new Circle();
            shape.segments = 6 + Math.floor(Math.random() * 7);
            break;
    }

    shape.position = [x, y];
    shape.color = randColor;
    shape.size = randSize;

    queue.push(shape);
}

function getRandomColorArray() {
    return [
        Math.random(),
        Math.random(),
        Math.random(),
        1.0
    ];
}

// Special effects
function pulseEffect() {
    document.body.style.animation = 'pulse 0.5s';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 500);
}

function rippleEffect() {
    const ripple = document.createElement('div');

    // Random Position
    const x = Math.floor(Math.random() * 100);
    const y = Math.floor(Math.random() * 100);

    // Random color
    const rippleColor = getRandomColor();
    const opacity = 0.3 + Math.random() * 0.4;

    ripple.style.cssText = `
        position: fixed;
        top: ${x}%;
        left: ${y}%;
        width: 0;
        height: 0;
        background: ${rippleColor.replace(')', `, ${opacity})`).replace('rgb', 'rgba')};
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        animation: ripple 1s ease-out;
    `;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
}

function shakeEffect() {
    document.body.style.animation = 'shake 0.5s';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 500);
}

