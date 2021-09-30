var createCanvas: Function = function() { return document.createElement('canvas'); }

// Use offscreen canvas if available.
if (HTMLCanvasElement.prototype.transferControlToOffscreen) {
    createCanvas = function() {
        const offscreenCanvas = new OffscreenCanvas(256, 256);
        return offscreenCanvas;
    }
}

export function updateCreateCanvasFunc(newFunc: Function): void {
    // So you can update it if running from node.
    createCanvas = newFunc;
}

export function drawImageDataOnCanvas(imageData: ImageData, canvas: HTMLCanvasElement): void {
    var context = canvas.getContext('2d');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    context.putImageData(imageData, 0, 0);
}

export function getImageDataFromCanvas(canvas: HTMLCanvasElement): ImageData {
    let imgSize = canvas.width;  // assuming square
    let context = canvas.getContext('2d');
    return context.getImageData(0, 0, imgSize, imgSize);
}

export function getImageDataFromCanvasContext(context: CanvasRenderingContext2D): ImageData {
    let imgSize = context.canvas.width;  // assuming square
    return context.getImageData(0, 0, imgSize, imgSize);
}

export function makeInMemoryCanvas(imgSize: number, id: string): HTMLCanvasElement {
    let canvas = createCanvas();
    canvas.width = imgSize;
    canvas.height = imgSize;
    canvas.id = id;
    return canvas;
}

export function makeInMemoryCanvasContext(imgSize: number, id: string): CanvasRenderingContext2D {
    let canvas = makeInMemoryCanvas(imgSize, id);
    let context = canvas.getContext('2d');
    return context;
}