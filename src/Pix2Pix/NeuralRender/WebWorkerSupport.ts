// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

// These functions are in a separate file because sometimes you might want to
// access them outside a webworker as well (e.g., for use in nodejs).

import { IProteinColoringInfo } from ".";
import { colorize } from "./Colorize";

let storedModel = {
    path: "",
    model: undefined
};
let out;
let firstRender = true;

/**
 * Rendering in the webworker.
 * @param {string}                modelPath             The path to the model.
 * @param {ImageData|Uint8Array}  inputImageData        The input image data
 *                                                      (tensor).
 * @param {IProteinColoringInfo}  [proteinColoringInf]  The coloring scheme.
 * @param {*}                     tf                    The TensorFlow.js
 *                                                      module.
 * @param {Function}              sendMsgFunc           A function that takes a
 *                                                      string as an argument
 *                                                      and sends it to the main
 *                                                      thread.
 * @returns {Promise}  A promise that resolves the output of the neural network
 *                     (a JavaScript array).
 */
export function neuralRenderInWorker(
    modelPath: string, imageData: ImageData | Uint8Array, 
    proteinColoringInf: IProteinColoringInfo,
    tf: any, sendMsgFunc: Function=undefined
): Promise<any> {
    let loadModelPromise: Promise<any>;
    if (modelPath !== storedModel.path) {
        if (storedModel.model) {
            storedModel.model.dispose();
        }

        loadModelPromise = tf.ready()
            .then(() => {
                let loadGraph = tf.loadGraphModel(modelPath, {
                    "onProgress"(v) {
                        if (sendMsgFunc) {
                            sendMsgFunc(`Loading Prot2Prot model (${Math.round(100 * v).toString()}%)...`);
                        }
                    }
                });
                return Promise.resolve(loadGraph);
            });
    } else {
        loadModelPromise = Promise.resolve(storedModel.model);
    }

    return loadModelPromise.then((model: any) => {
        storedModel.model = model;
        storedModel.path = modelPath;

        // tf.setBackend('cpu');

        let renderMsg = "Rendering image...";
    
        if (firstRender) {
            renderMsg += " First render takes longer.";
            firstRender = false;
        }

        let backend = tf.getBackend();
        
        if (backend.indexOf("webgl") === -1) {
            renderMsg += " Render faster with Chrome, Edge, or Opera.";
        }
        
        renderMsg += "\n\nTFJS backend: " + backend + ".";

        if (sendMsgFunc) {
            sendMsgFunc(renderMsg);
        }

        out = tf.tidy(() => {
            let inp;
            if (imageData instanceof Uint8Array) {
                // Probably running in nodejs, not the browser.
                inp = tf.node.decodePng(imageData, 3);
            } else {
                // Probably running in the browser, using ImageData.
                inp = tf.browser.fromPixels(imageData, 3);
            }
            
            const processed = normalize(inp, tf);
            const channelFirst = processed.transpose([2, 0, 1]);
            processed.dispose();
    
            // Convert to shape [1, N, N, 3]
            let batch = tf.expandDims(channelFirst)
            let pred = model.predict(batch);  //  as tf.Tensor<tf.Rank> | tf.TensorLike;
            batch.dispose();

            pred = pred.transpose([0, 2, 3, 1]);

            // Convert to shape [N, N, 3] and unnormalize
            let out = unnormalize(tf.squeeze(pred, [0]), tf);  // was just 0
            pred.dispose();

            // TESTING
            // let [r, g, b] = out.unstack(2);
            // let outGrayscaleBW = r.add(g).add(b).div(3);
            // let outGrayscaleRGB = tf.stack([outGrayscaleBW, outGrayscaleBW, outGrayscaleBW])
            //     .transpose([1, 2, 0]);

            let inpSimpForColoring;
            if (proteinColoringInf && (proteinColoringInf.imageDataSimpleForColoring !== null) && (proteinColoringInf.imageDataSimpleForColoring !== undefined)) {

                if (proteinColoringInf.imageDataSimpleForColoring instanceof Uint8Array) {
                    // Probably running in nodejs, not the browser.
                    inpSimpForColoring = tf.node.decodePng(proteinColoringInf.imageDataSimpleForColoring, 3);
                } else {
                    // Probably running in the browser, using ImageData.
                    inpSimpForColoring = tf.browser.fromPixels(proteinColoringInf.imageDataSimpleForColoring, 3);
                }
                out = colorize(inpSimpForColoring, out, tf, proteinColoringInf);
                return tf.div(out, 255);
            }

            return tf.div(out, 255);
        });

        return out.data();
    }).then((outArray: number[][]) => {
        out.dispose();
        if (sendMsgFunc) {
            sendMsgFunc("Sending image data to main thread...");
        }

        return Promise.resolve(outArray);
    });
}

/**
 * Normalize the tensor t.
 * @param {*} t   The tensor to be normalized
 * @param {*} tf  The tensorflow module
 * @returns The normalized tensor.
 */
function normalize(t: any, tf: any): any {
    return tf.sub(tf.div(t, 127.5), 1)
}

/**
 * Undo normalization of the tensor t.
 * @param {*} t   The normalized tensor tensor to be normalized
 * @param {*} tf  The tensorflow module
 * @returns The unnormalized tensor.
 */
function unnormalize(t: any, tf: any): any {
    return tf.mul(tf.add(t, 1), 127.5)
}

