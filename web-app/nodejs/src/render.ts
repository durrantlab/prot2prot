// For node.js

const fs = require("fs");
import { makeImg, updateRotMat, updateOffsetVec, rotMat, offsetVec, initializeVars } from '../../src/Pix2Pix/InputImage/MakeImage';
import { parsePDB } from '../../src/Pix2Pix/InputImage/PDBParser';
import { drawImageDataOnCanvas, makeInMemoryCanvas } from '../../src/Pix2Pix/InputImage/ImageDataHelper';
import { InputColorScheme } from '../../src/Pix2Pix/InputImage/ColorSchemes/InputColorScheme';
import { neuralRender } from '../../src/Pix2Pix/NeuralRender/index';
const Canvas = require('canvas')
import { getParameters } from "./_params";
import { saveDebugTextFiles } from './_debug';
import { processIntermediateImage, setNodeMode } from './_utils';

// Get commandline parameters.
let params = getParameters();

// Because running in nodejs.
setNodeMode();

// Get PDB text.
let pdbTxt = fs.readFileSync(params.pdb).toString();

function transformPDBCoors(z_rot?: number) {
    if (z_rot === undefined) {
        z_rot = params.z_rot;
    }

    // Decide on how to position the PDB
    initializeVars();
    updateRotMat([1, 0, 0], params.x_rot);
    updateRotMat([0, 1, 0], params.y_rot);
    updateRotMat([0, 0, 1], z_rot);
    
    // Distance from camera to protein COG.
    updateOffsetVec(0, 0, params.dist);
}

function main(z_rots?: number[], frame?: number) {
    if (z_rots === undefined) {
        z_rots = [params.z_rot];
    }

    if (z_rots.length == 0) {
        return;
    }

    let z_rot = z_rots.shift();

    parsePDB(pdbTxt)
    .then(() => {
        transformPDBCoors(z_rot);
        saveDebugTextFiles(params, rotMat, offsetVec)
    
        // Make the input imagedata.
        makeImg(params.reso, new InputColorScheme())
        .then((imgData) => {
            let newCanvas = makeInMemoryCanvas(params.reso, "tmp");
            let uint8View = processIntermediateImage(params, imgData, newCanvas);
    
            // Feed the image data into the neural network.
    
            // let filename = `../../dist/models/simple_surf/1024/uint8/model.json`;
            let filename = `models/simple_surf/1024/uint8/model.json`;
    
            let startDrawImgTime = new Date().getTime();
            neuralRender("file://" + filename, uint8View, Canvas.Image)
            .then((imgOutData: ImageData) => {
                // if (imgOutData !== undefined) {
                drawImageDataOnCanvas(imgOutData, newCanvas);
                
                // Save the image
                let outFileName = frame 
                    ? params.out + "." + frame.toString() + ".png"
                    : params.out;
                console.log(outFileName);
                const out = fs.createWriteStream(outFileName);
                const stream = (newCanvas as any).createPNGStream()
                let p = stream.pipe(out)
                
                return new Promise((resolve, reject) => {
                    p.on('finish', function() {
                        resolve(undefined);
                    });
                })
                // }
            })
            .then(() => {
                let deltaTime = (new Date().getTime() - startDrawImgTime) / 1000;
                console.log("Render time: " + deltaTime.toString() + " secs");

                // Done rendering. Move to next frame if there is one.
                main(z_rots, frame ? frame + 1 : undefined);
            })
        });
    });
}

let z_rots: number[] = undefined;
let frame: number = undefined;
if (params.turn_table) {
    z_rots = [];
    for (let i = 0; i < 360; i = i + 1) {
        z_rots.push(i);
    }
    frame = 1;
}

main(z_rots, frame);

