import { store } from '../../VueInterface/Store';
import { makeInMemoryCanvas, getImageDataFromCanvas } from '../InputImage/ImageDataHelper';
import { loadTfjs, tf } from '../LoadTF';
import Worker from 'web-worker';
import { neuralRenderInWorker } from './WebWorkerSupport';

let inferenceRunning = false;
let webWorker;

let runWebWorker = function(modelPath, imageData, resolveFunc) {
    // Uses a web worker (default).
    if (webWorker === undefined) {
        webWorker = new Worker("./renderWebWorker.js?" + Math.random().toString());
    }

    if (typeof(Worker) !== "undefined") {
        webWorker.onmessage = (event: MessageEvent) => {
            let data = event.data;

            switch (data["cmd"]) {
                case "inference":
                    inferenceRunning = false;
                    resolveFunc(data["out"] as Float32Array);
                    break;
                case "message":
                    store.commit("setVar", {
                        name: "webWorkerInfo",
                        val: data["msg"]
                    });
            }
        };
    }

    webWorker.postMessage({
        "cmd": "inference",
        "data": {
            "modelPath": modelPath,
            "imageData": imageData
        }
    });
}

export function avoidWorkers() {
    // Run inference without using web workers (for use in nodejs).
    runWebWorker = function(modelPath, imageData, resolveFunc) {
        neuralRenderInWorker(modelPath, imageData, tf)
        .then((outTypedArray) => {
            resolveFunc(outTypedArray);
        });
    };
}

export function neuralRender(modelPath: string, imageData: ImageData): Promise<ImageData> {
    // avoidWorkers()

    if (inferenceRunning) {
        console.warn("Already running inference...");
        return Promise.resolve(undefined);
    }
    
    let outputCanvas;
    inferenceRunning = true;
    let newImageDataTensor;

    return loadTfjs()
        .then(() => {
            return new Promise((resolve, reject) => {
                
                store.commit("setVar", {
                    name: "webWorkerInfo",
                    val: "Sending data to worker thread..."
                });
                
                runWebWorker(modelPath, imageData, resolve);
            })
        })
        .then((imageDataArray) => {
            // Convert back to tensor.
            newImageDataTensor = tf.tensor(imageDataArray, [imageData.width, imageData.width, 3]);
            outputCanvas = makeInMemoryCanvas(imageData.width, "tmp");
            return tf.browser.toPixels(newImageDataTensor, outputCanvas);
        })
        .then(() => {
            // Because outside of tidy.
            newImageDataTensor.dispose();
            let imgData = getImageDataFromCanvas(outputCanvas);
            inferenceRunning = false;

            store.commit("setVar", {
                name: "webWorkerInfo",
                val: undefined
            });
            
            return Promise.resolve(imgData);
        });
}