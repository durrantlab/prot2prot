import { InputColorScheme } from "../../../Pix2Pix/InputImage/ColorSchemes/InputColorScheme";
import { drawImageDataOnCanvas } from "../../../Pix2Pix/InputImage/ImageDataHelper";
import { neuralRender } from "../../../Pix2Pix/NeuralRender";
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowUp, faArrowDown, faArrowLeft, faArrowRight, faUndo, faRedo, faArrowsAltV, faArrowsAltH, faExpandAlt } from '@fortawesome/free-solid-svg-icons'
import { StandardColorScheme } from "../../../Pix2Pix/InputImage/ColorSchemes/StandardColorScheme";
import { makeImg, updateOffsetVec, updateRotMat } from "../../../Pix2Pix/InputImage/MakeImage";
import { protCanvasTemplate } from "./ProtCanvas";
import { tf } from "../../../Pix2Pix/LoadTF";

// @ts-ignore
library.add([
    faArrowUp, faArrowDown, faArrowLeft, faArrowRight, faUndo, faRedo,
    faArrowsAltV, faArrowsAltH, faExpandAlt
]);

const maxDist = 500;

export let viewSetupTemplate = /* html */ `
<sub-section title="Molecular Viewer">
    ${protCanvasTemplate}
    <hr />
    <b-container fluid>
        <b-row>
            <b-col>
                <div style="text-align:center;">Render Mode</div>
            </b-col>
        </b-row>

        <b-row style="margin-bottom:16px;">
            <b-col>
                <b-form-radio @change="drawImg" style="margin:auto; display:table;" v-model="preModeSelected" name="some-radios" value="fast">Preview</b-form-radio>
            </b-col>
            <b-col>
                <b-form-radio @change="drawImg" style="margin:auto; display:table;" v-model="preModeSelected" name="some-radios" value="neural">Prot2Prot</b-form-radio>
            </b-col>
        </b-row>

        <b-alert class="slide-height" show variant="info">{{$store.state.webWorkerInfo}}</b-alert>
        
        <!--
        <b-row style="margin-bottom:-11px;">
            <b-col>
                <div style="text-align:center;">Molecule Distance</div>
            </b-col>
        </b-row>

        <b-row>
            <b-col>
                <form-group>
                    <div style="margin-top:10px;">
                        <input 
                            type="range" 
                            name="distanceRange" 
                            step="1"
                            min="0"
                            max=${maxDist}
                            v-model="protDist"
                            style="width:100%;"
                            @change="offset()"
                        >
                    </div>
                </form-group>
            </b-col>
        </b-row>

        <b-row>
            <b-col>
                <div style="text-align:center;">Molecule Rotation</div>
            </b-col>
        </b-row>

        <b-row no-gutters style="width:123px; margin-left:auto; margin-right:auto;">
            <b-col style="max-width:41px; width:41px;">
                <form-button style="width:41px;" @click.native.prevent="tilt([0, 1, 0], -10)"><font-awesome-icon :icon="['fa', 'undo']"/></form-button>
            </b-col>
            <b-col style="max-width:41px; width:41px;">
                <form-button style="width:41px;" @click.native.prevent="tilt([1, 0, 0], -10)"><font-awesome-icon :icon="['fa', 'arrow-up']"/></form-button>
            </b-col>
            <b-col style="max-width:41px; width:41px;">
                <form-button style="width:41px;" @click.native.prevent="tilt([0, 1, 0], 10)"><font-awesome-icon :icon="['fa', 'redo']"/></form-button>
            </b-col>
        </b-row>
        <b-row no-gutters style="width:123px; margin-left:auto; margin-right:auto;">
            <b-col style="max-width:41px; width:41px;">
            <form-button style="width:41px;" @click.native.prevent="tilt([0, 0, 1], -10)"><font-awesome-icon :icon="['fa', 'arrow-left']"/></form-button>
            </b-col>
            <b-col style="max-width:41px; width:41px;">
                <form-button style="width:41px;" @click.native.prevent="tilt([1, 0, 0], 10)"><font-awesome-icon :icon="['fa', 'arrow-down']"/></form-button>
            </b-col>
            <b-col style="max-width:41px; width:41px;">
                <form-button style="width:41px;" @click.native.prevent="tilt([0, 0, 1], 10)"><font-awesome-icon :icon="['fa', 'arrow-right']"/></form-button>
            </b-col>
        </b-row> -->
    </b-container>
</sub-section>`;

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
        makeImg(
            this["selectedDimensions"], 
            isFast
                ? new StandardColorScheme()
                : new InputColorScheme()
        ).then((imageData) => {
            if (imageData === undefined) {
                // Happens if PDB not loaded.
                return;
            }

            let canvas = this.$refs["viewCanvas"];
    
            if (isFast) {
                drawImageDataOnCanvas(imageData, canvas);
            } else {
                let filename: string;
                filename = `./models/${this.$store.state["selectedNeuralRenderer"]}/${this.$store.state["selectedDimensions"]}/${this.$store.state["selectedQuality"]}/model.json`;
                // console.log(filename);
                // filename = "./models/simple_surf/256/uint8/model.json";
                // filename = "./models/simple_surf/256/full/model.json";
                neuralRender(filename, imageData).then((imgData: ImageData) => {
                    if (imgData !== undefined) {
                        drawImageDataOnCanvas(imgData, canvas);
                        let deltaTime = (new Date().getTime() - startDrawImgTime) / 1000;
                        this.$store.commit("setVar", {
                            name: "webWorkerInfo",
                            val: `Render time: ${deltaTime.toFixed(1)} seconds`
                        });
                    }
                });
            }
        });
    },
}

export let viewSetupData = {
    "preModeSelected": "fast"
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
}