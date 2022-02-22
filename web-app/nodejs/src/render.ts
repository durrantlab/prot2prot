// For node.js

const fs = require("fs");
import { makeImg, updateRotMat, updateOffsetVec, rotMat, offsetVec, initializeVars } from '../../src/Pix2Pix/InputImage/MakeImage';
import { parsePDB } from '../../src/Pix2Pix/InputImage/PDBParser';
import { drawImageDataOnCanvas, makeInMemoryCanvas } from '../../src/Pix2Pix/InputImage/ImageDataHelper';
import { InputColorScheme } from '../../src/Pix2Pix/InputImage/ColorSchemes/InputColorScheme';
import { IProteinColoringInfo, neuralRender } from '../../src/Pix2Pix/NeuralRender/index';
const Canvas = require('canvas')
import { getParameters } from "./_params";
import { saveDebugTextFiles } from './_debug';
import { processIntermediateImage, setNodeMode } from './_utils';
import { get_rotation_angles } from './_rots';

// Get commandline parameters.
let params = getParameters();

// Because running in nodejs.
setNodeMode();

// Get PDB text.
let pdbTxt = fs.readFileSync(params.pdb).toString();

function transformPDBCoors(rotDist?: number[]) {
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

console.log("\n");

function main(rotDists?: number[][], frame?: number): void {
    if (rotDists === undefined) {
        rotDists = [[params.x_rot, params.y_rot, params.z_rot, params.dist]];
    }

    if (rotDists.length == 0) {
        return;
    }

    if (frame) {
        console.log("Rendering frame " + frame.toString() + "...")
    }

    parsePDB(pdbTxt, params.dist !== 9999, params.radius_scale, params.atom_names)
    .then(() => {
        // coorsTensor.print();

        params.out_to_use = frame 
        ? params.out + "." + ("00000" + frame.toString()).slice(-5) + ".png"
        : params.out;

        transformPDBCoors(rotDists.shift());
        saveDebugTextFiles(params, rotMat, offsetVec)

        // Make the input imagedata.
        let newCanvas;
        let startDrawImgTime = new Date().getTime();
        makeImg(params.reso, new InputColorScheme())
        .then((imgData) => {
            newCanvas = makeInMemoryCanvas(params.reso, "tmp");
            return processIntermediateImage(params, imgData, newCanvas);
        })
        .then((uint8View: Uint8Array) => {
            if (["render", "both"].indexOf(params.mode) === -1) {
                // Skip the rendering step.
                return Promise.resolve();
            }

            // Feed the image data into the neural network.
            // let filename = `../../dist/models/simple_surf/1024/uint8/model.json`;

            // if (this["doColorize"]) {
            let colorInfoDonePromise: Promise<any>;
            if (true) {
                colorInfoDonePromise = makeImg(
                    params.reso,
                    new InputColorScheme(),
                    true  // simplify
                )
                .then((imgData) => {
                    let newCanvas2 = makeInMemoryCanvas(params.reso, "tmp");
                    drawImageDataOnCanvas(imgData, newCanvas2);
                    let uint8View2 = new Uint8Array(
                        // @ts-ignore
                        newCanvas2.toBuffer('image/png').buffer
                    );

                    let proteinColoringInfo: IProteinColoringInfo = {
                        imageDataSimpleForColoring: uint8View2,
                        color: "FF0000",  // HEX
                        colorStrength: 1.0,
                        colorBlend: 8
                    }

                    return Promise.resolve(proteinColoringInfo);
                })
            } else {
                colorInfoDonePromise = Promise.resolve(undefined);
            }

            return colorInfoDonePromise
            .then((proteinColoringInfo: IProteinColoringInfo) => {
                return neuralRender("file://" + params.model_js, uint8View, proteinColoringInfo)
            })
            .then((imgOutData: ImageData) => {
                // if (imgOutData !== undefined) {
                drawImageDataOnCanvas(imgOutData, newCanvas);
                
                // Save the image
                const out = fs.createWriteStream(params.out_to_use);
                const stream = (newCanvas).createPNGStream();
                let p = stream.pipe(out);
                
                return new Promise((resolve, reject) => {
                    p.on('finish', function() {
                        console.log("    Saved " + params.out_to_use);
                        resolve(undefined);
                    });
                })
                // }
            });
        })
        .then(() => {
            let deltaTime = (new Date().getTime() - startDrawImgTime) / 1000;
            console.log("    Render time: " + deltaTime.toString() + " secs\n");

            // Done rendering. Move to next frame if there is one.
            main(rotDists, frame ? frame + 1 : undefined);
        })
    });
}

let [frameNum, rots] = get_rotation_angles(params);

main(rots, frameNum);

