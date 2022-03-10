// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

/**
 * Creates a canvas element.
 * @param  {number} sizeX
 * @param  {number} sizeY
 * @returns {*}  The canvas.
 */
var createCanvas: Function = function(sizeX: number, sizeY: number): any { 
    let canvas = document.createElement('canvas');
    canvas.width = sizeX;
    canvas.height = sizeY;
    return canvas;
}

// Use offscreen canvas if available.
if (typeof window !== 'undefined') {
    // So assume running in browser, not nodejs.
    if (HTMLCanvasElement.prototype.transferControlToOffscreen) {
        createCanvas = function(sizeX: number, sizeY: number): any {
            const offscreenCanvas = new OffscreenCanvas(sizeX, sizeY);
            return offscreenCanvas;
        }
    }
}

/**
 * Update the createCanvas function to use a new function. So you can update it
 * if running from node.
 * @param {Function} newFunc  The new function that will be used to create the
 *                            canvas.
 */
export function updateCreateCanvasFunc(newFunc: Function): void {
    createCanvas = newFunc;
}

/**
 * Resize the canvas to the specified size.
 * @param {HTMLCanvasElement} canvas   The canvas element to resize.
 * @param {number}            newSize  The new size of the canvas.
 * @returns {*}  The canvas element.
 */
export function resizeCanvas(canvas: HTMLCanvasElement, newSize: number): HTMLCanvasElement {
   // Need to resize both canvas dimensions (for drawing) and style (for
   // display).
   canvas.width = newSize;
   canvas.height = newSize;
   canvas.style.width = `${0.75 * newSize}px`;  // 0.75 to make resolution look a little better in browser

   return canvas;
}

/**
 * Draws the given ImageData on the given canvas.
 * @param {ImageData}          imageData  The ImageData object that contains the
 *                                        image data to be drawn.
 * @param {HTMLCanvasElement}  canvas     The canvas element to draw the image
 *                                        data on.
 */
export function drawImageDataOnCanvas(imageData: ImageData, canvas: HTMLCanvasElement): void {
    var context = canvas.getContext('2d');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    context.putImageData(imageData, 0, 0);
}

/**
 * Get the image data from the canvas.
 * @param {HTMLCanvasElement} canvas  The canvas
 * @returns {ImageData}  The ImageData object contains the image data.
 */
export function getImageDataFromCanvas(canvas: HTMLCanvasElement): ImageData {
    let imgSize = canvas.width;  // assuming square
    let context = canvas.getContext('2d');
    return context.getImageData(0, 0, imgSize, imgSize);
}

/**
 * Gets the image data from the canvas context.
 * @param {CanvasRenderingContext2D} context  The context.
 * @returns {ImageData}  The ImageData object contains the pixel data for the
 *                       image.
 */
export function getImageDataFromCanvasContext(context: CanvasRenderingContext2D): ImageData {
    let imgSize = context.canvas.width;  // assuming square
    return context.getImageData(0, 0, imgSize, imgSize);
}

/**
 * Create a canvas with the given id and size
 * @param {number} imgSize  The size of the canvas to be generated.
 * @param {string} id       The id of the canvas element.
 * @returns {*}  A canvas element.
 */
export function makeInMemoryCanvas(imgSize: number, id: string): HTMLCanvasElement {
    let canvas = createCanvas(imgSize, imgSize);
    canvas.id = id;
    return canvas;
}

/**
 * Create a canvas context.
 * @param {number} imgSize  The size of the canvas context to be generated.
 * @param {string} id       The id of the canvas element.
 * @returns {CanvasRenderingContext2D}  A CanvasRenderingContext2D object.
 */
export function makeInMemoryCanvasContext(imgSize: number, id: string): CanvasRenderingContext2D {
    let canvas = makeInMemoryCanvas(imgSize, id);
    let context = canvas.getContext('2d');
    return context;
}