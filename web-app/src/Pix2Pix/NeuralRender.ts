import { loadTfjs } from '../Utils';
import { makeInMemoryCanvas, getImageDataFromCanvasContext, getImageDataFromCanvas } from './InputImage/ImageDataHelper';

var tf: any;  // loaded dynamically.

function normalize(t) {
    return tf.sub(tf.div(t, 127.5), 1)
}

function unnormalize(t) {
    return tf.mul(tf.add(t, 1), 127.5)
}

let storedModel = undefined;

export function neuralRender(modelPath: string, imageData: ImageData): Promise<ImageData> {
    let out;
    let outputCanvas;

    return loadTfjs().then((tfMod) => {
        tf = tfMod;

        // const input_canvas = document.getElementById('canvasRenderer') as HTMLCanvasElement;
        // const output_canvas = document.getElementById('output_img') as HTMLCanvasElement;
        
        let loadModelPromise = (storedModel === undefined) 
            ? tf.loadLayersModel(modelPath)
            : Promise.resolve(storedModel);

        return loadModelPromise;
    }).then((model) => {

        if (storedModel === undefined) {
            storedModel = model;
        }

        // console.log('loaded')
        // console.log(model)

        out = tf.tidy(() => {
            let data = tf.browser
                .fromPixels(imageData, 3);
    
            const processed = normalize(data);
            // processed.print()
    
            // Convert to shape [1,256,256,3]
            let batch = tf.expandDims(processed)
    
            let pred = model.predict(batch);  //  as tf.Tensor<tf.Rank> | tf.TensorLike;
    
            // Convert to shape [256,256,3] and unnormalize
            let out = unnormalize(tf.squeeze(pred, [0]));  // was just 0

            return tf.div(out, 255);
        });

        outputCanvas = makeInMemoryCanvas(imageData.width, "tmp");
        // return tf.browser.toPixels(out as unknown as tf.TensorLike, outputCanvas);
        return tf.browser.toPixels(out, outputCanvas);
    }).then(() => {
        // Because outside of tidy.
        out.dispose();
        
        return Promise.resolve(getImageDataFromCanvas(outputCanvas));
    })
}