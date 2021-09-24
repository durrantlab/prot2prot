// This file is part of Prot2Prot, released under the Apache 2.0 License. See
// LICENSE.md or go to https://opensource.org/licenses/Apache-2.0 for full
// details. Copyright 2020 Jacob D. Durrant.


import * as Utils from "../../Utils";
import { IConvert, IFileLoaded, IFileLoadError } from "../Forms/FileLoader/Common/Interfaces";
import { getExt } from "../Forms/FileLoader/Common/Utils";
// import * as MakeImg from "../../Pix2Pix/Library.old/make_img";
import { neuralRender } from "../../Pix2Pix/NeuralRender";
import { parsePDB } from "../../Pix2Pix/InputImage/PDBParser";
import { makeImg, updateRotMat } from "../../Pix2Pix/InputImage/MakeImage";
import { library } from '@fortawesome/fontawesome-svg-core'
import { faArrowUp, faArrowDown, faArrowLeft, faArrowRight, faUndo, faRedo, faArrowsAltV, faArrowsAltH, faExpandAlt } from '@fortawesome/free-solid-svg-icons'
// import { rotat } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { drawImageDataOnCanvas, getImageDataFromCanvas, getImageDataFromCanvasContext } from "../../Pix2Pix/InputImage/ImageDataHelper";
import { getDataURI, moveBackSVG, moveFrontSVG, rotBackSVG, rotClockWiseSVG, rotCounterClockWiseSVG, rotFrontSVG, rotLeftSVG, rotRightSVG } from "./RotationIcons";

// @ts-ignore
library.add([
    faArrowUp, faArrowDown, faArrowLeft, faArrowRight, faUndo, faRedo,
    faArrowsAltV, faArrowsAltH, faExpandAlt
]);

Vue.component('font-awesome-icon', FontAwesomeIcon)
// Vue.config.productionTip = false

declare var Vue;
declare var Prot2Prot;
declare var jQuery;

/** An object containing the vue-component computed functions. */
let computedFunctions = {
    /**
     * Whether to hide the vina docking-box parameters.
     * @returns boolean  True if they should be hidden, false otherwise.
     */
    "hideDockingBoxParams"(): boolean {
        return this.$store.state.hideDockingBoxParams;
    },

    /** Whether to show the keep-protein-only link. Has both a getter and a setter. */
    "showKeepProteinOnlyLink": {
        get(): number {
            return this.$store.state["showKeepProteinOnlyLink"];
        },

        set(val: string): void {
            this.$store.commit("setVar", {
                name: "showKeepProteinOnlyLink",
                val: parseInt(val)
            });
        }
    },

    "leftRightOffset": {
        get(): number {
            return this.$store.state["leftRightOffset"];
        },
        set(val: string): void {
            this.$store.commit("setVar", {
                name: "leftRightOffset",
                val: parseInt(val)
            });
        }
    },

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
    }
}

