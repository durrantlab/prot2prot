// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2022 Jacob D. Durrant.

import { InputColorScheme } from "../../../Pix2Pix/InputImage/ColorSchemes/InputColorScheme";
import { drawImageDataOnCanvas } from "../../../Pix2Pix/InputImage/ImageDataHelper";
import { neuralRender, IProteinColoringInfo } from "../../../Pix2Pix/NeuralRender";
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowUp, faArrowDown, faArrowLeft, faArrowRight, faUndo, faRedo, faArrowsAltV, faArrowsAltH, faExpandAlt } from '@fortawesome/free-solid-svg-icons'
import { StandardColorScheme } from "../../../Pix2Pix/InputImage/ColorSchemes/StandardColorScheme";
import { getRotMatAsArray, makeImg, setRotMatFromArray, updateOffsetVec, updateRotMat } from "../../../Pix2Pix/InputImage/MakeImage";
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
            @click.native="saveLastPreModeSelected"
            :disabled="allDisabled"
        ></b-form-radio-group>

        <b-alert class="slide-height mt-3 mb-0" show variant="info" v-html="$store.state.webWorkerInfo"></b-alert>

        <b-form-checkbox 
            v-model="doColorize" name="check-button" switch
            :disabled="allDisabledOrNotNeural" @change="drawImg" class="mt-3"
            :title="notNeuralTitle"
        >
            Colorize Prot2Prot Render
        </b-form-checkbox>
        <span v-if="doColorize">
            <b-container fluid class="mt-3">
                <b-row>
                    <b-col sm="2" class="p-0" style="text-align:center;">
                        <input 
                            type="color" id="protColor" name="protColor"
                            v-model="protColor"
                            :disabled="allDisabledOrNotNeural"
                            :title="notNeuralTitle"
                            @change="drawImg"
                            :style="'width:100%;' + (allDisabledOrNotNeural ? 'cursor:not-allowed': '')"
                        >
                    </b-col>
                    <b-col sm="8" class="px-3">
                        <b-form-input 
                            id="colorStrength" type="range"
                            min="0" max="1" step="0.05"
                            v-model="colorStrength"
                            :disabled="allDisabledOrNotNeural"
                            :title="notNeuralTitle"
                            class="pt-2"
                            @change="drawImg"
                        ></b-form-input>
                    </b-col>
                    <b-col sm="2" class="p-0" style="text-align:center;">
                        <b-form-checkbox 
                            v-model="colorBlend" name="check-button" switch
                            :disabled="allDisabledOrNotNeural"
                            :title="notNeuralTitle"
                            @change="drawImg"
                        >Blend
                        </b-form-checkbox>
                    </b-col>
                </b-row>
            </b-container>
        </span>
        <form-group
            label="Viewport"
            id="angle-dist-text"
            style=""
            class="mt-3"
            description=""
            title="Copy and paste to restore viewport"
        >
            <b-form-input
                style="border-top-left-radius:4px; border-bottom-left-radius:4px;"
                placeholder="Copy and paste to restore viewport"
                v-model="viewPortInf"
                :disabled="allDisabled"
            ></b-form-input>
        </form-group>
    </sub-section>
