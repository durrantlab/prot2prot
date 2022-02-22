const fs = require("fs");
const Canvas = require('canvas')

import { offsetVec, rotMat } from "../../../../src/Pix2Pix/InputImage/MakeImage";
import { parsePDB } from "../../../../src/Pix2Pix/InputImage/PDBParser";
import { IProteinColoringInfo, neuralRender } from "../../../../src/Pix2Pix/NeuralRender";
import { saveDebugTextFiles } from "./debug";
import { IHooks } from "./hooks";
import { makeNodeImages, saveOutputImage } from "./make_images";
import { getParameters } from "./params/params";
import { setNodeMode, transformPDBCoors } from "./utils";

export function main(hooks: IHooks) {
    // Get commandline parameters.
    let params = getParameters(hooks);

    // Because running in nodejs.
    setNodeMode();

    // Get PDB text.
    let pdbTxt = fs.readFileSync(params.pdb).toString();

    console.log("\n");

    let [frameNum, rots] = hooks.rotationAngles(params);

    renderFrame(params, pdbTxt, rots, frameNum);
}

export function renderFrame(params: any, pdbTxt: string, rotDists?: number[][], frame?: number): void {
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

        transformPDBCoors(params, rotDists.shift());
        saveDebugTextFiles(params, rotMat, offsetVec)

        // Make the input imagedata.
        // let newCanvas;
        let startDrawImgTime = new Date().getTime();
        let newCanvasMain;

        makeNodeImages(params)
        .then((payload): Promise<any> => {
            if (["render", "both"].indexOf(params.mode) === -1) {
                // Skip the rendering step.
                return Promise.resolve(undefined);
            }
    
            // Unpack payload
            let payloadMain = payload[0];
            let uint8View: Uint8Array = payloadMain[0];
            newCanvasMain = payloadMain[1];
            let proteinColoringInfo: IProteinColoringInfo = payload[1];

            // Feed the image data into the neural network.
            // let filename = `../../dist/models/simple_surf/1024/uint8/model.json`;

            // Render the image
            return neuralRender("file://" + params.model_js, uint8View, proteinColoringInfo, Canvas.Image);
        })
        .then((imgOutData: ImageData) => {
            saveOutputImage(params, imgOutData, newCanvasMain);
        })
        .then(() => {
            let deltaTime = (new Date().getTime() - startDrawImgTime) / 1000;
            console.log("    Render time: " + deltaTime.toString() + " secs\n");

            // Done rendering. Move to next frame if there is one.
            renderFrame(params, pdbTxt, rotDists, frame ? frame + 1 : undefined);
        })
    });
}
