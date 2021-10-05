import { loadGraphModel, tidy, browser, expandDims, squeeze, div, sub, mul, add, disposeVariables } from '@tensorflow/tfjs';

const ctx: Worker = self as any;
declare var WorkerGlobalScope: any;
let storedModel = {
    path: "",
    model: undefined
};
let out;

// @ts-ignore : A strange shim to avoid bootstrap errors in the webworker.
self["document"] = {
    "createElement"() {
        return {"setAttribute"(a, b) {}}
    },
    "head": {"appendChild"(a) {}}
}

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
                    "cmd": "inference",
                    "out": outTypedArray
                });
            });
        }
    };
}

function sendMsg(msg: string): void {
    ctx.postMessage({
        "cmd": "message",
        "msg": msg
    });
}

function neuralRender(modelPath: string, imageData: ImageData) {
    let loadModelPromise = (modelPath !== storedModel.path) 
        // ? loadLayersModel(modelPath)
        ? new Promise((resolve, reject) => {
            if (storedModel.model) {
                storedModel.model.dispose();
            }

            resolve(
                loadGraphModel(modelPath, {
                    "onProgress"(v) {
                        sendMsg(`Loading Prot2Prot model (${Math.round(100 * v).toString()}%)...`);
                    }
                })
            );
        })
        : Promise.resolve(storedModel.model);

    return loadModelPromise.then((model: any) => {
        storedModel.model = model;
        storedModel.path = modelPath;
        
        // tf.setBackend('cpu');
        // console.log(tf.getBackend());

        sendMsg("Rendering image...");

        out = tidy(() => {
            let data = browser
                .fromPixels(imageData, 3);
    
            const processed = normalize(data);
            const channelFirst = processed.transpose([2, 0, 1])
    
            // Convert to shape [1, 256, 256, 3]
            let batch = expandDims(channelFirst)
    
            let pred = model.predict(batch);  //  as tf.Tensor<tf.Rank> | tf.TensorLike;

            pred = pred.transpose([0, 2, 3, 1]);

            // Convert to shape [256, 256, 3] and unnormalize
            let out = unnormalize(squeeze(pred, [0]));  // was just 0
            
            return div(out, 255);
        });

        return out.data();
    }).then((outArray: number[][]) => {
        out.dispose();
        sendMsg("Sending image data to main thread...");
        return Promise.resolve(outArray);
    });
}

function normalize(t) {
    return sub(div(t, 127.5), 1)
}    

function unnormalize(t) {
    return mul(add(t, 1), 127.5)
}    