/** An object containing the vue-component methods functions. */
let methodsFunctions = {
    /**
     * Runs when user indicates theye want to use example vina input files,
     * rather than provide their own.
     * @returns void
     */
    "useExampleVinaInputFiles"(): void {
        this["showFileInputs"] = false;

        setTimeout(() => {  // Vue.nextTick doesn't work...
            // Update some values.
            this.$store.commit("setVar", {
                name: "receptorContents",
                val: this.$store.state["receptorContentsExample"]
            });

            this.$store.commit("setVar", {
                name: "ligandContents",
                val: this.$store.state["ligandContentsExample"]
            });
            this.$store.commit("setVar", {
                name: "crystalContents",
                val: this.$store.state["crystalContentsExample"]
            });
            this.$store.commit("setVinaParam", {
                name: "center_x",
                val: 41.03
            });
            this.$store.commit("setVinaParam", {
                name: "center_y",
                val: 18.98
            });
            this.$store.commit("setVinaParam", {
                name: "center_z",
                val: 14.03
            });
            this.$store.commit("setVinaParam", {
                name: "size_x",
                val: 20.00
            });
            this.$store.commit("setVinaParam", {
                name: "size_y",
                val: 20.00
            });
            this.$store.commit("setVinaParam", {
                name: "size_z",
                val: 20.00
            });

            // Also update file names so example vina command line is valid.
            this.$store.commit("updateFileName", { type: "ligand", filename: "ligand_example.pdbqt" });
            this.$store.commit("updateFileName", { type: "receptor", filename: "receptor_example.pdbqt" });

            // These values should now validate.
            let validateVars = [
                "receptor", "ligand", "center_x", "center_y", "center_z",
                "size_x", "size_y", "size_z"
            ];
            const validateVarsLen = validateVars.length;
            for (let i = 0; i < validateVarsLen; i++) {
                const validateVar = validateVars[i];
                this.$store.commit("setValidationParam", {
                    name: validateVar,
                    val: true
                });
            }
        }, 100);
    },

    /**
     * Runs when the user presses the submit button.
     * @returns void
     */
    "onSubmitClick"(): void {
        if (this["validate"]() === true) {
            this.$store.commit("disableTabs", {
                "parametersTabDisabled": true,
                "existingVinaOutputTabDisabled": true,
                "runningTabDisabled": false,
            });

            jQuery("body").addClass("waiting");

            Vue.nextTick(() => {
                this.$store.commit("setVar", {
                    name: "tabIdx",
                    val: 2
                });

                Vue.nextTick(() => {
                    // setTimeout(() => {
                    //     this.afterWASM(this["testVinaOut"], this["testStdOut"]);
                    // }, 1000);

                    // Keep track of start time
                    this.$store.commit("setVar", {
                        name: "time",
                        val: new Date().getTime()
                    });

                    Prot2Prot.start(
                        this.$store.state["vinaParams"],
                        this.$store.state["receptorContents"],
                        this.$store.state["ligandContents"],

                        // onDone
                        (outPdbqtFileTxt: string, stdOut: string, stdErr: string) => {
                            this.$store.commit("setVar", {
                                name: "time",
                                val: Math.round((new Date().getTime() - this.$store.state["time"]) / 100) / 10
                            });

                            this.afterWASM(outPdbqtFileTxt, stdOut, stdErr);
                        },

                        // onError
                        (errObj: any) => {
                            // Disable some tabs
                            this.$store.commit("disableTabs", {
                                "parametersTabDisabled": true,
                                "existingVinaOutputTabDisabled": true,
                                "runningTabDisabled": true,
                                "outputTabDisabled": true,
                                "startOverTabDisabled": false
                            });

                            this.showProt2ProtError(errObj["message"]);
                        },
                        Utils.curPath() + "Prot2Prot/"
                    )
                });
            });
        }
    },

    /**
     * Opens the draw ligand modal.
     * @param  {*} e  A click event so you can stop the propagation.
     * @returns void
     */
    // "onDrawLigClick"(e: any): void {
    //     this.$store.commit("drawSmilesModal");
    //     e.preventDefault();
    //     e.stopPropagation();
    // },

    /**
     * Removes residues from protein model that are not protein amino acids.
     * @param  {any} e  The click event.
     * @returns void
     */
    "onShowKeepProteinOnlyClick"(e: any): void {
        let linesToKeep = Utils.keepOnlyProteinAtoms(this.$store.state["receptorContents"]);

        this.$store.commit("setVar", {
            name: "receptorContents",
            val: linesToKeep
        });

        this.$store.commit("updateFileName", {
            type: "receptor",
            filename: Utils.replaceExt(
                this.$store.state["receptorFileName"],
                "protein.pdbqt"
            )
        });

        this["showKeepProteinOnlyLink"] = false;

        e.preventDefault();
        e.stopPropagation();
    },

    /**
     * Determines whether all form values are valid.
     * @param  {boolean=true} modalWarning  Whether to show a modal if
     *                                      they are not valid.
     * @returns boolean  True if they are valid, false otherwise.
     */
    "validate"(modalWarning: boolean=true): boolean {
        let validations = this.$store.state["validation"];

        let pass = true;

        const paramName = Object.keys(validations);
        const paramNameLen = paramName.length;
        let badParams: string[] = [];
        for (let i = 0; i < paramNameLen; i++) {
            const name = paramName[i];

            if (name === "output") {
                // This one isn't part of the validation.
                continue;
            }

            const valid = validations[name];
            if (valid === false) {
                pass = false;
                badParams.push(name);
            }
        }

        if (pass === false) {
            if (modalWarning === true) {
                this.onError(
                    "Invalid Parameters!", 
                    "Please correct the following parameter(s) before continuing: <code>" 
                        + badParams.join(" ") 
                        + "</code>"
                );
            }
        }

        this.$store.commit("setVar", {
            name: "vinaParamsValidates",
            val: pass
        })

        return pass;
    },

    onError(title: string, msg: string): void {
        this.$store.commit("openModal", {
            title: title,
            body: `<p>${msg}</p>`
        });
    },

    "drawImg"(): void {
        let imageData = makeImg(
            this.$store.state["leftRightOffset"],
            -this.$store.state["upDownOffset"],
            this.$store.state["protDist"],
            256
        );
        let canvas = this.$refs["viewCanvas"]
        // drawImageDataOnCanvas(imageData, canvas);
        
        // TODO: mess here. Rendering every time you change protein. Need to use
        // render button, different tab, specify model, etc.
        // let imgData = getImageDataFromCanvas(canvas)

        neuralRender("./models/simple_surf/256/uint16/model.json", imageData).then((imgData: ImageData) => {
            drawImageDataOnCanvas(imgData, canvas);
        });

    },

    "onFileLoaded"(fileInfo: IFileLoaded): void {
        if (fileInfo.fileContents === "") {
            // Not really loaded
            return;
        }

        parsePDB(fileInfo.fileContents);
        this["drawImg"]();

        return;

        // MakeImg.set_figure_dimens(256);
        // MakeImg.main(undefined, fileInfo.fileContents, {
        //     "thetaX": 0,
        //     "thetaY": 0,
        //     "thetaZ": 0,
        //     "deltaX": 0,
        //     "deltaY": 0,
        //     "deltaZ": 50,
        // });

        // debugger;
        // this.$store.commit("updateFileName", {
        //     type: this["id"],
        //     filename: fileInfo.filename,
        // });

        // // this.getModelFileContents(this["file"]).then((text: string) => {
        // this.$store.commit("setVar", {
        //     name: fileInfo.id + "Contents",
        //     val: fileInfo.fileContents,
        // });

        // // Reset the show non-protein atom's link.
        // if (fileInfo.id === "receptor") {
        //     this.$store.commit("setVar", {
        //         name: "showKeepProteinOnlyLink",
        //         val: true,
        //     });
        // }

        // // });
    },

    "onConvertNeeded"(convertInfo: IConvert): void {
        // Set the filename.
        this.$store.commit("updateFileName", {
            type: convertInfo.id,
            filename: convertInfo.filename,
        });

        let ext = getExt(convertInfo.filename);

        // this.getModelFileContents(val).then((text: string) => {
            // this.$store.commit("openConvertFileModal", {
            //     ext: ext,
            //     type: convertInfo.id,
            //     file: convertInfo.fileContents,
            //     onConvertCancel: convertInfo.onConvertCancel,
            //     onConvertDone: convertInfo.onConvertDone,
            // });
        // });

        alert("");
        // Handle below!!!
        // convertInfo.onConvertCancel
        // convertInfo.onConvertDone
    },

    /**
     * Runs after the Vina WASM file is complete.
     * @param  {string} outPdbqtFileTxt  The contents of the Vina output pdbqt file.
     * @param  {string} stdOut           The contents of the Vina standard output.
     * @param  {string} stdErr           The contents of the Vina standard error.
     * @returns void
     */
    afterWASM(outPdbqtFileTxt: string, stdOut: string, stdErr: string): void {
        // Disable some tabs
        this.$store.commit("disableTabs", {
            "parametersTabDisabled": true,
            "existingVinaOutputTabDisabled": true,
            "runningTabDisabled": true,
            "outputTabDisabled": false,
            "startOverTabDisabled": false
        });

        // Switch to output tab.
        this.$store.commit("setVar", {
            name: "tabIdx",
            val: 3
        });

        this.$store.commit("setVar", {
            name: "stdOut",
            val: stdOut
        });
        this.$store.commit("setVar", {
            name: "outputContents",
            val: outPdbqtFileTxt
        });

        if (stdErr !== "") {
            this.showProt2ProtError(stdErr);
        }

        // Process the standard output (extract scores and rmsds) and
        // frames.
        this.$store.commit("outputToData");

        jQuery("body").removeClass("waiting");
    },

    /**
     * Shows a Prot2Prot error.
     * @param  {string} message  The error message.
     * @returns void
     */
    showProt2ProtError(message: string): void {
        this.onError(
            "Prot2Prot Error!", 
            "Prot2Prot returned the following error: <code>" + message + "</code>"
        );
    },

    "showFileLoaderError"(error: IFileLoadError): void {
        this.onError(
            error.title,
            error.body
        );
    },

    "tilt"(axis: string, degrees: number): void {
        updateRotMat(axis, degrees);
        this["drawImg"]();
    }
}

