// These functions are in a separate file because sometimes you might want to
// access them outside a webworker as well (e.g., for use in nodejs).

let storedModel = {
    path: "",
    model: undefined
};
let out;
let firstRender = true;

export function neuralRenderInWorker(modelPath: string, imageData: ImageData, tf, sendMsgFunc=undefined): Promise<any> {
    console.log(modelPath);

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
        console.log("TFJS WebWorker backend: " + backend);

        if (backend.indexOf("webgl") === -1) {
            renderMsg += " Render faster with Chrome, Edge, or Opera.";
        }

        if (sendMsgFunc) {
            sendMsgFunc(renderMsg);
        }

        out = tf.tidy(() => {
            console.log(Object.keys(imageData));
            let data = tf.browser.fromPixels(imageData, 3);
    
            const processed = normalize(data, tf);
            const channelFirst = processed.transpose([2, 0, 1])
    
            // Convert to shape [1, 256, 256, 3]
            let batch = tf.expandDims(channelFirst)

            let pred = model.predict(batch);  //  as tf.Tensor<tf.Rank> | tf.TensorLike;

            pred = pred.transpose([0, 2, 3, 1]);

            // Convert to shape [256, 256, 3] and unnormalize
            let out = unnormalize(tf.squeeze(pred, [0]), tf);  // was just 0
            
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

function normalize(t, tf) {
    return tf.sub(tf.div(t, 127.5), 1)
}

function unnormalize(t, tf) {
    return tf.mul(tf.add(t, 1), 127.5)
}
