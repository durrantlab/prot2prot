import { store } from '../../VueInterface/Store';
import { makeInMemoryCanvas, getImageDataFromCanvas, drawImageDataOnCanvas } from '../InputImage/ImageDataHelper';
import { loadTfjs, tf } from '../LoadTF';
import Worker from 'web-worker';
import { neuralRenderInWorker } from './WebWorkerSupport';

let inferenceRunning = false;
let webWorker;

export interface IProteinColoringInfo {
    imageDataSimpleForColoring : ImageData | Uint8Array;
    color: string | number[];
    colorStrength: number;
    colorBlend: number;
}

let runWebWorker = function(
    modelPath: string, imageData: ImageData | Uint8Array, 
    proteinColoringInf: IProteinColoringInfo,
    resolveFunc: Function
) {
    // Uses a web worker (default).
    if (webWorker === undefined) {
        webWorker = new Worker("./renderWebWorker.js?" + Math.random().toString());
    }

    if (typeof(Worker) !== "undefined") {
        // Return messages from webworker
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
            "imageData": imageData,
            "proteinColoringInf": proteinColoringInf
        }
    });
}

export function runningInNode() {
    // Run inference without using web workers (for use in nodejs).
    runWebWorker = function(
        modelPath: string, imageData: ImageData | Uint8Array, 
        proteinColoringInf: IProteinColoringInfo, resolveFunc: Function
    ) {
        neuralRenderInWorker(modelPath, imageData, proteinColoringInf, tf)
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

export function neuralRender(
    modelPath: string, inputImageData: ImageData | Uint8Array,
    proteinColoringInf?: IProteinColoringInfo
): Promise<ImageData> {
    // Note that you only need ImageClass if running in node with canvas-node.
    // See
    // https://stackoverflow.com/questions/32666458/node-js-canvas-image-data

    if (inferenceRunning) {
        console.warn("Already running inference...");
        return Promise.resolve(undefined);
    }

    // If color is a string, assume HEX.
    if (proteinColoringInf && typeof(proteinColoringInf.color) === "string") {
        proteinColoringInf.color = hexToRGB(proteinColoringInf.color as string) as number[];
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
                
                // Rendering takes place in web worker.
                runWebWorker(
                    modelPath, inputImageData, proteinColoringInf, resolve
                );
            })
        })
        .then((outputImageDataArray: Float32Array) => {
            // Convert back to tensor.
            let dimen = getDimen(outputImageDataArray);
            newImageDataTensor = tf.tensor(outputImageDataArray, [dimen, dimen, 3]);
            outputCanvas = makeInMemoryCanvas(dimen, "tmp");

            if (inputImageData instanceof Uint8Array) {
                // Probably in nodejs if you get here.
                newImageDataTensor = newImageDataTensor.mul(255);
                return tf.node.encodePng(newImageDataTensor).then((png) => {
                    return new Promise((resolve, reject) => {
                        var ctx = outputCanvas.getContext('2d');
                        // @ts-ignore
                        const img = new ImageClass();
                        img.onload = () => {
                            ctx.drawImage(img, 0, 0);
                            resolve(undefined);
                        }
                        img.onerror = err => { throw err }
                        let buf = Buffer.from(png);
                        img.src = buf;
                    });
                })
            } else {
                // In browser, not nodejs. Simply render it to an in-memory
                // canvas.
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

function hexToRGB(h: string): number[] {
    // Make with help from codex.
    var hex = h.replace('#', '');
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b];
}