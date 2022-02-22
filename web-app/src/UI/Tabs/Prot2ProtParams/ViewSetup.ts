import { InputColorScheme } from "../../../Pix2Pix/InputImage/ColorSchemes/InputColorScheme";
import { drawImageDataOnCanvas } from "../../../Pix2Pix/InputImage/ImageDataHelper";
import { neuralRender, IProteinColoringInfo } from "../../../Pix2Pix/NeuralRender";
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowUp, faArrowDown, faArrowLeft, faArrowRight, faUndo, faRedo, faArrowsAltV, faArrowsAltH, faExpandAlt } from '@fortawesome/free-solid-svg-icons'
import { StandardColorScheme } from "../../../Pix2Pix/InputImage/ColorSchemes/StandardColorScheme";
import { makeImg, updateOffsetVec, updateRotMat } from "../../../Pix2Pix/InputImage/MakeImage";
import { protCanvasTemplate } from "./ProtCanvas";

// @ts-ignore
library.add([
    faArrowUp, faArrowDown, faArrowLeft, faArrowRight, faUndo, faRedo,
    faArrowsAltV, faArrowsAltH, faExpandAlt
]);

const maxDist = 500;

export let viewSetupTemplate = /* html */ `
<div>
    <sub-section title="Molecular Viewer">
        ${protCanvasTemplate}

        <b-form-radio-group
            id="btn-radios-2"
            v-model="preModeSelected"
            :options="options"
            button-variant="outline-primary"
            name="some-radios"
            buttons
            class="d-flex flex-wrap mt-3"
            @change="drawImg"
            :disabled="allDisabled"
        ></b-form-radio-group>

        <span v-if="preModeSelected==='neural'">
            <!-- title="Colorize" -->
            <b-form-checkbox 
                v-model="doColorize" name="check-button" switch
                :disabled="allDisabled" @change="drawImg" class="mt-3"
            >
                Colorize the Prot2Prot Render
            </b-form-checkbox>
            <span v-if="doColorize">
                <b-container fluid class="mt-3">
                    <b-row>
                        <b-col sm="2" class="p-0" style="text-align:center;">
                            <input 
                                type="color" id="protColor" name="protColor"
                                v-model="protColor"
                                :disabled="allDisabled"
                                @change="drawImg"
                                style="width:100%;"
                            >
                        </b-col>
                        <b-col sm="8" class="px-3">
                            <b-form-input 
                                id="colorStrength" type="range"
                                min="0" max="1" step="0.05"
                                v-model="colorStrength"
                                :disabled="allDisabled"
                                class="pt-2"
                                @change="drawImg"
                            ></b-form-input>
                        </b-col>
                        <b-col sm="2" class="p-0" style="text-align:center;">
                            <b-form-checkbox 
                                v-model="colorBlend" name="check-button" switch
                                :disabled="allDisabled" @change="drawImg"
                            >Blend
                            </b-form-checkbox>
                        </b-col>
                    </b-row>
                </b-container>
            </span>
        </span>

        <b-alert class="slide-height mt-3 mb-0" show variant="info">{{$store.state.webWorkerInfo}}</b-alert>
    </sub-section>
</div>`;

export let viewSetupMethodsFunctions = {
    "downloadImg"(): void {
        import(
            /* webpackChunkName: "filesaver" */ 
            /* webpackMode: "lazy" */
            'file-saver'
        ).then((mod) => {
            let canvas = this.$refs["viewCanvas"];
            canvas.toBlob(function(blob){ 
                mod.saveAs(blob, "temp4.png"); 
            });
        });
    },
    "tilt"(axis: number[], degrees: number): void {
        updateRotMat(axis, degrees);
        this["drawImg"]();
    },

    "offset"(): void {
        if (this["protDist"] > maxDist) {
            this["protDist"] = maxDist;
        }

        updateOffsetVec(
            this.$store.state["leftRightOffset"],
            -this.$store.state["upDownOffset"],
            this.$store.state["protDist"],
        );
        this["drawImg"]();
    },

    "drawImg"(): void {
        let startDrawImgTime = new Date().getTime();
        let isFast = (this["preModeSelected"] === "fast");

        let imgPromises = [
            makeImg(
                this["selectedDimensions"], 
                isFast
                    ? new StandardColorScheme()
                    : new InputColorScheme()
            )
        ];

        if (this["doColorize"]) {
            imgPromises.push(
                makeImg(
                    this["selectedDimensions"], 
                    new InputColorScheme(),
                    true  // simplify
                )
            )
        }

        Promise.all(imgPromises)
        .then((payload) => {
            let imageData = payload[0];

            if (imageData === undefined) {
                // Happens if PDB not loaded.
                return;
            }

            let canvas = this.$refs["viewCanvas"];
    
            if (isFast) {
                // So howing fast representation to user (not rendered
                // representation).
                drawImageDataOnCanvas(imageData, canvas);
            } else {
                // So rendering the image.

                // Temporarily disable the render button while rendering.
                this["allDisabled"] = true;
                
                let imageDataSimpleForColoring = (payload.length === 2) 
                    ? payload[1] 
                    : undefined;
                
                let filename: string;
                filename = `./models/${this.$store.state["selectedNeuralRenderer"]}/${this.$store.state["selectedDimensions"]}/${this.$store.state["selectedQuality"]}/model.json`;
                // console.log(filename);
                // filename = "./models/simple_surf/256/uint8/model.json";
                // filename = "./models/simple_surf/256/full/model.json";

                let proteinColoringInf = (this["doColorize"]) 
                    ? {
                        imageDataSimpleForColoring: imageDataSimpleForColoring, 
                        color: this["protColor"],  // HEX
                        colorStrength: parseFloat(this["colorStrength"]),
                        colorBlend: this["colorBlend"] ? 8 : 0
                    } as IProteinColoringInfo
                    : undefined

                neuralRender(filename, imageData, proteinColoringInf)
                .then((imgData: ImageData) => {
                    if (imgData !== undefined) {
                        drawImageDataOnCanvas(imgData, canvas);
                        let deltaTime = (new Date().getTime() - startDrawImgTime) / 1000;
                        this.$store.commit("setVar", {
                            name: "webWorkerInfo",
                            val: `Render time: ${deltaTime.toFixed(1)} seconds`
                        });
                    }

                    this["allDisabled"] = false;
                });
            }
        });
    },
}

export let viewSetupData = {
    "preModeSelected": "fast",
    "options": [
        { "text": 'Preview', "value": 'fast' },
        { "text": 'Prot2Prot', "value": 'neural' }
    ],
    "doColorize": false,
    "protColor": "#FF0000",
    "colorStrength": 0.5,
    "colorBlend": true,
    "allDisabled": false
    // "neuralCheckBoxDisabled": false
}

export let viewSetupComputedFunctions = {
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

    // "doColorize": {
    //     get(): boolean {
    //         return this.$store.state["doColorize"];
    //     },
    //     set(val: boolean): void {
    //         this.$store.commit("setVar", {
    //             name: "doColorize",
    //             val
    //         });
    //     }
    // }
}