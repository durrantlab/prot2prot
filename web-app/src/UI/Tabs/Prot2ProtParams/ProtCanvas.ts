import { InputColorScheme } from "../../../Pix2Pix/InputImage/ColorSchemes/InputColorScheme";
import { drawImageDataOnCanvas } from "../../../Pix2Pix/InputImage/ImageDataHelper";
import { neuralRender } from "../../../Pix2Pix/NeuralRender";
import { StandardColorScheme } from "../../../Pix2Pix/InputImage/ColorSchemes/StandardColorScheme";
import { makeImg, updateOffsetVec, updateRotMat } from "../../../Pix2Pix/InputImage/MakeImage";


export let protCanvasTemplate = /* html */ `
    <canvas ref="viewCanvas" style="width:256px;height:256px;margin-left:auto;margin-right:auto;display:block;"></canvas>
`;

export let protCanvasMethodsFunctions = {
    "tilt"(axis: string, degrees: number): void {
        updateRotMat(axis, degrees);
        this["drawImg"]();
    },

    "offset"(): void {
        updateOffsetVec(
            this.$store.state["leftRightOffset"],
            -this.$store.state["upDownOffset"],
            this.$store.state["protDist"],
        );
        this["drawImg"]();
    },

    "drawImg"(): void {
        let isFast = (this["preModeSelected"] === "fast");
        makeImg(
            256, 
            isFast
                ? new StandardColorScheme()
                : new InputColorScheme()
        ).then((imageData) => {
            let canvas = this.$refs["viewCanvas"];
    
            if (isFast) {
                drawImageDataOnCanvas(imageData, canvas);
            } else {
                // TODO: mess here. Rendering every time you change protein. Need to use
                // render button, different tab, specify model, etc.
                // let imgData = getImageDataFromCanvas(canvas)

                // const vrmlParserWebWorker = new Worker("renderWebWorker.js?" + Math.random().toString());

                // if (typeof(Worker) !== "undefined") {
                //     vrmlParserWebWorker.onmessage = (event: MessageEvent) => {
                //         let data = event.data;
                //         debugger;
                //     };

                //     vrmlParserWebWorker.postMessage({
                //         "cmd": "start",
                //         "data": "data"
                //     });
                // }       
                
                // return


                let filename: string;
                filename = "./models/simple_surf/256/uint16/model.json";
                // filename = "./models/simple_surf/256/uint8/model.json";
                // filename = "./models/simple_surf/256/full/model.json";
                neuralRender(filename, imageData).then((imgData: ImageData) => {
                    if (imgData !== undefined) {
                        drawImageDataOnCanvas(imgData, canvas);
                    }
                });
            }
        });
    },
}

export let protCanvasData = {
    "preModeSelected": "fast"
}

export let protCanvasComputedFunctions = {
    "upDownOffset": {
        get(): number {
            return this.$store.state["upDownOffset"];
        },
        set(val: string): void {
            this.$store.commit("setVar", {
                name: "upDownOffset",
                val: parseInt(val)
            });
        }
    },


    "protDist": {
        get(): number {
            return this.$store.state["protDist"];
        },
        set(val: number): void {
            this.$store.commit("setVar", {
                name: "protDist",
                val: val
            });
        }
    },
}