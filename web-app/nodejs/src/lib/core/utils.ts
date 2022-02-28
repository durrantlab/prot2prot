const fs = require("fs");
import { drawImageDataOnCanvas, makeInMemoryCanvas, updateCreateCanvasFunc } from "../../../../src/Pix2Pix/InputImage/ImageDataHelper";
import { initializeVars, updateOffsetVec, updateRotMat } from "../../../../src/Pix2Pix/InputImage/MakeImage";
import { runningInNode } from "../../../../src/Pix2Pix/NeuralRender";
import { setupFakeVueXStore } from "../../../../src/VueInterface/Store";

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

export function transformPDBCoors(params: any, rotDist?: number[]) {
    if (rotDist === undefined) {
        rotDist = [params.x_rot, params.y_rot, params.z_rot, params.dist];
    }

    // Decide on how to position the PDB
    initializeVars();
    updateRotMat([1, 0, 0], rotDist[0]);
    updateRotMat([0, 1, 0], rotDist[1]);
    updateRotMat([0, 0, 1], rotDist[2]);
    
    // Distance from camera to protein COG.
    if (params.dist !== 9999) {
        updateOffsetVec(0, 0, rotDist[3]);
    }
}

export function extendFrames(frames: string[], numFrames: number): string[] {
    if (frames.length > numFrames) {
        return frames.slice(0, numFrames);
    }

    while (frames.length < numFrames) {
        frames.push(frames[frames.length - 1]);
    }

    return frames;
}

export function scaleFrames(frames: string[], targetNumFrames: number): string[] {
    let currentNumFrames = frames.length;

    if (targetNumFrames !== currentNumFrames) {
        console.log(`WARNING: You have requested ${targetNumFrames} output frame(s), but your PDB file has ${currentNumFrames} frame(s). I will duplicate or stride the PDB frames to produce your requested ${targetNumFrames} output frame(s).\n`)
    }

    let newFrames: string[] = [];

    for (let newFramesIdx = 0; newFramesIdx < targetNumFrames; newFramesIdx++) {
        let framesIdx = Math.round((currentNumFrames - 1) * newFramesIdx / (targetNumFrames - 1));
        if (isNaN(framesIdx)) {
            // Happens if --frames = 1, for example.
            framesIdx = 0;
        }
        newFrames[newFramesIdx] = frames[framesIdx];
    }

    return newFrames;
}