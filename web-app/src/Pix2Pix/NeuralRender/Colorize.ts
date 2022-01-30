import { IProteinColoringInfo } from ".";

export function colorize(inp, out, tf, proteinColoringInf: IProteinColoringInfo) {
    let compositeMask = makeMask(inp, out, proteinColoringInf.colorStrength);

    if (proteinColoringInf.colorBlend > 0) {
        let blurResoAdjusted = Math.ceil(compositeMask.shape[0] * proteinColoringInf.colorBlend / 1024.0);
        compositeMask = gaussianBlurMask(compositeMask, blurResoAdjusted, tf);
    }

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
    // solidColor.dispose();
    let diffScaled = diff.mul(compositeMaskRGB);
    // diff.dispose();
    // compositeMaskRGB.dispose();
    
    // Scale down by strength
    // let diffScaledScaled = diffScaled.mul(strength);
    
    out = out.add(diffScaled);
    // diffScaledScaled.dispose();
    // diffScaled.dispose();

    // out = tf.stack([zeros, g, zeros]).transpose([1, 2, 0]);
    // return out.mul(mask).div(255);
    // debugger;

    return out;
}

function makeMask(inp, out, strength: number) {
    // Initial grayscale masking of output scene.
    let outMask = grayscaleMask(out);
    
    // Creating mask where protein 1, not protein 0 (binary).
    let inpMask = grayscaleMask(inp).ceil();
    
    // Adjust mask so less strong when far away (per inp image).
    let inpDist = inp.unstack(2)[2].div(255);
    inpDist = inpDist.onesLike(inpDist).sub(inpDist);  // invert

    // Mask where protein is grayscale masked, everything else black
    // (won't change).
    let compositeMask = outMask.mul(inpMask).mul(strength).mul(inpDist);

    outMask.dispose();
    inpMask.dispose();
    inpDist.dispose()

    return compositeMask;
}

function gaussianBlurMask(mask, blur, tf) {
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

            // compositeMask.dispose();
            // scaleSliced.dispose();
            // compositeMaskSliced.dispose();
            // compositeMask = updatedCompositeMask;
        }
    }
    mask = mask.div(maxPossible);
    maskPadded.dispose();

    return mask;
}

function makeSolidColor(color: number[], dimens: number[], tf) {
    let onesChannel = tf.ones(dimens);
    let solidColor = stackColorChannels(
        onesChannel.mul(color[0]), onesChannel.mul(color[1]),
        onesChannel.mul(color[2]), tf
    );
    onesChannel.dispose();
    return solidColor;
}

function grayscaleMask(imgData) {
    let [r, g, b] = imgData.unstack(2);
    let outGrayscaleBW = r.add(g).add(b).div(3);
    return outGrayscaleBW.div(255);  // So 0 to 1
}

function stackColorChannels(r, g, b, tf) {
    return tf
        .stack([r, g, b])
        .transpose([1, 2, 0]);
}