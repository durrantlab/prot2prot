import { store } from '../../VueInterface/Store';
import { makeInMemoryCanvas, getImageDataFromCanvas, drawImageDataOnCanvas } from '../InputImage/ImageDataHelper';
import { loadTfjs, tf } from '../LoadTF';
import Worker from 'web-worker';
import { neuralRenderInWorker } from './WebWorkerSupport';

let inferenceRunning = false;
let webWorker;

let runWebWorker = function(modelPath: string, imageData: ImageData | Uint8Array, resolveFunc: Function) {
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

export function runningInNode() {
    // Run inference without using web workers (for use in nodejs).
    runWebWorker = function(modelPath: string, imageData: ImageData | Uint8Array, resolveFunc: Function) {
        neuralRenderInWorker(modelPath, imageData, tf)
        .then((outTypedArray) => {
            resolveFunc(outTypedArray);
        });
    };
}

function getDimen(imageData: ImageData | Float32Array): number {
    if (imageData instanceof Float32Array) {
        return Math.round(Math.sqrt(imageData.length / 3));
    } else {
        return imageData.width;
    }
}

export function neuralRender(modelPath: string, inputImageData: ImageData | Uint8Array, ImageClass = undefined): Promise<ImageData> {
    // Note that you only need ImageClass if running in node with canvas-node.
    // See
    // https://stackoverflow.com/questions/32666458/node-js-canvas-image-data

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
                
                runWebWorker(modelPath, inputImageData, resolve);
            })
        })
        .then((outputImageDataArray: Float32Array) => {
            // Convert back to tensor.
            let dimen = getDimen(outputImageDataArray);
            newImageDataTensor = tf.tensor(outputImageDataArray, [dimen, dimen, 3]);
            outputCanvas = makeInMemoryCanvas(dimen, "tmp");

            // console.log(outputCanvas);

            if (inputImageData instanceof Uint8Array) {
                // Probably in node
                newImageDataTensor = newImageDataTensor.mul(255);
                return tf.node.encodePng(newImageDataTensor).then((png) => {
                    return new Promise((resolve, reject) => {
                        var ctx = outputCanvas.getContext('2d');
                        const img = new ImageClass()
                        img.onload = () => {
                            ctx.drawImage(img, 0, 0);

                            // Debug
                            // tf.browser.fromPixels(outputCanvas).print();

                            resolve(undefined);
                        }
                        img.onerror = err => { throw err }
                        let buf = Buffer.from(png);
                        img.src = buf;
                    });
                })
            } else {
                // In browser. Render it to an in-memory canvas.
                return tf.browser.toPixels(newImageDataTensor, outputCanvas);
            }
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