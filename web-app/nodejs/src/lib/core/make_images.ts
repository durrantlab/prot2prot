const fs = require("fs");
import { InputColorScheme } from "../../../../src/Pix2Pix/InputImage/ColorSchemes/InputColorScheme";
import { drawImageDataOnCanvas, makeInMemoryCanvas } from "../../../../src/Pix2Pix/InputImage/ImageDataHelper";
import { makeImg } from "../../../../src/Pix2Pix/InputImage/MakeImage";
import { getColorPromise } from "./colorize";
import { processIntermediateImage } from "./utils";

export function makeNodeImages(params: any): Promise<any> {
    let newCanvasMain;

    let mainInpImgPromise = makeImg(params.reso, new InputColorScheme())
    .then((imgData) => {
        newCanvasMain = makeInMemoryCanvas(params.reso, "tmp");
        let promise1 = processIntermediateImage(params, imgData, newCanvasMain);
        let promise2 = Promise.resolve(newCanvasMain)
        return Promise.all([promise1, promise2]);
    })

    let colorPromise = getColorPromise(params);

    return Promise.all([mainInpImgPromise, colorPromise]);
}

export function saveOutputImage(params: any, imgOutData: ImageData, newCanvasMain): Promise<any> {
    if (imgOutData !== undefined) {
        drawImageDataOnCanvas(imgOutData, newCanvasMain);
    
        // Save the image
        const out = fs.createWriteStream(params.out_to_use);
        const stream = (newCanvasMain).createPNGStream();
        let p = stream.pipe(out);
        
        return new Promise((resolve, reject) => {
            p.on('finish', function() {
                console.log("    Saved " + params.out_to_use);
                resolve(undefined);
            });
        })
    } else {
        // Could be mode intermediate
        return Promise.resolve(undefined);
    }
}