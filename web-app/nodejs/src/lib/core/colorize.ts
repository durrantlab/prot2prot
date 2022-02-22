import { InputColorScheme } from "../../../../src/Pix2Pix/InputImage/ColorSchemes/InputColorScheme";
import { drawImageDataOnCanvas, makeInMemoryCanvas } from "../../../../src/Pix2Pix/InputImage/ImageDataHelper";
import { makeImg } from "../../../../src/Pix2Pix/InputImage/MakeImage";
import { IProteinColoringInfo } from "../../../../src/Pix2Pix/NeuralRender";

export function getColorPromise(params: any) {
    if (params.color) {
        return makeImg(
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
                color: params.color,  // HEX, like "FF0000"
                colorStrength: params.color_strength,
                colorBlend: params.color_blend
            }

            return Promise.resolve(proteinColoringInfo);
        })
    } else {
        return Promise.resolve(undefined);
    }
}