/**
 * The vue-component mounted function.
 * @returns void
 */
function mountedFunction(): void {
    this["webAssemblyAvaialble"] = Utils.webAssemblySupported();
}

/**
 * Setup the vina-params Vue commponent.
 * @returns void
 */
export function setup(): void {
    Vue.component('vina-params', {
        "template": /* html */ `
            <div>
                <b-form v-if="webAssemblyAvaialble">
                    <b-card
                        class="mb-2 text-center"
                        style="margin-bottom:1.4rem !important;"
                    >
                        <b-card-text>
                            Use this tab to setup a Prot2Prot job in your browser.
                            Specify the input files and Vina parameters below.
                        </b-card-text>
                    </b-card>

                    <sub-section title="Input PDB File" v-if="showFileInputs">
                        <!-- TODO: Attention here -->
                        <!-- convert=".pdb, .ent, .xyz, .pqr, .mcif, .mmcif" 
                        description="Formats: PDBQT (best), PDB, ENT, XYZ, PQR, MCIF, MMCIF. If PDB, be sure to add polar hydrogen atoms."
                        -->
                        <file-loader
                            label="Receptor"
                            id="receptor"
                            description="Format: PDB"
                            accept=".pdb" 
                            :required="true"
                            :allowUrlInput="false"
                            :multipleFiles="false"
                            :countDownToNextInput="-1"
                            @onError="showFileLoaderError"
                            @onFileLoaded="onFileLoaded"
                        >
                            <!-- @onConvertNeeded="onConvertNeeded" -->
                            <!-- 
                            @onFileNameChange="fileNameChanged"
                            @onTimeUp="timeUp" -->
                            <template v-slot:extraDescription>
                                <span v-if="showKeepProteinOnlyLink">
                                    <a href='' @click="onShowKeepProteinOnlyClick($event);">Automatically remove all non-protein atoms?</a>
                                </span>
                                <span v-else>
                                    <b>(Removed all non-protein atoms!)</b>
                                </span>
                            </template>
                        </file-loader>

                        <form-button @click.native="useExampleVinaInputFiles" cls="float-right">Use Example Files</form-button>  <!-- variant="default" -->
                    </sub-section>

                    <sub-section title="View Setup">
                        <canvas ref="viewCanvas" style="width:256px;height:256px;margin-left:auto;margin-right:auto;display:block;"></canvas>

                        <!-- <b-container fluid>
                            <b-row>
                                <b-col>
                                    <font-awesome-icon :icon="['fa', 'expand-alt']"/>
                                </b-col>
                                <b-col cols="11">
                                    <form-group>
                                        <div style="margin-top:10px;">
                                            <input 
                                                type="range" 
                                                name="distanceRange" 
                                                step="1"
                                                min="0"
                                                max="500"
                                                v-model="protDist"
                                                style="width:100%;"
                                                @change="drawImg"
                                            >
                                        </div>
                                    </form-group>
                                </b-col>
                            </b-row> -->

                            <!--
                            <b-row>
                                <b-col>
                                    <font-awesome-icon :icon="['fa', 'arrows-alt-h']"/>
                                </b-col>
                                <b-col cols="11">
                                    <form-group>
                                        <div style="margin-top:10px;">
                                            <input 
                                                type="range" 
                                                name="leftRightOffsetRange" 
                                                step="1"
                                                min="-50"
                                                max="50"
                                                v-model="leftRightOffset"
                                                style="width:100%;"
                                                @change="drawImg"
                                            >
                                        </div>
                                    </form-group>
                                </b-col>
                            </b-row>

                            <b-row>
                                <b-col>
                                    <font-awesome-icon :icon="['fa', 'arrows-alt-v']"/>
                                </b-col>
                                <b-col cols="11">
                                    <form-group>
                                        <div style="margin-top:10px;">
                                            <input 
                                                type="range" 
                                                name="upDownOffsetRange" 
                                                step="1"
                                                min="-50"
                                                max="50"
                                                v-model="upDownOffset"
                                                style="width:100%;"
                                                @change="drawImg"
                                            >
                                        </div>
                                    </form-group>
                                </b-col>
                            </b-row>
                            -->

                            <!-- <b-container style="width:160px">
                                <b-row>
                                    <b-col style="height:40px; display:flex; justify-content:center; align-items:center;">
                                        <img style="" src="${getDataURI(rotLeftSVG)}">
                                    </b-col>
                                    <b-col style="height:40px; display:flex; justify-content:center; align-items:center;">
                                        <img style="" src="${getDataURI(rotBackSVG)}"/>
                                    </b-col>
                                    <b-col style="height:40px; display:flex; justify-content:center; align-items:center;">
                                        <img style="" src="${getDataURI(rotRightSVG)}">
                                    </b-col>
                                </b-row>
                                <b-row no-gutters>
                                    <b-col style="display:flex; justify-content:center; align-items:center;">
                                        <img style="" src="${getDataURI(rotClockWiseSVG)}">
                                    </b-col>
                                    <b-col style="display:flex; justify-content:center; align-items:center;"></b-col>
                                    <b-col style="display:flex; justify-content:center; align-items:center;">
                                        <img style="" src="${getDataURI(rotCounterClockWiseSVG)}">
                                    </b-col>
                                </b-row>
                                <b-row>
                                    <b-col style="height:40px; display:flex; justify-content:center; align-items:center;">
                                        <img style="" src="${getDataURI(moveBackSVG)}">
                                    </b-col>
                                    <b-col style="height:40px; display:flex; justify-content:center; align-items:center;">
                                        <img style="" src="${getDataURI(rotFrontSVG)}"/>
                                    </b-col>
                                    <b-col style="height:40px; display:flex; justify-content:center; align-items:center;">
                                        <img style="" src="${getDataURI(moveFrontSVG)}">
                                    </b-col>
                                </b-row>
                            </b-container>
                        </b-container>
                        -->

                        <b-container fluid>
                        <!-- <b-col>
                        <font-awesome-icon :icon="['fa', 'expand-alt']"/>
                        </b-col> -->
                            <b-row style="margin-bottom:-11px;">
                                <b-col>
                                    <div style="text-align:center;">Molecule Distance</div>
                                </b-col>
                            </b-row>
                        
                            <b-row>
                                <b-col cols="11">
                                    <form-group>
                                        <div style="margin-top:10px;">
                                            <input 
                                                type="range" 
                                                name="distanceRange" 
                                                step="1"
                                                min="0"
                                                max="500"
                                                v-model="protDist"
                                                style="width:100%;"
                                                @change="drawImg"
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
                                    <form-button style="width:41px;" @click.native.prevent="tilt('Y', -10)"><font-awesome-icon :icon="['fa', 'undo']"/></form-button>
                                </b-col>
                                <b-col style="max-width:41px; width:41px;">
                                    <form-button style="width:41px;" @click.native.prevent="tilt('X', -10)"><font-awesome-icon :icon="['fa', 'arrow-up']"/></form-button>
                                </b-col>
                                <b-col style="max-width:41px; width:41px;">
                                    <form-button style="width:41px;" @click.native.prevent="tilt('Y', 10)"><font-awesome-icon :icon="['fa', 'redo']"/></form-button>
                                </b-col>
                            </b-row>
                            <b-row no-gutters style="width:123px; margin-left:auto; margin-right:auto;">
                                <b-col style="max-width:41px; width:41px;">
                                <form-button style="width:41px;" @click.native.prevent="tilt('Z', -10)"><font-awesome-icon :icon="['fa', 'arrow-left']"/></form-button>
                                </b-col>
                                <b-col style="max-width:41px; width:41px;">
                                    <form-button style="width:41px;" @click.native.prevent="tilt('X', 10)"><font-awesome-icon :icon="['fa', 'arrow-down']"/></form-button>
                                </b-col>
                                <b-col style="max-width:41px; width:41px;">
                                    <form-button style="width:41px;" @click.native.prevent="tilt('Z', 10)"><font-awesome-icon :icon="['fa', 'arrow-right']"/></form-button>
                                </b-col>
                            </b-row>
                        </b-container>
                    </sub-section>

                    <!-- <sub-section title="Docking Box">
                        <form-group
                            label=""
                            id="input-group-receptor-3dmol"
                            description=""
                        >
                            <div class="bv-example-row container-fluid">
                                <b-row>
                                    <b-col style="padding-left: 0; padding-right: 10px;">
                                        <threedmol type="receptor"></threedmol>
                                    </b-col>
                                    <b-col style="padding-right: 0; padding-left: 10px;">
                                        <threedmol type="ligand"></threedmol>
                                    </b-col>
                                </b-row>
                            </div>
                        </form-group>

                        <triple-numeric-input
                            :hide="hideDockingBoxParams"
                            label="Box Center"
                            id1="center_x"
                            id2="center_y"
                            id3="center_z"
                            description="X, Y, and Z coordinates of the docking-box center."
                        ></triple-numeric-input>

                        <triple-numeric-input
                            :hide="hideDockingBoxParams"
                            label="Box Size"
                            id1="size_x"
                            id2="size_y"
                            id3="size_z"
                            description="Size of docking box in the X, Y, and Z dimensions (Angstroms)."
                            :min="0"
                        ></triple-numeric-input>
                    </sub-section>

                    <sub-section title="Other Critical Parameters">
                        <numeric-input
                            label="CPU(s)" id="cpu"
                            description="The number of CPUs to use. Leave a few CPUs free to maintain computer responsiveness."
                            placeholder="${navigator.hardwareConcurrency <= 2 ? 1 : 2}"
                            :default="${navigator.hardwareConcurrency <= 2 ? 1 : 2}"
                            :min="1"
                            :max="${navigator.hardwareConcurrency == 1 ? 1 : navigator.hardwareConcurrency - 1}"
                        ></numeric-input>

                        <numeric-input
                            label="Exhaustiveness" id="exhaustiveness"
                            description="Exhaustiveness of the global search (roughly proportional to time). Prot2Prot defaults to 4 to speed execution in the browser, but the Vina default is 8. Use 8 when accuracy is critical."
                            placeholder="8"
                            :default="8"
                            :min="1"
                        ></numeric-input>
                    </sub-section> -->

                    <!-- <sub-section title="Advanced Parameters">
                        <div role="tablist">
                            <b-card no-body class="mb-1">
                                <b-card-header header-tag="header" class="p-1" role="tab">
                                    <b-button block href="#" v-b-toggle.accordion-2 variant="default">Output  Parameters (Optional)</b-button>
                                </b-card-header>
                                <b-collapse id="accordion-2" role="tabpanel">
                                    <b-card-body>
                                        <b-card
                                            class="mb-2 text-center"
                                            style="margin-bottom:1.4rem !important;"
                                        >
                                            <b-card-text>
                                                Optional parameters to control Prot2Prot output.
                                            </b-card-text>
                                        </b-card>

                                        <check-box
                                            label="Perform a local search only." id="local_only"
                                        ></check-box>
                                        <check-box
                                            label="Score only, without docking. Docking-box center and size will be ignored."
                                            id="score_only"
                                        ></check-box>
                                        <check-box
                                            label="Randomize input, attempting to avoid clashes."
                                            id="randomize_only"
                                        ></check-box>
                                    </b-card-body>
                                </b-collapse>
                            </b-card>

                            <b-card no-body class="mb-1">
                                <b-card-header header-tag="header" class="p-1" role="tab">
                                    <b-button block href="#" v-b-toggle.accordion-3 variant="default">Misc Parameters (Optional)</b-button>
                                </b-card-header>
                                <b-collapse id="accordion-3" role="tabpanel">
                                    <b-card-body>
                                        <b-card
                                            class="mb-2 text-center"
                                            style="margin-bottom:1.4rem !important;"
                                        >
                                            <b-card-text>
                                                Advanced parameters that are best left unmodified.
                                            </b-card-text>
                                        </b-card>
                                        <numeric-input
                                            label="Random Seed" id="seed"
                                            description="The explicit random seed."
                                            placeholder="${new Date().getTime()}"
                                            :min="1"
                                        ></numeric-input>

                                        <numeric-input
                                            label="Number of Modes" id="num_modes"
                                            description="Maximum number of binding modes to generate."
                                            placeholder="9"
                                            :min="1"
                                        ></numeric-input>

                                        <numeric-input
                                            label="Energy Range" id="energy_range"
                                            description="Maximum energy difference between the best binding mode and the worst one displayed (kcal/mol)."
                                            placeholder="3"
                                            :min="0"
                                        ></numeric-input>

                                        <numeric-input
                                            label="Gauss_1 Weight" id="weight_gauss1"
                                            description="Gauss_1 weight."
                                            placeholder="-0.035579"
                                        ></numeric-input>

                                        <numeric-input
                                            label="Gauss2 Weight" id="weight_gauss2"
                                            description="Gauss_1 weight term."
                                            placeholder="-0.005156"
                                        ></numeric-input>

                                        <numeric-input
                                            label="Repulsion Weight"
                                            id="weight_repulsion"
                                            description="Repulsion weight term."
                                            placeholder="0.84024500000000002"
                                        ></numeric-input>

                                        <numeric-input
                                            label="Hydrophobic Weight"
                                            id="weight_hydrophobic"
                                            description="Hydrophobic weight term."
                                            placeholder="-0.035069000000000003"
                                        ></numeric-input>

                                        <numeric-input
                                            label="Hydrogen Weight"
                                            id="weight_hydrogen"
                                            description="Hydrogen bond weight term."
                                            placeholder="-0.58743900000000004"
                                        ></numeric-input>

                                        <numeric-input
                                            label="Rot Weight" id="weight_rot"
                                            description="N_rot weight term."
                                            placeholder="0.058459999999999998"
                                        ></numeric-input>
                                    </b-card-body>
                                </b-collapse>
                            </b-card>
                        </div>
                    </sub-section> -->

                    <!-- <vina-commandline></vina-commandline> -->

                    <span style="display:none;">{{validate(false)}}</span>  <!-- Hackish. Just to make reactive. -->
                    <form-button @click.native="onSubmitClick" variant="primary" cls="float-right mb-4">Start Prot2Prot</form-button>

                </b-form>
                <div v-else>
                    <p>Unfortunately, your browser does not support WebAssembly.
                    Please <a href='https://developer.mozilla.org/en-US/docs/WebAssembly#Browser_compatibility'
                    target='_blank'>switch to a browser that does</a> (e.g., Google Chrome).</p>

                    <p>Note that you can still use the "Existing Vina Output" option
                    (see menu on the left) even without WebAssembly.</p>
                </div>
            </div>
        `,
        "props": {},
        "computed": computedFunctions,

        /**
         * Get the data associated with this component.
         * @returns any  The data.
         */
        "data"() {
            return {
                "showFileInputs": true,
                "webAssemblyAvaialble": true,
            }
        },
        "methods": methodsFunctions,

        /**
         * Runs when the vue component is mounted.
         * @returns void
         */
        "mounted": mountedFunction
    })
}
