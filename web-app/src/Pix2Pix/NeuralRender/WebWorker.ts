// importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");

import { loadGraphModel, tidy, browser, expandDims, squeeze, div, sub, mul, add } from '@tensorflow/tfjs';

const ctx: Worker = self as any;
declare var WorkerGlobalScope: any;
let storedModel = undefined;
let out;

// @ts-ignore : A strange shim to avoid bootstrap errors in the webworker.
self["document"] = {
    "createElement"() {
        return {"setAttribute"(a, b) {}}
    },
    "head": {"appendChild"(a) {}}
}

/** @const {number} */
// const DATA_CHUNK_SIZE = 10000000;

// Determine if we're in a webworker. See
// https://stackoverflow.com/questions/7931182/reliably-detect-if-the-script-is-executing-in-a-web-worker
let inWebWorker = false;
if (typeof WorkerGlobalScope !== "undefined" && ctx instanceof WorkerGlobalScope) {
    inWebWorker = true;
}

// Get the data from the main thread, if webworker.
if (inWebWorker) {
    ctx.onmessage = (e: MessageEvent) => {
        /** @type {string} */
        let cmd = e.data["cmd"];

        const data = e.data["data"];

        if (cmd === "inference") {
            neuralRender(data["modelPath"], data["imageData"])
            .then((outTypedArray) => {
                ctx.postMessage({
                    "out": outTypedArray
                });
            });
        }
    };
}

function neuralRender(modelPath: string, imageData: ImageData) {
    let loadModelPromise = (storedModel === undefined) 
        // ? tf.loadLayersModel(modelPath)
        ? loadGraphModel(modelPath)
        : Promise.resolve(storedModel);

    return loadModelPromise.then((model) => {
        if (storedModel === undefined) {
            storedModel = model;
        }
        
        // tf.setBackend('cpu');
        // console.log(tf.getBackend());

        out = tidy(() => {
            let data = browser
                .fromPixels(imageData, 3);
    
            const processed = normalize(data);
            const channelFirst = processed.transpose([2, 0, 1])

            // processed.print()
    
            // Convert to shape [1,256,256,3]
            let batch = expandDims(channelFirst)
    
            let pred = model.predict(batch);  //  as tf.Tensor<tf.Rank> | tf.TensorLike;

            pred = pred.transpose([0, 2, 3, 1]);

            // Convert to shape [256,256,3] and unnormalize
            let out = unnormalize(squeeze(pred, [0]));  // was just 0
            
            return div(out, 255);
        });

        return out.data();
    }).then((outArray: number[][]) => {
        out.dispose();
        return Promise.resolve(outArray);
    });
}

function normalize(t) {
    return sub(div(t, 127.5), 1)
}    

function unnormalize(t) {
    return mul(add(t, 1), 127.5)
}    
