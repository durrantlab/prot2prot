// importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");
importScripts("./tfjs/tfjs.js");
importScripts("./tfjs/tf-backend-wasm.js");

declare var tf;

tf["wasm"]["setWasmPaths"]({
    'tfjs-backend-wasm.wasm': './tfjs/tfjs-backend-wasm.wasm',
    'tfjs-backend-wasm-simd.wasm': './tfjs/tfjs-backend-wasm-simd.wasm',
    'tfjs-backend-wasm-threaded-simd.wasm': './tfjs/tfjs-backend-wasm-threaded-simd.wasm'
});

// import { loadGraphModel, tf.tidy, tf.browser, tf.expandDims, tf.squeeze, tf.div, tf.sub, tf.mul, tf.add } from '@tensorflow/tfjs';
// import { memory, tensor, profile } from '@tensorflow/tfjs';

// debugger

const ctx: Worker = self as any;
declare var WorkerGlobalScope: any;
let storedModel = {
    path: "",
    model: undefined
};
let out;
let firstRender = true;

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

    let loadModelPromise: Promise<any>;
    if (modelPath !== storedModel.path) {
        if (storedModel.model) {
            storedModel.model.dispose();
        }

        loadModelPromise = tf.ready()
            .then(() => {
                // ? loadLayersModel(modelPath)
                let loadGraph = tf.loadGraphModel(modelPath, {
                    "onProgress"(v) {
                        sendMsg(`Loading Prot2Prot model (${Math.round(100 * v).toString()}%)...`);
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
        console.log("TFJS WebWorker backend: " + backend);

        if (backend.indexOf("webgl") === -1) {
            renderMsg += " Render faster with Chrome, Edge, or Opera.";
        }

        sendMsg(renderMsg);

        out = tf.tidy(() => {
            let data = tf.browser
                .fromPixels(imageData, 3);
    
            const processed = normalize(data);
            const channelFirst = processed.transpose([2, 0, 1])
    
            // Convert to shape [1, 256, 256, 3]
            let batch = tf.expandDims(channelFirst)
    
            let pred = model.predict(batch);  //  as tf.Tensor<tf.Rank> | tf.TensorLike;

            pred = pred.transpose([0, 2, 3, 1]);

            // Convert to shape [256, 256, 3] and unnormalize
            let out = unnormalize(tf.squeeze(pred, [0]));  // was just 0
            
            return tf.div(out, 255);
        });

        return out.data();
    }).then((outArray: number[][]) => {
        out.dispose();
        sendMsg("Sending image data to main thread...");

        return Promise.resolve(outArray);
    });
}

function normalize(t) {
    return tf.sub(tf.div(t, 127.5), 1)
}

function unnormalize(t) {
    return tf.mul(tf.add(t, 1), 127.5)
}