</div>`;

export let viewSetupMethodsFunctions = {
    /**
     * Downloads the canvas as a png file.
     */
    "downloadImg"(): void {
        import(
            /* webpackChunkName: "FileSaver" */ 
            /* webpackMode: "lazy" */
            'file-saver'
        ).then((mod) => {
            let canvas = this.$refs["viewCanvas"];
            canvas.toBlob(function(blob){ 
                mod.saveAs(blob, "temp4.png"); 
            });
        });
    },

    /**
     * Rotates the protein.
     * @param {number[]} axis     The axis to rotate around.
     * @param {number}   degrees  The number of degrees to rotate the image.
     */
    "tilt"(axis: number[], degrees: number): void {
        updateRotMat(axis, degrees);
        this["drawImg"]();
        this.rotMat = getRotMatAsArray();
    },

    /**
     * Updates the offset vector by subtracting the left right offset and adding
     * the up down offset.
     * @param  {boolean} [updateImg=true]  If true (defualt), also updates the
     *                                     image.
     * @returns void
     */
    "offset"(updateImg=true): void {
        if (this["protDist"] > maxDist) {
            this["protDist"] = maxDist;
        }

        updateOffsetVec(
            this.$store.state["leftRightOffset"],
            -this.$store.state["upDownOffset"],
            this.$store.state["protDist"],
        );
        if (updateImg) {
            this["drawImg"]();  
        }
    },

    /**
     * Save the previous pre-mode selected value (e.g., "fast").
     */
    "saveLastPreModeSelected"(): void {
        if (this["preModeSelected"] === "save") {
            return;
        }
        this["previousPreModeSelected"] = this["preModeSelected"];
    },

    /**
     * Creates an image from the protein data and then draws it on the canvas.
     * @param {boolean} [alwaysShowAllAtoms=false]  If true, will always show
     *                                              all atoms. Useful after
     *                                              rotating, when stopped.
     * @returns void
     */
    "drawImg"(alwaysShowAllAtoms=false): void {
        switch (this["preModeSelected"]) {
            case "save":
                this["preModeSelected"] = this["previousPreModeSelected"];
                this.downloadImg();
                return;
            case "neural":
                document.body.classList.add("waiting");
                break;
        }

        let startDrawImgTime = new Date().getTime();
        let isFast = (this["preModeSelected"] === "fast");

        let imgPromises = [
            makeImg(
                this["selectedDimensions"], 
                isFast
                    ? new StandardColorScheme()
                    : new InputColorScheme(),
                false,
                isFast
                    ? alwaysShowAllAtoms
                    : false                    
            )
        ];

        if (this["doColorize"] && !isFast) {
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
                filename = `./prot2prot_models/${this.$store.state["selectedNeuralRenderer"]}/${this.$store.state["selectedDimensions"]}/${this.$store.state["selectedQuality"]}/model.json`;

                let proteinColoringInf = (this["doColorize"]) 
                    ? {
                        imageDataSimpleForColoring: imageDataSimpleForColoring, 
                        color: this["protColor"],  // HEX
                        colorStrength: parseFloat(this["colorStrength"]),
                        colorBlend: this["colorBlend"] ? 8 : 0
                    } as IProteinColoringInfo
                    : undefined

                neuralRender(filename, imageData, proteinColoringInf)
                .then((outImgData: ImageData) => {
                    // outImgData = null; // For debugging
                    if ([undefined, null].indexOf(outImgData) === -1) {
                        drawImageDataOnCanvas(outImgData, canvas);
                        let deltaTime = (new Date().getTime() - startDrawImgTime) / 1000;
                        this.$store.commit("setVar", {
                            name: "webWorkerInfo",
                            val: `Render time: ${deltaTime.toFixed(1)} seconds`
                        });
                        this["allDisabled"] = false;
                    } else {
                        let msg = `ERROR: Render failed. GPU may not be powerful enough to render at this image size (${imageData.width}px x ${imageData.height}px). Try `;
                        let myUrl = window.location.origin + window.location.pathname
                        if (imageData.width !== 256) {
                            let newWidth = (imageData.width === 1024) ? "512" : "256";
                            msg += `(1) <a href="${myUrl}?size=${newWidth}">reducing the size</a> to ${newWidth}px x ${newWidth}px or (2) `
                        }
                        msg += `<a href="${myUrl}?cpu">using the CPU</a> instead (takes longer).`;

                        this.$store.commit("setVar", {
                            name: "webWorkerInfo",
                            val: msg
                        });
                        this["allDisabled"] = true;
                    }

                    document.body.classList.remove("waiting");
                });
            }
        });
    },
}

export let viewSetupData = {
    "preModeSelected": "fast",
    "previousPreModeSelected": "fast",
    "options": [
        { "text": 'Preview', "value": 'fast' },
        { "text": 'Prot2Prot', "value": 'neural' },
        { "text": 'Save', "value": 'save' },
    ],
    "doColorize": false,
    "protColor": "#FF0000",
    "colorStrength": 0.5,
    "colorBlend": true,
    "allDisabled": false,
    rotMat: undefined
}

export let viewSetupComputedFunctions = {
    /** Get or set the upDownOffset. */
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

    /** Get or set the protDist. */
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

    /** Get or set the viewPortInf. */
    "viewPortInf": {
        get(): string {
            return JSON.stringify({
                "dist": this["protDist"],
                "rotation": this.rotMat
            });
        },
        set(val: string) {
            let data;
            try {
                data = JSON.parse(val);
            } catch(e) {
                this["viewPortInf"] = JSON.stringify({
                    "dist": this["protDist"]
                });
                return;
            }
            if (data["dist"]) {
                this["protDist"] = data["dist"];
                this["offset"]();        
            }
            if (data["rotation"]) {
                // console.log(data);
                setRotMatFromArray(data["rotation"]);
            }
            this["drawImg"]();
        }
    },
    "allDisabledOrNotNeural"(): boolean {
        return this["allDisabled"] || (this["preModeSelected"] !== 'neural')
    },
    "notNeuralTitle"(): string {
        return (this["preModeSelected"] !== 'neural') ? "Click the \"Prot2Prot\" button to enable" : "";
    }
}