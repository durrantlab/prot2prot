const fs = require("fs");
import { drawImageDataOnCanvas, makeInMemoryCanvas, updateCreateCanvasFunc } from "../../src/Pix2Pix/InputImage/ImageDataHelper";
import { runningInNode } from "../../src/Pix2Pix/NeuralRender";
import { setupFakeVueXStore } from "../../src/VueInterface/Store";

const Canvas = require('canvas')

export function setNodeMode() {
    // Use the node.js-compatible canvas
    updateCreateCanvasFunc(Canvas.createCanvas);

    // Also prevent vue from throwing errors (not used in nodejs).
    setupFakeVueXStore();
    runningInNode();    
}

export function processIntermediateImage(params, imgData, newCanvas): Uint8Array {
    // Put that image data on a canvas
    drawImageDataOnCanvas(imgData, newCanvas);
    
    // Save that canvas image if needed.
    if (params.debug || params.intermediate) {
        const out = fs.createWriteStream(params.out + '.intermediate.png');
        const stream = (newCanvas as any).createPNGStream()
        stream.pipe(out)
    }

    // Convert the image into a PNG-encoded image in an Uint8Array. See
    // https://js.tensorflow.org/api_node/3.12.0/#node.decodePng 
    let uint8View = new Uint8Array(
        // @ts-ignore
        newCanvas.toBuffer('image/png').buffer
    );

    return uint8View;
}