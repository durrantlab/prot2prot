import { store } from '../../VueInterface/Store';
import { makeInMemoryCanvas, getImageDataFromCanvas } from '../InputImage/ImageDataHelper';
import { loadTfjs, tf } from '../LoadTF';

let inferenceRunning = false;
let webWorker;

function setupWebWorker(onmessage: Function): void {
    if (webWorker === undefined) {
        webWorker = new Worker("renderWebWorker.js?" + Math.random().toString());
    }

    if (typeof(Worker) !== "undefined") {
        webWorker.onmessage = (event: MessageEvent) => {
            let data = event.data;
            onmessage(data);
        };
    }
}

export function neuralRender(modelPath: string, imageData: ImageData): Promise<ImageData> {
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
                setupWebWorker((data) => {
                    switch (data["cmd"]) {
                        case "inference":
                            inferenceRunning = false;
                            resolve(data["out"] as Float32Array);
                            break;
                        case "message":
                            store.commit("setVar", {
                                name: "webWorkerInfo",
                                val: data["msg"]
                            });
                    }
                });

                store.commit("setVar", {
                    name: "webWorkerInfo",
                    val: "Sending data to worker thread..."
                });

                webWorker.postMessage({
                    "cmd": "inference",
                    "data": {
                        "modelPath": modelPath,
                        "imageData": imageData
                    }
                });
            });
        })
        .then((imageDataArray) => {
            // return tf.tidy(() => {

            // Convert back to tensor.
            newImageDataTensor = tf.tensor(imageDataArray, [imageData.width, imageData.width, 3]);
            outputCanvas = makeInMemoryCanvas(imageData.width, "tmp");
            return tf.browser.toPixels(newImageDataTensor, outputCanvas);

            // })
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