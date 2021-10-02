var createCanvas: Function = function(size: number): any { 
    let canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    return canvas;
}

// Use offscreen canvas if available.
if (HTMLCanvasElement.prototype.transferControlToOffscreen) {
    createCanvas = function(size: number): any {
        const offscreenCanvas = new OffscreenCanvas(size, size);
        return offscreenCanvas;
    }
}

export function updateCreateCanvasFunc(newFunc: Function): void {
    // So you can update it if running from node.
    createCanvas = newFunc;
}

export function resizeCanvas(canvas: HTMLCanvasElement, newSize: number): HTMLCanvasElement {
   // Need to resize both canvas dimensions (for drawing) and style (for
   // display).
   canvas.width = newSize;
   canvas.height = newSize;
   canvas.style.width = `${newSize}px`;
   canvas.style.height = `${newSize}px`;

   return canvas;
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
    let canvas = createCanvas(imgSize);
    // canvas.width = imgSize;
    // canvas.height = imgSize;
    canvas.id = id;
    return canvas;
}

export function makeInMemoryCanvasContext(imgSize: number, id: string): CanvasRenderingContext2D {
    let canvas = makeInMemoryCanvas(imgSize, id);
    let context = canvas.getContext('2d');
    return context;
}