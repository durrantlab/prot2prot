// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

import { IProteinColoringInfo } from ".";

/**
 * Colorizes an iamge tensor.
 * @param inp  The input tensor.
 * @param out  The output tensor.
 * @param tf   The TensorFlow module.
 * @param {IProteinColoringInfo} proteinColoringInf  The coloring scheme.
 * @returns The output image tensor.
 */
export function colorize(inp: any, out: any, tf: any, proteinColoringInf: IProteinColoringInfo): any {
    let compositeMask = makeMask(inp, out, proteinColoringInf.colorStrength);

    if (proteinColoringInf.colorBlend > 0) {
        let blurResoAdjusted = Math.ceil(compositeMask.shape[0] * proteinColoringInf.colorBlend / 1024.0);
        compositeMask = gaussianBlurMask(compositeMask, blurResoAdjusted, tf);
    }

    // return stackColorChannels(
    //     compositeMask, compositeMask, compositeMask, tf
    // ).mul(255)

    // let debugMaskRGB = stackColorChannels(compositeMask, compositeMask, compositeMask, tf)
    //     .mul(255);

    let compositeMaskRGB = stackColorChannels(
        compositeMask, compositeMask, compositeMask, tf
    );

    // return compositeMaskRGB.mul(255)

    // Create solid color tensor
    let solidColor = makeSolidColor(proteinColoringInf.color as number[], compositeMask.shape, tf);

    // Get the difference between the output and this solid color.
    let diff = solidColor.sub(out);
    let diffScaled = diff.mul(compositeMaskRGB);
    
    out = out.add(diffScaled);

    return out;
}

/**
 * Given an input image and an output image, create a mask that is a composite
 * of a grayscale mask of the output image, a binary mask of the input image,
 * and a distance mask of the input image
 * @param {*}      inp  Input image tensor
 * @param {*}      out  Output image tensor
 * @param {number} strength  The strength of the colorizing effect.
 * @returns {*}  The mask that is returned is a tensor.
 */
function makeMask(inp: any, out: any, strength: number) {
    // Initial grayscale masking of output scene.
    let outMask = grayscaleMask(out);
    
    // Creating mask where protein 1, not protein 0 (binary).
    let inpMask = grayscaleMask(inp).ceil();
    
    // Adjust mask so less strong when far away (per inp image).
    let inpDist = inp.unstack(2)[2].div(255);
    inpDist = inpDist.onesLike(inpDist).sub(inpDist);  // invert

    // Mask where protein is grayscale masked, everything else black (won't
    // change).
    let compositeMask = outMask.mul(inpMask).mul(strength).mul(inpDist);

    outMask.dispose();
    inpMask.dispose();
    inpDist.dispose()

    return compositeMask;
}

/**
 * It takes a mask, and a blur radius, and returns a blurred mask.
 * @param {*}      mask  The mask to blur.
 * @param {number} blur  The radius of the Gaussian blur effect.
 * @param {*}      tf    TensorFlow.js module.
 * @returns {*}  A mask that is blurred.
 */
function gaussianBlurMask(mask: any, blur: number, tf: any) {
    let maskPadded = mask.mirrorPad(
            [[blur, blur],
            [blur, blur]]
        ,
        "reflect"
    );

    let maxPossible = 1;
    for (let ix = -blur; ix <= blur; ix++) {
        let ixSqr = ix * ix;
        for (let iy = -blur; iy <= blur; iy++) {
            if ((ix === 0) && (iy === 0)) {
                // We've already got the central one.
                continue;
            }

            let iySqr = iy * iy;
            let dist = Math.sqrt(ixSqr + iySqr);
            if (dist > blur) { continue; }

            // Linear
            // let distRatio = 1.0 - dist / (blur + 1);

            // Gaussian
            let distRatio = Math.exp(
                -(dist ** 2) / 
                ((0.5 * blur) ** 2)
            );

            maxPossible += distRatio;

            mask = tf.tidy(() => {
                let maskSliced = maskPadded.slice(
                    [blur + ix, blur + iy],
                    mask.shape
                )
                let scaleSlicedByBlurDist = maskSliced.mul(distRatio);
                let maskUpdated = mask.add(scaleSlicedByBlurDist);
                mask.dispose();

                return maskUpdated;
            });
        }
    }
    mask = mask.div(maxPossible);
    maskPadded.dispose();

    return mask;
}

/**
 * Creates a tensor of the given dimensions, and fills it with the given color
 * @param {number[]} color   An array of numbers representing the color.
 * @param {number[]} dimens  The dimensions of the image.
 * @param {*}        tf      The TensorFlow.js module.
 * @returns A tensor representing the solid color.
 */
function makeSolidColor(color: number[], dimens: number[], tf): any {
    let onesChannel = tf.ones(dimens);
    let solidColor = stackColorChannels(
        onesChannel.mul(color[0]), onesChannel.mul(color[1]),
        onesChannel.mul(color[2]), tf
    );
    onesChannel.dispose();
    return solidColor;
}

/**
 * Given an image tensor, return a grayscale version.
 * @param imgData  The image data to be converted to grayscale.
 * @returns {*}  The grayscale image data, a tensor.
 */
function grayscaleMask(imgData): any {
    let [r, g, b] = imgData.unstack(2);
    let outGrayscaleBW = r.add(g).add(b).div(3);
    return outGrayscaleBW.div(255);  // So 0 to 1
}

/**
 * Combines r, g, and b tensors into a single RGB tensor.
 * @param r   The red channel tensor.
 * @param g   The green channel tensor.
 * @param b   The blue channel tensor.
 * @param tf  The TensorFlow module.
 * @returns {*}  A tensor with the R, G, B channels stacked.
 */
function stackColorChannels(r, g, b, tf) {
    return tf
        .stack([r, g, b])
        .transpose([1, 2, 0]);
}