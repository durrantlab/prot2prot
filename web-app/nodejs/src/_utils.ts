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

export function processIntermediateImage(params, imgData, newCanvas): Promise<Uint8Array> {
    // Put that image data on a canvas
    drawImageDataOnCanvas(imgData, newCanvas);
    
    // Convert the image into a PNG-encoded image in an Uint8Array. See
    // https://js.tensorflow.org/api_node/3.12.0/#node.decodePng 
    let uint8View = new Uint8Array(
        // @ts-ignore
        newCanvas.toBuffer('image/png').buffer
    );

    // Save that canvas image if needed.
    if (["intermediate", "both"].indexOf(params.mode) !== -1) {
        const out = fs.createWriteStream(params.out_to_use + '.intermediate.png');
        const stream = (newCanvas as any).createPNGStream()
        let p = stream.pipe(out)

        return new Promise((resolve, reject) => {
            p.on('finish', function() {
                console.log("    Saved " + params.out_to_use + '.intermediate.png');
                resolve(uint8View);
            });
        })
    }

    return Promise.resolve(uint8View);
}